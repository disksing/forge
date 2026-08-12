package app

import "gopkg.in/yaml.v3"

func parseLegacyTemplate(template *TaskTemplate, root *yaml.Node) {
	template.Legacy = true
	template.SchemaVersion = 1
	allowed := map[string]bool{"title": true}
	validateKnownKeys(root, allowed, "", &template.Errors)
	_, titleNode := mappingValue(root, "title")
	template.Title = decodeString(titleNode, "title", true, &template.Errors)
	template.TaskTitle = template.Title
	template.Warnings = append(template.Warnings, templateWarning("legacy_schema", "legacy V1 template; migrate to schema-version: 2", "schema-version", nil))
}
