package serve

import (
	"os"
	"path/filepath"
	"testing"
)

func TestDefaultConfigPathUsesPUAHome(t *testing.T) {
	home := t.TempDir()
	t.Setenv("HOME", home)
	t.Setenv("FORGE_SERVE_CONFIG", "")
	t.Setenv("FORGE_GUI_CONFIG", "")
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

func TestDefaultConfigPathKeepsLegacyGUIConfig(t *testing.T) {
	home := t.TempDir()
	t.Setenv("HOME", home)
	t.Setenv("FORGE_SERVE_CONFIG", "")
	t.Setenv("FORGE_GUI_CONFIG", "")
	t.Setenv("PUA_SERVE_CONFIG", "")

	legacy := filepath.Join(home, ".forge", "gui.json")
	if err := os.MkdirAll(filepath.Dir(legacy), 0o755); err != nil {
		t.Fatal(err)
	}
	if err := os.WriteFile(legacy, []byte("{}"), 0o644); err != nil {
		t.Fatal(err)
	}

	got, err := defaultConfigPath()
	if err != nil {
		t.Fatal(err)
	}
	if got != legacy {
		t.Fatalf("defaultConfigPath() = %q, want legacy %q", got, legacy)
	}
}

func TestDefaultConfigPathPrefersServeConfigOverride(t *testing.T) {
	override := filepath.Join(t.TempDir(), "custom", "serve.json")
	t.Setenv("PUA_SERVE_CONFIG", override)
	t.Setenv("FORGE_SERVE_CONFIG", "")
	t.Setenv("FORGE_GUI_CONFIG", override)

	got, err := defaultConfigPath()
	if err != nil {
		t.Fatal(err)
	}
	if got != override {
		t.Fatalf("defaultConfigPath() = %q, want %q", got, override)
	}
}

func TestDefaultConfigPathRejectsGUIOverrideConflict(t *testing.T) {
	t.Setenv("PUA_SERVE_CONFIG", filepath.Join(t.TempDir(), "pua.json"))
	t.Setenv("FORGE_SERVE_CONFIG", "")
	t.Setenv("FORGE_GUI_CONFIG", filepath.Join(t.TempDir(), "gui.json"))
	if _, err := defaultConfigPath(); err == nil {
		t.Fatal("expected conflicting current and older legacy config overrides to fail")
	}
}

func TestDefaultConfigPathHonorsLegacyOverride(t *testing.T) {
	legacy := filepath.Join(t.TempDir(), "custom", "gui.json")
	t.Setenv("FORGE_SERVE_CONFIG", "")
	t.Setenv("FORGE_GUI_CONFIG", legacy)
	t.Setenv("PUA_SERVE_CONFIG", "")

	got, err := defaultConfigPath()
	if err != nil {
		t.Fatal(err)
	}
	if got != legacy {
		t.Fatalf("defaultConfigPath() = %q, want %q", got, legacy)
	}
}

func TestDefaultConfigPathRejectsCurrentAndLegacyConflict(t *testing.T) {
	t.Setenv("PUA_SERVE_CONFIG", filepath.Join(t.TempDir(), "pua.json"))
	t.Setenv("FORGE_SERVE_CONFIG", filepath.Join(t.TempDir(), "forge.json"))
	t.Setenv("FORGE_GUI_CONFIG", "")
	if _, err := defaultConfigPath(); err == nil {
		t.Fatal("expected conflicting current and legacy serve config overrides to fail")
	}
}
