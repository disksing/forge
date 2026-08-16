package serve

import (
	"path/filepath"
	"testing"
)

func TestDefaultConfigPathUsesPUAHome(t *testing.T) {
	home := t.TempDir()
	t.Setenv("HOME", home)
	t.Setenv("PUA_SERVE_CONFIG", "")

	got, err := defaultConfigPath()
	if err != nil {
		t.Fatal(err)
	}
	want := filepath.Join(home, ".pua", "serve.json")
	if got != want {
		t.Fatalf("defaultConfigPath() = %q, want %q", got, want)
	}
}

func TestDefaultConfigPathPrefersServeConfigOverride(t *testing.T) {
	override := filepath.Join(t.TempDir(), "custom", "serve.json")
	t.Setenv("PUA_SERVE_CONFIG", override)

	got, err := defaultConfigPath()
	if err != nil {
		t.Fatal(err)
	}
	if got != override {
		t.Fatalf("defaultConfigPath() = %q, want %q", got, override)
	}
}
