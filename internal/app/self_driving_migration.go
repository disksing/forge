package app

import (
	"bytes"
	"encoding/json"
	"fmt"
	"os"
	"path/filepath"
	"strings"
	"time"
)

// migrateLegacySelfDrivingSchema is the only production reader for AutoRun and
// the retired seven-state Self-Driving schema. It rewrites one file at a time
// atomically and is idempotent after every persistence boundary.
func migrateLegacySelfDrivingSchema(dir string) error {
	// Validate every compatibility surface before the first write so malformed
	// or conflicting task/log data cannot leave a half-migrated resource.
	if err := preflightLegacySelfDrivingTask(dir); err != nil {
		return err
	}
	if err := preflightLegacySelfDrivingLogs(dir); err != nil {
		return err
	}
	if err := migrateLegacySelfDrivingTask(dir); err != nil {
		return err
	}
	if err := migrateLegacySelfDrivingLogs(dir); err != nil {
		return err
	}
	return migrateLegacySelfDrivingLock(dir)
}

func preflightLegacySelfDrivingTask(dir string) error {
	path := filepath.Join(dir, taskJSONFile)
	data, err := os.ReadFile(path)
	if err != nil {
		return err
	}
	var root map[string]json.RawMessage
	if err := json.Unmarshal(data, &root); err != nil {
		return err
	}
	legacyAuto, hasAuto := root["autoRun"]
	selfRaw, hasSelf := root["selfDriving"]
	if hasAuto && hasSelf {
		return errorsForConflictingSelfDrivingSchema(path)
	}
	if hasAuto {
		selfRaw, hasSelf = legacyAuto, true
	}
	if !hasSelf || bytes.Equal(bytes.TrimSpace(selfRaw), []byte("null")) {
		return nil
	}
	var fields map[string]json.RawMessage
	if err := json.Unmarshal(selfRaw, &fields); err != nil {
		return fmt.Errorf("decode Self-Driving in %s: %w", path, err)
	}
	_, hasEnabled := fields["enabled"]
	_, hasRevision := fields["revision"]
	_, hasCondition := fields["condition"]
	_, hasGeneration := fields["generation"]
	_, hasState := fields["state"]
	if (hasEnabled || hasRevision || hasCondition) && (hasGeneration || hasState) {
		return fmt.Errorf("conflicting legacy and current Self-Driving fields in %s", path)
	}
	if !hasEnabled && !hasRevision && !hasCondition {
		_, err := convertSevenStateSelfDriving(fields, root, path)
		return err
	}
	var current SelfDriving
	if err := json.Unmarshal(selfRaw, &current); err != nil {
		return err
	}
	if current.Revision <= 0 || strings.TrimSpace(current.Condition) == "" {
		return fmt.Errorf("invalid current Self-Driving schema in %s", path)
	}
	return nil
}

func preflightLegacySelfDrivingLogs(dir string) error {
	path := filepath.Join(dir, logJSONLFile)
	data, err := os.ReadFile(path)
	if err != nil {
		if os.IsNotExist(err) {
			return nil
		}
		return err
	}
	for i, line := range bytes.Split(data, []byte{'\n'}) {
		if len(bytes.TrimSpace(line)) == 0 {
			continue
		}
		var raw map[string]json.RawMessage
		if err := json.Unmarshal(line, &raw); err != nil {
			return fmt.Errorf("%s:%d: %w", path, i+1, err)
		}
		for _, keys := range [][2]string{{"autoRun", "selfDriving"}, {"autoRunWakeCondition", "selfDrivingWakeCondition"}, {"autoRunWakeConditionFallback", "selfDrivingWakeConditionFallback"}} {
			if _, legacy := raw[keys[0]]; legacy {
				if _, current := raw[keys[1]]; current {
					return errorsForConflictingSelfDrivingSchema(path)
				}
			}
		}
		present := 0
		var revision json.RawMessage
		for _, key := range []string{"autoRunGeneration", "selfDrivingGeneration", "selfDrivingRevision"} {
			if value, ok := raw[key]; ok {
				present++
				revision = value
			}
		}
		if present > 1 {
			return errorsForConflictingSelfDrivingSchema(path)
		}
		if present == 1 {
			var value int
			if err := json.Unmarshal(revision, &value); err != nil || value <= 0 {
				return fmt.Errorf("invalid legacy Self-Driving generation in %s:%d", path, i+1)
			}
		}
	}
	return nil
}

func migrateWorkspaceSelfDrivingData(root string) error {
	projects, err := readProjectEntriesInDirs([]string{root, filepath.Join(root, archiveDir)})
	if err != nil {
		return err
	}
	for _, project := range projects {
		for _, parent := range []string{project.Path, filepath.Join(project.Path, archiveDir)} {
			entries, readErr := os.ReadDir(parent)
			if readErr != nil {
				if os.IsNotExist(readErr) {
					continue
				}
				return readErr
			}
			for _, entry := range entries {
				if !entry.IsDir() {
					continue
				}
				dir := filepath.Join(parent, entry.Name())
				if _, statErr := os.Stat(filepath.Join(dir, taskJSONFile)); statErr != nil {
					if os.IsNotExist(statErr) {
						continue
					}
					return statErr
				}
				if err := migrateLegacySelfDrivingSchema(dir); err != nil {
					return err
				}
			}
		}
	}
	return nil
}

func migrateLegacySelfDrivingTask(dir string) error {
	path := filepath.Join(dir, taskJSONFile)
	data, err := os.ReadFile(path)
	if err != nil {
		return err
	}
	var root map[string]json.RawMessage
	if err := json.Unmarshal(data, &root); err != nil {
		return err
	}
	legacyAuto, hasAuto := root["autoRun"]
	selfRaw, hasSelf := root["selfDriving"]
	if hasAuto && hasSelf {
		return errorsForConflictingSelfDrivingSchema(path)
	}
	if hasAuto {
		selfRaw, hasSelf = legacyAuto, true
		delete(root, "autoRun")
	}
	if !hasSelf || bytes.Equal(bytes.TrimSpace(selfRaw), []byte("null")) {
		return nil
	}
	var fields map[string]json.RawMessage
	if err := json.Unmarshal(selfRaw, &fields); err != nil {
		return fmt.Errorf("decode Self-Driving in %s: %w", path, err)
	}
	_, hasEnabled := fields["enabled"]
	_, hasRevision := fields["revision"]
	_, hasCondition := fields["condition"]
	_, hasGeneration := fields["generation"]
	_, hasState := fields["state"]
	if (hasEnabled || hasRevision || hasCondition) && (hasGeneration || hasState) {
		return fmt.Errorf("conflicting legacy and current Self-Driving fields in %s", path)
	}
	changed := hasAuto
	if !hasEnabled && !hasRevision && !hasCondition {
		converted, convertErr := convertSevenStateSelfDriving(fields, root, path)
		if convertErr != nil {
			return convertErr
		}
		encoded, marshalErr := json.Marshal(converted)
		if marshalErr != nil {
			return marshalErr
		}
		root["selfDriving"] = encoded
		changed = true
	} else {
		var current SelfDriving
		if err := json.Unmarshal(selfRaw, &current); err != nil {
			return err
		}
		if current.Revision <= 0 || strings.TrimSpace(current.Condition) == "" {
			return fmt.Errorf("invalid current Self-Driving schema in %s", path)
		}
		if isArchivedMigrationPath(dir) && current.Enabled {
			oldRevision := current.Revision
			current.Enabled = false
			current.Revision++
			current.Condition = selfDrivingConditionDisabled
			current.ConditionReason = ""
			current.LastOutcome = &SelfDrivingOutcome{Status: "archived", Reason: "task archived", At: migrationTimestamp(root), Revision: oldRevision}
			encoded, marshalErr := json.Marshal(current)
			if marshalErr != nil {
				return marshalErr
			}
			root["selfDriving"] = encoded
			changed = true
		} else if hasAuto {
			root["selfDriving"] = selfRaw
		}
	}
	if !changed {
		return nil
	}
	encoded, err := json.MarshalIndent(root, "", "  ")
	if err != nil {
		return err
	}
	return writeAtomicMigrationFile(path, append(encoded, '\n'), 0o644)
}

func convertSevenStateSelfDriving(fields map[string]json.RawMessage, taskRoot map[string]json.RawMessage, path string) (SelfDriving, error) {
	var legacy struct {
		Generation             int      `json:"generation"`
		State                  string   `json:"state"`
		AgentName              string   `json:"agentName"`
		PreferredAgentProfiles []string `json:"preferredAgentProfiles"`
		Prompt                 string   `json:"prompt"`
		CompletionCriteria     string   `json:"completionCriteria"`
		WakeCondition          string   `json:"wakeCondition"`
		SuspendedAt            string   `json:"suspendedAt"`
		SuspensionSummary      string   `json:"suspensionSummary"`
		StatusReason           string   `json:"statusReason"`
		WakeConditionFallback  bool     `json:"wakeConditionFallback"`
	}
	encoded, _ := json.Marshal(fields)
	if err := json.Unmarshal(encoded, &legacy); err != nil {
		return SelfDriving{}, err
	}
	if legacy.Generation <= 0 {
		return SelfDriving{}, fmt.Errorf("legacy Self-Driving generation must be positive in %s", path)
	}
	current := SelfDriving{
		Revision: legacy.Generation, AgentName: strings.TrimSpace(legacy.AgentName),
		PreferredAgentProfiles: append([]string(nil), legacy.PreferredAgentProfiles...),
		Prompt:                 strings.TrimSpace(legacy.Prompt), CompletionCriteria: strings.TrimSpace(legacy.CompletionCriteria),
	}
	reason := strings.TrimSpace(legacy.StatusReason)
	switch strings.TrimSpace(legacy.State) {
	case "queued":
		current.Enabled, current.Condition = true, selfDrivingConditionReady
	case "running":
		current.Enabled, current.Condition = true, selfDrivingConditionReconciling
	case "suspended", "waiting":
		current.Enabled, current.Condition = true, selfDrivingConditionWaiting
		summary := strings.TrimSpace(legacy.SuspensionSummary)
		if summary == "" {
			summary = reason
		}
		if summary == "" {
			summary = selfDrivingSuspensionFallback
		}
		condition := strings.TrimSpace(legacy.WakeCondition)
		fallback := legacy.WakeConditionFallback || condition == ""
		if condition == "" {
			condition = summary
		}
		waitingAt := strings.TrimSpace(legacy.SuspendedAt)
		if waitingAt == "" {
			waitingAt = migrationTimestamp(taskRoot)
		}
		current.WakeContext = &SelfDrivingWakeContext{Summary: summary, Condition: condition, WaitingAt: waitingAt, Fallback: fallback}
		current.ConditionReason = summary
	case "paused", "completed", "failed", "cancelled":
		status := strings.TrimSpace(legacy.State)
		current.Enabled, current.Condition = false, selfDrivingConditionDisabled
		current.LastOutcome = &SelfDrivingOutcome{Status: status, Reason: reason, At: migrationTimestamp(taskRoot), Revision: legacy.Generation}
	default:
		return SelfDriving{}, fmt.Errorf("invalid legacy Self-Driving state %q in %s", legacy.State, path)
	}
	if isArchivedMigrationPath(filepath.Dir(path)) && current.Enabled {
		oldRevision := current.Revision
		current.Enabled = false
		current.Revision++
		current.Condition = selfDrivingConditionDisabled
		current.ConditionReason = ""
		current.LastOutcome = &SelfDrivingOutcome{Status: "archived", Reason: "task archived", At: migrationTimestamp(taskRoot), Revision: oldRevision}
	}
	return current, nil
}

func migrationTimestamp(root map[string]json.RawMessage) string {
	var updated string
	_ = json.Unmarshal(root["updatedAt"], &updated)
	if strings.TrimSpace(updated) == "" {
		updated = time.Now().Format(time.RFC3339)
	}
	return updated
}

func isArchivedMigrationPath(path string) bool {
	for path != "." && path != string(filepath.Separator) && path != "" {
		if filepath.Base(path) == archiveDir {
			return true
		}
		path = filepath.Dir(path)
	}
	return false
}

func migrateLegacySelfDrivingLogs(dir string) error {
	path := filepath.Join(dir, logJSONLFile)
	data, err := os.ReadFile(path)
	if err != nil {
		if os.IsNotExist(err) {
			return nil
		}
		return err
	}
	lines := bytes.Split(data, []byte{'\n'})
	changed := false
	for i, line := range lines {
		if len(bytes.TrimSpace(line)) == 0 {
			continue
		}
		var raw map[string]json.RawMessage
		if err := json.Unmarshal(line, &raw); err != nil {
			return fmt.Errorf("%s:%d: %w", path, i+1, err)
		}
		for _, keys := range [][2]string{{"autoRun", "selfDriving"}, {"autoRunWakeCondition", "selfDrivingWakeCondition"}, {"autoRunWakeConditionFallback", "selfDrivingWakeConditionFallback"}} {
			legacy, ok := raw[keys[0]]
			if !ok {
				continue
			}
			if _, conflict := raw[keys[1]]; conflict {
				return errorsForConflictingSelfDrivingSchema(path)
			}
			raw[keys[1]] = legacy
			delete(raw, keys[0])
			changed = true
		}
		generationKeys := []string{"autoRunGeneration", "selfDrivingGeneration", "selfDrivingRevision"}
		present := make([]string, 0, len(generationKeys))
		for _, key := range generationKeys {
			if _, ok := raw[key]; ok {
				present = append(present, key)
			}
		}
		if len(present) > 1 {
			return errorsForConflictingSelfDrivingSchema(path)
		}
		if len(present) == 1 && present[0] != "selfDrivingRevision" {
			var revision int
			if err := json.Unmarshal(raw[present[0]], &revision); err != nil || revision <= 0 {
				return fmt.Errorf("invalid legacy Self-Driving generation in %s:%d", path, i+1)
			}
			raw["selfDrivingRevision"] = raw[present[0]]
			delete(raw, present[0])
			changed = true
		}
		var title string
		if value, ok := raw["title"]; ok && json.Unmarshal(value, &title) == nil {
			originalTitle := title
			if strings.HasPrefix(title, "Auto Run ") {
				title = "Self-Driving " + strings.TrimPrefix(title, "Auto Run ")
			}
			if title == "Self-Driving queued" || title == "Self-Driving started" {
				title = "Self-Driving enabled"
			}
			if title == "Self-Driving suspended" {
				title = "Self-Driving waiting"
			}
			raw["title"], _ = json.Marshal(title)
			changed = changed || title != originalTitle
		}
		lines[i], err = json.Marshal(raw)
		if err != nil {
			return err
		}
	}
	if !changed {
		return nil
	}
	return writeAtomicMigrationFile(path, bytes.Join(lines, []byte{'\n'}), 0o644)
}

func migrateLegacySelfDrivingLock(dir string) error {
	lockDir := filepath.Join(dir, ".forge")
	legacyPath := filepath.Join(lockDir, "autorun.lock")
	currentPath := filepath.Join(lockDir, "self-driving.lock")
	if _, err := os.Lstat(legacyPath); err != nil {
		if os.IsNotExist(err) {
			return nil
		}
		return err
	}
	if _, err := os.Lstat(currentPath); err == nil {
		return os.Remove(legacyPath)
	} else if !os.IsNotExist(err) {
		return err
	}
	if err := os.Rename(legacyPath, currentPath); err != nil && !os.IsNotExist(err) {
		return err
	}
	return nil
}

func errorsForConflictingSelfDrivingSchema(path string) error {
	return fmt.Errorf("conflicting legacy and selfDriving fields in %s", path)
}

func writeAtomicMigrationFile(path string, data []byte, mode os.FileMode) error {
	tmp, err := os.CreateTemp(filepath.Dir(path), ".forge-self-driving-*.tmp")
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
