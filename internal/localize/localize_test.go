package localize

import (
	"reflect"
	"strings"
	"testing"
)

func TestLocalesHaveMatchingTemplateSets(t *testing.T) {
	english, err := TemplateNames(English)
	if err != nil {
		t.Fatal(err)
	}
	chinese, err := TemplateNames(SimplifiedChinese)
	if err != nil {
		t.Fatal(err)
	}
	if !reflect.DeepEqual(english, chinese) {
		t.Fatalf("locale template sets differ:\nen: %v\nzh-CN: %v", english, chinese)
	}
}

func TestRenderRejectsMissingData(t *testing.T) {
	_, err := Render(English, "task-agents.md", map[string]string{})
	if err == nil || !strings.Contains(err.Error(), "ResourceID") {
		t.Fatalf("expected missing ResourceID error, got %v", err)
	}
}

func TestNormalizeLanguage(t *testing.T) {
	for input, want := range map[string]string{"": English, "en_US": English, "zh": SimplifiedChinese, "zh-Hans": SimplifiedChinese} {
		got, err := Normalize(input)
		if err != nil || got != want {
			t.Fatalf("Normalize(%q) = %q, %v; want %q", input, got, err, want)
		}
	}
	if _, err := Normalize("fr"); err == nil {
		t.Fatal("expected unsupported language error")
	}
}
