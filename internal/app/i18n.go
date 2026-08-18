package app

import (
	"fmt"

	"github.com/disksing/pua/internal/localize"
)

const (
	defaultLanguage           = localize.English
	languageSimplifiedChinese = localize.SimplifiedChinese
)

func normalizeLanguage(language string) (string, error) {
	return localize.Normalize(language)
}

// NormalizeLanguage returns PUA's canonical language identifier.
func NormalizeLanguage(language string) (string, error) {
	return normalizeLanguage(language)
}

func readWorkspaceConfig(root string) (Config, error) {
	config := Config{}
	if err := readJSON(workspaceConfigPath(root), &config); err != nil {
		return Config{}, err
	}
	language, err := normalizeLanguage(config.Language)
	if err != nil {
		return Config{}, fmt.Errorf("invalid workspace language: %w", err)
	}
	config.Language = language
	return config, nil
}

func workspaceLanguage(root string) (string, error) {
	config, err := readWorkspaceConfig(root)
	if err != nil {
		return "", err
	}
	return config.Language, nil
}

// Language returns the Workspace's canonical content language.
func (w *Workspace) Language() (string, error) {
	if err := w.require(); err != nil {
		return "", err
	}
	return workspaceLanguage(w.root)
}

func defaultWikiIndexForLanguage(language string) string {
	return localize.MustRender(language, "wiki-index.md", nil)
}

func workspaceAgentsPromptForLanguage(language string) string {
	// Do not add exact-text assertions for generated prompts; they mirror prompt content without validating behavior.
	return localize.MustRender(language, "workspace-agents.md", nil)
}
