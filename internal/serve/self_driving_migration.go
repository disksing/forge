package serve

import (
	"encoding/json"
	"fmt"
	"os"
	"path/filepath"
	"strings"
)

// decodeAndMigrateAgentRuns is the isolated compatibility boundary for the
// retired AutoRun generation stored in runs.json and Forge session context
// files. It rewrites only after every record decodes successfully; repeated
// calls are no-ops once the new schema is durable.
func decodeAndMigrateAgentRuns(workspacePath string, data []byte) ([]agentRun, error) {
	var rawRuns []map[string]json.RawMessage
	if err := json.Unmarshal(data, &rawRuns); err != nil {
		return nil, err
	}
	runs := make([]agentRun, 0, len(rawRuns))
	changed := false
	for _, raw := range rawRuns {
		legacy, hasLegacy := raw["autoRunGeneration"]
		_, hasCurrent := raw["selfDrivingGeneration"]
		if hasLegacy && hasCurrent {
			return nil, errorsForConflictingRunSchema(agentIndexPath(workspacePath))
		}
		if hasLegacy {
			raw["selfDrivingGeneration"] = legacy
			delete(raw, "autoRunGeneration")
			changed = true
		}
		encoded, err := json.Marshal(raw)
		if err != nil {
			return nil, err
		}
		var run agentRun
		if err := json.Unmarshal(encoded, &run); err != nil {
			return nil, err
		}
		if err := migrateLegacyForgeSessionContext(run.ForgeSessionContextPath); err != nil {
			return nil, err
		}
		runs = append(runs, run)
	}
	if changed {
		if err := writeAgentRunsIndexLocked(workspacePath, runs); err != nil {
			return nil, err
		}
	}
	return runs, nil
}

func migrateLegacyForgeSessionContext(path string) error {
	path = strings.TrimSpace(path)
	if path == "" {
		return nil
	}
	data, err := os.ReadFile(path)
	if err != nil {
		if os.IsNotExist(err) {
			return nil
		}
		return err
	}
	var raw map[string]json.RawMessage
	if err := json.Unmarshal(data, &raw); err != nil {
		return err
	}
	legacy, hasLegacy := raw["autoRunGeneration"]
	_, hasCurrent := raw["selfDrivingGeneration"]
	if !hasLegacy {
		return nil
	}
	if hasCurrent {
		return errorsForConflictingRunSchema(path)
	}
	raw["selfDrivingGeneration"] = legacy
	delete(raw, "autoRunGeneration")
	encoded, err := json.MarshalIndent(raw, "", "  ")
	if err != nil {
		return err
	}
	encoded = append(encoded, '\n')
	return writeAtomicRunMigrationFile(path, encoded, 0o600)
}

func errorsForConflictingRunSchema(path string) error {
	return fmt.Errorf("conflicting legacy and selfDriving generation fields in %s", path)
}

func writeAtomicRunMigrationFile(path string, data []byte, mode os.FileMode) error {
	tmp, err := os.CreateTemp(filepath.Dir(path), ".forge-self-driving-run-*.tmp")
	if err != nil {
		return err
	}
	tmpPath := tmp.Name()
	defer os.Remove(tmpPath)
	if err := tmp.Chmod(mode); err != nil {
		tmp.Close()
		return err
	}
	if _, err := tmp.Write(data); err != nil {
		tmp.Close()
		return err
	}
	if err := tmp.Sync(); err != nil {
		tmp.Close()
		return err
	}
	if err := tmp.Close(); err != nil {
		return err
	}
	return os.Rename(tmpPath, path)
}
