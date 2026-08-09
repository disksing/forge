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

// migrateLegacySelfDrivingSchema is the only production reader for the
// retired AutoRun persistence keys. It performs a one-way, atomic rewrite of
// task metadata, log entries, and the per-task lock name. Each file is
// independently idempotent, so an interrupted migration safely resumes on the
// next read without duplicating state transitions or changing generations.
func migrateLegacySelfDrivingSchema(dir string) error {
	if err := migrateLegacySelfDrivingTask(dir); err != nil {
		return err
	}
	if err := migrateLegacySelfDrivingLogs(dir); err != nil {
		return err
	}
	return migrateLegacySelfDrivingLock(dir)
}

func migrateWorkspaceSelfDrivingData(root string) error {
	projects, err := readProjectEntriesInDirs([]string{root, filepath.Join(root, archiveDir)})
	if err != nil {
		return err
	}
	for _, project := range projects {
		for _, parent := range []string{project.Path, filepath.Join(project.Path, archiveDir)} {
			entries, err := os.ReadDir(parent)
			if err != nil {
				if os.IsNotExist(err) {
					continue
				}
				return err
			}
			for _, entry := range entries {
				if !entry.IsDir() {
					continue
				}
				dir := filepath.Join(parent, entry.Name())
				if _, err := os.Stat(filepath.Join(dir, taskJSONFile)); err != nil {
					if os.IsNotExist(err) {
						continue
					}
					return err
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
	var raw map[string]json.RawMessage
	if err := json.Unmarshal(data, &raw); err != nil {
		return err
	}
	legacy, hasLegacy := raw["autoRun"]
	_, hasCurrent := raw["selfDriving"]
	if !hasLegacy {
		return nil
	}
	if hasCurrent {
		return errorsForConflictingSelfDrivingSchema(path)
	}
	raw["selfDriving"] = legacy
	delete(raw, "autoRun")
	encoded, err := json.MarshalIndent(raw, "", "  ")
	if err != nil {
		return err
	}
	return writeAtomicMigrationFile(path, append(encoded, '\n'), 0o644)
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
		for _, keys := range [][2]string{
			{"autoRun", "selfDriving"},
			{"autoRunGeneration", "selfDrivingGeneration"},
			{"autoRunWakeCondition", "selfDrivingWakeCondition"},
			{"autoRunWakeConditionFallback", "selfDrivingWakeConditionFallback"},
		} {
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
		var title string
		if value, ok := raw["title"]; ok && json.Unmarshal(value, &title) == nil && strings.HasPrefix(title, "Auto Run ") {
			raw["title"], _ = json.Marshal("Self-Driving " + strings.TrimPrefix(title, "Auto Run "))
			changed = true
		}
		if changedLine, err := json.Marshal(raw); err != nil {
			return err
		} else {
			lines[i] = changedLine
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
		if err := os.Remove(legacyPath); err != nil && !os.IsNotExist(err) {
			return err
		}
		return nil
	} else if !os.IsNotExist(err) {
		return err
	}
	if err := os.Rename(legacyPath, currentPath); err != nil {
		// Concurrent readers can race through the initial Lstat while applying
		// the same idempotent migration. The winner's current lock is the only
		// acceptable reason for the legacy source to disappear.
		if os.IsNotExist(err) {
			if _, currentErr := os.Lstat(currentPath); currentErr == nil {
				return nil
			}
		}
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

// legacySelfDrivingDependency mirrors the pre-simplification Self-Driving after list
// so migration can read it from the raw task.json bytes before the new schema
// silently drops it.
type legacySelfDrivingDependency struct {
	TaskID     string `json:"taskId"`
	Generation int    `json:"generation"`
}

// migrateLegacySelfDrivingWaiting converts pre-simplification Self-Driving data in
// place. Old generations used the "waiting" state plus a structured after
// dependency list. The new model records a natural-language suspension reason
// and a wall-clock suspendedAt timestamp instead, and never depends on other
// tasks.
//
// A migrated generation becomes "suspended" so the server driver can wake it
// after the fixed suspension limit. The suspendedAt timestamp prefers the most
// recent "Self-Driving waiting" log entry for that generation, falling back to the
// task's updatedAt; it is never derived from task.updatedAt afterwards. The
// dependency list is flattened into a readable summary for the agent.
//
// The migration is idempotent: once the file is rewritten with the new state,
// later reads no longer see "waiting" and skip the rewrite.
func migrateLegacySelfDrivingWaiting(dir string, task *Task) error {
	if task.SelfDriving == nil || task.SelfDriving.State != "waiting" {
		return nil
	}
	generation := task.SelfDriving.Generation
	suspendedAt := task.UpdatedAt
	summary := ""
	page, err := readLogPage(dir, "", DefaultResourceLogPageLimit)
	if err == nil {
		// prependLogEntry writes newest first; the first matching entry is the
		// most recent "Self-Driving waiting" for this generation.
		for _, entry := range page.Entries {
			if !entry.SelfDriving || entry.SelfDrivingGeneration != generation || entry.Title != "Self-Driving waiting" {
				continue
			}
			if entry.Time != "" {
				suspendedAt = entry.Time
			}
			if strings.TrimSpace(entry.Details) != "" {
				summary = strings.TrimSpace(entry.Details)
			}
			break
		}
	}
	after := readLegacySelfDrivingAfter(dir)
	deps := make([]string, 0, len(after))
	for _, dep := range after {
		deps = append(deps, fmt.Sprintf("%s@%d", dep.TaskID, dep.Generation))
	}
	if len(deps) > 0 {
		waiting := "Waiting for " + strings.Join(deps, ", ")
		if summary != "" {
			summary = waiting + "; " + summary
		} else {
			summary = waiting
		}
	}
	if summary == "" {
		summary = "Suspended while waiting for prerequisites"
	}
	task.SelfDriving.State = selfDrivingStateSuspended
	task.SelfDriving.SuspendedAt = suspendedAt
	task.SelfDriving.SuspensionSummary = summary
	task.SelfDriving.StatusReason = summary
	task.SelfDriving.WakeConditionFallback = true
	if err := writeResourceMetadata(dir, task); err != nil {
		return fmt.Errorf("migrate Self-Driving waiting state for %s: %w", task.ID, err)
	}
	return nil
}

// migrateSelfDrivingMetadata completes the wakeCondition migration for both old
// suspended records and records created before the field existed. It is
// deliberately explicit and idempotent: a read repairs the durable task once
// and subsequent reads leave it untouched.
func migrateSelfDrivingMetadata(dir string, task *Task) error {
	if err := migrateLegacySelfDrivingWaiting(dir, task); err != nil {
		return err
	}
	if task.SelfDriving == nil || task.SelfDriving.State != selfDrivingStateSuspended {
		return nil
	}
	changed := false
	wakeConditionMissing := strings.TrimSpace(task.SelfDriving.WakeCondition) == ""
	if strings.TrimSpace(task.SelfDriving.SuspendedAt) == "" {
		task.SelfDriving.SuspendedAt = task.UpdatedAt
		if strings.TrimSpace(task.SelfDriving.SuspendedAt) == "" {
			task.SelfDriving.SuspendedAt = time.Now().Format(time.RFC3339)
		}
		changed = true
	}
	if strings.TrimSpace(task.SelfDriving.SuspensionSummary) == "" {
		if strings.TrimSpace(task.SelfDriving.WakeCondition) != "" {
			task.SelfDriving.SuspensionSummary = strings.TrimSpace(task.SelfDriving.WakeCondition)
		} else {
			task.SelfDriving.SuspensionSummary = selfDrivingSuspensionFallback
		}
		changed = true
	}
	if strings.TrimSpace(task.SelfDriving.StatusReason) == "" && strings.TrimSpace(task.SelfDriving.SuspensionSummary) != "" {
		task.SelfDriving.StatusReason = strings.TrimSpace(task.SelfDriving.SuspensionSummary)
		changed = true
	}
	if strings.TrimSpace(task.SelfDriving.WakeCondition) == "" {
		task.SelfDriving.WakeCondition = strings.TrimSpace(task.SelfDriving.SuspensionSummary)
		if task.SelfDriving.WakeCondition == "" {
			task.SelfDriving.WakeCondition = selfDrivingSuspensionFallback
		}
		changed = true
		task.SelfDriving.WakeConditionFallback = true
	}
	if !changed {
		return nil
	}
	if err := writeResourceMetadata(dir, task); err != nil {
		return fmt.Errorf("migrate Self-Driving wake condition for %s: %w", task.ID, err)
	}
	if wakeConditionMissing {
		page, err := readLogPage(dir, "", DefaultResourceLogPageLimit)
		markerFound := false
		if err == nil {
			for _, entry := range page.Entries {
				if entry.SelfDriving && entry.SelfDrivingGeneration == task.SelfDriving.Generation && entry.Title == "Self-Driving wake condition migrated" {
					markerFound = true
					break
				}
			}
		}
		if !markerFound {
			if err := prependLogEntry(dir, newSelfDrivingSuspensionLogEntry("Self-Driving wake condition migrated", "compatibility fallback: suspension summary copied into wake condition", task.SelfDriving.WakeCondition, true, task.SelfDriving.Generation)); err != nil {
				return err
			}
		}
	}
	return nil
}

func readLegacySelfDrivingAfter(dir string) []legacySelfDrivingDependency {
	path := filepath.Join(dir, taskJSONFile)
	data, err := os.ReadFile(path)
	if err != nil {
		return nil
	}
	var raw struct {
		SelfDriving *struct {
			After []legacySelfDrivingDependency `json:"after"`
		} `json:"selfDriving"`
	}
	if err := json.Unmarshal(data, &raw); err != nil || raw.SelfDriving == nil {
		return nil
	}
	return raw.SelfDriving.After
}
