package app

import (
	"os"
	"path/filepath"
	"syscall"
)

const workspaceMutationLockFile = "application.lock"

// withWorkspaceMutationLock serializes mutations which allocate resource ids
// or update files that do not have a narrower resource lock. The lock lives
// under the explicit Workspace root and is therefore shared by independent
// Workspace handles and processes without any package-global state.
func withWorkspaceMutationLock(root string, update func() error) error {
	lockDir := filepath.Join(root, ".forge")
	if err := os.MkdirAll(lockDir, 0o755); err != nil {
		return err
	}
	lock, err := os.OpenFile(filepath.Join(lockDir, workspaceMutationLockFile), os.O_CREATE|os.O_RDWR, 0o644)
	if err != nil {
		return err
	}
	defer lock.Close()
	if err := syscall.Flock(int(lock.Fd()), syscall.LOCK_EX); err != nil {
		return err
	}
	defer syscall.Flock(int(lock.Fd()), syscall.LOCK_UN)
	return update()
}
