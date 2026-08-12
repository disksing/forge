package forge

import (
	"errors"
	"fmt"
	"strings"

	"github.com/disksing/forge/internal/app"
)

const sessionShowUsage = "usage: forge session show --id=<id>"

// The CLI intentionally exposes only read-only Session diagnostics. Session
// creation, binding, and removal are internal forge serve operations.
type Session = app.Session
type SessionLiveness = app.SessionLiveness

func runSession(args []string) error {
	if len(args) == 0 {
		return errors.New("session requires a subcommand")
	}
	switch args[0] {
	case "list":
		if len(args) != 1 {
			return errors.New("usage: forge session list")
		}
		return applicationSessionList()
	case "show":
		return sessionShow(args[1:])
	default:
		return fmt.Errorf("unknown session subcommand %q", args[0])
	}
}

func sessionShow(args []string) error {
	id, err := parseSessionIDArg(args, sessionShowUsage)
	if err != nil {
		return err
	}
	return applicationSessionShow(id)
}

func parseSessionIDArg(args []string, usage string) (string, error) {
	var id string
	for i := 0; i < len(args); i++ {
		arg := args[i]
		switch {
		case strings.HasPrefix(arg, "--id="):
			value := strings.TrimSpace(strings.TrimPrefix(arg, "--id="))
			if value == "" || id != "" {
				return "", errors.New(usage)
			}
			id = value
		case arg == "--id":
			value, ok := nextFlagValue(args, &i)
			if !ok || strings.TrimSpace(value) == "" || id != "" {
				return "", errors.New(usage)
			}
			id = strings.TrimSpace(value)
		default:
			return "", errors.New(usage)
		}
	}
	if id == "" {
		return "", errors.New(usage)
	}
	return id, nil
}

func nextFlagValue(args []string, i *int) (string, bool) {
	if *i+1 >= len(args) || strings.HasPrefix(args[*i+1], "--") {
		return "", false
	}
	*i = *i + 1
	return args[*i], true
}

func formatSessionLiveness(liveness SessionLiveness) string {
	if liveness.AgentHubSessionID != "" {
		return "agenthub:" + liveness.AgentHubSessionID
	}
	if liveness.SourceExternalID != "" {
		return "agenthub:" + liveness.SourceExternalID
	}
	return "agenthub:unbound"
}
