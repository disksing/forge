package forge

import (
	"os"

	"github.com/disksing/forge/internal/app"
)

func inferCurrentProjectID() (string, bool, error) {
	workspace, cwd, err := currentWorkspaceSelection()
	if err != nil {
		return "", false, err
	}
	return workspace.InferProjectID(cwd)
}

func inferCurrentTaskID() (string, bool, error) {
	workspace, cwd, err := currentWorkspaceSelection()
	if err != nil {
		return "", false, err
	}
	return workspace.InferTaskID(cwd)
}

func currentWorkspaceSelection() (*app.Workspace, string, error) {
	cwd, err := os.Getwd()
	if err != nil {
		return nil, "", err
	}
	workspace, err := app.OpenWorkspaceFrom(cwd)
	if err != nil {
		return nil, "", err
	}
	return workspace, cwd, nil
}
