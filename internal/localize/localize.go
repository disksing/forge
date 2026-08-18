package localize

import (
	"bytes"
	"embed"
	"fmt"
	"io/fs"
	"path"
	"sort"
	"strings"
	"text/template"
)

const (
	English           = "en"
	SimplifiedChinese = "zh-CN"
)

//go:embed locales/*/*.tmpl
var localeFiles embed.FS

var localeTemplates = loadTemplates()

// Normalize returns PUA's canonical language identifier.
func Normalize(language string) (string, error) {
	switch strings.ToLower(strings.ReplaceAll(strings.TrimSpace(language), "_", "-")) {
	case "", "en", "en-us":
		return English, nil
	case "zh", "zh-cn", "zh-hans":
		return SimplifiedChinese, nil
	default:
		return "", fmt.Errorf("unsupported language %q (supported: en, zh-CN)", language)
	}
}

// Render renders one trusted, embedded locale template. Missing assets,
// invalid languages, and missing template data are programming errors and are
// deliberately returned instead of silently mixing languages.
func Render(language, name string, data any) (string, error) {
	language, err := Normalize(language)
	if err != nil {
		return "", err
	}
	templates := localeTemplates[language]
	tmpl, ok := templates[name]
	if !ok {
		return "", fmt.Errorf("localized template %q is missing for %s", name, language)
	}
	var output bytes.Buffer
	if err := tmpl.Execute(&output, data); err != nil {
		return "", fmt.Errorf("render localized template %q for %s: %w", name, language, err)
	}
	return output.String(), nil
}

// MustRender renders a trusted embedded asset and panics only when the
// compiled product text is internally inconsistent.
func MustRender(language, name string, data any) string {
	result, err := Render(language, name, data)
	if err != nil {
		panic(err)
	}
	return result
}

// TemplateNames returns the sorted embedded asset names for completeness
// checks and diagnostics.
func TemplateNames(language string) ([]string, error) {
	language, err := Normalize(language)
	if err != nil {
		return nil, err
	}
	names := make([]string, 0, len(localeTemplates[language]))
	for name := range localeTemplates[language] {
		names = append(names, name)
	}
	sort.Strings(names)
	return names, nil
}

func loadTemplates() map[string]map[string]*template.Template {
	locales := map[string]map[string]*template.Template{
		English:           {},
		SimplifiedChinese: {},
	}
	for language := range locales {
		pattern := path.Join("locales", language, "*.tmpl")
		files, err := fs.Glob(localeFiles, pattern)
		if err != nil {
			panic(err)
		}
		for _, file := range files {
			content, err := localeFiles.ReadFile(file)
			if err != nil {
				panic(err)
			}
			name := strings.TrimSuffix(path.Base(file), ".tmpl")
			parsed, err := template.New(name).Option("missingkey=error").Parse(string(content))
			if err != nil {
				panic(fmt.Errorf("parse localized template %s: %w", file, err))
			}
			locales[language][name] = parsed
		}
	}
	return locales
}
