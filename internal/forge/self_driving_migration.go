package forge

import (
	"encoding/json"
	"fmt"
	"os"
	"path/filepath"
	"strings"
	"time"
)

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
	entries, err := readLogEntries(dir)
	if err == nil {
		// prependLogEntry writes newest first; the first matching entry is the
		// most recent "Self-Driving waiting" for this generation.
		for _, entry := range entries {
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
	if err := writeResourceMetadata(dir, task); err != nil {
		return fmt.Errorf("migrate Self-Driving waiting state for %s: %w", task.ID, err)
	}
	return nil
}

// migrateSelfDrivingMetadata repairs suspended records created before
// wakeCondition existed. The write is explicit and idempotent so both CLI and
// application API reads converge old task.json files to the same safe shape.
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
	if strings.TrimSpace(task.SelfDriving.WakeCondition) == "" {
		task.SelfDriving.WakeCondition = strings.TrimSpace(task.SelfDriving.SuspensionSummary)
		if task.SelfDriving.WakeCondition == "" {
			task.SelfDriving.WakeCondition = selfDrivingSuspensionFallback
		}
		changed = true
	}
	if !changed {
		return nil
	}
	if err := writeResourceMetadata(dir, task); err != nil {
		return fmt.Errorf("migrate Self-Driving wake condition for %s: %w", task.ID, err)
	}
	if wakeConditionMissing {
		entries, err := readLogEntries(dir)
		if err != nil {
			return err
		}
		markerFound := false
		for _, entry := range entries {
			if entry.SelfDriving && entry.SelfDrivingGeneration == task.SelfDriving.Generation && entry.Title == "Self-Driving wake condition migrated" {
				markerFound = true
				break
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
