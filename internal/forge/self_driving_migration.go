package forge

import (
	"bytes"
	"encoding/json"
	"fmt"
	"os"
	"path/filepath"
	"strings"

	"github.com/disksing/forge/internal/app"
)

// migrateSelfDrivingMetadata keeps obsolete direct readers in this package on
// the same concentrated migration boundary as the application API. New command
// paths use app directly; this compatibility hook must never implement a
// second legacy decoder.
func migrateSelfDrivingMetadata(dir string, task *Task) error {
	if task.SelfDriving != nil && task.SelfDriving.Revision > 0 && strings.TrimSpace(task.SelfDriving.Condition) != "" {
		return nil
	}
	path := filepath.Join(dir, taskJSONFile)
	data, err := os.ReadFile(path)
	if err != nil {
		return err
	}
	var raw map[string]json.RawMessage
	if err := json.Unmarshal(data, &raw); err != nil {
		return err
	}
	selfRaw, hasSelf := raw["selfDriving"]
	_, hasAuto := raw["autoRun"]
	if !hasAuto && (!hasSelf || bytes.Equal(bytes.TrimSpace(selfRaw), []byte("null"))) {
		return nil
	}
	root, err := workspaceRootForResourceDir(dir)
	if err != nil {
		return err
	}
	workspace, err := app.OpenWorkspace(root)
	if err != nil {
		return err
	}
	if err := workspace.MigrateSelfDrivingData(); err != nil {
		return err
	}
	return readJSON(path, task)
}

func workspaceRootForResourceDir(dir string) (string, error) {
	current, err := filepath.Abs(dir)
	if err != nil {
		return "", err
	}
	for {
		if pathExists(filepath.Join(current, configFile)) {
			return current, nil
		}
		parent := filepath.Dir(current)
		if parent == current {
			return "", fmt.Errorf("not inside an AgentWorkspace: %s", dir)
		}
		current = parent
	}
}
