package forge

import (
	"bytes"
	"context"
	"crypto/sha1"
	"encoding/hex"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"net"
	"net/http"
	"net/url"
	"os"
	"path/filepath"
	"strings"
	"time"
)

const (
	workspaceStatusUsage = "usage: forge workspace status [--server=<url>]"
	projectStatusUsage   = "usage: forge project status [--project=<project>] [--server=<url>]"
	taskStatusUsage      = "usage: forge task status [--project=<project>] [--task=<task>] [--server=<url>]"
	messageSendUsage     = "usage: forge message send --to=<resource> [--mode=steer|enqueue|interrupt] [--server=<url>] <message>"
	messageShowUsage     = "usage: forge message show --id=<message-id> [--server=<url>]"
)

type resourceServerOptions struct {
	ID        string
	Mode      string
	ServerURL string
	Text      string
}

type serveLockMetadata struct {
	PID           int    `json:"pid"`
	Address       string `json:"address"`
	WorkspacePath string `json:"workspacePath"`
}

type resourceServerClient struct {
	baseURL     string
	workspaceID string
	http        *http.Client
}

func parseMessageServerArgs(args []string, command string) (resourceServerOptions, error) {
	usage := messageSendUsage
	if command == "show" {
		usage = messageShowUsage
	}
	var options resourceServerOptions
	var text []string
	for index := 0; index < len(args); index++ {
		arg := args[index]
		switch {
		case strings.HasPrefix(arg, "--to=") && command == "send":
			if options.ID != "" {
				return resourceServerOptions{}, errors.New(usage)
			}
			options.ID = strings.TrimSpace(strings.TrimPrefix(arg, "--to="))
		case arg == "--to" && command == "send":
			if index+1 >= len(args) || strings.HasPrefix(args[index+1], "--") || options.ID != "" {
				return resourceServerOptions{}, errors.New(usage)
			}
			index++
			options.ID = strings.TrimSpace(args[index])
		case strings.HasPrefix(arg, "--id=") && command == "show":
			if options.ID != "" {
				return resourceServerOptions{}, errors.New(usage)
			}
			options.ID = strings.TrimSpace(strings.TrimPrefix(arg, "--id="))
		case arg == "--id" && command == "show":
			if index+1 >= len(args) || strings.HasPrefix(args[index+1], "--") || options.ID != "" {
				return resourceServerOptions{}, errors.New(usage)
			}
			index++
			options.ID = strings.TrimSpace(args[index])
		case strings.HasPrefix(arg, "--mode=") && command == "send":
			if options.Mode != "" {
				return resourceServerOptions{}, errors.New(usage)
			}
			options.Mode = strings.ToLower(strings.TrimSpace(strings.TrimPrefix(arg, "--mode=")))
		case arg == "--mode" && command == "send":
			if index+1 >= len(args) || strings.HasPrefix(args[index+1], "--") || options.Mode != "" {
				return resourceServerOptions{}, errors.New(usage)
			}
			index++
			options.Mode = strings.ToLower(strings.TrimSpace(args[index]))
		case strings.HasPrefix(arg, "--server="):
			if options.ServerURL != "" {
				return resourceServerOptions{}, errors.New(usage)
			}
			options.ServerURL = strings.TrimSpace(strings.TrimPrefix(arg, "--server="))
		case arg == "--server":
			if index+1 >= len(args) || strings.HasPrefix(args[index+1], "--") || options.ServerURL != "" {
				return resourceServerOptions{}, errors.New(usage)
			}
			index++
			options.ServerURL = strings.TrimSpace(args[index])
		case strings.HasPrefix(arg, "--"):
			return resourceServerOptions{}, errors.New(usage)
		default:
			if command != "send" {
				return resourceServerOptions{}, errors.New(usage)
			}
			text = append(text, arg)
		}
	}
	if command == "send" {
		options.Text = strings.TrimSpace(strings.Join(text, " "))
		if options.ID == "" || options.Text == "" {
			return resourceServerOptions{}, errors.New(usage)
		}
		if options.Mode == "" {
			options.Mode = "steer"
		}
		if options.Mode != "steer" && options.Mode != "enqueue" && options.Mode != "interrupt" {
			return resourceServerOptions{}, errors.New("mode must be steer, enqueue, or interrupt")
		}
	} else if command == "show" && options.ID == "" {
		return resourceServerOptions{}, errors.New(usage)
	}
	return options, nil
}

func splitServerArg(args []string, usage string) ([]string, string, error) {
	filtered := make([]string, 0, len(args))
	serverURL := ""
	for index := 0; index < len(args); index++ {
		arg := args[index]
		switch {
		case strings.HasPrefix(arg, "--server="):
			if serverURL != "" {
				return nil, "", errors.New(usage)
			}
			serverURL = strings.TrimSpace(strings.TrimPrefix(arg, "--server="))
			if serverURL == "" {
				return nil, "", errors.New(usage)
			}
		case arg == "--server":
			if serverURL != "" || index+1 >= len(args) || strings.HasPrefix(args[index+1], "--") {
				return nil, "", errors.New(usage)
			}
			index++
			serverURL = strings.TrimSpace(args[index])
			if serverURL == "" {
				return nil, "", errors.New(usage)
			}
		default:
			filtered = append(filtered, arg)
		}
	}
	return filtered, serverURL, nil
}

func inferCurrentResourceID() (string, error) {
	if taskID, ok, err := inferCurrentTaskID(); err != nil {
		return "", err
	} else if ok {
		return taskID, nil
	}
	if projectID, ok, err := inferCurrentProjectID(); err != nil {
		return "", err
	} else if ok {
		return projectID, nil
	}
	return "workspace", nil
}

func normalizeForgeServerURL(value string) (string, error) {
	value = strings.TrimSpace(value)
	if value == "" {
		return "", errors.New("forge serve owner address is empty")
	}
	if !strings.Contains(value, "://") {
		value = "http://" + value
	}
	parsed, err := url.Parse(value)
	if err != nil || parsed.Host == "" {
		return "", fmt.Errorf("invalid Forge Server URL %q", value)
	}
	if parsed.Scheme != "http" && parsed.Scheme != "https" {
		return "", fmt.Errorf("unsupported Forge Server URL scheme %q", parsed.Scheme)
	}
	host, port, splitErr := net.SplitHostPort(parsed.Host)
	if splitErr == nil && (host == "" || host == "0.0.0.0" || host == "::") {
		parsed.Host = net.JoinHostPort("127.0.0.1", port)
	}
	parsed.Path = strings.TrimRight(parsed.Path, "/")
	parsed.RawQuery = ""
	parsed.Fragment = ""
	return strings.TrimRight(parsed.String(), "/"), nil
}

func newResourceServerClient(serverOverride string) (*resourceServerClient, string, error) {
	workspace, err := openApplicationWorkspace()
	if err != nil {
		return nil, "", err
	}
	root, err := filepath.Abs(workspace.Root())
	if err != nil {
		return nil, "", err
	}
	if canonical, canonicalErr := filepath.EvalSymlinks(root); canonicalErr == nil {
		root = canonical
	}
	serverURL := strings.TrimSpace(serverOverride)
	if serverURL == "" {
		lockPath := filepath.Join(root, ".forge", "serve.lock")
		data, readErr := os.ReadFile(lockPath)
		if readErr != nil {
			return nil, "", fmt.Errorf("discover Forge Server owner from %s: %w; start forge serve or use --server=<url>", lockPath, readErr)
		}
		var metadata serveLockMetadata
		if err := json.Unmarshal(data, &metadata); err != nil {
			return nil, "", fmt.Errorf("read Forge Server owner metadata: %w", err)
		}
		ownerPath := strings.TrimSpace(metadata.WorkspacePath)
		if canonical, canonicalErr := filepath.EvalSymlinks(ownerPath); canonicalErr == nil {
			ownerPath = canonical
		}
		if ownerPath == "" || filepath.Clean(ownerPath) != filepath.Clean(root) {
			return nil, "", fmt.Errorf("Forge Server owner metadata changed or belongs to another Workspace; expected %s, got %s", root, ownerPath)
		}
		serverURL = metadata.Address
	}
	serverURL, err = normalizeForgeServerURL(serverURL)
	if err != nil {
		return nil, "", err
	}
	sum := sha1.Sum([]byte(filepath.Clean(root)))
	return &resourceServerClient{
		baseURL: serverURL, workspaceID: hex.EncodeToString(sum[:8]),
		http: &http.Client{Timeout: 60 * time.Second},
	}, root, nil
}

func (client *resourceServerClient) request(ctx context.Context, method, path string, body any, output any) error {
	var reader io.Reader
	if body != nil {
		data, err := json.Marshal(body)
		if err != nil {
			return err
		}
		reader = bytes.NewReader(data)
	}
	request, err := http.NewRequestWithContext(ctx, method, client.baseURL+path, reader)
	if err != nil {
		return err
	}
	if body != nil {
		request.Header.Set("Content-Type", "application/json")
	}
	response, err := client.http.Do(request)
	if err != nil {
		return fmt.Errorf("contact Forge Server %s: %w; verify the owner is running or use --server=<url>", client.baseURL, err)
	}
	defer response.Body.Close()
	data, err := io.ReadAll(io.LimitReader(response.Body, 4*1024*1024))
	if err != nil {
		return err
	}
	if response.StatusCode < 200 || response.StatusCode >= 300 {
		var failure struct {
			Code  string `json:"code"`
			Error string `json:"error"`
		}
		_ = json.Unmarshal(data, &failure)
		message := strings.TrimSpace(failure.Error)
		if message == "" {
			message = strings.TrimSpace(string(data))
		}
		if message == "" {
			message = response.Status
		}
		if failure.Code != "" {
			return fmt.Errorf("Forge Server %s: %s", failure.Code, message)
		}
		return fmt.Errorf("Forge Server returned %s: %s", response.Status, message)
	}
	if output == nil || len(bytes.TrimSpace(data)) == 0 {
		return nil
	}
	if err := json.Unmarshal(data, output); err != nil {
		return fmt.Errorf("decode Forge Server response: %w", err)
	}
	return nil
}

func runResourceStatus(resourceID, serverURL string) error {
	client, _, err := newResourceServerClient(serverURL)
	if err != nil {
		return err
	}
	var response map[string]any
	path := fmt.Sprintf("/api/workspaces/%s/resources/%s/status", url.PathEscape(client.workspaceID), url.PathEscape(resourceID))
	if err := client.request(context.Background(), http.MethodGet, path, nil, &response); err != nil {
		return err
	}
	return printJSON(response)
}

func runWorkspaceStatus(args []string) error {
	remaining, serverURL, err := splitServerArg(args, workspaceStatusUsage)
	if err != nil || len(remaining) != 0 {
		if err != nil {
			return err
		}
		return errors.New(workspaceStatusUsage)
	}
	return runResourceStatus("workspace", serverURL)
}

func runProjectStatus(args []string) error {
	remaining, serverURL, err := splitServerArg(args, projectStatusUsage)
	if err != nil {
		return err
	}
	projectID, err := resolveProjectArg(remaining, "status")
	if err != nil {
		return err
	}
	return runResourceStatus(projectID, serverURL)
}

func runTaskStatus(args []string) error {
	remaining, serverURL, err := splitServerArg(args, taskStatusUsage)
	if err != nil {
		return err
	}
	taskID, err := resolveTaskArg(remaining, "status")
	if err != nil {
		return err
	}
	return runResourceStatus(taskID, serverURL)
}

func runMessage(args []string) error {
	if len(args) == 0 {
		return errors.New("message requires a subcommand")
	}
	switch args[0] {
	case "send":
		return runMessageSend(args[1:])
	case "show":
		return runMessageShow(args[1:])
	default:
		return fmt.Errorf("unknown message subcommand %q", args[0])
	}
}

func runMessageSend(args []string) error {
	options, err := parseMessageServerArgs(args, "send")
	if err != nil {
		return err
	}
	senderID, err := inferCurrentResourceID()
	if err != nil {
		return err
	}
	client, _, err := newResourceServerClient(options.ServerURL)
	if err != nil {
		return err
	}
	body := map[string]any{
		"text": options.Text, "mode": options.Mode, "role": "agent",
		"sender": map[string]string{"id": senderID, "name": senderID},
	}
	var response map[string]any
	path := fmt.Sprintf("/api/workspaces/%s/resources/%s/messages", url.PathEscape(client.workspaceID), url.PathEscape(options.ID))
	if err := client.request(context.Background(), http.MethodPost, path, body, &response); err != nil {
		return err
	}
	return printJSON(response)
}

func runMessageShow(args []string) error {
	options, err := parseMessageServerArgs(args, "show")
	if err != nil {
		return err
	}
	client, _, err := newResourceServerClient(options.ServerURL)
	if err != nil {
		return err
	}
	var response map[string]any
	path := fmt.Sprintf("/api/workspaces/%s/messages/%s", url.PathEscape(client.workspaceID), url.PathEscape(options.ID))
	if err := client.request(context.Background(), http.MethodGet, path, nil, &response); err != nil {
		return err
	}
	return printJSON(response)
}
