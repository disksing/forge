package pua

import (
	"context"
	"errors"
	"fmt"
	"net/http"
	"sort"
	"strings"

	"github.com/disksing/pua/internal/app"
)

const doctorUsage = "usage: pua doctor [--json] [--server=<url>]"

type doctorExitError struct {
	code    int
	message string
}

func (e doctorExitError) Error() string { return e.message }
func (e doctorExitError) ExitCode() int { return e.code }

func runDoctor(args []string) error {
	if len(args) == 1 && isHelpCommand(args[0]) {
		printDoctorHelp()
		return nil
	}
	remaining, serverURL, err := splitServerArg(args, doctorUsage)
	if err != nil {
		return err
	}
	jsonOutput := false
	for _, arg := range remaining {
		if arg == "--json" && !jsonOutput {
			jsonOutput = true
			continue
		}
		return errors.New(doctorUsage)
	}
	workspace, err := openApplicationWorkspace()
	if err != nil {
		return err
	}
	options := app.DoctorOptions{}
	client, _, clientErr := newResourceServerClient(serverURL)
	if clientErr != nil {
		options.BindingError = clientErr.Error()
	} else {
		var settings agentHubSettingsResponse
		if requestErr := client.request(context.Background(), http.MethodGet, "/api/settings/agenthub", nil, &settings); requestErr != nil {
			options.BindingError = requestErr.Error()
		} else if message := strings.TrimSpace(settings.Error); message != "" {
			options.BindingError = message
		} else if !settings.Connected || !settings.Compatible {
			options.BindingError = "PUA Server did not provide a connected, compatible AgentHub catalog"
		} else {
			catalog := &app.DoctorBindingCatalog{
				Profiles: make([]app.DoctorProfile, 0, len(settings.Config.AgentProfiles)),
				Agents:   make([]app.DoctorAgent, 0, len(settings.Catalog.Agents)),
			}
			for _, profile := range settings.Config.AgentProfiles {
				catalog.Profiles = append(catalog.Profiles, app.DoctorProfile{Key: profile.Key, AgentName: profile.AgentName})
			}
			for _, agent := range settings.Catalog.Agents {
				catalog.Agents = append(catalog.Agents, app.DoctorAgent{
					Name: agent.Name, Available: agent.Available, UnavailableReason: agent.UnavailableReason,
				})
			}
			options.BindingCatalog = catalog
		}
	}
	report, err := app.CheckWorkspace(workspace.Root(), options)
	if err != nil {
		return doctorExitError{code: 2, message: "doctor could not inspect the Workspace: " + err.Error()}
	}
	if jsonOutput {
		if err := printJSON(report); err != nil {
			return err
		}
	} else {
		printDoctorReport(report)
	}
	if !report.Complete {
		return doctorExitError{code: 2, message: "doctor checks were incomplete"}
	}
	if report.Summary.Errors > 0 {
		return doctorExitError{code: 1, message: "doctor found errors"}
	}
	return nil
}

func printDoctorReport(report app.DoctorReport) {
	fmt.Printf("Workspace: %s\n", report.Workspace)
	if len(report.Issues) == 0 {
		fmt.Println("Doctor: healthy")
		return
	}
	issues := append([]app.DoctorIssue(nil), report.Issues...)
	sort.SliceStable(issues, func(i, j int) bool {
		if issues[i].Severity != issues[j].Severity {
			return issues[i].Severity < issues[j].Severity
		}
		return issues[i].Path < issues[j].Path
	})
	for _, issue := range issues {
		location := issue.Path
		if location == "" {
			location = "Workspace"
		}
		if issue.ResourceID != "" {
			location = issue.ResourceID + " " + location
		}
		fmt.Printf("%s [%s] %s: %s\n", strings.ToUpper(issue.Severity), issue.Code, location, issue.Message)
		if issue.Suggestion != "" {
			fmt.Printf("  Suggestion: %s\n", issue.Suggestion)
		}
	}
	fmt.Printf("Summary: %d error(s), %d warning(s)\n", report.Summary.Errors, report.Summary.Warnings)
}

func printDoctorHelp() {
	fmt.Print(`Usage:
  pua doctor [--json] [--server=<url>]

Inspect the current open Workspace without changing it. Doctor checks the
Workspace configuration, open Project and Task metadata, Scheduler targets,
PUA-managed AGENTS.md sections, templates, repository references, and Agent
bindings. Archive directories are skipped completely.

Agent and Profile checks use the owning pua serve process. If no compatible
catalog can be reached, filesystem checks still run and the report is marked
incomplete. Exit status is 0 when there are no errors, 1 when errors are found,
and 2 when the check could not be completed.

Options:
  --json              print the complete machine-readable report
  --server <url>      override the owning pua serve address
`)
}
