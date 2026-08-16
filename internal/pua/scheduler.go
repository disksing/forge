package pua

import (
	"errors"
	"fmt"
	"os"
	"strings"

	"github.com/disksing/pua/internal/app"
)

const (
	schedulerAddUsage    = "usage: pua scheduler add --description=<text> --condition=<text> --target=<resource>"
	schedulerShowUsage   = "usage: pua scheduler show --id=<schedule>"
	schedulerUpdateUsage = "usage: pua scheduler update --id=<schedule> [--description=<text>] [--condition=<text>] [--target=<resource>]"
	schedulerRemoveUsage = "usage: pua scheduler remove --id=<schedule>"
)

func runScheduler(args []string) error {
	if len(args) > 0 && isHelpCommand(args[0]) {
		printSchedulerHelp()
		return nil
	}
	if len(args) == 0 {
		return errors.New("scheduler requires a subcommand")
	}
	switch args[0] {
	case "list":
		jsonOutput := false
		for _, arg := range args[1:] {
			if arg != "--json" || jsonOutput {
				return errors.New("usage: pua scheduler list [--json]")
			}
			jsonOutput = true
		}
		workspace, err := openApplicationWorkspace()
		if err != nil {
			return err
		}
		config, err := workspace.Scheduler()
		if err != nil {
			return err
		}
		if jsonOutput {
			return printJSON(config)
		}
		for _, schedule := range config.Schedules {
			fmt.Fprintf(os.Stdout, "%s\t%s\t%s\t%s\n", schedule.ID, schedule.Description, schedule.Condition, schedule.Target)
		}
		return nil
	case "show":
		values, err := parseSchedulerOptions(args[1:], map[string]bool{"id": true})
		if err != nil || values["id"] == "" {
			return errors.New(schedulerShowUsage)
		}
		workspace, err := openApplicationWorkspace()
		if err != nil {
			return err
		}
		config, err := workspace.Scheduler()
		if err != nil {
			return err
		}
		for _, schedule := range config.Schedules {
			if schedule.ID == values["id"] {
				return printJSON(schedule)
			}
		}
		return fmt.Errorf("schedule not found: %s", values["id"])
	case "add":
		values, err := parseSchedulerOptions(args[1:], map[string]bool{"description": true, "condition": true, "target": true})
		if err != nil || values["description"] == "" || values["condition"] == "" || values["target"] == "" {
			return errors.New(schedulerAddUsage)
		}
		workspace, err := openApplicationWorkspace()
		if err != nil {
			return err
		}
		created, err := workspace.AddSchedule(app.CreateScheduleInput{Description: values["description"], Condition: values["condition"], Target: values["target"]})
		if err != nil {
			return err
		}
		return printJSON(created)
	case "update":
		values, err := parseSchedulerOptions(args[1:], map[string]bool{"id": true, "description": true, "condition": true, "target": true})
		if err != nil || values["id"] == "" {
			return errors.New(schedulerUpdateUsage)
		}
		input := app.UpdateScheduleInput{ID: values["id"]}
		if value, exists := values["description"]; exists {
			input.Description = &value
		}
		if value, exists := values["condition"]; exists {
			input.Condition = &value
		}
		if value, exists := values["target"]; exists {
			input.Target = &value
		}
		if input.Description == nil && input.Condition == nil && input.Target == nil {
			return errors.New(schedulerUpdateUsage)
		}
		workspace, err := openApplicationWorkspace()
		if err != nil {
			return err
		}
		updated, err := workspace.UpdateSchedule(input)
		if err != nil {
			return err
		}
		return printJSON(updated)
	case "remove":
		values, err := parseSchedulerOptions(args[1:], map[string]bool{"id": true})
		if err != nil || values["id"] == "" {
			return errors.New(schedulerRemoveUsage)
		}
		workspace, err := openApplicationWorkspace()
		if err != nil {
			return err
		}
		removed, err := workspace.RemoveSchedule(values["id"])
		if err != nil {
			return err
		}
		return printJSON(removed)
	default:
		return fmt.Errorf("unknown scheduler subcommand %q", args[0])
	}
}

func parseSchedulerOptions(args []string, allowed map[string]bool) (map[string]string, error) {
	values := make(map[string]string)
	for index := 0; index < len(args); index++ {
		arg := args[index]
		if !strings.HasPrefix(arg, "--") {
			return nil, fmt.Errorf("unexpected argument %q", arg)
		}
		nameValue := strings.SplitN(strings.TrimPrefix(arg, "--"), "=", 2)
		name := nameValue[0]
		if !allowed[name] || values[name] != "" {
			return nil, fmt.Errorf("unknown or duplicate option --%s", name)
		}
		value := ""
		if len(nameValue) == 2 {
			value = nameValue[1]
		} else if index+1 < len(args) && !strings.HasPrefix(args[index+1], "--") {
			index++
			value = args[index]
		}
		value = strings.TrimSpace(value)
		if value == "" {
			return nil, fmt.Errorf("option --%s requires a value", name)
		}
		values[name] = value
	}
	return values, nil
}
