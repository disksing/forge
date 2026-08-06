package app

import (
	"encoding/json"
	"fmt"
	"os"
	"path/filepath"
	"strings"
	"time"
)

// legacyAutoRunDependency mirrors the pre-simplification AutoRun after list
// so migration can read it from the raw task.json bytes before the new schema
// silently drops it.
type legacyAutoRunDependency struct {
	TaskID     string `json:"taskId"`
	Generation int    `json:"generation"`
}

// migrateLegacyAutoRunWaiting converts pre-simplification AutoRun data in
// place. Old generations used the "waiting" state plus a structured after
// dependency list. The new model records a natural-language suspension reason
// and a wall-clock suspendedAt timestamp instead, and never depends on other
// tasks.
//
// A migrated generation becomes "suspended" so the server driver can wake it
// after the fixed suspension limit. The suspendedAt timestamp prefers the most
// recent "Auto Run waiting" log entry for that generation, falling back to the
// task's updatedAt; it is never derived from task.updatedAt afterwards. The
// dependency list is flattened into a readable summary for the agent.
//
// The migration is idempotent: once the file is rewritten with the new state,
// later reads no longer see "waiting" and skip the rewrite.
func migrateLegacyAutoRunWaiting(dir string, task *Task) error {
	if task.AutoRun == nil || task.AutoRun.State != "waiting" {
		return nil
	}
	generation := task.AutoRun.Generation
	suspendedAt := task.UpdatedAt
	summary := ""
	page, err := readLogPage(dir, "", DefaultResourceLogPageLimit)
	if err == nil {
		// prependLogEntry writes newest first; the first matching entry is the
		// most recent "Auto Run waiting" for this generation.
		for _, entry := range page.Entries {
			if !entry.AutoRun || entry.AutoRunGeneration != generation || entry.Title != "Auto Run waiting" {
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
	after := readLegacyAutoRunAfter(dir)
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
	task.AutoRun.State = autoRunStateSuspended
	task.AutoRun.SuspendedAt = suspendedAt
	task.AutoRun.SuspensionSummary = summary
	task.AutoRun.StatusReason = summary
	task.AutoRun.WakeConditionFallback = true
	if err := writeResourceMetadata(dir, task); err != nil {
		return fmt.Errorf("migrate AutoRun waiting state for %s: %w", task.ID, err)
	}
	return nil
}

// migrateAutoRunMetadata completes the wakeCondition migration for both old
// suspended records and records created before the field existed. It is
// deliberately explicit and idempotent: a read repairs the durable task once
// and subsequent reads leave it untouched.
func migrateAutoRunMetadata(dir string, task *Task) error {
	if err := migrateLegacyAutoRunWaiting(dir, task); err != nil {
		return err
	}
	if task.AutoRun == nil || task.AutoRun.State != autoRunStateSuspended {
		return nil
	}
	changed := false
	wakeConditionMissing := strings.TrimSpace(task.AutoRun.WakeCondition) == ""
	if strings.TrimSpace(task.AutoRun.SuspendedAt) == "" {
		task.AutoRun.SuspendedAt = task.UpdatedAt
		if strings.TrimSpace(task.AutoRun.SuspendedAt) == "" {
			task.AutoRun.SuspendedAt = time.Now().Format(time.RFC3339)
		}
		changed = true
	}
	if strings.TrimSpace(task.AutoRun.SuspensionSummary) == "" {
		if strings.TrimSpace(task.AutoRun.WakeCondition) != "" {
			task.AutoRun.SuspensionSummary = strings.TrimSpace(task.AutoRun.WakeCondition)
		} else {
			task.AutoRun.SuspensionSummary = autoRunSuspensionFallback
		}
		changed = true
	}
	if strings.TrimSpace(task.AutoRun.StatusReason) == "" && strings.TrimSpace(task.AutoRun.SuspensionSummary) != "" {
		task.AutoRun.StatusReason = strings.TrimSpace(task.AutoRun.SuspensionSummary)
		changed = true
	}
	if strings.TrimSpace(task.AutoRun.WakeCondition) == "" {
		task.AutoRun.WakeCondition = strings.TrimSpace(task.AutoRun.SuspensionSummary)
		if task.AutoRun.WakeCondition == "" {
			task.AutoRun.WakeCondition = autoRunSuspensionFallback
		}
		changed = true
		task.AutoRun.WakeConditionFallback = true
	}
	if !changed {
		return nil
	}
	if err := writeResourceMetadata(dir, task); err != nil {
		return fmt.Errorf("migrate AutoRun wake condition for %s: %w", task.ID, err)
	}
	if wakeConditionMissing {
		page, err := readLogPage(dir, "", DefaultResourceLogPageLimit)
		markerFound := false
		if err == nil {
			for _, entry := range page.Entries {
				if entry.AutoRun && entry.AutoRunGeneration == task.AutoRun.Generation && entry.Title == "Auto Run wake condition migrated" {
					markerFound = true
					break
				}
			}
		}
		if !markerFound {
			if err := prependLogEntry(dir, newAutoRunSuspensionLogEntry("Auto Run wake condition migrated", "compatibility fallback: suspension summary copied into wake condition", task.AutoRun.WakeCondition, true, task.AutoRun.Generation)); err != nil {
				return err
			}
		}
	}
	return nil
}

func readLegacyAutoRunAfter(dir string) []legacyAutoRunDependency {
	path := filepath.Join(dir, taskJSONFile)
	data, err := os.ReadFile(path)
	if err != nil {
		return nil
	}
	var raw struct {
		AutoRun *struct {
			After []legacyAutoRunDependency `json:"after"`
		} `json:"autoRun"`
	}
	if err := json.Unmarshal(data, &raw); err != nil || raw.AutoRun == nil {
		return nil
	}
	return raw.AutoRun.After
}
