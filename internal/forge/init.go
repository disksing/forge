package forge

import (
	"fmt"
	"strings"

	"github.com/disksing/forge/internal/app"
)

func runInit(args []string) error {
	language, err := parseLanguageOption(args)
	if err != nil {
		return fmt.Errorf("usage: forge init [--language=<language>]: %w", err)
	}
	return applicationInit(language)
}

func runWorkspaceMigrate(args []string) error {
	language, err := parseLanguageOption(args)
	if err != nil {
		return fmt.Errorf("usage: forge migrate [--language=<language>]: %w", err)
	}
	return applicationMigrate(language)
}

func parseLanguageOption(args []string) (string, error) {
	var language string
	seen := false
	for i := 0; i < len(args); i++ {
		arg := args[i]
		var value string
		switch {
		case strings.HasPrefix(arg, "--language="):
			value = strings.TrimPrefix(arg, "--language=")
		case arg == "--language":
			i++
			if i >= len(args) {
				return "", fmt.Errorf("--language requires a value")
			}
			value = args[i]
		default:
			return "", fmt.Errorf("unexpected argument %q", arg)
		}
		if seen {
			return "", fmt.Errorf("--language may only be specified once")
		}
		seen = true
		normalized, err := app.NormalizeLanguage(value)
		if err != nil {
			return "", err
		}
		language = normalized
	}
	return language, nil
}
