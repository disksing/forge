package forge

import (
	"fmt"
	"strings"

	"github.com/disksing/forge/internal/app"
)

func runInit(args []string) error {
	if len(args) == 1 && isHelpCommand(args[0]) {
		printInitHelp()
		return nil
	}
	language, err := parseInitOptions(args)
	if err != nil {
		return fmt.Errorf("usage: forge init [--language=<language>]: %w", err)
	}
	return applicationInit(language)
}

func runWorkspaceMigrate(args []string) error {
	if len(args) == 1 && isHelpCommand(args[0]) {
		printMigrateHelp()
		return nil
	}
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

func parseInitOptions(args []string) (string, error) {
	var language string
	for i := 0; i < len(args); i++ {
		arg := args[i]
		switch {
		case strings.HasPrefix(arg, "--language="):
			if language != "" {
				return "", fmt.Errorf("--language may only be specified once")
			}
			value, err := app.NormalizeLanguage(strings.TrimPrefix(arg, "--language="))
			if err != nil {
				return "", err
			}
			language = value
		case arg == "--language":
			if language != "" || i+1 >= len(args) {
				return "", fmt.Errorf("--language requires one value")
			}
			i++
			value, err := app.NormalizeLanguage(args[i])
			if err != nil {
				return "", err
			}
			language = value
		default:
			return "", fmt.Errorf("unexpected argument %q", arg)
		}
	}
	return language, nil
}
