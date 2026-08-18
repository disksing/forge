package serve

import (
	"github.com/disksing/pua/internal/app"
	"github.com/disksing/pua/internal/localize"
)

func workspaceContentLanguage(workspacePath string) (string, error) {
	workspace, err := app.OpenWorkspace(workspacePath)
	if err != nil {
		return "", err
	}
	return workspace.Language()
}

func (m *agentManager) notificationContentLanguage(source serveWorkspace, targetInstanceID string) (string, error) {
	target, found, err := m.managedWorkspaceByInstanceID(targetInstanceID)
	if err != nil {
		return "", err
	}
	if found {
		return workspaceContentLanguage(target.Path)
	}
	// The notification will become terminal when its target Workspace is not
	// managed. Render the durable diagnostic in the source Workspace language.
	language, err := workspaceContentLanguage(source.Path)
	if err != nil {
		return localize.English, nil
	}
	return language, nil
}
