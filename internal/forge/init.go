package forge

import (
	"fmt"
	"strings"

	"github.com/disksing/forge/internal/app"
)

func runInit(args []string) error {
	language, creatorOption, err := parseInitOptions(args)
	if err != nil {
		return fmt.Errorf("usage: forge init [--language=<language>] [--creator=user|agent]: %w", err)
	}
	creator, err := resolveCreationCreator(creatorOption)
	if err != nil {
		return err
	}
	return applicationInit(language, creator)
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

func parseInitOptions(args []string) (string, string, error) {
	var language, creator string
	for i := 0; i < len(args); i++ {
		arg := args[i]
		switch {
		case strings.HasPrefix(arg, "--language="):
			if language != "" {
				return "", "", fmt.Errorf("--language may only be specified once")
			}
			value, err := app.NormalizeLanguage(strings.TrimPrefix(arg, "--language="))
			if err != nil {
				return "", "", err
			}
			language = value
		case arg == "--language":
			if language != "" || i+1 >= len(args) {
				return "", "", fmt.Errorf("--language requires one value")
			}
			i++
			value, err := app.NormalizeLanguage(args[i])
			if err != nil {
				return "", "", err
			}
			language = value
		case strings.HasPrefix(arg, "--creator="):
			if creator != "" {
				return "", "", fmt.Errorf("--creator may only be specified once")
			}
			value, err := normalizeCreationCreatorOption(strings.TrimPrefix(arg, "--creator="))
			if err != nil {
				return "", "", err
			}
			creator = value
		case arg == "--creator":
			if creator != "" || i+1 >= len(args) {
				return "", "", fmt.Errorf("--creator requires one value")
			}
			i++
			value, err := normalizeCreationCreatorOption(args[i])
			if err != nil {
				return "", "", err
			}
			creator = value
		default:
			return "", "", fmt.Errorf("unexpected argument %q", arg)
		}
	}
	return language, creator, nil
}
