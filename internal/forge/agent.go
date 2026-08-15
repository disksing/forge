package forge

import (
	"context"
	"errors"
	"fmt"
	"net/http"
	"os"
	"strings"
)

const agentListUsage = "usage: forge agent list [--server=<url>] [--json]"

// agentHubSettingsResponse mirrors the subset of the Forge Server
// /api/settings/agenthub response the agent list command needs. The catalog is
// read-only and owned by AgentHub; Forge only relays it.
type agentHubSettingsResponse struct {
	Connected  bool                `json:"connected"`
	Compatible bool                `json:"compatible"`
	Error      string              `json:"error,omitempty"`
	Catalog    agentHubCatalogJSON `json:"catalog"`
}

type agentHubCatalogJSON struct {
	Providers []agentProviderJSON `json:"providers"`
	Agents    []agentJSON         `json:"agents"`
	Probes    []agentProbeJSON    `json:"probes"`
}

type agentProviderJSON struct {
	ID      string `json:"id"`
	Name    string `json:"name"`
	Type    string `json:"type"`
	Enabled bool   `json:"enabled"`
}

type agentJSON struct {
	Name              string            `json:"name"`
	ProviderID        string            `json:"providerId"`
	Options           map[string]string `json:"options,omitempty"`
	Available         bool              `json:"available"`
	UnavailableReason string            `json:"unavailableReason,omitempty"`
}

type agentProbeJSON struct {
	ProviderID string `json:"providerId"`
	Type       string `json:"type"`
	Command    string `json:"command,omitempty"`
	Available  bool   `json:"available"`
}

func runAgent(args []string) error {
	if len(args) > 0 && isHelpCommand(args[0]) {
		printAgentHelp()
		return nil
	}
	if len(args) == 0 {
		return errors.New("agent requires a subcommand")
	}
	switch args[0] {
	case "list":
		return runAgentList(args[1:])
	default:
		return fmt.Errorf("unknown agent subcommand %q", args[0])
	}
}

func runAgentList(args []string) error {
	remaining, serverURL, err := splitServerArg(args, agentListUsage)
	if err != nil {
		return err
	}
	jsonOutput := false
	for _, arg := range remaining {
		if arg == "--json" && !jsonOutput {
			jsonOutput = true
			continue
		}
		return errors.New(agentListUsage)
	}
	client, _, err := newResourceServerClient(serverURL)
	if err != nil {
		return err
	}
	var response agentHubSettingsResponse
	if err := client.request(context.Background(), http.MethodGet, "/api/settings/agenthub", nil, &response); err != nil {
		return err
	}
	if message := strings.TrimSpace(response.Error); message != "" {
		return errors.New(message)
	}
	if jsonOutput {
		return printJSON(response.Catalog)
	}
	printAgentList(response.Catalog)
	return nil
}

func printAgentList(catalog agentHubCatalogJSON) {
	for _, agent := range catalog.Agents {
		provider := strings.TrimSpace(agent.ProviderID)
		if provider == "" {
			provider = "-"
		}
		status := "available"
		if !agent.Available {
			status = "unavailable"
			if reason := strings.TrimSpace(agent.UnavailableReason); reason != "" {
				status += ": " + reason
			}
		}
		fmt.Fprintf(os.Stdout, "%s\t%s\t%s\n", agent.Name, provider, status)
	}
}

func printAgentHelp() {
	fmt.Print(`Usage:
  forge agent list [--server=<url>] [--json]

Commands:
  forge agent list [--server=<url>] [--json]
    Query the owning forge serve process for the AgentHub agent catalog. The
    default output lists each agent's name, provider, and availability as
    tab-separated rows. Use --json for the complete catalog including providers
    and probes. --server overrides the owner address discovered from
    .forge/serve.lock.
`)
}
