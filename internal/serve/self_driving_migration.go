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
	contextMigrations := make([]runContextMigration, 0, len(rawRuns))
	changed := false
	for _, raw := range rawRuns {
		migrated, err := migrateRevisionField(raw, agentIndexPath(workspacePath))
		if err != nil {
			return nil, err
		}
		changed = changed || migrated
		encoded, err := json.Marshal(raw)
		if err != nil {
			return nil, err
		}
		var run agentRun
		if err := json.Unmarshal(encoded, &run); err != nil {
			return nil, err
		}
		contextMigration, err := prepareLegacyForgeSessionContextMigration(run.ForgeSessionContextPath)
		if err != nil {
			return nil, err
		}
		if contextMigration != nil {
			contextMigrations = append(contextMigrations, *contextMigration)
		}
		runs = append(runs, run)
	}
	// Validate every run and context before writing any file so conflicting or
	// malformed legacy data cannot leave a partially migrated workspace.
	for _, migration := range contextMigrations {
		if err := writeAtomicRunMigrationFile(migration.path, migration.data, 0o600); err != nil {
			return nil, err
		}
	}
	if changed {
		if err := writeAgentRunsIndexLocked(workspacePath, runs); err != nil {
			return nil, err
		}
	}
	return runs, nil
}

type runContextMigration struct {
	path string
	data []byte
}

func prepareLegacyForgeSessionContextMigration(path string) (*runContextMigration, error) {
	path = strings.TrimSpace(path)
	if path == "" {
		return nil, nil
	}
	data, err := os.ReadFile(path)
	if err != nil {
		if os.IsNotExist(err) {
			return nil, nil
		}
		return nil, err
	}
	var raw map[string]json.RawMessage
	if err := json.Unmarshal(data, &raw); err != nil {
		return nil, err
	}
	changed, err := migrateRevisionField(raw, path)
	if err != nil {
		return nil, err
	}
	if !changed {
		return nil, nil
	}
	encoded, err := json.MarshalIndent(raw, "", "  ")
	if err != nil {
		return nil, err
	}
	encoded = append(encoded, '\n')
	return &runContextMigration{path: path, data: encoded}, nil
}

func migrateRevisionField(raw map[string]json.RawMessage, path string) (bool, error) {
	keys := []string{"autoRunGeneration", "selfDrivingGeneration", "selfDrivingRevision"}
	present := make([]string, 0, len(keys))
	for _, key := range keys {
		if _, ok := raw[key]; ok {
			present = append(present, key)
		}
	}
	if len(present) > 1 {
		return false, errorsForConflictingRunSchema(path)
	}
	if len(present) == 0 || present[0] == "selfDrivingRevision" {
		return false, nil
	}
	var revision int
	if err := json.Unmarshal(raw[present[0]], &revision); err != nil || revision <= 0 {
		return false, fmt.Errorf("invalid legacy Self-Driving generation in %s", path)
	}
	raw["selfDrivingRevision"] = raw[present[0]]
	delete(raw, present[0])
	return true, nil
}

func errorsForConflictingRunSchema(path string) error {
	return fmt.Errorf("conflicting legacy generation and Self-Driving revision fields in %s", path)
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
