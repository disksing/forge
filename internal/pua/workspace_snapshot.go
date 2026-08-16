package pua

import (
	"errors"
	"strings"
)

func nextFlagValue(args []string, i *int) (string, bool) {
	if *i+1 >= len(args) || strings.HasPrefix(args[*i+1], "--") {
		return "", false
	}
	*i = *i + 1
	return args[*i], true
}

func workspaceTreeJSON() error {
	return applicationWorkspaceTreeJSON()
}

func workspaceResourceJSON(id string) error {
	return applicationWorkspaceResourceJSON(id)
}

func parseWorkspaceResourceArgs(args []string) (string, error) {
	const usage = "usage: pua workspace resource --id=<resource> --json"
	if len(args) < 2 || len(args) > 3 {
		return "", errors.New(usage)
	}
	var id string
	for i := 0; i < len(args); i++ {
		arg := args[i]
		switch {
		case strings.HasPrefix(arg, "--id="):
			id = strings.TrimSpace(strings.TrimPrefix(arg, "--id="))
		case arg == "--id":
			value, ok := nextFlagValue(args, &i)
			if !ok {
				return "", errors.New(usage)
			}
			id = strings.TrimSpace(value)
		case arg == "--json":
		default:
			return "", errors.New(usage)
		}
	}
	if id == "" {
		return "", errors.New(usage)
	}
	return id, nil
}
