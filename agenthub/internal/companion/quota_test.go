package companion

import (
	"context"
	"encoding/json"
	"math"
	"net/http"
	"net/http/httptest"
	"sync/atomic"
	"testing"
	"time"

	"github.com/disksing/pua/agenthub/internal/config"
)

func TestSnapshotNormalizesProviderSchemasAndCaches(t *testing.T) {
	var calls atomic.Int32
	upstream := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		calls.Add(1)
		if r.Header.Get("X-Forwarded-User") != "local-user" {
			t.Fatalf("forwarded user = %q", r.Header.Get("X-Forwarded-User"))
		}
		w.Header().Set("Content-Type", "application/json")
		switch r.URL.Path {
		case "/api/providers":
			_, _ = w.Write([]byte(`{"providers":["codex","kimi","grok","opencode","both"],"provider_labels":{"codex":"Codex","kimi":"Kimi","grok":"Grok","opencode":"OpenCode"}}`))
		case "/api/current":
			switch r.URL.Query().Get("provider") {
			case "codex":
				_, _ = w.Write([]byte(`{"capturedAt":"2026-08-10T16:12:24Z","planType":"pro","quotas":[{"displayName":"Weekly","name":"seven_day","remainingPercent":83,"utilization":17,"timeUntilResetSeconds":449168,"status":"healthy"}]}`))
			case "kimi":
				_, _ = w.Write([]byte(`{"capturedAt":"2026-08-10T16:14:23Z","membership":"Allegro","quotas":[{"displayName":"5-hour","name":"5h","utilization":22,"timeUntilResetSeconds":7200,"status":"warning"}]}`))
			case "grok":
				_, _ = w.Write([]byte(`{"capturedAt":"2026-08-10T16:14:23Z","quotas":[{"displayName":"Credits","name":"credits","utilization":78,"status":"danger"}]}`))
			case "opencode":
				_, _ = w.Write([]byte(`{"capturedAt":"2026-08-10T16:12:23Z","planName":"OpenCode Go","quotas":[{"displayName":"5-Hour","name":"five_hour","limit":100,"used":3,"remainingPercent":97,"isStale":true,"status":"healthy"}]}`))
			}
		default:
			http.NotFound(w, r)
		}
	}))
	defer upstream.Close()
	settings := config.Defaults().OnWatch
	settings.Enabled = true
	settings.ServerURL = upstream.URL
	settings.Username = "local-user"
	service := NewService(upstream.Client())

	result := service.Snapshot(context.Background(), settings)
	if !result.Connected || len(result.Providers) != 4 {
		t.Fatalf("snapshot = %+v", result)
	}
	if result.Providers[0].Quotas[0].Kind != "7d" || result.Providers[0].Quotas[0].RemainingPercent != 83 {
		t.Fatalf("codex quota = %+v", result.Providers[0])
	}
	if result.Providers[1].Quotas[0].RemainingPercent != 78 || result.Providers[1].Status != "warning" {
		t.Fatalf("kimi quota = %+v", result.Providers[1])
	}
	if result.Providers[2].Quotas[0].Kind != "credits" || result.Providers[2].Quotas[0].RemainingPercent != 22 {
		t.Fatalf("grok quota = %+v", result.Providers[2])
	}
	if !result.Providers[3].Stale || result.Providers[3].PlanLabel != "OpenCode Go" {
		t.Fatalf("opencode quota = %+v", result.Providers[3])
	}
	_ = service.Snapshot(context.Background(), settings)
	if calls.Load() != 5 {
		t.Fatalf("cached request made %d upstream calls, want 5", calls.Load())
	}
}

func TestSnapshotNormalizesBalanceProviderAndBalanceTotal(t *testing.T) {
	var calls atomic.Int32
	upstream := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		calls.Add(1)
		w.Header().Set("Content-Type", "application/json")
		switch r.URL.Path {
		case "/api/providers":
			_, _ = w.Write([]byte(`{"providers":["deepseek"],"provider_labels":{"deepseek":"DeepSeek"}}`))
		case "/api/current":
			capturedAt := time.Now().UTC().Add(-30 * time.Second).Format(time.RFC3339)
			_, _ = w.Write([]byte(`{"capturedAt":"` + capturedAt + `","balance":{"name":"Balance","available":true,"currency":"CNY","total":91.61,"granted":0,"toppedUp":91.61,"rate":1.7,"status":"healthy","totalTracked":0.13}}`))
		default:
			http.NotFound(w, r)
		}
	}))
	defer upstream.Close()
	settings := config.Defaults().OnWatch
	settings.Enabled = true
	settings.ServerURL = upstream.URL
	service := NewService(upstream.Client())

	result := service.Snapshot(context.Background(), settings)
	if !result.Connected || len(result.Providers) != 1 {
		t.Fatalf("snapshot = %+v", result)
	}
	provider := result.Providers[0]
	if provider.Provider != "deepseek" || provider.Label != "DeepSeek" {
		t.Fatalf("provider = %+v", provider)
	}
	if len(provider.Quotas) != 1 {
		t.Fatalf("quotas = %+v", provider.Quotas)
	}
	quota := provider.Quotas[0]
	if quota.Kind != "balance" || quota.Label != "Balance" || quota.Status != "healthy" {
		t.Fatalf("quota = %+v", quota)
	}
	// Default balance total is 100: 91.61 / 100 = 91.61% remaining.
	if math.Abs(quota.RemainingPercent-91.61) > 1e-9 || math.Abs(quota.UsedPercent-8.39) > 1e-9 {
		t.Fatalf("balance quota percents = %+v", quota)
	}
	if quota.Used == nil || quota.Limit == nil || math.Abs(*quota.Used-8.39) > 1e-9 || *quota.Limit != 100 {
		t.Fatalf("balance quota amounts = %+v", quota)
	}
	if quota.CurrentRate == nil || *quota.CurrentRate != 1.7 {
		t.Fatalf("balance quota rate = %+v", quota)
	}

	// A different balance total invalidates the cache and renormalizes.
	settings.BalanceTotal = 200
	second := service.Snapshot(context.Background(), settings)
	quota = second.Providers[0].Quotas[0]
	if math.Abs(quota.RemainingPercent-45.805) > 1e-9 || *quota.Limit != 200 || math.Abs(*quota.Used-108.39) > 1e-9 {
		t.Fatalf("balance quota after total change = %+v", quota)
	}
	if calls.Load() != 4 {
		t.Fatalf("upstream calls = %d, want 4 (catalog + provider for each of two signatures)", calls.Load())
	}
}

func TestNormalizeBalanceFallsBackToDefaultTotal(t *testing.T) {
	quota := normalizeBalance(upstreamBalance{Name: "Balance", Available: true, Total: 25, Status: "exhausted"}, 0)
	if quota.Kind != "balance" || quota.Status != "exhausted" {
		t.Fatalf("quota = %+v", quota)
	}
	if quota.Limit == nil || *quota.Limit != 100 || math.Abs(quota.RemainingPercent-25) > 1e-9 {
		t.Fatalf("quota = %+v", quota)
	}
	quota = normalizeBalance(upstreamBalance{Name: "Balance", Available: false, Total: 10}, 50)
	if quota.Status != "unavailable" || math.Abs(quota.RemainingPercent-20) > 1e-9 {
		t.Fatalf("unavailable quota = %+v", quota)
	}
}

func TestSnapshotReturnsStaleCacheAfterUpstreamFailure(t *testing.T) {
	failing := atomic.Bool{}
	upstream := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if failing.Load() {
			http.Error(w, "down", http.StatusServiceUnavailable)
			return
		}
		if r.URL.Path == "/api/providers" {
			_, _ = w.Write([]byte(`{"providers":["codex"]}`))
			return
		}
		_, _ = w.Write([]byte(`{"quotas":[{"name":"5h","utilization":10,"status":"healthy"}]}`))
	}))
	defer upstream.Close()
	settings := config.Defaults().OnWatch
	settings.Enabled = true
	settings.ServerURL = upstream.URL
	service := NewService(upstream.Client())
	first := service.Snapshot(context.Background(), settings)
	if !first.Connected {
		t.Fatalf("first snapshot = %+v", first)
	}
	failing.Store(true)
	service.mu.Lock()
	service.expiresAt = time.Time{}
	service.mu.Unlock()
	stale := service.Snapshot(context.Background(), settings)
	if stale.Connected || !stale.Stale || stale.Error == "" || !stale.Providers[0].Stale {
		t.Fatalf("stale snapshot = %+v", stale)
	}
}

func TestBasicAuthAndCatalogResponse(t *testing.T) {
	upstream := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		user, password, ok := r.BasicAuth()
		if !ok || user != "alice" || password != "secret" {
			t.Fatalf("basic auth = %q %q %v", user, password, ok)
		}
		_ = json.NewEncoder(w).Encode(map[string]any{"providers": []string{"codex", "both"}})
	}))
	defer upstream.Close()
	settings := config.Defaults().OnWatch
	settings.ServerURL = upstream.URL
	settings.AuthMode = "basic"
	settings.Username = "alice"
	settings.Password = "secret"
	catalog, err := NewService(upstream.Client()).TestConnection(context.Background(), settings)
	if err != nil || len(catalog.Providers) != 1 || catalog.Providers[0] != "codex" {
		t.Fatalf("catalog = %+v, %v", catalog, err)
	}
}

func TestWindowPositionMovesLeftAsResetApproaches(t *testing.T) {
	fullWindow := int64(5 * 60 * 60)
	halfWindow := fullWindow / 2
	nearReset := int64(60)
	atReset := int64(0)

	fullPosition := windowPosition("5h", &fullWindow)
	halfPosition := windowPosition("5h", &halfWindow)
	nearPosition := windowPosition("5h", &nearReset)
	resetPosition := windowPosition("5h", &atReset)
	if fullPosition == nil || halfPosition == nil || nearPosition == nil || resetPosition == nil {
		t.Fatal("known reset window did not produce marker positions")
	}
	if *fullPosition != 100 || *halfPosition != 50 || *resetPosition != 0 {
		t.Fatalf("positions = full %.2f, half %.2f, reset %.2f", *fullPosition, *halfPosition, *resetPosition)
	}
	if !(*nearPosition < *halfPosition) {
		t.Fatalf("near-reset position %.2f must be left of half-window position %.2f", *nearPosition, *halfPosition)
	}
}
