package app

import "testing"

func TestUpsertManagedBlockRejectsIncompleteMarkers(t *testing.T) {
	content := puaPromptStart + "\ncontent\n"
	if _, err := upsertManagedBlock(content, puaPromptBlock(defaultLanguage)); err == nil {
		t.Fatal("expected incomplete PUA markers to fail")
	}
}

func TestUpsertManagedBlockRejectsDuplicateMarkers(t *testing.T) {
	content := puaPromptStart + "\ncontent\n" + puaPromptEnd + "\n" + puaPromptStart + "\nmore\n" + puaPromptEnd
	if _, err := upsertManagedBlock(content, puaPromptBlock(defaultLanguage)); err == nil {
		t.Fatal("expected duplicate PUA markers to fail")
	}
}
