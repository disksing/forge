package forge

import (
	"errors"
	"fmt"
	"os"
	"strings"

	"github.com/disksing/forge/internal/app"
)

const (
	forgeWorkspaceRootEnvironment     = "FORGE_WORKSPACE_ROOT"
	forgeWorkspaceInstanceEnvironment = "FORGE_WORKSPACE_INSTANCE_ID"
	forgeResourceIDEnvironment        = "FORGE_RESOURCE_ID"
	creationCreatorUser               = "user"
	creationCreatorAgent              = "agent"
)

func normalizeCreationCreatorOption(value string) (string, error) {
	value = strings.ToLower(strings.TrimSpace(value))
	if value != creationCreatorUser && value != creationCreatorAgent {
		return "", errors.New("creator must be user or agent")
	}
	return value, nil
}

func resolveCreationCreator(option string) (app.Creator, error) {
	option = strings.ToLower(strings.TrimSpace(option))
	if option == creationCreatorUser {
		return app.UserCreator(), nil
	}
	root := strings.TrimSpace(os.Getenv(forgeWorkspaceRootEnvironment))
	instanceID := strings.TrimSpace(os.Getenv(forgeWorkspaceInstanceEnvironment))
	resourceID := strings.TrimSpace(os.Getenv(forgeResourceIDEnvironment))
	contextValues := 0
	for _, value := range []string{root, instanceID, resourceID} {
		if value != "" {
			contextValues++
		}
	}
	if option == "" && contextValues == 0 {
		return app.UserCreator(), nil
	}
	if option != "" && option != creationCreatorAgent {
		return app.Creator{}, errors.New("creator must be user or agent")
	}
	if contextValues != 3 {
		return app.Creator{}, fmt.Errorf("Agent creator requires %s, %s, and %s from a Forge resource generation", forgeWorkspaceRootEnvironment, forgeWorkspaceInstanceEnvironment, forgeResourceIDEnvironment)
	}
	workspace, err := app.OpenWorkspace(root)
	if err != nil {
		return app.Creator{}, fmt.Errorf("validate Agent creator Workspace: %w", err)
	}
	runtimeConfig, err := workspace.RuntimeConfig()
	if err != nil {
		return app.Creator{}, fmt.Errorf("validate Agent creator Workspace runtime: %w", err)
	}
	if runtimeConfig.InstanceID != instanceID {
		return app.Creator{}, errors.New("Agent creator Workspace instance does not match its persisted Forge runtime")
	}
	if resourceID != "workspace" {
		resource, err := workspace.ResourceValue(resourceID)
		if err != nil {
			return app.Creator{}, fmt.Errorf("validate Agent creator resource: %w", err)
		}
		if resource.Archived {
			return app.Creator{}, errors.New("Agent creator resource is archived")
		}
	}
	creator, err := app.ResourceCreator(instanceID, resourceID)
	if err != nil {
		return app.Creator{}, fmt.Errorf("validate Agent creator provenance: %w", err)
	}
	return creator, nil
}
