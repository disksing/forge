package serve

import (
	"os"
	"strings"
	"testing"
)

func TestMainHelpAndVersionDoNotStartServer(t *testing.T) {
	if err := Main([]string{"--help"}); err != nil {
		t.Fatalf("Main(--help) failed: %v", err)
	}
	if err := Main([]string{"-h"}); err != nil {
		t.Fatalf("Main(-h) failed: %v", err)
	}
	if err := Main([]string{"--version"}); err != nil {
		t.Fatalf("Main(--version) failed: %v", err)
	}
}

func TestMainRejectsUnknownFlagsAndPositionalArgs(t *testing.T) {
	if err := Main([]string{"--bogus"}); err == nil {
		t.Fatal("expected unknown flag to fail")
	}
	if err := Main([]string{"positional"}); err == nil || !strings.Contains(err.Error(), "unexpected positional argument") {
		t.Fatalf("expected positional argument to fail, got %v", err)
	}
}

func TestDefaultForgePathPrefersEnvOverride(t *testing.T) {
	t.Setenv("FORGE_CLI", "/tmp/custom-forge")
	path, err := defaultForgePath()
	if err != nil {
		t.Fatal(err)
	}
	if path != "/tmp/custom-forge" {
		t.Fatalf("expected FORGE_CLI override, got %q", path)
	}
}

func TestDefaultForgePathFallsBackToCurrentExecutable(t *testing.T) {
	t.Setenv("FORGE_CLI", "")
	path, err := defaultForgePath()
	if err != nil {
		t.Fatal(err)
	}
	exe, err := os.Executable()
	if err != nil {
		t.Fatal(err)
	}
	if path != exe {
		t.Fatalf("expected current executable %q, got %q", exe, path)
	}
}
