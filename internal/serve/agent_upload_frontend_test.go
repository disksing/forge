package serve

import (
	"os"
	"path/filepath"
	"strings"
	"testing"
)

func TestAgentUploadIsSvelteOwnedAndCancelsStaleRequests(t *testing.T) {
	component, err := os.ReadFile(filepath.Join("..", "..", "frontend", "src", "islands", "UploadDialog.svelte"))
	if err != nil {
		t.Fatal(err)
	}
	testSource, err := os.ReadFile(filepath.Join("..", "..", "frontend", "tests", "unit", "upload-dialog.test.ts"))
	if err != nil {
		t.Fatal(err)
	}
	for _, want := range []string{"request.upload.addEventListener(\"progress\"", "model.identity !== requestIdentity", "abortAll()", "model.onDone(items.filter"} {
		if !strings.Contains(string(component), want) {
			t.Fatalf("Svelte upload dialog is missing %q", want)
		}
	}
	if !strings.Contains(string(testSource), "aborts in-flight uploads when the Workspace or Session identity changes") {
		t.Fatal("upload cancellation component coverage is missing")
	}
}
