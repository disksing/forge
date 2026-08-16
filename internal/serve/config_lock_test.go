package serve

import (
	"encoding/json"
	"os"
	"path/filepath"
	"strconv"
	"strings"
	"testing"
)

func TestServeConfigLockPreventsSecondInstance(t *testing.T) {
	configPath := filepath.Join(t.TempDir(), "forge", "serve.json")
	first, err := acquireServeConfigLock(configPath, "127.0.0.1:4936")
	if err != nil {
		t.Fatal(err)
	}

	data, err := os.ReadFile(configPath + ".lock")
	if err != nil {
		t.Fatal(err)
	}
	var metadata serveConfigLockMetadata
	if err := json.Unmarshal(data, &metadata); err != nil {
		t.Fatal(err)
	}
	absConfigPath, err := filepath.Abs(configPath)
	if err != nil {
		t.Fatal(err)
	}
	if metadata.PID != os.Getpid() || metadata.Address != "127.0.0.1:4936" || metadata.ConfigPath != absConfigPath || metadata.StartedAt == "" {
		t.Fatalf("unexpected lock metadata: %#v", metadata)
	}

	second, err := acquireServeConfigLock(configPath, "127.0.0.1:4999")
	if err == nil {
		_ = second.Close()
		t.Fatal("expected the second config lock to fail")
	}
	for _, want := range []string{absConfigPath, "PID " + strconv.Itoa(os.Getpid()), "127.0.0.1:4936", "PUA_SERVE_CONFIG"} {
		if !strings.Contains(err.Error(), want) {
			t.Fatalf("config lock conflict is missing %q: %v", want, err)
		}
	}

	if err := first.Close(); err != nil {
		t.Fatal(err)
	}
	reopened, err := acquireServeConfigLock(configPath, "127.0.0.1:4999")
	if err != nil {
		t.Fatalf("config lock should be reusable after release: %v", err)
	}
	if err := reopened.Close(); err != nil {
		t.Fatal(err)
	}
}

func TestServeConfigLockAllowsDifferentConfigs(t *testing.T) {
	dir := t.TempDir()
	first, err := acquireServeConfigLock(filepath.Join(dir, "first.json"), "127.0.0.1:4936")
	if err != nil {
		t.Fatal(err)
	}
	defer first.Close()
	second, err := acquireServeConfigLock(filepath.Join(dir, "second.json"), "127.0.0.1:4999")
	if err != nil {
		t.Fatal(err)
	}
	defer second.Close()
}
