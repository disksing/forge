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

type serveConfigLockMetadata struct {
	PID        int    `json:"pid"`
	Address    string `json:"address"`
	ConfigPath string `json:"configPath"`
	StartedAt  string `json:"startedAt"`
}

type serveConfigLock struct {
	file *os.File
}

func acquireServeConfigLock(configPath, address string) (*serveConfigLock, error) {
	configPath = strings.TrimSpace(configPath)
	if configPath == "" {
		return nil, errors.New("serve config path is required")
	}
	absConfigPath, err := filepath.Abs(configPath)
	if err != nil {
		return nil, fmt.Errorf("resolve serve config path: %w", err)
	}
	if err := os.MkdirAll(filepath.Dir(absConfigPath), 0o755); err != nil {
		return nil, fmt.Errorf("create serve config directory: %w", err)
	}
	lockPath := absConfigPath + ".lock"
	file, err := os.OpenFile(lockPath, os.O_CREATE|os.O_RDWR, 0o600)
	if err != nil {
		return nil, fmt.Errorf("open serve config lock %s: %w", lockPath, err)
	}
	if err := syscall.Flock(int(file.Fd()), syscall.LOCK_EX|syscall.LOCK_NB); err != nil {
		metadata := readServeConfigLockMetadata(file)
		_ = file.Close()
		if errors.Is(err, syscall.EWOULDBLOCK) || errors.Is(err, syscall.EAGAIN) {
			return nil, serveConfigLockConflictError(absConfigPath, metadata)
		}
		return nil, fmt.Errorf("lock serve config %s: %w", absConfigPath, err)
	}
	metadata := serveConfigLockMetadata{
		PID:        os.Getpid(),
		Address:    strings.TrimSpace(address),
		ConfigPath: absConfigPath,
		StartedAt:  time.Now().Format(time.RFC3339),
	}
	if err := writeServeConfigLockMetadata(file, metadata); err != nil {
		_ = syscall.Flock(int(file.Fd()), syscall.LOCK_UN)
		_ = file.Close()
		return nil, fmt.Errorf("write serve config lock %s: %w", lockPath, err)
	}
	return &serveConfigLock{file: file}, nil
}

func readServeConfigLockMetadata(file *os.File) serveConfigLockMetadata {
	if file == nil {
		return serveConfigLockMetadata{}
	}
	if _, err := file.Seek(0, 0); err != nil {
		return serveConfigLockMetadata{}
	}
	var metadata serveConfigLockMetadata
	_ = json.NewDecoder(file).Decode(&metadata)
	return metadata
}

func writeServeConfigLockMetadata(file *os.File, metadata serveConfigLockMetadata) error {
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

func serveConfigLockConflictError(configPath string, metadata serveConfigLockMetadata) error {
	owner := ""
	if metadata.PID > 0 {
		owner = fmt.Sprintf(" by PID %d", metadata.PID)
	}
	if metadata.Address != "" {
		owner += fmt.Sprintf(" at %s", metadata.Address)
	}
	return fmt.Errorf("serve config %s is already in use%s; stop the existing pua serve process or set PUA_SERVE_CONFIG to an isolated config path", configPath, owner)
}

func (lock *serveConfigLock) Close() error {
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
