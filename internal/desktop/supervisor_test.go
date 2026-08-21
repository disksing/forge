//go:build darwin

package desktop

import (
	"context"
	"encoding/json"
	"net"
	"net/http"
	"net/http/httptest"
	"os"
	"os/exec"
	"path/filepath"
	"strings"
	"syscall"
	"testing"
	"time"
)

func TestEndpointForAddress(t *testing.T) {
	t.Parallel()
	tests := map[string]string{
		"127.0.0.1:4936": "http://127.0.0.1:4936",
		"0.0.0.0:4936":   "http://127.0.0.1:4936",
		":4936":          "http://127.0.0.1:4936",
		"[::]:4936":      "http://127.0.0.1:4936",
		"[::1]:4936":     "http://[::1]:4936",
	}
	for input, expected := range tests {
		input, expected := input, expected
		t.Run(input, func(t *testing.T) {
			t.Parallel()
			actual, err := endpointForAddress(input)
			if err != nil {
				t.Fatal(err)
			}
			if actual != expected {
				t.Fatalf("endpointForAddress(%q) = %q, want %q", input, actual, expected)
			}
		})
	}
}

func TestInstallBackendIsVersionedAndReused(t *testing.T) {
	t.Parallel()
	temporary := t.TempDir()
	source := filepath.Join(temporary, "source-pua")
	if err := os.WriteFile(source, []byte("backend-v1"), 0o755); err != nil {
		t.Fatal(err)
	}
	options := Options{AppSupportDir: filepath.Join(temporary, "support"), BackendPath: source}

	installed, digest, err := installBackend(options, source)
	if err != nil {
		t.Fatal(err)
	}
	if !strings.Contains(installed, filepath.Join("versions", digest, backendFileName)) {
		t.Fatalf("installed path %q does not contain version digest", installed)
	}
	info, err := os.Stat(installed)
	if err != nil {
		t.Fatal(err)
	}
	if info.Mode().Perm() != 0o755 {
		t.Fatalf("installed mode = %o, want 755", info.Mode().Perm())
	}

	selected, selectedDigest, err := selectBackend(options)
	if err != nil {
		t.Fatal(err)
	}
	if selected != installed || selectedDigest != digest {
		t.Fatalf("selected (%q, %q), want (%q, %q)", selected, selectedDigest, installed, digest)
	}
}

func TestSelectBackendRepairsTamperedInstall(t *testing.T) {
	t.Parallel()
	temporary := t.TempDir()
	source := filepath.Join(temporary, "source-pua")
	if err := os.WriteFile(source, []byte("known-good"), 0o755); err != nil {
		t.Fatal(err)
	}
	options := Options{AppSupportDir: filepath.Join(temporary, "support"), BackendPath: source}
	installed, _, err := installBackend(options, source)
	if err != nil {
		t.Fatal(err)
	}
	if err := os.WriteFile(installed, []byte("tampered"), 0o755); err != nil {
		t.Fatal(err)
	}

	selected, digest, err := selectBackend(options)
	if err != nil {
		t.Fatal(err)
	}
	actualDigest, err := fileDigest(selected)
	if err != nil {
		t.Fatal(err)
	}
	if actualDigest != digest {
		t.Fatalf("installed digest = %q, want %q", actualDigest, digest)
	}
}

func TestSelectBundledBackendReplacesOlderCurrentManifest(t *testing.T) {
	t.Parallel()
	temporary := t.TempDir()
	oldSource := filepath.Join(temporary, "old-pua")
	newSource := filepath.Join(temporary, "new-pua")
	if err := os.WriteFile(oldSource, []byte("backend-v1"), 0o755); err != nil {
		t.Fatal(err)
	}
	if err := os.WriteFile(newSource, []byte("backend-v2"), 0o755); err != nil {
		t.Fatal(err)
	}
	options := Options{AppSupportDir: filepath.Join(temporary, "support")}
	oldPath, oldDigest, err := installBackend(options, oldSource)
	if err != nil {
		t.Fatal(err)
	}

	selected, selectedDigest, err := selectBundledBackend(options, newSource)
	if err != nil {
		t.Fatal(err)
	}
	if selected == oldPath || selectedDigest == oldDigest {
		t.Fatalf("selected old backend (%q, %q), want bundled replacement", selected, selectedDigest)
	}
	if actual, err := os.ReadFile(selected); err != nil || string(actual) != "backend-v2" {
		t.Fatalf("selected backend content = %q, %v", actual, err)
	}
}

func TestStopManagedBackendRequiresMatchingStateAndLock(t *testing.T) {
	temporary := t.TempDir()
	command := exec.Command("sleep", "30")
	if err := command.Start(); err != nil {
		t.Fatal(err)
	}
	processDone := make(chan error, 1)
	go func() { processDone <- command.Wait() }()
	processDoneRead := false
	t.Cleanup(func() {
		_ = command.Process.Kill()
		if !processDoneRead {
			<-processDone
		}
	})

	options := Options{
		ConfigPath:    filepath.Join(temporary, "serve.json"),
		AppSupportDir: filepath.Join(temporary, "support"),
	}
	endpoint := "http://127.0.0.1:4936"
	state := backendState{
		SchemaVersion: stateVersion,
		PID:           command.Process.Pid,
		Endpoint:      endpoint,
		BackendPath:   "/test/pua",
		Digest:        "old-digest",
		Managed:       true,
	}
	if err := writeJSONAtomic(statePath(options), state); err != nil {
		t.Fatal(err)
	}
	if err := writeJSONAtomic(options.ConfigPath+".lock", serveLock{PID: command.Process.Pid, Address: "127.0.0.1:4936"}); err != nil {
		t.Fatal(err)
	}

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()
	if err := stopManagedBackend(ctx, options, Result{URL: endpoint, Managed: true, PID: command.Process.Pid}); err != nil {
		t.Fatal(err)
	}
	select {
	case <-processDone:
		processDoneRead = true
	case <-time.After(time.Second):
		t.Fatal("managed backend process was not reaped")
	}
}

func TestDiscoverExistingMarksOwnedBackendManaged(t *testing.T) {
	t.Parallel()
	server := httptest.NewServer(http.HandlerFunc(func(response http.ResponseWriter, request *http.Request) {
		if request.URL.Path != defaultProbePath {
			http.NotFound(response, request)
			return
		}
		response.WriteHeader(http.StatusOK)
	}))
	defer server.Close()

	temporary := t.TempDir()
	options := Options{
		Address:       addressFromURL(t, server.URL),
		ConfigPath:    filepath.Join(temporary, "serve.json"),
		AppSupportDir: filepath.Join(temporary, "support"),
		HTTPClient:    server.Client(),
	}
	state := backendState{
		SchemaVersion: stateVersion,
		PID:           os.Getpid(),
		Endpoint:      server.URL,
		BackendPath:   "/test/pua",
		Digest:        "test-digest",
		Managed:       true,
		StartedAt:     time.Now().UTC(),
	}
	if err := writeJSONAtomic(statePath(options), state); err != nil {
		t.Fatal(err)
	}
	if err := writeJSONAtomic(options.ConfigPath+".lock", serveLock{PID: os.Getpid(), Address: addressFromURL(t, server.URL)}); err != nil {
		t.Fatal(err)
	}

	result, ok := discoverExisting(context.Background(), options)
	if !ok {
		t.Fatal("healthy managed backend was not discovered")
	}
	if !result.Managed || result.PID != os.Getpid() || result.URL != server.URL {
		t.Fatalf("unexpected result: %+v", result)
	}
}

func TestDiscoverExistingLockIsExternalWithoutMatchingState(t *testing.T) {
	t.Parallel()
	server := httptest.NewServer(http.HandlerFunc(func(response http.ResponseWriter, request *http.Request) {
		response.WriteHeader(http.StatusOK)
	}))
	defer server.Close()
	temporary := t.TempDir()
	options := Options{
		Address:       "127.0.0.1:1",
		ConfigPath:    filepath.Join(temporary, "serve.json"),
		AppSupportDir: filepath.Join(temporary, "support"),
		HTTPClient:    server.Client(),
	}
	if err := writeJSONAtomic(options.ConfigPath+".lock", serveLock{PID: os.Getpid(), Address: addressFromURL(t, server.URL)}); err != nil {
		t.Fatal(err)
	}

	result, ok := discoverExisting(context.Background(), options)
	if !ok {
		t.Fatal("healthy external backend was not discovered")
	}
	if result.Managed {
		t.Fatalf("external backend was marked managed: %+v", result)
	}
}

func addressFromURL(t *testing.T, value string) string {
	t.Helper()
	return strings.TrimPrefix(value, "http://")
}

func TestHealthyRejectsReadinessFailure(t *testing.T) {
	t.Parallel()
	listener, err := net.Listen("tcp", "127.0.0.1:0")
	if err != nil {
		t.Fatal(err)
	}
	server := &http.Server{Handler: http.HandlerFunc(func(response http.ResponseWriter, request *http.Request) {
		http.Error(response, "starting", http.StatusServiceUnavailable)
	})}
	go func() { _ = server.Serve(listener) }()
	defer server.Close()
	endpoint := "http://" + listener.Addr().String()
	if healthy(context.Background(), &http.Client{Timeout: time.Second}, endpoint) {
		t.Fatal("503 endpoint was reported healthy")
	}
}

func TestEnsureStartsRealBackend(t *testing.T) {
	backend := os.Getenv("PUA_DESKTOP_TEST_BACKEND")
	if backend == "" {
		t.Skip("set PUA_DESKTOP_TEST_BACKEND to run the real backend integration test")
	}
	backend, err := filepath.Abs(backend)
	if err != nil {
		t.Fatal(err)
	}
	listener, err := net.Listen("tcp", "127.0.0.1:0")
	if err != nil {
		t.Fatal(err)
	}
	address := listener.Addr().String()
	if err := listener.Close(); err != nil {
		t.Fatal(err)
	}

	temporary := t.TempDir()
	t.Setenv("AGENTHUB_HOME", filepath.Join(temporary, "agenthub"))
	t.Setenv("PUA_WORKSPACE_ROOT", "")
	options := Options{
		Address:        address,
		ConfigPath:     filepath.Join(temporary, "pua", "serve.json"),
		AppSupportDir:  filepath.Join(temporary, "desktop"),
		BackendPath:    backend,
		StartupTimeout: 30 * time.Second,
		HTTPClient:     &http.Client{Timeout: time.Second},
	}
	t.Cleanup(func() {
		lock, ok := readJSON[serveLock](options.ConfigPath + ".lock")
		if ok && lock.PID > 0 {
			_ = syscall.Kill(-lock.PID, syscall.SIGTERM)
		}
	})

	result, err := Ensure(context.Background(), options)
	if err != nil {
		t.Fatal(err)
	}
	if !result.Managed || result.PID <= 0 {
		t.Fatalf("backend was not marked managed: %+v", result)
	}
	if !healthy(context.Background(), options.HTTPClient, result.URL) {
		t.Fatalf("backend %s is not healthy", result.URL)
	}
	response, err := options.HTTPClient.Get(result.URL + defaultProbePath)
	if err != nil {
		t.Fatal(err)
	}
	defer response.Body.Close()
	var workspaces struct {
		Workspaces []json.RawMessage `json:"workspaces"`
	}
	if err := json.NewDecoder(response.Body).Decode(&workspaces); err != nil {
		t.Fatal(err)
	}
	if len(workspaces.Workspaces) != 0 {
		t.Fatalf("desktop backend implicitly added %d workspaces", len(workspaces.Workspaces))
	}
	if !strings.HasPrefix(result.BackendPath, filepath.Join(options.AppSupportDir, "backend", "versions")) {
		t.Fatalf("backend was not launched from the versioned runtime: %q", result.BackendPath)
	}

	state, ok := readJSON[backendState](statePath(options))
	if !ok {
		t.Fatal("managed backend state was not written")
	}
	state.Digest = "outdated-bundled-backend"
	if err := writeJSONAtomic(statePath(options), state); err != nil {
		t.Fatal(err)
	}
	upgraded, err := Ensure(context.Background(), options)
	if err != nil {
		t.Fatal(err)
	}
	if !upgraded.Managed || upgraded.PID <= 0 || upgraded.PID == result.PID {
		t.Fatalf("managed backend was not replaced: before=%+v after=%+v", result, upgraded)
	}
	expectedDigest, err := fileDigest(backend)
	if err != nil {
		t.Fatal(err)
	}
	if upgraded.Digest != expectedDigest {
		t.Fatalf("upgraded digest = %q, want %q", upgraded.Digest, expectedDigest)
	}
}
