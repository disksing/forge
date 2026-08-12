package app

import (
	"os"
	"path/filepath"
	"strings"
	"testing"
)

func TestApplicationProductionCodeHasNoProcessCWDOrUserOutput(t *testing.T) {
	entries, err := os.ReadDir(".")
	if err != nil {
		t.Fatal(err)
	}
	for _, entry := range entries {
		if entry.IsDir() || !strings.HasSuffix(entry.Name(), ".go") || strings.HasSuffix(entry.Name(), "_test.go") {
			continue
		}
		data, err := os.ReadFile(filepath.Clean(entry.Name()))
		if err != nil {
			t.Fatal(err)
		}
		source := string(data)
		for _, forbidden := range []string{"os.Getwd(", "os.Chdir(", "os.Stdout", "os.Stderr", "fmt.Print"} {
			if strings.Contains(source, forbidden) {
				t.Errorf("%s contains process-global adapter concern %q", entry.Name(), forbidden)
			}
		}
	}
}
