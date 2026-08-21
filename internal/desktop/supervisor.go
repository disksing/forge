//go:build darwin

package desktop

import (
	"context"
	"crypto/sha256"
	"encoding/hex"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"net"
	"net/http"
	"net/url"
	"os"
	"os/exec"
	"path/filepath"
	"strconv"
	"strings"
	"syscall"
	"time"
)

const (
	defaultAddress    = "127.0.0.1:4936"
	manifestVersion   = 1
	stateVersion      = 1
	backendFileName   = "pua"
	defaultProbePath  = "/api/workspaces"
	defaultStartDelay = 100 * time.Millisecond
)

// Options controls how the desktop shell finds and starts the PUA backend.
type Options struct {
	Address        string
	ConfigPath     string
	AppSupportDir  string
	BackendPath    string
	StartupTimeout time.Duration
	HTTPClient     *http.Client
}

// Result describes the backend selected by Ensure.
type Result struct {
	URL         string
	Managed     bool
	PID         int
	BackendPath string
	Digest      string
}

type manifest struct {
	SchemaVersion int       `json:"schemaVersion"`
	Digest        string    `json:"digest"`
	Path          string    `json:"path"`
	InstalledAt   time.Time `json:"installedAt"`
}

type backendState struct {
	SchemaVersion int       `json:"schemaVersion"`
	PID           int       `json:"pid"`
	Endpoint      string    `json:"endpoint"`
	BackendPath   string    `json:"backendPath"`
	Digest        string    `json:"digest"`
	Managed       bool      `json:"managed"`
	StartedAt     time.Time `json:"startedAt"`
}

type serveLock struct {
	PID     int    `json:"pid"`
	Address string `json:"address"`
}

// DefaultOptions returns the production paths used by PUA.app.
func DefaultOptions() (Options, error) {
	home, err := os.UserHomeDir()
	if err != nil {
		return Options{}, fmt.Errorf("find home directory: %w", err)
	}
	configPath := os.Getenv("PUA_SERVE_CONFIG")
	if configPath == "" {
		configPath = filepath.Join(home, ".pua", "serve.json")
	}
	appSupport := os.Getenv("PUA_DESKTOP_HOME")
	if appSupport == "" {
		appSupport = filepath.Join(home, "Library", "Application Support", "PUA")
	}
	return Options{
		Address:        envOrDefault("PUA_DESKTOP_ADDRESS", defaultAddress),
		ConfigPath:     configPath,
		AppSupportDir:  appSupport,
		BackendPath:    os.Getenv("PUA_DESKTOP_BACKEND"),
		StartupTimeout: 30 * time.Second,
		HTTPClient:     &http.Client{Timeout: 2 * time.Second},
	}, nil
}

// Ensure reconnects to a healthy PUA server or starts a managed backend.
func Ensure(ctx context.Context, options Options) (Result, error) {
	options = withDefaults(options)
	if err := validateOptions(options); err != nil {
		return Result{}, err
	}

	if result, ok := discoverExisting(ctx, options); ok {
		return result, nil
	}

	backendPath, digest, err := selectBackend(options)
	if err != nil {
		return Result{}, err
	}
	return startBackend(ctx, options, backendPath, digest)
}

func withDefaults(options Options) Options {
	if options.Address == "" {
		options.Address = defaultAddress
	}
	if options.StartupTimeout <= 0 {
		options.StartupTimeout = 30 * time.Second
	}
	if options.HTTPClient == nil {
		options.HTTPClient = &http.Client{Timeout: 2 * time.Second}
	}
	return options
}

func validateOptions(options Options) error {
	if options.ConfigPath == "" {
		return errors.New("PUA serve config path is empty")
	}
	if options.AppSupportDir == "" {
		return errors.New("desktop application support path is empty")
	}
	if _, err := endpointForAddress(options.Address); err != nil {
		return fmt.Errorf("invalid desktop backend address: %w", err)
	}
	return nil
}

func discoverExisting(ctx context.Context, options Options) (Result, bool) {
	state, stateOK := readJSON[backendState](statePath(options))
	lock, lockOK := readJSON[serveLock](options.ConfigPath + ".lock")
	lockEndpoint, lockEndpointErr := endpointForAddress(lock.Address)
	if stateOK && state.SchemaVersion == stateVersion && state.Managed && lockOK && lockEndpointErr == nil && state.PID > 0 &&
		state.PID == lock.PID && state.Endpoint == lockEndpoint && processAlive(state.PID) &&
		healthy(ctx, options.HTTPClient, state.Endpoint) {
		return Result{
			URL:         state.Endpoint,
			Managed:     true,
			PID:         state.PID,
			BackendPath: state.BackendPath,
			Digest:      state.Digest,
		}, true
	}

	if lockOK {
		if lockEndpointErr == nil && processAlive(lock.PID) && healthy(ctx, options.HTTPClient, lockEndpoint) {
			managed := stateOK && state.SchemaVersion == stateVersion && state.Managed && state.PID == lock.PID && state.Endpoint == lockEndpoint
			return Result{URL: lockEndpoint, Managed: managed, PID: lock.PID}, true
		}
	}

	endpoint, err := endpointForAddress(options.Address)
	if err == nil && healthy(ctx, options.HTTPClient, endpoint) {
		return Result{URL: endpoint}, true
	}
	return Result{}, false
}

func selectBackend(options Options) (string, string, error) {
	if options.BackendPath != "" {
		return installBackend(options, options.BackendPath)
	}
	if current, ok := readJSON[manifest](manifestPath(options)); ok && current.SchemaVersion == manifestVersion {
		if digest, err := fileDigest(current.Path); err == nil && digest == current.Digest {
			return current.Path, current.Digest, nil
		}
	}

	source, err := bundledBackendPath()
	if err != nil {
		return "", "", err
	}
	return installBackend(options, source)
}

func bundledBackendPath() (string, error) {
	executable, err := os.Executable()
	if err != nil {
		return "", fmt.Errorf("find desktop executable: %w", err)
	}
	candidates := []string{
		filepath.Join(filepath.Dir(executable), "..", "Resources", backendFileName),
		filepath.Join(filepath.Dir(executable), backendFileName),
	}
	for _, candidate := range candidates {
		if info, statErr := os.Stat(candidate); statErr == nil && !info.IsDir() {
			return filepath.Clean(candidate), nil
		}
	}
	if path, lookErr := exec.LookPath(backendFileName); lookErr == nil {
		return path, nil
	}
	return "", errors.New("PUA backend not found; reinstall PUA.app or set PUA_DESKTOP_BACKEND")
}

func installBackend(options Options, source string) (string, string, error) {
	digest, err := fileDigest(source)
	if err != nil {
		return "", "", fmt.Errorf("hash PUA backend: %w", err)
	}
	versionDir := filepath.Join(options.AppSupportDir, "backend", "versions", digest)
	destination := filepath.Join(versionDir, backendFileName)
	if err := os.MkdirAll(versionDir, 0o700); err != nil {
		return "", "", fmt.Errorf("create backend version directory: %w", err)
	}
	if installedDigest, digestErr := fileDigest(destination); digestErr != nil || installedDigest != digest {
		if err := copyExecutable(source, destination); err != nil {
			return "", "", err
		}
	}
	if err := writeJSONAtomic(manifestPath(options), manifest{
		SchemaVersion: manifestVersion,
		Digest:        digest,
		Path:          destination,
		InstalledAt:   time.Now().UTC(),
	}); err != nil {
		return "", "", fmt.Errorf("write backend manifest: %w", err)
	}
	return destination, digest, nil
}

func startBackend(ctx context.Context, options Options, backendPath, digest string) (Result, error) {
	if err := os.MkdirAll(filepath.Dir(options.ConfigPath), 0o700); err != nil {
		return Result{}, fmt.Errorf("create PUA config directory: %w", err)
	}
	logDir := filepath.Join(options.AppSupportDir, "logs")
	if err := os.MkdirAll(logDir, 0o700); err != nil {
		return Result{}, fmt.Errorf("create desktop log directory: %w", err)
	}
	logFile, err := os.OpenFile(filepath.Join(logDir, "backend.log"), os.O_CREATE|os.O_APPEND|os.O_WRONLY, 0o600)
	if err != nil {
		return Result{}, fmt.Errorf("open backend log: %w", err)
	}

	command := exec.Command(backendPath, "serve", "--addr="+options.Address, "--no-default-workspace")
	command.Env = replaceEnv(os.Environ(), "PUA_SERVE_CONFIG", options.ConfigPath)
	command.Stdout = logFile
	command.Stderr = logFile
	command.SysProcAttr = &syscall.SysProcAttr{Setpgid: true}
	if err := command.Start(); err != nil {
		_ = logFile.Close()
		return Result{}, fmt.Errorf("start PUA backend: %w", err)
	}

	processDone := make(chan error, 1)
	go func() {
		processDone <- command.Wait()
		_ = logFile.Close()
	}()

	endpoint, _ := endpointForAddress(options.Address)
	timer := time.NewTimer(options.StartupTimeout)
	defer timer.Stop()
	ticker := time.NewTicker(defaultStartDelay)
	defer ticker.Stop()
	for {
		if healthy(ctx, options.HTTPClient, endpoint) {
			lock, ok := readJSON[serveLock](options.ConfigPath + ".lock")
			lockEndpoint, lockErr := endpointForAddress(lock.Address)
			if ok && lockErr == nil && lock.PID != command.Process.Pid && lockEndpoint == endpoint && processAlive(lock.PID) {
				_ = command.Process.Signal(os.Interrupt)
				return Result{URL: endpoint, PID: lock.PID}, nil
			}
			if ok && lockErr == nil && lock.PID == command.Process.Pid && lockEndpoint == endpoint {
				state := backendState{
					SchemaVersion: stateVersion,
					PID:           command.Process.Pid,
					Endpoint:      endpoint,
					BackendPath:   backendPath,
					Digest:        digest,
					Managed:       true,
					StartedAt:     time.Now().UTC(),
				}
				if err := writeJSONAtomic(statePath(options), state); err != nil {
					_ = command.Process.Signal(os.Interrupt)
					return Result{}, fmt.Errorf("write backend state: %w", err)
				}
				return Result{URL: endpoint, Managed: true, PID: state.PID, BackendPath: backendPath, Digest: digest}, nil
			}
		}
		select {
		case err := <-processDone:
			return Result{}, fmt.Errorf("PUA backend exited before becoming ready: %w", err)
		case <-ctx.Done():
			_ = command.Process.Signal(os.Interrupt)
			return Result{}, ctx.Err()
		case <-timer.C:
			_ = command.Process.Signal(os.Interrupt)
			return Result{}, fmt.Errorf("PUA backend did not become ready within %s", options.StartupTimeout)
		case <-ticker.C:
		}
	}
}

func healthy(ctx context.Context, client *http.Client, endpoint string) bool {
	request, err := http.NewRequestWithContext(ctx, http.MethodGet, strings.TrimRight(endpoint, "/")+defaultProbePath, nil)
	if err != nil {
		return false
	}
	response, err := client.Do(request)
	if err != nil {
		return false
	}
	defer response.Body.Close()
	_, _ = io.Copy(io.Discard, io.LimitReader(response.Body, 4096))
	return response.StatusCode == http.StatusOK
}

func endpointForAddress(address string) (string, error) {
	host, port, err := net.SplitHostPort(address)
	if err != nil {
		return "", err
	}
	if _, err := strconv.Atoi(port); err != nil {
		return "", fmt.Errorf("invalid port %q", port)
	}
	switch host {
	case "", "0.0.0.0", "::", "[::]":
		host = "127.0.0.1"
	}
	endpoint := &url.URL{Scheme: "http", Host: net.JoinHostPort(host, port)}
	return endpoint.String(), nil
}

func fileDigest(path string) (string, error) {
	file, err := os.Open(path)
	if err != nil {
		return "", err
	}
	defer file.Close()
	hash := sha256.New()
	if _, err := io.Copy(hash, file); err != nil {
		return "", err
	}
	return hex.EncodeToString(hash.Sum(nil)), nil
}

func copyExecutable(source, destination string) error {
	input, err := os.Open(source)
	if err != nil {
		return fmt.Errorf("open PUA backend: %w", err)
	}
	defer input.Close()
	temporary, err := os.CreateTemp(filepath.Dir(destination), ".pua-install-*")
	if err != nil {
		return fmt.Errorf("create backend staging file: %w", err)
	}
	temporaryPath := temporary.Name()
	defer os.Remove(temporaryPath)
	if _, err := io.Copy(temporary, input); err != nil {
		_ = temporary.Close()
		return fmt.Errorf("copy PUA backend: %w", err)
	}
	if err := temporary.Chmod(0o755); err != nil {
		_ = temporary.Close()
		return fmt.Errorf("make PUA backend executable: %w", err)
	}
	if err := temporary.Sync(); err != nil {
		_ = temporary.Close()
		return fmt.Errorf("sync PUA backend: %w", err)
	}
	if err := temporary.Close(); err != nil {
		return fmt.Errorf("close PUA backend staging file: %w", err)
	}
	if err := os.Rename(temporaryPath, destination); err != nil {
		return fmt.Errorf("install PUA backend: %w", err)
	}
	return nil
}

func writeJSONAtomic(path string, value any) error {
	if err := os.MkdirAll(filepath.Dir(path), 0o700); err != nil {
		return err
	}
	data, err := json.MarshalIndent(value, "", "  ")
	if err != nil {
		return err
	}
	data = append(data, '\n')
	temporary, err := os.CreateTemp(filepath.Dir(path), ".desktop-state-*")
	if err != nil {
		return err
	}
	temporaryPath := temporary.Name()
	defer os.Remove(temporaryPath)
	if err := temporary.Chmod(0o600); err != nil {
		_ = temporary.Close()
		return err
	}
	if _, err := temporary.Write(data); err != nil {
		_ = temporary.Close()
		return err
	}
	if err := temporary.Sync(); err != nil {
		_ = temporary.Close()
		return err
	}
	if err := temporary.Close(); err != nil {
		return err
	}
	return os.Rename(temporaryPath, path)
}

func readJSON[T any](path string) (T, bool) {
	var value T
	data, err := os.ReadFile(path)
	if err != nil || json.Unmarshal(data, &value) != nil {
		return value, false
	}
	return value, true
}

func processAlive(pid int) bool {
	if pid <= 0 {
		return false
	}
	process, err := os.FindProcess(pid)
	if err != nil {
		return false
	}
	return process.Signal(syscall.Signal(0)) == nil
}

func replaceEnv(environ []string, key, value string) []string {
	prefix := key + "="
	result := make([]string, 0, len(environ)+1)
	for _, entry := range environ {
		if !strings.HasPrefix(entry, prefix) {
			result = append(result, entry)
		}
	}
	return append(result, prefix+value)
}

func manifestPath(options Options) string {
	return filepath.Join(options.AppSupportDir, "backend", "current.json")
}

func statePath(options Options) string {
	return filepath.Join(options.AppSupportDir, "backend-state.json")
}

func envOrDefault(key, fallback string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return fallback
}
