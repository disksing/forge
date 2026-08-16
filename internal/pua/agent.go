package pua

import (
	"context"
	"errors"
	"fmt"
	"net/http"
	"os"
	"strings"
)

const agentListUsage = "usage: pua agent list [--server=<url>] [--json]"

// agentHubSettingsResponse mirrors the subset of the PUA Server
// /api/settings/agenthub response the agent list command needs. The catalog is
// read-only and owned by AgentHub; Agent Profiles are PUA Server
// configuration that maps a profile key to a catalog agent.
type agentHubSettingsResponse struct {
	Connected  bool                `json:"connected"`
	Compatible bool                `json:"compatible"`
	Error      string              `json:"error,omitempty"`
	Config     agentHubConfigJSON  `json:"config"`
	Catalog    agentHubCatalogJSON `json:"catalog"`
}

type agentHubConfigJSON struct {
	AgentProfiles []agentProfileJSON `json:"agentProfiles,omitempty"`
}

type agentProfileJSON struct {
	Key         string `json:"key"`
	Description string `json:"description,omitempty"`
	AgentName   string `json:"agentName"`
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

// agentListResult is the complete agent surface exposed by pua agent list:
// PUA Agent Profiles plus the read-only AgentHub catalog.
type agentListResult struct {
	Profiles []agentProfileJSON  `json:"profiles"`
	Catalog  agentHubCatalogJSON `json:"catalog"`
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
	profiles := response.Config.AgentProfiles
	if profiles == nil {
		profiles = []agentProfileJSON{}
	}
	result := agentListResult{Profiles: profiles, Catalog: response.Catalog}
	if jsonOutput {
		return printJSON(result)
	}
	printAgentList(result)
	return nil
}

func printAgentList(result agentListResult) {
	if len(result.Profiles) > 0 {
		fmt.Fprintln(os.Stdout, "Profiles")
		for _, profile := range result.Profiles {
			description := strings.TrimSpace(profile.Description)
			if description == "" {
				description = "-"
			}
			fmt.Fprintf(os.Stdout, "%s\t%s\t%s\n", profile.Key, profile.AgentName, description)
		}
		fmt.Fprintln(os.Stdout)
	}
	fmt.Fprintln(os.Stdout, "Agents")
	for _, agent := range result.Catalog.Agents {
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
  pua agent list [--server=<url>] [--json]

Commands:
  pua agent list [--server=<url>] [--json]
    Query the owning pua serve process for the AgentHub agent catalog and the
    configured PUA Agent Profiles. The default output lists profiles (key,
    agent, description) followed by agents (name, provider, availability). Use
    --json for the complete structured result including profiles, providers,
    and probes. --server overrides the owner address discovered from
    the Workspace control directory (.pua/serve.lock, or legacy
    .forge/serve.lock).
`)
}
