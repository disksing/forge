package app

import (
	"crypto/sha256"
	"encoding/hex"
	"errors"
	"fmt"
	"os"
	"path/filepath"
	"regexp"
	"sort"
	"strconv"
	"strings"

	"gopkg.in/yaml.v3"
)

const taskTemplateSchemaVersion = 2

var (
	templateNamePattern  = regexp.MustCompile(`^[A-Za-z0-9][A-Za-z0-9._-]*$`)
	templateFieldPattern = regexp.MustCompile(`^[a-z][a-z0-9_-]*$`)
	templateTokenPattern = regexp.MustCompile(`\{\{\s*([a-z][a-z0-9_-]*)\s*\}\}`)
	templateAnyToken     = regexp.MustCompile(`\{\{[^{}]*\}\}`)
)

// TemplateIssue is a stable, machine-readable template diagnostic.
type TemplateIssue struct {
	Code     string `json:"code"`
	Message  string `json:"message"`
	Path     string `json:"path,omitempty"`
	Line     int    `json:"line,omitempty"`
	Column   int    `json:"column,omitempty"`
	Severity string `json:"severity"`
}

// TemplateValidationError carries all field-level failures from one template operation.
type TemplateValidationError struct {
	Template string          `json:"template"`
	Issues   []TemplateIssue `json:"issues"`
}

func (e *TemplateValidationError) Error() string {
	if e == nil || len(e.Issues) == 0 {
		return "template validation failed"
	}
	parts := make([]string, 0, len(e.Issues))
	for _, issue := range e.Issues {
		location := issue.Path
		if issue.Line > 0 {
			location += fmt.Sprintf(":%d", issue.Line)
		}
		if location != "" {
			parts = append(parts, fmt.Sprintf("%s: %s", location, issue.Message))
		} else {
			parts = append(parts, issue.Message)
		}
	}
	return strings.Join(parts, "; ")
}

// TemplateField describes one user-supplied value in a V2 content template.
type TemplateField struct {
	Name        string   `json:"name"`
	Type        string   `json:"type"`
	Label       string   `json:"label"`
	Description string   `json:"description,omitempty"`
	Required    bool     `json:"required,omitempty"`
	Placeholder string   `json:"placeholder,omitempty"`
	Default     any      `json:"default,omitempty"`
	HasDefault  bool     `json:"hasDefault,omitempty"`
	Options     []string `json:"options,omitempty"`
}

// TemplateRenderInput contains typed values and an optional explicit task title.
type TemplateRenderInput struct {
	ProjectID string         `json:"project"`
	Name      string         `json:"templateName"`
	Fields    map[string]any `json:"templateFields"`
	Title     string         `json:"title,omitempty"`
}

// TemplateRenderResult is deterministic for identical template bytes and inputs.
type TemplateRenderResult struct {
	TemplateName  string          `json:"templateName"`
	SchemaVersion int             `json:"schemaVersion"`
	Digest        string          `json:"digest"`
	Title         string          `json:"title"`
	Markdown      string          `json:"markdown"`
	Fields        map[string]any  `json:"fields"`
	Warnings      []TemplateIssue `json:"warnings,omitempty"`
}

// TemplateMigration describes a V1-to-V2 migration preview or write result.
type TemplateMigration struct {
	Name     string          `json:"name"`
	Path     string          `json:"path"`
	Changed  bool            `json:"changed"`
	Written  bool            `json:"written"`
	Content  string          `json:"content,omitempty"`
	Warnings []TemplateIssue `json:"warnings,omitempty"`
}

func normalizeTemplateSource(content string) string {
	content = strings.ReplaceAll(content, "\r\n", "\n")
	content = strings.ReplaceAll(content, "\r", "\n")
	return strings.TrimRight(content, "\n") + "\n"
}

func templateDigest(content string) string {
	sum := sha256.Sum256([]byte(normalizeTemplateSource(content)))
	return "sha256:" + hex.EncodeToString(sum[:])
}

func templateProblem(code, message, path string, node *yaml.Node) TemplateIssue {
	issue := TemplateIssue{Code: code, Message: message, Path: path, Severity: "error"}
	if node != nil {
		// yaml.Node line numbers are relative to the front matter contents;
		// account for the opening --- line in the physical Markdown file.
		issue.Line, issue.Column = node.Line+1, node.Column
	}
	return issue
}

func templateWarning(code, message, path string, node *yaml.Node) TemplateIssue {
	issue := templateProblem(code, message, path, node)
	issue.Severity = "warning"
	return issue
}

func safeTemplateName(name string) bool {
	name = strings.TrimSpace(name)
	return name != "." && name != ".." && templateNamePattern.MatchString(name) && !strings.ContainsAny(name, `/\\`)
}

func splitTemplateSource(name, content string) (string, string, []TemplateIssue) {
	normalized := normalizeTemplateSource(content)
	if !strings.HasPrefix(normalized, "---\n") {
		return "", "", []TemplateIssue{templateProblem("front_matter_missing", "template must start with YAML front matter", "", nil)}
	}
	end := strings.Index(normalized[4:], "\n---\n")
	if end < 0 {
		return "", "", []TemplateIssue{templateProblem("front_matter_unterminated", "template has unterminated YAML front matter", "", nil)}
	}
	front := normalized[4 : 4+end]
	body := normalized[4+end+5:]
	if body == "" {
		body = "\n"
	}
	_ = name
	return front, normalizeTemplateSource(body), nil
}

func mappingValue(node *yaml.Node, key string) (*yaml.Node, *yaml.Node) {
	if node == nil || node.Kind != yaml.MappingNode {
		return nil, nil
	}
	for i := 0; i+1 < len(node.Content); i += 2 {
		if node.Content[i].Value == key {
			return node.Content[i], node.Content[i+1]
		}
	}
	return nil, nil
}

func decodeString(node *yaml.Node, path string, required bool, issues *[]TemplateIssue) string {
	if node == nil {
		if required {
			*issues = append(*issues, templateProblem("required_property", "property is required", path, nil))
		}
		return ""
	}
	if node.Kind != yaml.ScalarNode || node.Tag != "!!str" {
		*issues = append(*issues, templateProblem("invalid_property_type", "must be a string", path, node))
		return ""
	}
	value := strings.TrimSpace(node.Value)
	if required && value == "" {
		*issues = append(*issues, templateProblem("empty_property", "must not be empty", path, node))
	}
	return value
}

func decodeBool(node *yaml.Node, path string, issues *[]TemplateIssue) bool {
	if node == nil {
		return false
	}
	if node.Kind != yaml.ScalarNode || node.Tag != "!!bool" {
		*issues = append(*issues, templateProblem("invalid_property_type", "must be a boolean", path, node))
		return false
	}
	value, err := strconv.ParseBool(node.Value)
	if err != nil {
		*issues = append(*issues, templateProblem("invalid_property_type", "must be a boolean", path, node))
	}
	return value
}

func validateKnownKeys(node *yaml.Node, allowed map[string]bool, prefix string, issues *[]TemplateIssue) {
	if node == nil || node.Kind != yaml.MappingNode {
		return
	}
	for i := 0; i+1 < len(node.Content); i += 2 {
		key := node.Content[i]
		if !allowed[key.Value] {
			path := key.Value
			if prefix != "" {
				path = prefix + "." + key.Value
			}
			*issues = append(*issues, templateProblem("unknown_property", fmt.Sprintf("unknown property %q", key.Value), path, key))
		}
	}
}

func validateUniqueKeys(node *yaml.Node, prefix string, issues *[]TemplateIssue) {
	if node == nil || node.Kind != yaml.MappingNode {
		return
	}
	seen := map[string]bool{}
	for i := 0; i+1 < len(node.Content); i += 2 {
		key := node.Content[i]
		path := key.Value
		if prefix != "" {
			path = prefix + "." + key.Value
		}
		if seen[key.Value] {
			*issues = append(*issues, templateProblem("duplicate_property", fmt.Sprintf("property %q is declared more than once", key.Value), path, key))
		}
		seen[key.Value] = true
	}
}

func parseTaskTemplate(name, path, content string) TaskTemplate {
	template := TaskTemplate{Name: name, Path: path, Content: content, Digest: templateDigest(content), Fields: []TemplateField{}, Errors: []TemplateIssue{}, Warnings: []TemplateIssue{}}
	front, body, issues := splitTemplateSource(name, content)
	template.Detail, template.Body = body, body
	if len(issues) > 0 {
		template.Errors = issues
		return template
	}
	var document yaml.Node
	if err := yaml.Unmarshal([]byte(front), &document); err != nil {
		template.Errors = append(template.Errors, templateProblem("yaml_syntax", err.Error(), "", nil))
		return template
	}
	if len(document.Content) == 0 || document.Content[0].Kind != yaml.MappingNode {
		template.Errors = append(template.Errors, templateProblem("invalid_schema", "front matter must be a YAML object", "", nil))
		return template
	}
	root := document.Content[0]
	validateUniqueKeys(root, "", &template.Errors)
	_, versionNode := mappingValue(root, "schema-version")
	if versionNode == nil {
		parseLegacyTemplate(&template, root)
	} else {
		parseV2Template(&template, root, versionNode)
	}
	if len(template.Errors) == 0 && !template.Legacy {
		validateTemplatePlaceholders(&template)
	}
	template.Valid = len(template.Errors) == 0
	return template
}

func parseV2Template(template *TaskTemplate, root, versionNode *yaml.Node) {
	allowed := map[string]bool{"schema-version": true, "title": true, "description": true, "task-title": true, "fields": true}
	for i := 0; i+1 < len(root.Content); i += 2 {
		key := root.Content[i]
		if !allowed[key.Value] {
			template.Errors = append(template.Errors, templateProblem("unknown_property", fmt.Sprintf("unknown property %q", key.Value), key.Value, key))
		}
	}
	if versionNode.Kind != yaml.ScalarNode || versionNode.Tag != "!!int" {
		template.Errors = append(template.Errors, templateProblem("invalid_schema_version", "schema-version must be the integer 2", "schema-version", versionNode))
	} else if version, err := strconv.Atoi(versionNode.Value); err != nil || version != taskTemplateSchemaVersion {
		template.Errors = append(template.Errors, templateProblem("unsupported_schema_version", "only schema-version 2 is supported", "schema-version", versionNode))
	} else {
		template.SchemaVersion = taskTemplateSchemaVersion
	}
	_, titleNode := mappingValue(root, "title")
	template.Title = decodeString(titleNode, "title", true, &template.Errors)
	_, descriptionNode := mappingValue(root, "description")
	template.Description = decodeString(descriptionNode, "description", false, &template.Errors)
	_, taskTitleNode := mappingValue(root, "task-title")
	template.TaskTitle = decodeString(taskTitleNode, "task-title", false, &template.Errors)
	_, fieldsNode := mappingValue(root, "fields")
	if fieldsNode == nil {
		template.Errors = append(template.Errors, templateProblem("required_property", "property is required", "fields", nil))
		return
	}
	if fieldsNode.Kind != yaml.SequenceNode {
		template.Errors = append(template.Errors, templateProblem("invalid_property_type", "fields must be an array", "fields", fieldsNode))
		return
	}
	seen := map[string]bool{}
	for index, node := range fieldsNode.Content {
		path := fmt.Sprintf("fields[%d]", index)
		if node.Kind != yaml.MappingNode {
			template.Errors = append(template.Errors, templateProblem("invalid_field", "field definition must be an object", path, node))
			continue
		}
		validateUniqueKeys(node, path, &template.Errors)
		allowedField := map[string]bool{"name": true, "type": true, "label": true, "description": true, "required": true, "placeholder": true, "default": true, "options": true}
		validateKnownKeys(node, allowedField, path, &template.Errors)
		_, nameNode := mappingValue(node, "name")
		_, typeNode := mappingValue(node, "type")
		_, labelNode := mappingValue(node, "label")
		field := TemplateField{
			Name:  decodeString(nameNode, path+".name", true, &template.Errors),
			Type:  decodeString(typeNode, path+".type", true, &template.Errors),
			Label: decodeString(labelNode, path+".label", true, &template.Errors),
		}
		_, valueNode := mappingValue(node, "description")
		field.Description = decodeString(valueNode, path+".description", false, &template.Errors)
		_, valueNode = mappingValue(node, "placeholder")
		field.Placeholder = decodeString(valueNode, path+".placeholder", false, &template.Errors)
		_, valueNode = mappingValue(node, "required")
		field.Required = decodeBool(valueNode, path+".required", &template.Errors)
		if !templateFieldPattern.MatchString(field.Name) {
			template.Errors = append(template.Errors, templateProblem("invalid_field_name", "field name must match [a-z][a-z0-9_-]*", path+".name", nameNode))
		} else if seen[field.Name] {
			template.Errors = append(template.Errors, templateProblem("duplicate_field", fmt.Sprintf("field %q is declared more than once", field.Name), path+".name", nameNode))
		}
		seen[field.Name] = true
		switch field.Type {
		case "text", "textarea", "select", "boolean":
		default:
			template.Errors = append(template.Errors, templateProblem("unsupported_field_type", "field type must be text, textarea, select, or boolean", path+".type", typeNode))
		}
		_, optionsNode := mappingValue(node, "options")
		if optionsNode != nil {
			if field.Type != "select" {
				template.Errors = append(template.Errors, templateProblem("options_not_allowed", "options are only allowed for select fields", path+".options", optionsNode))
			} else if optionsNode.Kind != yaml.SequenceNode || len(optionsNode.Content) == 0 {
				template.Errors = append(template.Errors, templateProblem("invalid_options", "select options must be a non-empty array", path+".options", optionsNode))
			} else {
				optionSeen := map[string]bool{}
				for optionIndex, optionNode := range optionsNode.Content {
					optionPath := fmt.Sprintf("%s.options[%d]", path, optionIndex)
					option := decodeString(optionNode, optionPath, true, &template.Errors)
					if optionSeen[option] {
						template.Errors = append(template.Errors, templateProblem("duplicate_option", fmt.Sprintf("option %q is duplicated", option), optionPath, optionNode))
					}
					optionSeen[option] = true
					field.Options = append(field.Options, option)
				}
			}
		} else if field.Type == "select" {
			template.Errors = append(template.Errors, templateProblem("options_required", "select fields require options", path+".options", node))
		}
		_, defaultNode := mappingValue(node, "default")
		if defaultNode != nil {
			field.HasDefault = true
			var value any
			if err := defaultNode.Decode(&value); err != nil {
				template.Errors = append(template.Errors, templateProblem("invalid_default", err.Error(), path+".default", defaultNode))
			} else {
				field.Default = value
				if _, issue := normalizeTemplateFieldValue(field, value, path+".default"); issue != nil {
					issue.Line, issue.Column = defaultNode.Line+1, defaultNode.Column
					template.Errors = append(template.Errors, *issue)
				}
			}
		}
		template.Fields = append(template.Fields, field)
	}
}

func validateTemplatePlaceholders(template *TaskTemplate) {
	declared := map[string]bool{}
	for _, field := range template.Fields {
		declared[field.Name] = true
	}
	for path, text := range map[string]string{"task-title": template.TaskTitle, "body": template.Body} {
		matches := templateAnyToken.FindAllStringSubmatchIndex(text, -1)
		for _, match := range matches {
			token := text[match[0]:match[1]]
			valid := templateTokenPattern.FindStringSubmatch(token)
			if len(valid) != 2 {
				template.Errors = append(template.Errors, templateProblem("invalid_placeholder", fmt.Sprintf("unsupported placeholder %q", token), path, nil))
				continue
			}
			if !declared[valid[1]] {
				template.Errors = append(template.Errors, templateProblem("unknown_placeholder", fmt.Sprintf("placeholder references unknown field %q", valid[1]), path, nil))
			}
		}
		withoutTokens := templateAnyToken.ReplaceAllString(text, "")
		if strings.Contains(withoutTokens, "{{") || strings.Contains(withoutTokens, "}}") {
			template.Errors = append(template.Errors, templateProblem("invalid_placeholder", "malformed placeholder; use {{ field_name }}", path, nil))
		}
	}
}

func normalizeTemplateFieldValue(field TemplateField, value any, path string) (string, *TemplateIssue) {
	switch field.Type {
	case "text", "textarea", "select":
		text, ok := value.(string)
		if !ok {
			issue := templateProblem("field_type", "value must be a string", path, nil)
			return "", &issue
		}
		if field.Type == "text" && strings.ContainsAny(text, "\r\n") {
			issue := templateProblem("field_type", "text value must be a single line", path, nil)
			return "", &issue
		}
		if field.Type == "select" && text != "" {
			found := false
			for _, option := range field.Options {
				if text == option {
					found = true
					break
				}
			}
			if !found {
				issue := templateProblem("field_option", fmt.Sprintf("value must be one of %s", strings.Join(field.Options, ", ")), path, nil)
				return "", &issue
			}
		}
		return strings.ReplaceAll(text, "\r\n", "\n"), nil
	case "boolean":
		boolean, ok := value.(bool)
		if !ok {
			issue := templateProblem("field_type", "value must be a boolean", path, nil)
			return "", &issue
		}
		return strconv.FormatBool(boolean), nil
	default:
		issue := templateProblem("unsupported_field_type", "unsupported field type", path, nil)
		return "", &issue
	}
}

func renderTemplate(template TaskTemplate, input TemplateRenderInput) (TemplateRenderResult, error) {
	if !template.Valid {
		return TemplateRenderResult{}, &TemplateValidationError{Template: template.Name, Issues: template.Errors}
	}
	values := input.Fields
	if values == nil {
		values = map[string]any{}
	}
	declared := map[string]TemplateField{}
	for _, field := range template.Fields {
		declared[field.Name] = field
	}
	var issues []TemplateIssue
	for name := range values {
		if _, ok := declared[name]; !ok {
			issues = append(issues, templateProblem("unknown_field", fmt.Sprintf("unknown input field %q", name), "templateFields."+name, nil))
		}
	}
	resolved := map[string]string{}
	typed := map[string]any{}
	for _, field := range template.Fields {
		value, present := values[field.Name]
		if !present && field.HasDefault {
			value, present = field.Default, true
		}
		if !present {
			if field.Required {
				issues = append(issues, templateProblem("required_field", "value is required", "templateFields."+field.Name, nil))
				continue
			}
			if field.Type == "boolean" {
				value = false
			} else {
				value = ""
			}
		}
		text, issue := normalizeTemplateFieldValue(field, value, "templateFields."+field.Name)
		if issue != nil {
			issues = append(issues, *issue)
			continue
		}
		if field.Required && strings.TrimSpace(text) == "" {
			issues = append(issues, templateProblem("required_field", "value must not be blank", "templateFields."+field.Name, nil))
			continue
		}
		resolved[field.Name], typed[field.Name] = text, value
	}
	if len(issues) > 0 {
		sort.SliceStable(issues, func(i, j int) bool { return issues[i].Path < issues[j].Path })
		return TemplateRenderResult{}, &TemplateValidationError{Template: template.Name, Issues: issues}
	}
	replace := func(source string) string {
		if template.Legacy {
			return source
		}
		return templateTokenPattern.ReplaceAllStringFunc(source, func(token string) string {
			name := templateTokenPattern.FindStringSubmatch(token)[1]
			return resolved[name]
		})
	}
	title := strings.TrimSpace(input.Title)
	if title == "" {
		title = strings.TrimSpace(replace(template.TaskTitle))
	}
	if title == "" {
		return TemplateRenderResult{}, &TemplateValidationError{Template: template.Name, Issues: []TemplateIssue{templateProblem("invalid_task_title", "rendered task title must not be empty", "title", nil)}}
	}
	markdown := normalizeTemplateSource(replace(template.Body))
	return TemplateRenderResult{TemplateName: template.Name, SchemaVersion: template.SchemaVersion, Digest: template.Digest, Title: title, Markdown: markdown, Fields: typed, Warnings: template.Warnings}, nil
}

func (w *Workspace) projectTemplateDir(projectID string) (string, error) {
	projectID = strings.TrimSpace(projectID)
	if projectID == "" {
		return "", errors.New("project id is required")
	}
	projectPath, err := findResourceDir(w.root, projectID)
	if err != nil {
		return "", err
	}
	var project Project
	if err := readProjectAtDir(projectPath, &project); err != nil {
		return "", err
	}
	dir := filepath.Join(projectPath, "templates")
	info, err := os.Lstat(dir)
	if err != nil {
		return "", err
	}
	if info.Mode()&os.ModeSymlink != 0 || !info.IsDir() {
		return "", errors.New("project templates path must be a real directory")
	}
	return dir, nil
}

func invalidTemplateEntry(root, name, path, code, message string) TaskTemplate {
	return TaskTemplate{Name: name, Path: relPath(root, path), Fields: []TemplateField{}, Errors: []TemplateIssue{templateProblem(code, message, "", nil)}, Warnings: []TemplateIssue{}}
}

func (w *Workspace) Templates(projectID string) ([]TaskTemplate, error) {
	if err := w.require(); err != nil {
		return nil, err
	}
	dir, err := w.projectTemplateDir(projectID)
	if err != nil {
		return nil, &APIError{Operation: "list templates", Kind: "template", Workspace: w.root, ResourceID: projectID, Err: err}
	}
	entries, err := os.ReadDir(dir)
	if err != nil {
		return nil, &APIError{Operation: "list templates", Kind: "template", Workspace: w.root, ResourceID: projectID, Err: err}
	}
	templates := make([]TaskTemplate, 0, len(entries))
	for _, entry := range entries {
		if strings.ToLower(filepath.Ext(entry.Name())) != ".md" {
			continue
		}
		name := strings.TrimSuffix(entry.Name(), filepath.Ext(entry.Name()))
		path := filepath.Join(dir, entry.Name())
		if !safeTemplateName(name) {
			templates = append(templates, invalidTemplateEntry(w.root, name, path, "invalid_template_name", "template filename is not safe"))
			continue
		}
		info, err := os.Lstat(path)
		if err != nil {
			templates = append(templates, invalidTemplateEntry(w.root, name, path, "template_unreadable", err.Error()))
			continue
		}
		if info.Mode()&os.ModeSymlink != 0 || !info.Mode().IsRegular() {
			templates = append(templates, invalidTemplateEntry(w.root, name, path, "template_path_unsafe", "template must be a regular file and may not be a symbolic link"))
			continue
		}
		data, err := os.ReadFile(path)
		if err != nil {
			templates = append(templates, invalidTemplateEntry(w.root, name, path, "template_unreadable", err.Error()))
			continue
		}
		templates = append(templates, parseTaskTemplate(name, relPath(w.root, path), string(data)))
	}
	sort.SliceStable(templates, func(i, j int) bool { return templates[i].Name < templates[j].Name })
	return templates, nil
}

func (w *Workspace) Template(projectID, name string) (TaskTemplate, error) {
	if !safeTemplateName(name) {
		return TaskTemplate{}, &APIError{Operation: "read template", Kind: "template", Workspace: w.root, ResourceID: projectID, Err: errors.New("invalid template name")}
	}
	templates, err := w.Templates(projectID)
	if err != nil {
		return TaskTemplate{}, err
	}
	for _, template := range templates {
		if template.Name == name {
			return template, nil
		}
	}
	return TaskTemplate{}, &APIError{Operation: "read template", Kind: "template", Workspace: w.root, ResourceID: projectID, Err: fmt.Errorf("template not found: %s", name)}
}

func (w *Workspace) RenderTemplate(input TemplateRenderInput) (TemplateRenderResult, error) {
	if err := w.require(); err != nil {
		return TemplateRenderResult{}, err
	}
	template, err := w.Template(input.ProjectID, input.Name)
	if err != nil {
		return TemplateRenderResult{}, err
	}
	result, err := renderTemplate(template, input)
	if err != nil {
		return TemplateRenderResult{}, &APIError{Operation: "render template", Kind: "template", Workspace: w.root, ResourceID: input.ProjectID, Path: template.Path, Err: err}
	}
	return result, nil
}

func (w *Workspace) ValidateTemplateContent(name, content string) TaskTemplate {
	name = strings.TrimSpace(name)
	template := parseTaskTemplate(name, "", content)
	if !safeTemplateName(name) {
		template.Errors = append([]TemplateIssue{templateProblem("invalid_template_name", "template name is not safe", "name", nil)}, template.Errors...)
		template.Valid = false
	}
	return template
}

func (w *Workspace) CreateTemplate(projectID, name, title string) (TaskTemplate, error) {
	if err := w.require(); err != nil {
		return TaskTemplate{}, err
	}
	var result TaskTemplate
	err := withWorkspaceMutationLock(w.root, func() error {
		var err error
		result, err = w.createTemplate(projectID, name, title)
		return err
	})
	return result, err
}

func (w *Workspace) createTemplate(projectID, name, title string) (TaskTemplate, error) {
	if !safeTemplateName(name) {
		return TaskTemplate{}, &APIError{Operation: "create template", Kind: "template", Workspace: w.root, ResourceID: projectID, Err: errors.New("invalid template name")}
	}
	title = strings.TrimSpace(title)
	if title == "" {
		title = name
	}
	dir, err := w.projectTemplateDir(projectID)
	if err != nil {
		return TaskTemplate{}, &APIError{Operation: "create template", Kind: "template", Workspace: w.root, ResourceID: projectID, Err: err}
	}
	path := filepath.Join(dir, name+".md")
	content := fmt.Sprintf("---\nschema-version: 2\ntitle: %q\nfields: []\n---\n# %s\n", title, title)
	file, err := os.OpenFile(path, os.O_WRONLY|os.O_CREATE|os.O_EXCL, 0o644)
	if err != nil {
		return TaskTemplate{}, &APIError{Operation: "create template", Kind: "template", Workspace: w.root, ResourceID: projectID, Path: relPath(w.root, path), Err: err}
	}
	if _, err = file.WriteString(content); err == nil {
		err = file.Close()
	} else {
		_ = file.Close()
	}
	if err != nil {
		_ = os.Remove(path)
		return TaskTemplate{}, &APIError{Operation: "create template", Kind: "template", Workspace: w.root, ResourceID: projectID, Path: relPath(w.root, path), Err: err}
	}
	return parseTaskTemplate(name, relPath(w.root, path), content), nil
}

func migratedTemplateContent(template TaskTemplate) string {
	var front strings.Builder
	front.WriteString("---\nschema-version: 2\ntitle: ")
	front.WriteString(strconv.Quote(template.Title))
	front.WriteString("\nfields: []\n---\n")
	front.WriteString(normalizeTemplateSource(template.Body))
	return normalizeTemplateSource(front.String())
}

func writeTemplateAtomic(path, content string) error {
	tmp, err := os.CreateTemp(filepath.Dir(path), ".forge-template-*.tmp")
	if err != nil {
		return err
	}
	tmpPath := tmp.Name()
	defer os.Remove(tmpPath)
	if err := tmp.Chmod(0o644); err != nil {
		_ = tmp.Close()
		return err
	}
	if _, err := tmp.WriteString(content); err != nil {
		_ = tmp.Close()
		return err
	}
	if err := tmp.Close(); err != nil {
		return err
	}
	return os.Rename(tmpPath, path)
}

func (w *Workspace) MigrateTemplates(projectID string, names []string, write bool) ([]TemplateMigration, error) {
	if err := w.require(); err != nil {
		return nil, err
	}
	if !write {
		return w.migrateTemplates(projectID, names, false)
	}
	var results []TemplateMigration
	err := withWorkspaceMutationLock(w.root, func() error {
		var err error
		results, err = w.migrateTemplates(projectID, names, true)
		return err
	})
	return results, err
}

func (w *Workspace) migrateTemplates(projectID string, names []string, write bool) ([]TemplateMigration, error) {
	templates, err := w.Templates(projectID)
	if err != nil {
		return nil, err
	}
	wanted := map[string]bool{}
	for _, name := range names {
		if !safeTemplateName(name) {
			return nil, &APIError{Operation: "migrate template", Kind: "template", Workspace: w.root, ResourceID: projectID, Err: fmt.Errorf("invalid template name: %s", name)}
		}
		wanted[name] = true
	}
	results := []TemplateMigration{}
	found := map[string]bool{}
	for _, template := range templates {
		if len(wanted) > 0 && !wanted[template.Name] {
			continue
		}
		found[template.Name] = true
		if !template.Legacy {
			results = append(results, TemplateMigration{Name: template.Name, Path: template.Path, Warnings: template.Warnings})
			continue
		}
		if !template.Valid {
			return nil, &APIError{Operation: "migrate template", Kind: "template", Workspace: w.root, ResourceID: projectID, Path: template.Path, Err: &TemplateValidationError{Template: template.Name, Issues: template.Errors}}
		}
		content := migratedTemplateContent(template)
		migrated := parseTaskTemplate(template.Name, template.Path, content)
		if !migrated.Valid {
			return nil, &APIError{Operation: "migrate template", Kind: "template", Workspace: w.root, ResourceID: projectID, Path: template.Path, Err: &TemplateValidationError{Template: template.Name, Issues: migrated.Errors}}
		}
		result := TemplateMigration{Name: template.Name, Path: template.Path, Changed: true, Content: content, Warnings: template.Warnings}
		if write {
			path := filepath.Join(w.root, filepath.FromSlash(template.Path))
			if err := writeTemplateAtomic(path, content); err != nil {
				return nil, &APIError{Operation: "migrate template", Kind: "template", Workspace: w.root, ResourceID: projectID, Path: template.Path, Err: err}
			}
			result.Written = true
		}
		results = append(results, result)
	}
	for name := range wanted {
		if !found[name] {
			return nil, &APIError{Operation: "migrate template", Kind: "template", Workspace: w.root, ResourceID: projectID, Err: fmt.Errorf("template not found: %s", name)}
		}
	}
	return results, nil
}
