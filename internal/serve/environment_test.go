package serve

import (
	"strings"
	"testing"
)

func TestEnvironmentOverrideSupportsLegacyAndRejectsConflict(t *testing.T) {
	t.Setenv("PUA_TEST_VALUE", "")
	t.Setenv("FORGE_TEST_VALUE", "legacy")
	if got, err := environmentOverride("PUA_TEST_VALUE", "FORGE_TEST_VALUE"); err != nil || got != "legacy" {
		t.Fatalf("legacy override = %q, %v", got, err)
	}
	t.Setenv("PUA_TEST_VALUE", "current")
	t.Setenv("FORGE_TEST_VALUE", "current")
	if got, err := environmentOverride("PUA_TEST_VALUE", "FORGE_TEST_VALUE"); err != nil || got != "current" {
		t.Fatalf("matching overrides = %q, %v", got, err)
	}
	t.Setenv("FORGE_TEST_VALUE", "different")
	if _, err := environmentOverride("PUA_TEST_VALUE", "FORGE_TEST_VALUE"); err == nil || !strings.Contains(err.Error(), "different values") {
		t.Fatalf("expected conflicting override error, got %v", err)
	}
}
