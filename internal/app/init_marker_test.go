package app

import (
	"strings"
	"testing"
)

func TestUpsertManagedBlockMigratesLegacyForgeMarkers(t *testing.T) {
	legacy := "# User notes\n\n" + legacyForgePromptStart + "\nold managed content\n" + legacyForgePromptEnd + "\n"
	updated, err := upsertManagedBlock(legacy, puaPromptBlock(defaultLanguage))
	if err != nil {
		t.Fatal(err)
	}
	if !strings.Contains(updated, puaPromptStart) || !strings.Contains(updated, puaPromptEnd) {
		t.Fatalf("PUA markers missing after migration:\n%s", updated)
	}
	if strings.Contains(updated, legacyForgePromptStart) || strings.Contains(updated, legacyForgePromptEnd) {
		t.Fatalf("legacy Forge markers remain after migration:\n%s", updated)
	}
	if !strings.HasPrefix(updated, "# User notes") {
		t.Fatalf("user content was not preserved:\n%s", updated)
	}
}

func TestUpsertManagedBlockRejectsMixedMarkerGenerations(t *testing.T) {
	content := puaPromptStart + "\ncontent\n" + legacyForgePromptEnd
	if _, err := upsertManagedBlock(content, puaPromptBlock(defaultLanguage)); err == nil {
		t.Fatal("expected mixed PUA and Forge markers to fail")
	}
}
