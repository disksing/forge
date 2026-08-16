package app

import (
	"fmt"
	"strings"
	"time"
)

// SetResourceDescription updates the description of an open Project or Task.
// The Workspace and Scheduler resources have no editable description and are
// rejected. An empty description clears the field.
func (w *Workspace) SetResourceDescription(id string, description string) (string, error) {
	if err := w.require(); err != nil {
		return "", err
	}
	description = strings.TrimSpace(description)
	err := withWorkspaceMutationLock(w.root, func() error {
		path, resource, err := loadOpenResource(w.root, strings.TrimSpace(id))
		if err != nil {
			return err
		}
		switch typed := resource.(type) {
		case *Project:
			typed.Description = description
		case *Task:
			typed.Description = description
		default:
			return fmt.Errorf("resource %s does not support editing description", id)
		}
		meta := resource.resourceMeta()
		meta.UpdatedAt = time.Now().Format(time.RFC3339)
		return writeResourceMetadata(path, resource)
	})
	if err != nil {
		return "", &APIError{Operation: "set resource description", Kind: "description", Workspace: w.root, ResourceID: id, Err: err}
	}
	return description, nil
}
