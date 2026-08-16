package app

import (
	"fmt"
	"strings"
	"time"
)

// SetResourceTitle renames an open Project or Task. The Workspace and
// Scheduler resources have no editable title and are rejected.
func (w *Workspace) SetResourceTitle(id string, title string) (string, error) {
	if err := w.require(); err != nil {
		return "", err
	}
	title = strings.TrimSpace(title)
	if title == "" {
		return "", &APIError{Operation: "set resource title", Kind: "title", Workspace: w.root, ResourceID: id, Err: fmt.Errorf("title is required")}
	}
	err := withWorkspaceMutationLock(w.root, func() error {
		path, resource, err := loadOpenResource(w.root, strings.TrimSpace(id))
		if err != nil {
			return err
		}
		meta := resource.resourceMeta()
		if meta.Type != resourceTypeProject && meta.Type != resourceTypeTask {
			return fmt.Errorf("resource %s does not support renaming", id)
		}
		meta.Title = title
		meta.UpdatedAt = time.Now().Format(time.RFC3339)
		return writeResourceMetadata(path, resource)
	})
	if err != nil {
		return "", &APIError{Operation: "set resource title", Kind: "title", Workspace: w.root, ResourceID: id, Err: err}
	}
	return title, nil
}
