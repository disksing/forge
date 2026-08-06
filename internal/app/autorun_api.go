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

// AutoRunQueueInput describes a new or next AutoRun generation.
type AutoRunQueueInput struct {
	TaskID                 string
	AgentName              string
	AgentNameSet           bool
	PreferredAgentProfiles []string
	Prompt                 string
	PromptSet              bool
	CompletionCriteria     string
	CompletionCriteriaSet  bool
}

// AutoRunActionInput describes a scheduler action.
type AutoRunActionInput struct {
	TaskID             string
	Summary            string
	WakeCondition      string
	Reason             string
	ExpectedGeneration int
	ExpectedState      string
}

func (w *Workspace) updateAutoRunTask(taskID string, update func(root, dir string, task *Task) error) (Task, error) {
	if err := w.require(); err != nil {
		return Task{}, err
	}
	dir, task, err := loadOpenTask(w.root, cleanID(taskID))
	if err != nil {
		return Task{}, &APIError{Operation: "update AutoRun", Kind: "autorun", Workspace: w.root, ResourceID: taskID, Err: err}
	}
	lockDir := filepath.Join(dir, ".forge")
	if err := os.MkdirAll(lockDir, 0o755); err != nil {
		return Task{}, &APIError{Operation: "update AutoRun", Kind: "autorun", Workspace: w.root, ResourceID: taskID, Err: err}
	}
	lock, err := os.OpenFile(filepath.Join(lockDir, "autorun.lock"), os.O_CREATE|os.O_RDWR, 0o644)
	if err != nil {
		return Task{}, &APIError{Operation: "update AutoRun", Kind: "autorun", Workspace: w.root, ResourceID: taskID, Err: err}
	}
	defer lock.Close()
	if err := syscall.Flock(int(lock.Fd()), syscall.LOCK_EX); err != nil {
		return Task{}, &APIError{Operation: "update AutoRun", Kind: "autorun", Workspace: w.root, ResourceID: taskID, Err: err}
	}
	defer syscall.Flock(int(lock.Fd()), syscall.LOCK_UN)
	if err := readTaskAtDir(dir, &task); err != nil {
		return Task{}, &APIError{Operation: "update AutoRun", Kind: "autorun", Workspace: w.root, ResourceID: taskID, Err: err}
	}
	if err := update(w.root, dir, &task); err != nil {
		return Task{}, &APIError{Operation: "update AutoRun", Kind: "autorun", Workspace: w.root, ResourceID: taskID, Err: err}
	}
	task.UpdatedAt = time.Now().Format(time.RFC3339)
	if err := writeResourceMetadata(dir, &task); err != nil {
		return Task{}, &APIError{Operation: "update AutoRun", Kind: "autorun", Workspace: w.root, ResourceID: taskID, Err: err}
	}
	return task, nil
}

// QueueAutoRun queues a new generation or requeues a terminal generation.
func (w *Workspace) QueueAutoRun(input AutoRunQueueInput) (Task, error) {
	return w.updateAutoRunTask(input.TaskID, func(_ string, dir string, task *Task) error {
		generation := 1
		prompt := strings.TrimSpace(input.Prompt)
		agentName := strings.TrimSpace(input.AgentName)
		completionCriteria := strings.TrimSpace(input.CompletionCriteria)
		profiles, err := normalizeAgentProfiles(input.PreferredAgentProfiles)
		if err != nil {
			return err
		}
		if task.AutoRun != nil {
			if task.AutoRun.State != autoRunStateCompleted && task.AutoRun.State != autoRunStateFailed && task.AutoRun.State != autoRunStateCancelled {
				return fmt.Errorf("cannot queue AutoRun in %s state", task.AutoRun.State)
			}
			generation = task.AutoRun.Generation + 1
			if len(profiles) == 0 {
				profiles = append([]string(nil), task.AutoRun.PreferredAgentProfiles...)
			}
			if !input.AgentNameSet && agentName == "" {
				agentName = task.AutoRun.AgentName
			}
			if !input.PromptSet && prompt == "" {
				prompt = task.AutoRun.Prompt
			}
			if !input.CompletionCriteriaSet && completionCriteria == "" {
				completionCriteria = task.AutoRun.CompletionCriteria
			}
		}
		task.AutoRun = &AutoRun{
			Generation: generation, State: autoRunStateQueued, AgentName: agentName,
			PreferredAgentProfiles: profiles, Prompt: prompt, CompletionCriteria: completionCriteria,
		}
		return prependLogEntry(dir, newAutoRunLogEntry("Auto Run queued", "", generation))
	})
}

// StartAutoRun transitions a queued generation to running.
func (w *Workspace) StartAutoRun(taskID string) (Task, error) {
	return w.updateAutoRunTask(taskID, func(_ string, dir string, task *Task) error {
		if task.AutoRun != nil && task.AutoRun.State == autoRunStateRunning {
			task.AutoRun.SuspendedAt = ""
			return nil
		}
		if task.AutoRun == nil || task.AutoRun.State != autoRunStateQueued {
			return errors.New("AutoRun is not queued")
		}
		// SuspendedAt only describes the suspended state. Keep the historical
		// summary for prompt recovery, but never carry a stale wake-up timestamp
		// into a running generation.
		task.AutoRun.SuspendedAt = ""
		task.AutoRun.State = autoRunStateRunning
		return prependLogEntry(dir, newAutoRunLogEntry("Auto Run started", "", task.AutoRun.Generation))
	})
}

// ResumeAutoRun transitions a paused or suspended generation back to queued.
// It is idempotent for an already queued generation so concurrent manual
// resume, timed wake-up, and scheduler scans never double-transition or
// double-log the same generation.
func (w *Workspace) ResumeAutoRun(taskID string) (Task, error) {
	return w.updateAutoRunTask(taskID, func(_ string, dir string, task *Task) error {
		if task.AutoRun == nil {
			return errors.New("task has no AutoRun")
		}
		if task.AutoRun.State == autoRunStateQueued {
			task.AutoRun.SuspendedAt = ""
			return nil
		}
		if task.AutoRun.State != autoRunStatePaused && task.AutoRun.State != autoRunStateSuspended {
			return errors.New("AutoRun is not paused or suspended")
		}
		task.AutoRun.State = autoRunStateQueued
		task.AutoRun.SuspendedAt = ""
		// SuspensionSummary is intentionally preserved so a woken agent can
		// re-check the recorded reason before continuing or suspending again.
		return prependLogEntry(dir, newAutoRunLogEntry("Auto Run queued", "resumed", task.AutoRun.Generation))
	})
}

// ResumeAndStartAutoRun atomically resumes the expected suspended generation
// and starts its scheduler turn. The queued and started log entries are
// written together with the same task update, while suspension context is
// retained for the resumed generation.
func (w *Workspace) ResumeAndStartAutoRun(input AutoRunActionInput) (Task, error) {
	return w.updateAutoRunTask(input.TaskID, func(_ string, dir string, task *Task) error {
		if task.AutoRun == nil {
			return errors.New("task has no AutoRun")
		}
		if input.ExpectedGeneration <= 0 {
			return errors.New("expected AutoRun generation is required")
		}
		if strings.TrimSpace(input.ExpectedState) != autoRunStateSuspended {
			return errors.New("expected AutoRun state must be suspended")
		}
		if err := validateAutoRunCAS(task.AutoRun, input); err != nil {
			return err
		}
		if task.AutoRun.State != autoRunStateSuspended {
			return fmt.Errorf("AutoRun is not suspended: %s", task.AutoRun.State)
		}
		generation := task.AutoRun.Generation
		task.AutoRun.State = autoRunStateRunning
		task.AutoRun.SuspendedAt = ""
		return prependLogEntries(dir,
			newAutoRunLogEntry("Auto Run started", "", generation),
			newAutoRunLogEntry("Auto Run queued", "resumed", generation),
		)
	})
}

// RetryAutoRun records a retry and applies the existing retry budget.
func (w *Workspace) RetryAutoRun(input AutoRunActionInput) (Task, error) {
	return w.updateAutoRunTask(input.TaskID, func(_ string, dir string, task *Task) error {
		if task.AutoRun == nil || task.AutoRun.State != autoRunStateRunning {
			return errors.New("AutoRun is not running")
		}
		if err := validateAutoRunCAS(task.AutoRun, input); err != nil {
			return err
		}
		task.AutoRun.SuspendedAt = ""
		generation := task.AutoRun.Generation
		entries, err := readLogEntries(dir)
		if err != nil {
			return err
		}
		retries := 0
		for _, entry := range entries {
			if !entry.AutoRun || entry.AutoRunGeneration != generation {
				continue
			}
			if entry.Title == "Auto Run started" {
				break
			}
			if entry.Title == "Auto Run retry" {
				retries++
			}
		}
		if err := prependLogEntry(dir, newAutoRunLogEntry("Auto Run retry", strings.TrimSpace(input.Reason), generation)); err != nil {
			return err
		}
		if retries+1 >= 3 {
			task.AutoRun.State = autoRunStatePaused
			return prependLogEntry(dir, newAutoRunLogEntry("Auto Run paused", "retry limit reached", generation))
		}
		return nil
	})
}

// CompleteAutoRun, PauseAutoRun and FailAutoRun apply terminal scheduler
// actions without formatting or printing their result.
func (w *Workspace) CompleteAutoRun(input AutoRunActionInput) (Task, error) {
	return w.finishAutoRun(input, autoRunStateCompleted, "Auto Run completed")
}

func (w *Workspace) PauseAutoRun(input AutoRunActionInput) (Task, error) {
	return w.finishAutoRun(input, autoRunStatePaused, "Auto Run paused")
}

func (w *Workspace) FailAutoRun(input AutoRunActionInput) (Task, error) {
	return w.finishAutoRun(input, autoRunStateFailed, "Auto Run failed")
}

func (w *Workspace) finishAutoRun(input AutoRunActionInput, state, title string) (Task, error) {
	return w.updateAutoRunTask(input.TaskID, func(_ string, dir string, task *Task) error {
		if task.AutoRun == nil {
			return errors.New("task has no AutoRun")
		}
		if err := validateAutoRunCAS(task.AutoRun, input); err != nil {
			return err
		}
		if task.AutoRun.State != state && isAutoRunTerminalState(task.AutoRun.State) {
			return fmt.Errorf("cannot transition AutoRun from terminal state %s to %s", task.AutoRun.State, state)
		}
		details := strings.TrimSpace(input.Summary)
		if details == "" {
			details = strings.TrimSpace(input.Reason)
		}
		task.AutoRun.State = state
		task.AutoRun.SuspendedAt = ""
		// Pause is a manual control-plane state, not a suspension context.
		// Keep the last real suspension fields available for a later resume.
		return prependLogEntry(dir, newAutoRunLogEntry(title, details, task.AutoRun.Generation))
	})
}

// SuspendAutoRun puts the current generation into the suspended state with a
// natural-language summary. The server driver wakes it after
// autoRunSuspensionLimit, and every new suspend resets the timer.
func (w *Workspace) SuspendAutoRun(input AutoRunActionInput) (Task, error) {
	return w.updateAutoRunTask(input.TaskID, func(_ string, dir string, task *Task) error {
		if task.AutoRun == nil {
			return errors.New("task has no AutoRun")
		}
		if err := validateAutoRunCAS(task.AutoRun, input); err != nil {
			return err
		}
		if isAutoRunTerminalState(task.AutoRun.State) {
			return fmt.Errorf("cannot suspend AutoRun in %s state", task.AutoRun.State)
		}
		details := strings.TrimSpace(input.Summary)
		if details == "" {
			details = strings.TrimSpace(input.Reason)
		}
		if details == "" {
			details = autoRunSuspensionFallback
		}
		wakeCondition := strings.TrimSpace(input.WakeCondition)
		wakeConditionFallback := wakeCondition == ""
		if wakeConditionFallback {
			wakeCondition = details
		}
		if wakeCondition == "" {
			wakeCondition = autoRunSuspensionFallback
		}
		task.AutoRun.State = autoRunStateSuspended
		task.AutoRun.SuspendedAt = time.Now().Format(time.RFC3339)
		task.AutoRun.SuspensionSummary = details
		task.AutoRun.WakeCondition = wakeCondition
		return prependLogEntry(dir, newAutoRunSuspensionLogEntry("Auto Run suspended", details, wakeCondition, wakeConditionFallback, task.AutoRun.Generation))
	})
}

// CancelAutoRun durably ends the current generation. It intentionally does
// not know how to interrupt AgentHub; the serve control plane persists this
// state first and then performs the best-effort non-idempotent interrupt.
func (w *Workspace) CancelAutoRun(input AutoRunActionInput) (Task, error) {
	return w.updateAutoRunTask(input.TaskID, func(_ string, dir string, task *Task) error {
		if task.AutoRun == nil {
			return errors.New("task has no AutoRun")
		}
		if input.ExpectedGeneration > 0 && task.AutoRun.Generation != input.ExpectedGeneration {
			return fmt.Errorf("AutoRun generation changed from %d to %d", input.ExpectedGeneration, task.AutoRun.Generation)
		}
		// A duplicate cancel may carry the first request's stale expected state.
		// Once this generation is durably cancelled, returning the current
		// terminal record is safe and avoids a second cancellation log.
		if task.AutoRun.State == autoRunStateCancelled {
			return nil
		}
		if expectedState := strings.TrimSpace(input.ExpectedState); expectedState != "" && task.AutoRun.State != expectedState {
			return fmt.Errorf("AutoRun state changed from %q to %q", expectedState, task.AutoRun.State)
		}
		switch task.AutoRun.State {
		case autoRunStateCompleted, autoRunStateFailed:
			return fmt.Errorf("cannot cancel AutoRun in %s state", task.AutoRun.State)
		case autoRunStateQueued, autoRunStateRunning, autoRunStateSuspended, autoRunStatePaused:
		default:
			return fmt.Errorf("cannot cancel AutoRun in %s state", task.AutoRun.State)
		}
		details := strings.TrimSpace(input.Reason)
		if details == "" {
			details = strings.TrimSpace(input.Summary)
		}
		if details == "" {
			details = "AutoRun cancelled by user"
		}
		task.AutoRun.State = autoRunStateCancelled
		task.AutoRun.SuspendedAt = ""
		return prependLogEntry(dir, newAutoRunLogEntry("Auto Run cancelled", details, task.AutoRun.Generation))
	})
}

func validateAutoRunCAS(autoRun *AutoRun, input AutoRunActionInput) error {
	if input.ExpectedGeneration > 0 && autoRun.Generation != input.ExpectedGeneration {
		return fmt.Errorf("AutoRun generation changed from %d to %d", input.ExpectedGeneration, autoRun.Generation)
	}
	if expectedState := strings.TrimSpace(input.ExpectedState); expectedState != "" && autoRun.State != expectedState {
		return fmt.Errorf("AutoRun state changed from %q to %q", expectedState, autoRun.State)
	}
	return nil
}

func isAutoRunTerminalState(state string) bool {
	switch state {
	case autoRunStateCompleted, autoRunStateFailed, autoRunStateCancelled:
		return true
	default:
		return false
	}
}

// autoRunReady reports whether the AutoRun state should be surfaced to the
// server driver: queued and running always are, suspended tasks are re-queued
// by the driver once their suspension limit elapses, and paused or terminal
// generations are never automatically started.
func autoRunReady(task Task) (bool, string) {
	if task.AutoRun == nil {
		return false, "no_autorun"
	}
	switch task.AutoRun.State {
	case autoRunStateQueued:
		return true, "queued"
	case autoRunStateRunning:
		return true, "running"
	case autoRunStateSuspended:
		return true, "suspended"
	default:
		return false, task.AutoRun.State
	}
}
