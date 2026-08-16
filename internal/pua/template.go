package pua

import (
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"os"
	"strconv"
	"strings"

	"github.com/disksing/pua/internal/app"
	"gopkg.in/yaml.v3"
)

const (
	templateListUsage     = "usage: pua template list [--project=<project>] [--json]"
	templateShowUsage     = "usage: pua template show [--project=<project>] [--json|--raw|--schema] <name>"
	templateValidateUsage = "usage: pua template validate [--project=<project>] [<name>|--all] [--json]"
	templateRenderUsage   = "usage: pua template render [--project=<project>] [--field <name>=<value>...] [--fields <file>] [--title <title>] [--json] <name>"
	templateCreateUsage   = "usage: pua template create [--project=<project>] [--title=<title>] <name>"
)

type templateCLIOptions struct {
	ProjectID string
	Name      string
	JSON      bool
	Raw       bool
	Schema    bool
	All       bool
	Title     string
	Fields    string
	Field     []string
}

func runTemplate(args []string) error {
	if len(args) > 0 && isHelpCommand(args[0]) {
		printTemplateHelp()
		return nil
	}
	if len(args) == 0 {
		return errors.New("template requires a subcommand")
	}
	switch args[0] {
	case "list":
		options, err := parseTemplateArgs(args[1:], "list")
		if err != nil {
			return err
		}
		return templateList(options)
	case "show":
		options, err := parseTemplateArgs(args[1:], "show")
		if err != nil {
			return err
		}
		return templateShow(options)
	case "validate":
		options, err := parseTemplateArgs(args[1:], "validate")
		if err != nil {
			return err
		}
		return templateValidate(options)
	case "render":
		options, err := parseTemplateArgs(args[1:], "render")
		if err != nil {
			return err
		}
		return templateRender(options)
	case "create":
		options, err := parseTemplateArgs(args[1:], "create")
		if err != nil {
			return err
		}
		return templateCreate(options)
	default:
		return fmt.Errorf("unknown template subcommand %q", args[0])
	}
}

func templateUsage(command string) string {
	switch command {
	case "list":
		return templateListUsage
	case "show":
		return templateShowUsage
	case "validate":
		return templateValidateUsage
	case "render":
		return templateRenderUsage
	case "create":
		return templateCreateUsage
	default:
		return "usage: pua template <list|show|validate|render|create>"
	}
}

func parseTemplateArgs(args []string, command string) (templateCLIOptions, error) {
	var options templateCLIOptions
	var positional []string
	usage := templateUsage(command)
	for i := 0; i < len(args); i++ {
		arg := args[i]
		next := func() (string, bool) {
			if i+1 >= len(args) || strings.HasPrefix(args[i+1], "--") {
				return "", false
			}
			i++
			return args[i], true
		}
		switch {
		case strings.HasPrefix(arg, "--project="):
			value := strings.TrimPrefix(arg, "--project=")
			project, err := normalizeProjectArg(value)
			if err != nil || options.ProjectID != "" {
				if err != nil {
					return options, err
				}
				return options, errors.New(usage)
			}
			options.ProjectID = project
		case arg == "--project":
			value, ok := next()
			if !ok || options.ProjectID != "" {
				return options, errors.New(usage)
			}
			project, err := normalizeProjectArg(value)
			if err != nil {
				return options, err
			}
			options.ProjectID = project
		case arg == "--json":
			options.JSON = true
		case arg == "--raw":
			options.Raw = true
		case arg == "--schema":
			options.Schema = true
		case arg == "--all":
			options.All = true
		case strings.HasPrefix(arg, "--title="):
			options.Title = strings.TrimPrefix(arg, "--title=")
		case arg == "--title":
			value, ok := next()
			if !ok {
				return options, errors.New(usage)
			}
			options.Title = value
		case strings.HasPrefix(arg, "--fields="):
			if options.Fields != "" {
				return options, errors.New(usage)
			}
			options.Fields = strings.TrimPrefix(arg, "--fields=")
		case arg == "--fields":
			value, ok := next()
			if !ok || options.Fields != "" {
				return options, errors.New(usage)
			}
			options.Fields = value
		case strings.HasPrefix(arg, "--field="):
			options.Field = append(options.Field, strings.TrimPrefix(arg, "--field="))
		case arg == "--field":
			value, ok := next()
			if !ok {
				return options, errors.New(usage)
			}
			options.Field = append(options.Field, value)
		case strings.HasPrefix(arg, "--"):
			return options, errors.New(usage)
		default:
			positional = append(positional, arg)
		}
	}
	allowed := func(values ...string) bool {
		for _, value := range values {
			if command == value {
				return true
			}
		}
		return false
	}
	if options.JSON && !allowed("list", "show", "validate", "render") || options.Raw && command != "show" || options.Schema && command != "show" || options.All && command != "validate" || options.Title != "" && !allowed("render", "create") || options.Fields != "" && command != "render" || len(options.Field) > 0 && command != "render" {
		return options, errors.New(usage)
	}
	if command == "list" {
		if len(positional) != 0 {
			return options, errors.New(usage)
		}
	} else if command == "validate" {
		if len(positional) > 1 || options.All && len(positional) > 0 {
			return options, errors.New(usage)
		}
		if len(positional) == 1 {
			options.Name = positional[0]
		} else {
			options.All = true
		}
	} else {
		if len(positional) != 1 {
			return options, errors.New(usage)
		}
		options.Name = positional[0]
	}
	if command == "show" && boolCount(options.JSON, options.Raw, options.Schema) > 1 {
		return options, errors.New(usage)
	}
	return options, nil
}

func boolCount(values ...bool) int {
	count := 0
	for _, value := range values {
		if value {
			count++
		}
	}
	return count
}

func resolveTemplateProject(options *templateCLIOptions) error {
	if options.ProjectID != "" {
		return nil
	}
	project, ok, err := inferCurrentProjectID()
	if err != nil {
		return err
	}
	if !ok {
		return errors.New("could not infer current project; use --project=<project>")
	}
	options.ProjectID = project
	return nil
}

func templateWorkspace(options *templateCLIOptions) (*app.Workspace, error) {
	if err := resolveTemplateProject(options); err != nil {
		return nil, err
	}
	return openApplicationWorkspace()
}

func templateList(options templateCLIOptions) error {
	workspace, err := templateWorkspace(&options)
	if err != nil {
		return err
	}
	templates, err := workspace.Templates(options.ProjectID)
	if err != nil {
		return err
	}
	if options.JSON {
		return printJSON(map[string]any{"templates": templates})
	}
	for _, template := range templates {
		status := "valid"
		if !template.Valid {
			status = "invalid"
		}
		fmt.Printf("%s\t%s\tv%d\t%d fields\t%s\n", template.Name, template.Title, template.SchemaVersion, len(template.Fields), status)
	}
	return nil
}

func templateShow(options templateCLIOptions) error {
	workspace, err := templateWorkspace(&options)
	if err != nil {
		return err
	}
	template, err := workspace.Template(options.ProjectID, options.Name)
	if err != nil {
		return err
	}
	if options.Raw {
		_, err = fmt.Fprint(os.Stdout, template.Content)
		return err
	}
	if options.Schema {
		return printJSON(map[string]any{"name": template.Name, "schemaVersion": template.SchemaVersion, "taskTitle": template.TaskTitle, "fields": template.Fields, "digest": template.Digest, "valid": template.Valid, "errors": template.Errors, "warnings": template.Warnings})
	}
	if options.JSON {
		return printJSON(template)
	}
	return printHumanTemplate(template)
}

func printHumanTemplate(template app.TaskTemplate) error {
	fmt.Printf("Name: %s\nTitle: %s\nPath: %s\nSchema version: %d\nDigest: %s\nStatus: %s\n", template.Name, template.Title, template.Path, template.SchemaVersion, template.Digest, map[bool]string{true: "valid", false: "invalid"}[template.Valid])
	if template.Description != "" {
		fmt.Printf("Description: %s\n", template.Description)
	}
	if template.TaskTitle != "" {
		fmt.Printf("Task title: %s\n", template.TaskTitle)
	}

	fmt.Println("Fields:")
	if len(template.Fields) == 0 {
		fmt.Println("  (none)")
	}
	for _, field := range template.Fields {
		required := "optional"
		if field.Required {
			required = "required"
		}
		fmt.Printf("  - %s (%s, %s): %s\n", field.Name, field.Type, required, field.Label)
		if field.Description != "" {
			fmt.Printf("    Description: %s\n", field.Description)
		}
		if field.Placeholder != "" {
			fmt.Printf("    Placeholder: %s\n", field.Placeholder)
		}
		if field.HasDefault {
			fmt.Printf("    Default: %v\n", field.Default)
		}
		if len(field.Options) > 0 {
			fmt.Printf("    Options: %s\n", strings.Join(field.Options, ", "))
		}
	}

	issues := append(append([]app.TemplateIssue{}, template.Errors...), template.Warnings...)
	if len(issues) > 0 {
		fmt.Println("Diagnostics:")
		for _, issue := range issues {
			fmt.Printf("  %s: %s\t%s\t%s\n", strings.ToUpper(issue.Severity), issue.Code, issue.Path, issue.Message)
		}
	}

	fmt.Println("Markdown body:")
	body := template.Body
	if body == "" && template.Content != "" {
		// Keep malformed templates inspectable even when front matter parsing
		// could not identify a separate Markdown body.
		body = template.Content
	}
	if body == "" {
		fmt.Println("  (empty)")
		return nil
	}
	fmt.Print(body)
	if !strings.HasSuffix(body, "\n") {
		fmt.Println()
	}
	return nil
}

func templateValidate(options templateCLIOptions) error {
	workspace, err := templateWorkspace(&options)
	if err != nil {
		return err
	}
	templates, err := workspace.Templates(options.ProjectID)
	if err != nil {
		return err
	}
	if options.Name != "" {
		template, err := workspace.Template(options.ProjectID, options.Name)
		if err != nil {
			return err
		}
		templates = []app.TaskTemplate{template}
	}
	if options.JSON {
		if err := printJSON(map[string]any{"templates": templates}); err != nil {
			return err
		}
	} else {
		for _, template := range templates {
			status := "valid"
			if !template.Valid {
				status = "invalid"
			}
			fmt.Printf("%s\t%s\n", template.Name, status)
			for _, issue := range append(append([]app.TemplateIssue{}, template.Errors...), template.Warnings...) {
				fmt.Fprintf(os.Stderr, "%s\t%s\t%s\t%s\n", template.Name, issue.Code, issue.Path, issue.Message)
			}
		}
	}
	for _, template := range templates {
		if !template.Valid {
			return fmt.Errorf("one or more templates are invalid")
		}
	}
	return nil
}

func readTemplateFields(path string) (map[string]any, error) {
	if strings.TrimSpace(path) == "" {
		return map[string]any{}, nil
	}
	var data []byte
	var err error
	if path == "-" {
		data, err = io.ReadAll(os.Stdin)
	} else {
		data, err = os.ReadFile(path)
	}
	if err != nil {
		return nil, err
	}
	var values map[string]any
	if json.Valid(data) {
		err = json.Unmarshal(data, &values)
	} else {
		err = yaml.Unmarshal(data, &values)
	}
	if err != nil {
		return nil, fmt.Errorf("read template fields: %w", err)
	}
	if values == nil {
		values = map[string]any{}
	}
	return values, nil
}

func templateFieldValues(workspace *app.Workspace, projectID, name, fieldsFile string, fieldArgs []string) (map[string]any, error) {
	values, err := readTemplateFields(fieldsFile)
	if err != nil {
		return nil, err
	}
	template, err := workspace.Template(projectID, name)
	if err != nil {
		return nil, err
	}
	types := map[string]string{}
	for _, field := range template.Fields {
		types[field.Name] = field.Type
	}
	for _, assignment := range fieldArgs {
		name, value, ok := strings.Cut(assignment, "=")
		name = strings.TrimSpace(name)
		if !ok || name == "" {
			return nil, fmt.Errorf("invalid --field %q: use name=value", assignment)
		}
		if types[name] == "boolean" {
			boolean, err := strconv.ParseBool(strings.TrimSpace(value))
			if err != nil {
				return nil, fmt.Errorf("invalid boolean for field %s: %q", name, value)
			}
			values[name] = boolean
		} else {
			values[name] = value
		}
	}
	return values, nil
}

func templateRender(options templateCLIOptions) error {
	workspace, err := templateWorkspace(&options)
	if err != nil {
		return err
	}
	fields, err := templateFieldValues(workspace, options.ProjectID, options.Name, options.Fields, options.Field)
	if err != nil {
		return err
	}
	result, err := workspace.RenderTemplate(app.TemplateRenderInput{ProjectID: options.ProjectID, Name: options.Name, Fields: fields, Title: options.Title})
	if err != nil {
		return err
	}
	if options.JSON {
		return printJSON(result)
	}
	_, err = fmt.Fprint(os.Stdout, result.Markdown)
	return err
}

func templateCreate(options templateCLIOptions) error {
	workspace, err := templateWorkspace(&options)
	if err != nil {
		return err
	}
	template, err := workspace.CreateTemplate(options.ProjectID, options.Name, options.Title)
	if err != nil {
		return err
	}
	return printJSON(template)
}
