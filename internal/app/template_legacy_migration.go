package app

import (
	"fmt"

	"gopkg.in/yaml.v3"
)

// legacyTemplateExecutionProperties is isolated here because these retired V1
// keys are accepted only while reading legacy templates or rejected from the
// current V2 schema. New templates never expose or persist them.
var legacyTemplateExecutionProperties = map[string]bool{
	"autorun": true, "agent": true, "agent-name": true,
	"agent-profiles": true, "prompt": true, "completion-criteria": true,
}

var legacyTemplateExecutionPropertyOrder = []string{
	"autorun", "agent", "agent-name", "agent-profiles", "prompt", "completion-criteria",
}

func parseLegacyTemplate(template *TaskTemplate, root *yaml.Node) {
	template.Legacy = true
	template.SchemaVersion = 1
	allowed := map[string]bool{"title": true}
	for _, key := range legacyTemplateExecutionPropertyOrder {
		allowed[key] = true
	}
	validateKnownKeys(root, allowed, "", &template.Errors)
	_, titleNode := mappingValue(root, "title")
	template.Title = decodeString(titleNode, "title", true, &template.Errors)
	template.TaskTitle = template.Title
	_, valueNode := mappingValue(root, "autorun")
	template.SelfDriving = decodeBool(valueNode, "autorun", &template.Errors)
	_, valueNode = mappingValue(root, "agent")
	if valueNode == nil {
		_, valueNode = mappingValue(root, "agent-name")
	}
	template.AgentName = decodeString(valueNode, "agent", false, &template.Errors)
	_, valueNode = mappingValue(root, "prompt")
	template.Prompt = decodeString(valueNode, "prompt", false, &template.Errors)
	_, valueNode = mappingValue(root, "completion-criteria")
	template.CompletionCriteria = decodeString(valueNode, "completion-criteria", false, &template.Errors)
	_, valueNode = mappingValue(root, "agent-profiles")
	if valueNode != nil {
		if valueNode.Kind != yaml.SequenceNode {
			template.Errors = append(template.Errors, templateProblem("invalid_property_type", "agent-profiles must be an array", "agent-profiles", valueNode))
		} else {
			for index, profileNode := range valueNode.Content {
				template.PreferredAgentProfiles = append(template.PreferredAgentProfiles, decodeString(profileNode, fmt.Sprintf("agent-profiles[%d]", index), true, &template.Errors))
			}
		}
	}
	template.Warnings = append(template.Warnings, templateWarning("legacy_schema", "legacy V1 template; migrate to schema-version: 2", "schema-version", nil))
	for _, key := range legacyTemplateExecutionPropertyOrder {
		keyNode, valueNode := mappingValue(root, key)
		if valueNode != nil {
			template.Warnings = append(template.Warnings, templateWarning("legacy_run_property_ignored", fmt.Sprintf("legacy execution property %q is ignored", key), key, keyNode))
		}
	}
}
