package app

import (
	"errors"
	"fmt"
	"os"
	"path/filepath"
	"slices"
	"strings"
	"syscall"
	"time"
)

type SelfDrivingDesiredStateInput struct {
	TaskID                 string
	Enabled                bool
	AgentName              string
	AgentNameSet           bool
	PreferredAgentProfiles []string
	ProfilesSet            bool
	Prompt                 string
	PromptSet              bool
	CompletionCriteria     string
	CompletionCriteriaSet  bool
}

type SelfDrivingActionInput struct {
	TaskID           string
	Summary          string
	WakeCondition    string
	Reason           string
	ExpectedRevision int
}

type SelfDrivingConditionInput struct {
	TaskID           string
	ExpectedRevision int
	Condition        string
	Reason           string
}

func (w *Workspace) updateSelfDrivingTask(taskID string, update func(dir string, task *Task) error) (Task, error) {
	if err := w.require(); err != nil {
		return Task{}, err
	}
	var result Task
	err := withWorkspaceMutationLock(w.root, func() error {
		var updateErr error
		result, updateErr = w.updateSelfDrivingTaskLocked(taskID, update)
		return updateErr
	})
	return result, err
}

// updateSelfDrivingTaskLocked combines the Workspace mutation lock used by
// ordinary task metadata/log writers with a per-Task lock used for revision
// CAS and archive coordination. Forge resource-session locks are deliberately
// independent and never participate in this control-plane path.
func (w *Workspace) updateSelfDrivingTaskLocked(taskID string, update func(dir string, task *Task) error) (Task, error) {
	dir, task, err := loadOpenTask(w.root, cleanID(taskID))
	if err != nil {
		return Task{}, &APIError{Operation: "update Self-Driving", Kind: "self-driving", Workspace: w.root, ResourceID: taskID, Err: err}
	}
	lock, err := acquireSelfDrivingTaskLock(dir)
	if err != nil {
		return Task{}, err
	}
	defer lock.Close()
	defer syscall.Flock(int(lock.Fd()), syscall.LOCK_UN)
	if err := readTaskAtDir(dir, &task); err != nil {
		return Task{}, err
	}
	if err := update(dir, &task); err != nil {
		return Task{}, &APIError{Operation: "update Self-Driving", Kind: "self-driving", Workspace: w.root, ResourceID: taskID, Err: err}
	}
	task.UpdatedAt = time.Now().Format(time.RFC3339)
	if err := writeResourceMetadata(dir, &task); err != nil {
		return Task{}, err
	}
	return task, nil
}

func acquireSelfDrivingTaskLock(dir string) (*os.File, error) {
	lockDir := filepath.Join(dir, ".forge")
	if err := os.MkdirAll(lockDir, 0o755); err != nil {
		return nil, err
	}
	lock, err := os.OpenFile(filepath.Join(lockDir, "self-driving.lock"), os.O_CREATE|os.O_RDWR, 0o644)
	if err != nil {
		return nil, err
	}
	if err := syscall.Flock(int(lock.Fd()), syscall.LOCK_EX); err != nil {
		lock.Close()
		return nil, err
	}
	return lock, nil
}

func disableSelfDrivingForArchive(dir string, task *Task) error {
	if err := readTaskAtDir(dir, task); err != nil {
		return err
	}
	if task.SelfDriving == nil || !task.SelfDriving.Enabled {
		return nil
	}
	archivedRevision := task.SelfDriving.Revision
	task.SelfDriving.Enabled = false
	task.SelfDriving.Revision++
	task.SelfDriving.Condition = selfDrivingConditionDisabled
	task.SelfDriving.ConditionReason = ""
	task.SelfDriving.WakeContext = nil
	task.SelfDriving.LastOutcome = &SelfDrivingOutcome{
		Status: "archived", Reason: "task archived", At: time.Now().Format(time.RFC3339), Revision: archivedRevision,
	}
	task.UpdatedAt = time.Now().Format(time.RFC3339)
	if err := prependLogEntry(dir, newSelfDrivingLogEntry("Self-Driving disabled by archive", "task archived", archivedRevision)); err != nil {
		return err
	}
	return writeResourceMetadata(dir, task)
}

func (w *Workspace) SetSelfDrivingDesiredState(input SelfDrivingDesiredStateInput) (Task, error) {
	return w.updateSelfDrivingTask(input.TaskID, func(dir string, task *Task) error {
		profiles, err := normalizeAgentProfiles(input.PreferredAgentProfiles)
		if err != nil {
			return err
		}
		if task.SelfDriving == nil {
			task.SelfDriving = &SelfDriving{Revision: 1, Enabled: input.Enabled, Condition: selfDrivingConditionDisabled}
			if input.Enabled {
				task.SelfDriving.Condition = selfDrivingConditionReady
			}
			applySelfDrivingConfiguration(task.SelfDriving, input, profiles)
			title := "Self-Driving disabled"
			if input.Enabled {
				title = "Self-Driving enabled"
			}
			return prependLogEntry(dir, newSelfDrivingLogEntry(title, "", task.SelfDriving.Revision))
		}
		configurationChanged := selfDrivingConfigurationChanged(task.SelfDriving, input, profiles)
		stateChanged := task.SelfDriving.Enabled != input.Enabled
		if !configurationChanged && !stateChanged {
			return nil
		}
		task.SelfDriving.Revision++
		if task.SelfDriving.Revision <= 0 {
			return errors.New("Self-Driving revision overflow")
		}
		applySelfDrivingConfiguration(task.SelfDriving, input, profiles)
		task.SelfDriving.Enabled = input.Enabled
		task.SelfDriving.ConditionReason = ""
		task.SelfDriving.WakeContext = nil
		task.SelfDriving.NotificationError = nil
		if input.Enabled {
			task.SelfDriving.Condition = selfDrivingConditionReady
			return prependLogEntry(dir, newSelfDrivingLogEntry("Self-Driving enabled", "", task.SelfDriving.Revision))
		}
		task.SelfDriving.Condition = selfDrivingConditionDisabled
		return prependLogEntry(dir, newSelfDrivingLogEntry("Self-Driving disabled", "", task.SelfDriving.Revision))
	})
}

func applySelfDrivingConfiguration(current *SelfDriving, input SelfDrivingDesiredStateInput, profiles []string) {
	if input.AgentNameSet {
		current.AgentName = strings.TrimSpace(input.AgentName)
	}
	if input.ProfilesSet {
		current.PreferredAgentProfiles = append([]string(nil), profiles...)
	}
	if input.PromptSet {
		current.Prompt = strings.TrimSpace(input.Prompt)
	}
	if input.CompletionCriteriaSet {
		current.CompletionCriteria = strings.TrimSpace(input.CompletionCriteria)
	}
}

func selfDrivingConfigurationChanged(current *SelfDriving, input SelfDrivingDesiredStateInput, profiles []string) bool {
	return input.AgentNameSet && current.AgentName != strings.TrimSpace(input.AgentName) ||
		input.ProfilesSet && !slices.Equal(current.PreferredAgentProfiles, profiles) ||
		input.PromptSet && current.Prompt != strings.TrimSpace(input.Prompt) ||
		input.CompletionCriteriaSet && current.CompletionCriteria != strings.TrimSpace(input.CompletionCriteria)
}

func (w *Workspace) EnableSelfDriving(input SelfDrivingDesiredStateInput) (Task, error) {
	input.Enabled = true
	return w.SetSelfDrivingDesiredState(input)
}

func (w *Workspace) DisableSelfDriving(taskID string) (Task, error) {
	return w.SetSelfDrivingDesiredState(SelfDrivingDesiredStateInput{TaskID: taskID, Enabled: false})
}

func (w *Workspace) SetSelfDrivingCondition(input SelfDrivingConditionInput) (Task, error) {
	return w.updateSelfDrivingTask(input.TaskID, func(_ string, task *Task) error {
		if task.SelfDriving == nil || !task.SelfDriving.Enabled {
			return errors.New("Self-Driving is disabled")
		}
		if err := validateSelfDrivingRevision(task.SelfDriving, input.ExpectedRevision); err != nil {
			return err
		}
		switch input.Condition {
		case selfDrivingConditionReady, selfDrivingConditionReconciling, selfDrivingConditionWaiting, selfDrivingConditionBlocked, selfDrivingConditionError, selfDrivingConditionNeedsConfiguration:
		default:
			return fmt.Errorf("invalid Self-Driving condition %q", input.Condition)
		}
		task.SelfDriving.Condition = input.Condition
		task.SelfDriving.ConditionReason = strings.TrimSpace(input.Reason)
		return nil
	})
}

// SignalSelfDrivingUserMessage makes a blocked/waiting controller eligible for
// re-evaluation after the manual turn. The Session remains the priority gate,
// so the Scheduler will wait while that user turn is active.
func (w *Workspace) SignalSelfDrivingUserMessage(taskID string) (Task, error) {
	return w.updateSelfDrivingTask(taskID, func(dir string, task *Task) error {
		if task.SelfDriving == nil || !task.SelfDriving.Enabled {
			return nil
		}
		switch task.SelfDriving.Condition {
		case selfDrivingConditionWaiting, selfDrivingConditionBlocked, selfDrivingConditionError:
			if err := advanceSelfDrivingRevision(task.SelfDriving); err != nil {
				return err
			}
			task.SelfDriving.Condition = selfDrivingConditionReady
			task.SelfDriving.ConditionReason = "user message requested re-evaluation"
			task.SelfDriving.WakeContext = nil
			return prependLogEntry(dir, newSelfDrivingLogEntry("Self-Driving re-evaluation requested", "user message", task.SelfDriving.Revision))
		}
		return nil
	})
}

// WakeSelfDriving advances the authority epoch before a new autonomous Turn
// is dispatched for a due external wait. A callback from the Turn that
// established the wait can no longer mutate the reawakened controller.
func (w *Workspace) WakeSelfDriving(taskID string, expectedRevision int) (Task, error) {
	return w.updateSelfDrivingTask(taskID, func(dir string, task *Task) error {
		if err := validateEnabledSelfDrivingRevision(task.SelfDriving, expectedRevision); err != nil {
			return err
		}
		if task.SelfDriving.Condition != selfDrivingConditionWaiting || task.SelfDriving.WakeContext == nil {
			return errors.New("Self-Driving is not waiting for an external wake condition")
		}
		if err := advanceSelfDrivingRevision(task.SelfDriving); err != nil {
			return err
		}
		task.SelfDriving.Condition = selfDrivingConditionReady
		task.SelfDriving.ConditionReason = "external wait is due for re-evaluation"
		task.SelfDriving.WakeContext = nil
		return prependLogEntry(dir, newSelfDrivingLogEntry("Self-Driving wake re-evaluation", "external wait became due", task.SelfDriving.Revision))
	})
}

func (w *Workspace) RecordSelfDrivingNotificationError(taskID string, revision int, notificationErr error) (Task, error) {
	return w.updateSelfDrivingTask(taskID, func(_ string, task *Task) error {
		if task.SelfDriving == nil || task.SelfDriving.Revision != revision || task.SelfDriving.Enabled {
			return nil
		}
		if notificationErr == nil {
			task.SelfDriving.NotificationError = nil
		} else {
			task.SelfDriving.NotificationError = &SelfDrivingNotificationError{Message: notificationErr.Error(), At: time.Now().Format(time.RFC3339)}
		}
		return nil
	})
}

func (w *Workspace) CompleteSelfDriving(input SelfDrivingActionInput) (Task, error) {
	return w.updateSelfDrivingTask(input.TaskID, func(dir string, task *Task) error {
		if duplicateSelfDrivingOutcome(task.SelfDriving, input.ExpectedRevision, "completed") {
			return nil
		}
		if err := validateEnabledSelfDrivingRevision(task.SelfDriving, input.ExpectedRevision); err != nil {
			return err
		}
		completedRevision := task.SelfDriving.Revision
		task.SelfDriving.Enabled = false
		task.SelfDriving.Revision++
		task.SelfDriving.Condition = selfDrivingConditionDisabled
		task.SelfDriving.ConditionReason = ""
		task.SelfDriving.LastOutcome = &SelfDrivingOutcome{Status: "completed", Reason: strings.TrimSpace(input.Summary), At: time.Now().Format(time.RFC3339), Revision: completedRevision}
		return prependLogEntry(dir, newSelfDrivingLogEntry("Self-Driving completed", input.Summary, completedRevision))
	})
}

func (w *Workspace) SuspendSelfDriving(input SelfDrivingActionInput) (Task, error) {
	return w.updateSelfDrivingTask(input.TaskID, func(dir string, task *Task) error {
		if duplicateSelfDrivingOutcome(task.SelfDriving, input.ExpectedRevision, "waiting") {
			return nil
		}
		if err := validateEnabledSelfDrivingRevision(task.SelfDriving, input.ExpectedRevision); err != nil {
			return err
		}
		summary := strings.TrimSpace(input.Summary)
		if summary == "" {
			summary = strings.TrimSpace(input.Reason)
		}
		if summary == "" {
			summary = selfDrivingSuspensionFallback
		}
		condition := strings.TrimSpace(input.WakeCondition)
		fallback := condition == ""
		if fallback {
			condition = summary
		}
		task.SelfDriving.Condition = selfDrivingConditionWaiting
		task.SelfDriving.ConditionReason = summary
		task.SelfDriving.WakeContext = &SelfDrivingWakeContext{Summary: summary, Condition: condition, WaitingAt: time.Now().Format(time.RFC3339), Fallback: fallback}
		task.SelfDriving.LastOutcome = &SelfDrivingOutcome{Status: "waiting", Reason: summary, At: time.Now().Format(time.RFC3339), Revision: task.SelfDriving.Revision}
		return prependLogEntry(dir, newSelfDrivingSuspensionLogEntry("Self-Driving waiting", summary, condition, fallback, task.SelfDriving.Revision))
	})
}

func (w *Workspace) PauseSelfDriving(input SelfDrivingActionInput) (Task, error) {
	return w.recordSelfDrivingNonTerminalOutcome(input, selfDrivingConditionBlocked, "blocked")
}

func (w *Workspace) FailSelfDriving(input SelfDrivingActionInput) (Task, error) {
	return w.recordSelfDrivingNonTerminalOutcome(input, selfDrivingConditionError, "error")
}

func (w *Workspace) recordSelfDrivingNonTerminalOutcome(input SelfDrivingActionInput, condition, status string) (Task, error) {
	return w.updateSelfDrivingTask(input.TaskID, func(dir string, task *Task) error {
		if duplicateSelfDrivingOutcome(task.SelfDriving, input.ExpectedRevision, status) {
			return nil
		}
		if err := validateEnabledSelfDrivingRevision(task.SelfDriving, input.ExpectedRevision); err != nil {
			return err
		}
		reason := strings.TrimSpace(input.Reason)
		if reason == "" {
			reason = strings.TrimSpace(input.Summary)
		}
		task.SelfDriving.Condition = condition
		task.SelfDriving.ConditionReason = reason
		task.SelfDriving.LastOutcome = &SelfDrivingOutcome{Status: status, Reason: reason, At: time.Now().Format(time.RFC3339), Revision: task.SelfDriving.Revision}
		return prependLogEntry(dir, newSelfDrivingLogEntry("Self-Driving "+status, reason, task.SelfDriving.Revision))
	})
}

func validateEnabledSelfDrivingRevision(current *SelfDriving, expected int) error {
	if current == nil || !current.Enabled {
		return errors.New("Self-Driving is disabled")
	}
	return validateSelfDrivingRevision(current, expected)
}

func validateSelfDrivingRevision(current *SelfDriving, expected int) error {
	if expected <= 0 {
		return errors.New("expected Self-Driving revision is required")
	}
	if current.Revision != expected {
		return fmt.Errorf("Self-Driving revision changed from %d to %d", expected, current.Revision)
	}
	return nil
}

func advanceSelfDrivingRevision(current *SelfDriving) error {
	current.Revision++
	if current.Revision <= 0 {
		return errors.New("Self-Driving revision overflow")
	}
	return nil
}

func duplicateSelfDrivingOutcome(current *SelfDriving, revision int, status string) bool {
	return current != nil && current.LastOutcome != nil && current.LastOutcome.Revision == revision && current.LastOutcome.Status == status
}
