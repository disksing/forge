package app

import (
	"errors"
	"fmt"
	"strings"
)

const (
	CreatorKindUser     = "user"
	CreatorKindResource = "resource"
)

// Creator is immutable provenance recorded when a Workspace, Project, or Task
// is created. It is diagnostic identity metadata, never an authentication or
// authorization credential.
type Creator struct {
	Kind                string `json:"kind"`
	WorkspaceInstanceID string `json:"workspaceInstanceId,omitempty"`
	ResourceID          string `json:"resourceId,omitempty"`
}

// UserCreator returns the canonical creator for a user-initiated operation.
func UserCreator() Creator {
	return Creator{Kind: CreatorKindUser}
}

// ResourceCreator returns validated resource provenance for an Agent-initiated
// operation.
func ResourceCreator(workspaceInstanceID, resourceID string) (Creator, error) {
	return NormalizeCreator(Creator{
		Kind:                CreatorKindResource,
		WorkspaceInstanceID: workspaceInstanceID,
		ResourceID:          resourceID,
	})
}

// NormalizeCreator validates and canonicalizes creator provenance. A zero
// creator is rejected here; callers that support legacy or omitted values must
// handle that case explicitly before calling this function.
func NormalizeCreator(value Creator) (Creator, error) {
	value.Kind = strings.ToLower(strings.TrimSpace(value.Kind))
	value.WorkspaceInstanceID = strings.TrimSpace(value.WorkspaceInstanceID)
	value.ResourceID = strings.TrimSpace(value.ResourceID)
	switch value.Kind {
	case CreatorKindUser:
		if value.WorkspaceInstanceID != "" || value.ResourceID != "" {
			return Creator{}, errors.New("user creator must not include a Workspace instance or resource id")
		}
		return UserCreator(), nil
	case CreatorKindResource:
		if value.WorkspaceInstanceID == "" {
			return Creator{}, errors.New("resource creator requires a Workspace instance id")
		}
		if len(value.WorkspaceInstanceID) > 200 || strings.ContainsRune(value.WorkspaceInstanceID, '\x00') {
			return Creator{}, errors.New("resource creator Workspace instance id is invalid")
		}
		value.ResourceID = normalizedCreatorResourceID(value.ResourceID)
		if value.ResourceID == "" {
			return Creator{}, errors.New("resource creator requires a resource id")
		}
		return value, nil
	default:
		return Creator{}, fmt.Errorf("creator kind must be %q or %q", CreatorKindUser, CreatorKindResource)
	}
}

func normalizedCreatorResourceID(value string) string {
	value = strings.TrimSpace(value)
	if value == "workspace" {
		return value
	}
	if topProjectName.MatchString(value) {
		return value
	}
	if strings.Count(value, ".") == 1 {
		parts := strings.SplitN(value, ".", 2)
		if topProjectName.MatchString(parts[0]) && projectTaskName(parts[0]).MatchString(value) {
			return value
		}
	}
	return ""
}

func creatorOrUser(value Creator) (Creator, error) {
	if strings.TrimSpace(value.Kind) == "" && strings.TrimSpace(value.WorkspaceInstanceID) == "" && strings.TrimSpace(value.ResourceID) == "" {
		return UserCreator(), nil
	}
	return NormalizeCreator(value)
}
