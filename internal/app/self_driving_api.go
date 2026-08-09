package app

import (
	"errors"
	"fmt"
	"os"
	"path/filepath"
	"strings"
	"syscall"
	"time"
)

// SelfDrivingQueueInput describes a new or next Self-Driving generation.
type SelfDrivingQueueInput struct {
	TaskID                 string
	AgentName              string
	AgentNameSet           bool
	PreferredAgentProfiles []string
	Prompt                 string
	PromptSet              bool
	CompletionCriteria     string
	CompletionCriteriaSet  bool
}

// SelfDrivingResumeInput describes a manual or scheduled resume of the current
// generation. AgentName is optional for existing callers that keep the
// generation's persisted choice, but a caller that explicitly selected an
// Agent must set AgentNameSet so the same generation can be updated atomically.
type SelfDrivingResumeInput struct {
	TaskID             string
	AgentName          string
	AgentNameSet       bool
	ExpectedGeneration int
	ExpectedState      string
}

// SelfDrivingActionInput describes a scheduler action.
type SelfDrivingActionInput struct {
	TaskID             string
	Summary            string
	WakeCondition      string
	Reason             string
	ExpectedGeneration int
	ExpectedState      string
}

func (w *Workspace) updateSelfDrivingTask(taskID string, update func(root, dir string, task *Task) error) (Task, error) {
	if err := w.require(); err != nil {
		return Task{}, err
	}
	dir, task, err := loadOpenTask(w.root, cleanID(taskID))
	if err != nil {
		return Task{}, &APIError{Operation: "update Self-Driving", Kind: "self-driving", Workspace: w.root, ResourceID: taskID, Err: err}
	}
	lockDir := filepath.Join(dir, ".forge")
	if err := os.MkdirAll(lockDir, 0o755); err != nil {
		return Task{}, &APIError{Operation: "update Self-Driving", Kind: "self-driving", Workspace: w.root, ResourceID: taskID, Err: err}
	}
	lock, err := os.OpenFile(filepath.Join(lockDir, "self-driving.lock"), os.O_CREATE|os.O_RDWR, 0o644)
	if err != nil {
		return Task{}, &APIError{Operation: "update Self-Driving", Kind: "self-driving", Workspace: w.root, ResourceID: taskID, Err: err}
	}
	defer lock.Close()
	if err := syscall.Flock(int(lock.Fd()), syscall.LOCK_EX); err != nil {
		return Task{}, &APIError{Operation: "update Self-Driving", Kind: "self-driving", Workspace: w.root, ResourceID: taskID, Err: err}
	}
	defer syscall.Flock(int(lock.Fd()), syscall.LOCK_UN)
	if err := readTaskAtDir(dir, &task); err != nil {
		return Task{}, &APIError{Operation: "update Self-Driving", Kind: "self-driving", Workspace: w.root, ResourceID: taskID, Err: err}
	}
	if err := update(w.root, dir, &task); err != nil {
		return Task{}, &APIError{Operation: "update Self-Driving", Kind: "self-driving", Workspace: w.root, ResourceID: taskID, Err: err}
	}
	task.UpdatedAt = time.Now().Format(time.RFC3339)
	if err := writeResourceMetadata(dir, &task); err != nil {
		return Task{}, &APIError{Operation: "update Self-Driving", Kind: "self-driving", Workspace: w.root, ResourceID: taskID, Err: err}
	}
	return task, nil
}

// QueueSelfDriving queues a new generation or requeues a terminal generation.
func (w *Workspace) QueueSelfDriving(input SelfDrivingQueueInput) (Task, error) {
	return w.updateSelfDrivingTask(input.TaskID, func(_ string, dir string, task *Task) error {
		generation := 1
		prompt := strings.TrimSpace(input.Prompt)
		agentName := strings.TrimSpace(input.AgentName)
		completionCriteria := strings.TrimSpace(input.CompletionCriteria)
		profiles, err := normalizeAgentProfiles(input.PreferredAgentProfiles)
		if err != nil {
			return err
		}
		if task.SelfDriving != nil {
			if task.SelfDriving.State != selfDrivingStateCompleted && task.SelfDriving.State != selfDrivingStateFailed && task.SelfDriving.State != selfDrivingStateCancelled {
				return fmt.Errorf("cannot queue Self-Driving in %s state", task.SelfDriving.State)
			}
			generation = task.SelfDriving.Generation + 1
			if len(profiles) == 0 {
				profiles = append([]string(nil), task.SelfDriving.PreferredAgentProfiles...)
			}
			if !input.AgentNameSet && agentName == "" {
				agentName = task.SelfDriving.AgentName
			}
			if !input.PromptSet && prompt == "" {
				prompt = task.SelfDriving.Prompt
			}
			if !input.CompletionCriteriaSet && completionCriteria == "" {
				completionCriteria = task.SelfDriving.CompletionCriteria
			}
		}
		task.SelfDriving = &SelfDriving{
			Generation: generation, State: selfDrivingStateQueued, AgentName: agentName,
			PreferredAgentProfiles: profiles, Prompt: prompt, CompletionCriteria: completionCriteria,
		}
		return prependLogEntry(dir, newSelfDrivingLogEntry("Self-Driving queued", "", generation))
	})
}

// StartSelfDriving transitions a queued generation to running.
func (w *Workspace) StartSelfDriving(taskID string) (Task, error) {
	return w.updateSelfDrivingTask(taskID, func(_ string, dir string, task *Task) error {
		if task.SelfDriving != nil && task.SelfDriving.State == selfDrivingStateRunning {
			task.SelfDriving.SuspendedAt = ""
			return nil
		}
		if task.SelfDriving == nil || task.SelfDriving.State != selfDrivingStateQueued {
			return errors.New("Self-Driving is not queued")
		}
		// SuspendedAt only describes the suspended state. Keep the historical
		// summary for prompt recovery, but never carry a stale wake-up timestamp
		// into a running generation.
		task.SelfDriving.SuspendedAt = ""
		task.SelfDriving.State = selfDrivingStateRunning
		task.SelfDriving.StatusReason = ""
		return prependLogEntry(dir, newSelfDrivingLogEntry("Self-Driving started", "", task.SelfDriving.Generation))
	})
}

// ResumeSelfDriving transitions a paused or suspended generation back to queued.
// It is idempotent for an already queued generation so concurrent manual
// resume, timed wake-up, and scheduler scans never double-transition or
// double-log the same generation.
func (w *Workspace) ResumeSelfDriving(taskID string) (Task, error) {
	return w.ResumeSelfDrivingWithAgent(SelfDrivingResumeInput{TaskID: taskID})
}

// ResumeSelfDrivingWithAgent resumes the current generation and, when requested,
// persists the explicitly selected Agent without creating a new generation.
// ExpectedGeneration and ExpectedState form a durable CAS for callers that
// already validated a page, session, or scheduler snapshot.
func (w *Workspace) ResumeSelfDrivingWithAgent(input SelfDrivingResumeInput) (Task, error) {
	return w.updateSelfDrivingTask(input.TaskID, func(_ string, dir string, task *Task) error {
		if task.SelfDriving == nil {
			return errors.New("task has no Self-Driving")
		}
		if input.ExpectedGeneration > 0 && task.SelfDriving.Generation != input.ExpectedGeneration {
			return fmt.Errorf("Self-Driving generation changed from %d to %d", input.ExpectedGeneration, task.SelfDriving.Generation)
		}
		if expectedState := strings.TrimSpace(input.ExpectedState); expectedState != "" && task.SelfDriving.State != expectedState {
			return fmt.Errorf("Self-Driving state changed from %q to %q", expectedState, task.SelfDriving.State)
		}
		if task.SelfDriving.State == selfDrivingStateQueued {
			if input.AgentNameSet {
				agentName := strings.TrimSpace(input.AgentName)
				if agentName == "" {
					return errors.New("Agent name cannot be empty when resuming Self-Driving")
				}
				task.SelfDriving.AgentName = agentName
			}
			task.SelfDriving.SuspendedAt = ""
			return nil
		}
		if task.SelfDriving.State != selfDrivingStatePaused && task.SelfDriving.State != selfDrivingStateSuspended {
			return errors.New("Self-Driving is not paused or suspended")
		}
		if input.AgentNameSet {
			agentName := strings.TrimSpace(input.AgentName)
			if agentName == "" {
				return errors.New("Agent name cannot be empty when resuming Self-Driving")
			}
			task.SelfDriving.AgentName = agentName
		}
		task.SelfDriving.State = selfDrivingStateQueued
		task.SelfDriving.SuspendedAt = ""
		task.SelfDriving.StatusReason = ""
		// SuspensionSummary is intentionally preserved so a woken agent can
		// re-check the recorded reason before continuing or suspending again.
		return prependLogEntry(dir, newSelfDrivingLogEntry("Self-Driving queued", "resumed", task.SelfDriving.Generation))
	})
}

// ResumeAndStartSelfDriving atomically resumes the expected suspended generation
// and starts its scheduler turn. The queued and started log entries are
// written together with the same task update, while suspension context is
// retained for the resumed generation.
func (w *Workspace) ResumeAndStartSelfDriving(input SelfDrivingActionInput) (Task, error) {
	return w.updateSelfDrivingTask(input.TaskID, func(_ string, dir string, task *Task) error {
		if task.SelfDriving == nil {
			return errors.New("task has no Self-Driving")
		}
		if input.ExpectedGeneration <= 0 {
			return errors.New("expected Self-Driving generation is required")
		}
		if strings.TrimSpace(input.ExpectedState) != selfDrivingStateSuspended {
			return errors.New("expected Self-Driving state must be suspended")
		}
		if err := validateSelfDrivingCAS(task.SelfDriving, input); err != nil {
			return err
		}
		if task.SelfDriving.State != selfDrivingStateSuspended {
			return fmt.Errorf("Self-Driving is not suspended: %s", task.SelfDriving.State)
		}
		generation := task.SelfDriving.Generation
		task.SelfDriving.State = selfDrivingStateRunning
		task.SelfDriving.SuspendedAt = ""
		task.SelfDriving.StatusReason = ""
		return prependLogEntries(dir,
			newSelfDrivingLogEntry("Self-Driving started", "", generation),
			newSelfDrivingLogEntry("Self-Driving queued", "resumed", generation),
		)
	})
}

// RetrySelfDriving records a retry and applies the existing retry budget.
func (w *Workspace) RetrySelfDriving(input SelfDrivingActionInput) (Task, error) {
	return w.updateSelfDrivingTask(input.TaskID, func(_ string, dir string, task *Task) error {
		if task.SelfDriving == nil || task.SelfDriving.State != selfDrivingStateRunning {
			return errors.New("Self-Driving is not running")
		}
		if err := validateSelfDrivingCAS(task.SelfDriving, input); err != nil {
			return err
		}
		task.SelfDriving.SuspendedAt = ""
		generation := task.SelfDriving.Generation
		entries, err := readLogEntries(dir)
		if err != nil {
			return err
		}
		retries := 0
		for _, entry := range entries {
			if !entry.SelfDriving || entry.SelfDrivingGeneration != generation {
				continue
			}
			if entry.Title == "Self-Driving started" {
				break
			}
			if entry.Title == "Self-Driving retry" {
				retries++
			}
		}
		details := strings.TrimSpace(input.Reason)
		task.SelfDriving.StatusReason = details
		if err := prependLogEntry(dir, newSelfDrivingLogEntry("Self-Driving retry", details, generation)); err != nil {
			return err
		}
		if retries+1 >= 3 {
			task.SelfDriving.State = selfDrivingStatePaused
			task.SelfDriving.StatusReason = "retry limit reached"
			return prependLogEntry(dir, newSelfDrivingLogEntry("Self-Driving paused", "retry limit reached", generation))
		}
		return nil
	})
}

// CompleteSelfDriving, PauseSelfDriving and FailSelfDriving apply terminal scheduler
// actions without formatting or printing their result.
func (w *Workspace) CompleteSelfDriving(input SelfDrivingActionInput) (Task, error) {
	return w.finishSelfDriving(input, selfDrivingStateCompleted, "Self-Driving completed")
}

func (w *Workspace) PauseSelfDriving(input SelfDrivingActionInput) (Task, error) {
	return w.finishSelfDriving(input, selfDrivingStatePaused, "Self-Driving paused")
}

func (w *Workspace) FailSelfDriving(input SelfDrivingActionInput) (Task, error) {
	return w.finishSelfDriving(input, selfDrivingStateFailed, "Self-Driving failed")
}

func (w *Workspace) finishSelfDriving(input SelfDrivingActionInput, state, title string) (Task, error) {
	return w.updateSelfDrivingTask(input.TaskID, func(_ string, dir string, task *Task) error {
		if task.SelfDriving == nil {
			return errors.New("task has no Self-Driving")
		}
		if err := validateSelfDrivingCAS(task.SelfDriving, input); err != nil {
			return err
		}
		if task.SelfDriving.State != state && isSelfDrivingTerminalState(task.SelfDriving.State) {
			return fmt.Errorf("cannot transition Self-Driving from terminal state %s to %s", task.SelfDriving.State, state)
		}
		details := strings.TrimSpace(input.Summary)
		if details == "" {
			details = strings.TrimSpace(input.Reason)
		}
		task.SelfDriving.State = state
		task.SelfDriving.SuspendedAt = ""
		if state == selfDrivingStateCompleted {
			task.SelfDriving.StatusReason = ""
		} else {
			task.SelfDriving.StatusReason = details
		}
		// Pause is a manual control-plane state, not a suspension context.
		// Keep the last real suspension fields available for a later resume.
		return prependLogEntry(dir, newSelfDrivingLogEntry(title, details, task.SelfDriving.Generation))
	})
}

// SuspendSelfDriving puts the current generation into the suspended state with a
// natural-language summary. The server driver wakes it after
// selfDrivingSuspensionLimit, and every new suspend resets the timer.
func (w *Workspace) SuspendSelfDriving(input SelfDrivingActionInput) (Task, error) {
	return w.updateSelfDrivingTask(input.TaskID, func(_ string, dir string, task *Task) error {
		if task.SelfDriving == nil {
			return errors.New("task has no Self-Driving")
		}
		if err := validateSelfDrivingCAS(task.SelfDriving, input); err != nil {
			return err
		}
		if isSelfDrivingTerminalState(task.SelfDriving.State) {
			return fmt.Errorf("cannot suspend Self-Driving in %s state", task.SelfDriving.State)
		}
		details := strings.TrimSpace(input.Summary)
		if details == "" {
			details = strings.TrimSpace(input.Reason)
		}
		if details == "" {
			details = selfDrivingSuspensionFallback
		}
		wakeCondition := strings.TrimSpace(input.WakeCondition)
		wakeConditionFallback := wakeCondition == ""
		if wakeConditionFallback {
			wakeCondition = details
		}
		if wakeCondition == "" {
			wakeCondition = selfDrivingSuspensionFallback
		}
		task.SelfDriving.State = selfDrivingStateSuspended
		task.SelfDriving.SuspendedAt = time.Now().Format(time.RFC3339)
		task.SelfDriving.SuspensionSummary = details
		task.SelfDriving.WakeCondition = wakeCondition
		task.SelfDriving.StatusReason = details
		task.SelfDriving.WakeConditionFallback = wakeConditionFallback
		return prependLogEntry(dir, newSelfDrivingSuspensionLogEntry("Self-Driving suspended", details, wakeCondition, wakeConditionFallback, task.SelfDriving.Generation))
	})
}

// CancelSelfDriving durably ends the current generation. It intentionally does
// not know how to interrupt AgentHub; the serve control plane persists this
// state first and then performs the best-effort non-idempotent interrupt.
func (w *Workspace) CancelSelfDriving(input SelfDrivingActionInput) (Task, error) {
	return w.updateSelfDrivingTask(input.TaskID, func(_ string, dir string, task *Task) error {
		if task.SelfDriving == nil {
			return errors.New("task has no Self-Driving")
		}
		if input.ExpectedGeneration > 0 && task.SelfDriving.Generation != input.ExpectedGeneration {
			return fmt.Errorf("Self-Driving generation changed from %d to %d", input.ExpectedGeneration, task.SelfDriving.Generation)
		}
		// A duplicate cancel may carry the first request's stale expected state.
		// Once this generation is durably cancelled, returning the current
		// terminal record is safe and avoids a second cancellation log.
		if task.SelfDriving.State == selfDrivingStateCancelled {
			return nil
		}
		if expectedState := strings.TrimSpace(input.ExpectedState); expectedState != "" && task.SelfDriving.State != expectedState {
			return fmt.Errorf("Self-Driving state changed from %q to %q", expectedState, task.SelfDriving.State)
		}
		switch task.SelfDriving.State {
		case selfDrivingStateCompleted, selfDrivingStateFailed:
			return fmt.Errorf("cannot cancel Self-Driving in %s state", task.SelfDriving.State)
		case selfDrivingStateQueued, selfDrivingStateRunning, selfDrivingStateSuspended, selfDrivingStatePaused:
		default:
			return fmt.Errorf("cannot cancel Self-Driving in %s state", task.SelfDriving.State)
		}
		details := strings.TrimSpace(input.Reason)
		if details == "" {
			details = strings.TrimSpace(input.Summary)
		}
		if details == "" {
			details = "Self-Driving cancelled by user"
		}
		task.SelfDriving.State = selfDrivingStateCancelled
		task.SelfDriving.SuspendedAt = ""
		task.SelfDriving.StatusReason = details
		return prependLogEntry(dir, newSelfDrivingLogEntry("Self-Driving cancelled", details, task.SelfDriving.Generation))
	})
}

func validateSelfDrivingCAS(selfDriving *SelfDriving, input SelfDrivingActionInput) error {
	if input.ExpectedGeneration > 0 && selfDriving.Generation != input.ExpectedGeneration {
		return fmt.Errorf("Self-Driving generation changed from %d to %d", input.ExpectedGeneration, selfDriving.Generation)
	}
	if expectedState := strings.TrimSpace(input.ExpectedState); expectedState != "" && selfDriving.State != expectedState {
		return fmt.Errorf("Self-Driving state changed from %q to %q", expectedState, selfDriving.State)
	}
	return nil
}

func isSelfDrivingTerminalState(state string) bool {
	switch state {
	case selfDrivingStateCompleted, selfDrivingStateFailed, selfDrivingStateCancelled:
		return true
	default:
		return false
	}
}

// selfDrivingReady reports whether the Self-Driving state should be surfaced to the
// server driver: queued and running always are, suspended tasks are re-queued
// by the driver once their suspension limit elapses, and paused or terminal
// generations are never automatically started.
func selfDrivingReady(task Task) (bool, string) {
	if task.SelfDriving == nil {
		return false, "no_self_driving"
	}
	switch task.SelfDriving.State {
	case selfDrivingStateQueued:
		return true, "queued"
	case selfDrivingStateRunning:
		return true, "running"
	case selfDrivingStateSuspended:
		return true, "suspended"
	default:
		return false, task.SelfDriving.State
	}
}
