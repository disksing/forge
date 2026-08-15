package serve

import (
	"path/filepath"
	"testing"
)

func TestDefaultConfigPathUsesForgeHome(t *testing.T) {
	home := t.TempDir()
	t.Setenv("HOME", home)
	t.Setenv("FORGE_GUI_CONFIG", "")

	got, err := defaultConfigPath()
	if err != nil {
		t.Fatal(err)
	}
	want := filepath.Join(home, ".forge", "gui.json")
	if got != want {
		t.Fatalf("defaultConfigPath() = %q, want %q", got, want)
	}
}

func TestDefaultConfigPathHonorsExplicitOverride(t *testing.T) {
	override := filepath.Join(t.TempDir(), "custom", "gui.json")
	t.Setenv("FORGE_GUI_CONFIG", override)

	got, err := defaultConfigPath()
	if err != nil {
		t.Fatal(err)
	}
	if got != override {
		t.Fatalf("defaultConfigPath() = %q, want %q", got, override)
	}
}
