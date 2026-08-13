package app

import (
	"fmt"
	"os"
	"path/filepath"
)

const (
	legacySessionProjectionPath = "forge-sessions.json"
	legacySessionLockPath       = ".forge-sessions.lock"
	legacyProjectionBackupPath  = ".forge/legacy/forge-sessions.json"
	legacyLockBackupPath        = ".forge/legacy/.forge-sessions.lock"
)

// isolateLegacySessionProjection moves the pre-resource Session projection and
// its obsolete lock out of the Workspace root during migrate. Each rename is
// atomic, old bytes remain recoverable, and repeated migrate calls are
// idempotent. Forge serve no longer reads or writes either file.
func isolateLegacySessionProjection(root string) error {
	type legacyFile struct {
		source      string
		destination string
		display     string
	}
	files := []legacyFile{
		{source: filepath.Join(root, legacySessionProjectionPath), destination: filepath.Join(root, legacyProjectionBackupPath), display: legacyProjectionBackupPath},
		{source: filepath.Join(root, legacySessionLockPath), destination: filepath.Join(root, legacyLockBackupPath), display: legacyLockBackupPath},
	}
	present := make([]legacyFile, 0, len(files))
	for _, file := range files {
		if _, err := os.Lstat(file.source); os.IsNotExist(err) {
			continue
		} else if err != nil {
			return err
		}
		if _, err := os.Lstat(file.destination); err == nil {
			return fmt.Errorf("legacy Session projection backup already exists; remove or rename %s before retrying", file.display)
		} else if !os.IsNotExist(err) {
			return err
		}
		present = append(present, file)
	}
	if len(present) == 0 {
		return nil
	}
	if err := os.MkdirAll(filepath.Dir(present[0].destination), 0o700); err != nil {
		return err
	}
	moved := make([]legacyFile, 0, len(present))
	for _, file := range present {
		if err := os.Rename(file.source, file.destination); err != nil {
			for index := len(moved) - 1; index >= 0; index-- {
				_ = os.Rename(moved[index].destination, moved[index].source)
			}
			return err
		}
		moved = append(moved, file)
	}
	if err := syncDirectory(root); err != nil {
		return err
	}
	return syncDirectory(filepath.Dir(present[0].destination))
}
