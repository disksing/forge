package serve

import (
	"encoding/json"
	"errors"
	"fmt"
	"os"
	"path/filepath"
	"strings"
	"syscall"
	"time"
)

type guiConfigLockMetadata struct {
	PID        int    `json:"pid"`
	Address    string `json:"address"`
	ConfigPath string `json:"configPath"`
	StartedAt  string `json:"startedAt"`
}

type guiConfigLock struct {
	file *os.File
}

func acquireGUIConfigLock(configPath, address string) (*guiConfigLock, error) {
	configPath = strings.TrimSpace(configPath)
	if configPath == "" {
		return nil, errors.New("GUI config path is required")
	}
	absConfigPath, err := filepath.Abs(configPath)
	if err != nil {
		return nil, fmt.Errorf("resolve GUI config path: %w", err)
	}
	if err := os.MkdirAll(filepath.Dir(absConfigPath), 0o755); err != nil {
		return nil, fmt.Errorf("create GUI config directory: %w", err)
	}
	lockPath := absConfigPath + ".lock"
	file, err := os.OpenFile(lockPath, os.O_CREATE|os.O_RDWR, 0o600)
	if err != nil {
		return nil, fmt.Errorf("open GUI config lock %s: %w", lockPath, err)
	}
	if err := syscall.Flock(int(file.Fd()), syscall.LOCK_EX|syscall.LOCK_NB); err != nil {
		metadata := readGUIConfigLockMetadata(file)
		_ = file.Close()
		if errors.Is(err, syscall.EWOULDBLOCK) || errors.Is(err, syscall.EAGAIN) {
			return nil, guiConfigLockConflictError(absConfigPath, metadata)
		}
		return nil, fmt.Errorf("lock GUI config %s: %w", absConfigPath, err)
	}
	metadata := guiConfigLockMetadata{
		PID:        os.Getpid(),
		Address:    strings.TrimSpace(address),
		ConfigPath: absConfigPath,
		StartedAt:  time.Now().Format(time.RFC3339),
	}
	if err := writeGUIConfigLockMetadata(file, metadata); err != nil {
		_ = syscall.Flock(int(file.Fd()), syscall.LOCK_UN)
		_ = file.Close()
		return nil, fmt.Errorf("write GUI config lock %s: %w", lockPath, err)
	}
	return &guiConfigLock{file: file}, nil
}

func readGUIConfigLockMetadata(file *os.File) guiConfigLockMetadata {
	if file == nil {
		return guiConfigLockMetadata{}
	}
	if _, err := file.Seek(0, 0); err != nil {
		return guiConfigLockMetadata{}
	}
	var metadata guiConfigLockMetadata
	_ = json.NewDecoder(file).Decode(&metadata)
	return metadata
}

func writeGUIConfigLockMetadata(file *os.File, metadata guiConfigLockMetadata) error {
	if err := file.Truncate(0); err != nil {
		return err
	}
	if _, err := file.Seek(0, 0); err != nil {
		return err
	}
	encoder := json.NewEncoder(file)
	encoder.SetIndent("", "  ")
	if err := encoder.Encode(metadata); err != nil {
		return err
	}
	return file.Sync()
}

func guiConfigLockConflictError(configPath string, metadata guiConfigLockMetadata) error {
	owner := ""
	if metadata.PID > 0 {
		owner = fmt.Sprintf(" by PID %d", metadata.PID)
	}
	if metadata.Address != "" {
		owner += fmt.Sprintf(" at %s", metadata.Address)
	}
	return fmt.Errorf("GUI config %s is already in use%s; stop the existing Forge GUI or set FORGE_GUI_CONFIG to an isolated config path", configPath, owner)
}

func (lock *guiConfigLock) Close() error {
	if lock == nil || lock.file == nil {
		return nil
	}
	file := lock.file
	lock.file = nil
	unlockErr := syscall.Flock(int(file.Fd()), syscall.LOCK_UN)
	closeErr := file.Close()
	if unlockErr != nil {
		return unlockErr
	}
	return closeErr
}
