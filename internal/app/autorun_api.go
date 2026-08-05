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
			if task.AutoRun.State != autoRunStateCompleted && task.AutoRun.State != autoRunStateFailed {
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

// RetryAutoRun records a retry and applies the existing retry budget.
func (w *Workspace) RetryAutoRun(input AutoRunActionInput) (Task, error) {
	return w.updateAutoRunTask(input.TaskID, func(_ string, dir string, task *Task) error {
		if task.AutoRun == nil || task.AutoRun.State != autoRunStateRunning {
			return errors.New("AutoRun is not running")
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
		if input.ExpectedGeneration > 0 && task.AutoRun.Generation != input.ExpectedGeneration {
			return fmt.Errorf("AutoRun generation changed from %d to %d", input.ExpectedGeneration, task.AutoRun.Generation)
		}
		if expectedState := strings.TrimSpace(input.ExpectedState); expectedState != "" && task.AutoRun.State != expectedState {
			return fmt.Errorf("AutoRun state changed from %q to %q", expectedState, task.AutoRun.State)
		}
		details := strings.TrimSpace(input.Summary)
		if details == "" {
			details = strings.TrimSpace(input.Reason)
		}
		task.AutoRun.State = state
		// SuspendedAt is only meaningful while the generation is suspended.
		// SuspensionSummary remains durable so a resumed Agent can still receive
		// the previous suspension context in its prompt.
		task.AutoRun.SuspendedAt = ""
		if state == autoRunStatePaused && details != "" {
			task.AutoRun.SuspensionSummary = details
		}
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
		details := strings.TrimSpace(input.Summary)
		if details == "" {
			details = strings.TrimSpace(input.Reason)
		}
		task.AutoRun.State = autoRunStateSuspended
		task.AutoRun.SuspendedAt = time.Now().Format(time.RFC3339)
		task.AutoRun.SuspensionSummary = details
		return prependLogEntry(dir, newAutoRunLogEntry("Auto Run suspended", details, task.AutoRun.Generation))
	})
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
