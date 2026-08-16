package pua

import (
	"fmt"
	"strings"

	"github.com/disksing/pua/internal/app"
)

func runInit(args []string) error {
	if len(args) == 1 && isHelpCommand(args[0]) {
		printInitHelp()
		return nil
	}
	language, err := parseInitOptions(args)
	if err != nil {
		return fmt.Errorf("usage: pua init [--language=<language>]: %w", err)
	}
	return applicationInit(language)
}

func runWorkspaceMigrate(args []string) error {
	if len(args) == 1 && isHelpCommand(args[0]) {
		printMigrateHelp()
		return nil
	}
	language, renameStorage, err := parseMigrateOptions(args)
	if err != nil {
		return fmt.Errorf("usage: pua migrate [--language=<language>] [--rename-storage]: %w", err)
	}
	return applicationMigrate(language, renameStorage)
}

func parseMigrateOptions(args []string) (string, bool, error) {
	languageArgs := make([]string, 0, len(args))
	renameStorage := false
	for _, arg := range args {
		if arg == "--rename-storage" {
			if renameStorage {
				return "", false, fmt.Errorf("--rename-storage may only be specified once")
			}
			renameStorage = true
			continue
		}
		languageArgs = append(languageArgs, arg)
	}
	language, err := parseLanguageOption(languageArgs)
	return language, renameStorage, err
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
