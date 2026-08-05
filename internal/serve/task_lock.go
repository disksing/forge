package serve

import (
	"errors"
	"net/http"
	"strings"

	"github.com/disksing/forge/internal/app"
)

const externalTaskLockMessage = "This task is locked by an external session. New sessions and AutoRun are unavailable until the lock is released."

// externalTaskLockError is deliberately a stable, user-facing conflict. The
// frontend uses the same message for the optimistic composer state, while
// every server entry point re-checks the current Workspace projection.
type externalTaskLockError struct {
	ResourceID string
}

func (e *externalTaskLockError) Error() string {
	return externalTaskLockMessage
}

func isExternalTaskLockError(err error) bool {
	var target *externalTaskLockError
	return errors.As(err, &target)
}

func writeTaskOperationError(w http.ResponseWriter, err error, fallbackStatus int) {
	if isExternalTaskLockError(err) {
		writeError(w, err, http.StatusConflict)
		return
	}
	writeError(w, err, fallbackStatus)
}

// requireTaskNotExternallyLocked mirrors the GUI tree projection: a Forge
// session is internal only when the serve-owned AgentHub run index points at
// it. Any remaining session controlling the selected task is external. The
// check is intentionally performed from a fresh on-disk Workspace snapshot
// so stale Chat markup cannot bypass the resource lock.
func (s *server) requireTaskNotExternallyLocked(workspace guiWorkspace, resourceID string) error {
	resourceID = strings.TrimSpace(resourceID)
	if resourceID == "" {
		return nil
	}
	forgeWorkspace, err := app.OpenWorkspace(workspace.Path)
	if err != nil {
		return err
	}
	resource, err := forgeWorkspace.ResourceValue(resourceID)
	if err != nil {
		return err
	}
	if resource.Task == nil {
		return nil
	}
	typedTree, err := forgeWorkspace.Tree()
	if err != nil {
		return err
	}
	tree := workspaceTreeFromApp(typedTree)
	if err := s.enrichTreeSessions(workspace.Path, &tree); err != nil {
		return err
	}
	for _, session := range tree.Sessions {
		if session.Source != "external" {
			continue
		}
		for _, control := range session.Controls {
			if strings.TrimSpace(control.ResourceID) == resourceID {
				return &externalTaskLockError{ResourceID: resourceID}
			}
		}
	}
	return nil
}
