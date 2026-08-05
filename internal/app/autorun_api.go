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
	PreferredAgentProfiles []string
	Prompt                 string
	After                  []string
}

// AutoRunActionInput describes a scheduler action.
type AutoRunActionInput struct {
	TaskID  string
	Summary string
	Reason  string
	After   []string
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
	return w.updateAutoRunTask(input.TaskID, func(root, dir string, task *Task) error {
		generation := 1
		prompt := strings.TrimSpace(input.Prompt)
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
			if prompt == "" {
				prompt = task.AutoRun.Prompt
			}
		}
		probe := *task
		probe.AutoRun = &AutoRun{Generation: generation}
		after, err := resolveAutoRunDependencies(root, &probe, input.After)
		if err != nil {
			return err
		}
		state := autoRunStateQueued
		if len(after) > 0 {
			state = autoRunStateWaiting
		}
		task.AutoRun = &AutoRun{Generation: generation, State: state, PreferredAgentProfiles: profiles, Prompt: prompt, After: after}
		if err := prependLogEntry(dir, newAutoRunLogEntry("Auto Run queued", "", generation)); err != nil {
			return err
		}
		if state == autoRunStateWaiting {
			return prependLogEntry(dir, newAutoRunLogEntry("Auto Run waiting", "waiting for prerequisites", generation))
		}
		return nil
	})
}

// StartAutoRun transitions a queued generation to running.
func (w *Workspace) StartAutoRun(taskID string) (Task, error) {
	return w.updateAutoRunTask(taskID, func(_ string, dir string, task *Task) error {
		if task.AutoRun != nil && task.AutoRun.State == autoRunStateRunning {
			return nil
		}
		if task.AutoRun == nil || task.AutoRun.State != autoRunStateQueued {
			return errors.New("AutoRun is not queued")
		}
		ready, reason := autoRunReady(w.root, *task)
		if !ready {
			return fmt.Errorf("AutoRun is not ready: %s", reason)
		}
		task.AutoRun.State = autoRunStateRunning
		task.AutoRun.After = nil
		return prependLogEntry(dir, newAutoRunLogEntry("Auto Run started", "", task.AutoRun.Generation))
	})
}

// ResumeAutoRun transitions a paused or waiting generation back to queued.
func (w *Workspace) ResumeAutoRun(taskID string) (Task, error) {
	return w.updateAutoRunTask(taskID, func(root, dir string, task *Task) error {
		if task.AutoRun == nil || (task.AutoRun.State != autoRunStatePaused && task.AutoRun.State != autoRunStateWaiting) {
			return errors.New("AutoRun is not paused or waiting")
		}
		details := "resumed"
		if task.AutoRun.State == autoRunStateWaiting {
			ready, reason := autoRunReady(root, *task)
			if !ready {
				return fmt.Errorf("AutoRun dependencies are not ready: %s", reason)
			}
			details = "prerequisites completed"
		}
		task.AutoRun.State = autoRunStateQueued
		task.AutoRun.After = nil
		return prependLogEntry(dir, newAutoRunLogEntry("Auto Run queued", details, task.AutoRun.Generation))
	})
}

// RetryAutoRun records a retry and applies the existing retry budget.
func (w *Workspace) RetryAutoRun(input AutoRunActionInput) (Task, error) {
	return w.updateAutoRunTask(input.TaskID, func(_ string, dir string, task *Task) error {
		if task.AutoRun == nil || task.AutoRun.State != autoRunStateRunning {
			return errors.New("AutoRun is not running")
		}
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
		task.AutoRun.State = state
		task.AutoRun.After = nil
		details := strings.TrimSpace(input.Summary)
		if details == "" {
			details = strings.TrimSpace(input.Reason)
		}
		return prependLogEntry(dir, newAutoRunLogEntry(title, details, task.AutoRun.Generation))
	})
}

// WaitAutoRun puts a generation back into dependency waiting state.
func (w *Workspace) WaitAutoRun(input AutoRunActionInput) (Task, error) {
	return w.updateAutoRunTask(input.TaskID, func(root, dir string, task *Task) error {
		if task.AutoRun == nil {
			return errors.New("task has no AutoRun")
		}
		if len(input.After) == 0 {
			return errors.New("at least one AutoRun dependency is required")
		}
		after, err := resolveAutoRunDependencies(root, task, input.After)
		if err != nil {
			return err
		}
		task.AutoRun.State = autoRunStateWaiting
		task.AutoRun.After = after
		return prependLogEntry(dir, newAutoRunLogEntry("Auto Run waiting", strings.TrimSpace(input.Summary), task.AutoRun.Generation))
	})
}
