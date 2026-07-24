package main

import (
	"bufio"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"os"
	"os/exec"
	"strings"
	"sync"
	"syscall"
	"time"
)

type piRPCProvider struct {
	mu        sync.Mutex
	manager   *agentManager
	command   string
	startedAt string
	running   bool
	done      chan struct{}
	clients   map[string]*piRPCClient
}

type piRPCClient struct {
	provider *piRPCProvider
	rt       *agentRuntime
	cmd      *exec.Cmd
	stdin    io.WriteCloser

	mu      sync.Mutex
	writeMu sync.Mutex
	nextID  int64
	waiting map[string]chan piRPCResponse
	closed  bool
	closing bool
}

type piRPCResponse struct {
	Type    string          `json:"type"`
	ID      json.RawMessage `json:"id"`
	Command string          `json:"command"`
	Success bool            `json:"success"`
	Data    json.RawMessage `json:"data"`
	Error   string          `json:"error"`
}

type piRPCState struct {
	SessionID string `json:"sessionId"`
}

func newPiRPCProvider() *piRPCProvider {
	return &piRPCProvider{clients: make(map[string]*piRPCClient)}
}

func (p *piRPCProvider) ID() string { return piProviderID }

func (p *piRPCProvider) resolveCommand() (string, error) {
	command := strings.TrimSpace(os.Getenv("FORGE_PI_CLI"))
	if command == "" {
		command = "pi"
	}
	resolved, err := exec.LookPath(command)
	if err != nil {
		return "", fmt.Errorf("Pi CLI not found; install it or set FORGE_PI_CLI to its executable path")
	}
	return resolved, nil
}

func (p *piRPCProvider) Start(m *agentManager) error {
	command, err := p.resolveCommand()
	if err != nil {
		return err
	}
	p.mu.Lock()
	defer p.mu.Unlock()
	p.manager = m
	p.command = command
	if !p.running {
		p.running = true
		p.startedAt = time.Now().Format(time.RFC3339)
		p.done = make(chan struct{})
	}
	return nil
}

func (p *piRPCProvider) Stop() error {
	p.mu.Lock()
	clients := make([]*piRPCClient, 0, len(p.clients))
	for _, client := range p.clients {
		clients = append(clients, client)
	}
	p.clients = make(map[string]*piRPCClient)
	if p.running {
		p.running = false
		p.startedAt = ""
		close(p.done)
	}
	p.mu.Unlock()
	for _, client := range clients {
		client.close()
	}
	return nil
}

func (p *piRPCProvider) IsRunning() bool {
	p.mu.Lock()
	defer p.mu.Unlock()
	return p.running
}

func (p *piRPCProvider) Done() <-chan struct{} {
	p.mu.Lock()
	defer p.mu.Unlock()
	if !p.running || p.done == nil {
		return closedProviderDone()
	}
	return p.done
}

func (p *piRPCProvider) Status(enabled bool) opencodeStatus {
	p.mu.Lock()
	defer p.mu.Unlock()
	return opencodeStatus{Running: p.running, Enabled: enabled, StartedAt: p.startedAt}
}

func (p *piRPCProvider) NewSession(rt *agentRuntime) error {
	return p.startSession(rt, "")
}

func (p *piRPCProvider) ResumeSession(rt *agentRuntime) error {
	rt.mu.Lock()
	sessionID := strings.TrimSpace(rt.run.ProviderSessionID)
	rt.mu.Unlock()
	if sessionID == "" {
		return errors.New("no Pi session id to resume")
	}
	return p.startSession(rt, sessionID)
}

func (p *piRPCProvider) startSession(rt *agentRuntime, resumeSessionID string) error {
	p.mu.Lock()
	command := p.command
	running := p.running
	p.mu.Unlock()
	if !running || command == "" {
		return errors.New("Pi RPC provider is not running")
	}
	rt.mu.Lock()
	run := rt.run
	rt.mu.Unlock()
	args := []string{"--mode", "rpc"}
	if run.Model != "" {
		args = append(args, "--model", run.Model)
	}
	if run.Sandbox == "read-only" {
		args = append(args, "--tools", "read,grep,find,ls")
	}
	if resumeSessionID != "" {
		args = append(args, "--session", resumeSessionID)
	}
	if run.Title != "" {
		args = append(args, "--name", run.Title)
	}
	cmd := exec.Command(command, args...)
	cmd.Dir = run.Cwd
	cmd.SysProcAttr = &syscall.SysProcAttr{Setpgid: true}
	stdin, err := cmd.StdinPipe()
	if err != nil {
		return err
	}
	stdout, err := cmd.StdoutPipe()
	if err != nil {
		return err
	}
	stderr, err := cmd.StderrPipe()
	if err != nil {
		return err
	}
	client := &piRPCClient{
		provider: p,
		rt:       rt,
		cmd:      cmd,
		stdin:    stdin,
		nextID:   1,
		waiting:  make(map[string]chan piRPCResponse),
	}
	if err := cmd.Start(); err != nil {
		return fmt.Errorf("start Pi RPC: %w", err)
	}
	p.mu.Lock()
	p.clients[run.ID] = client
	p.mu.Unlock()
	go client.readLoop(stdout)
	go client.stderrLoop(stderr)
	go func() {
		err := cmd.Wait()
		client.processExited(err)
	}()
	response, err := client.request("get_state", nil)
	if err != nil {
		client.close()
		return fmt.Errorf("read Pi RPC session state: %w", err)
	}
	var state piRPCState
	if err := json.Unmarshal(response.Data, &state); err != nil {
		client.close()
		return fmt.Errorf("decode Pi RPC session state: %w", err)
	}
	if state.SessionID == "" {
		client.close()
		return errors.New("Pi RPC returned no session id")
	}
	rt.mu.Lock()
	rt.run.ProviderSessionID = state.SessionID
	if !rt.stopRequested {
		rt.run.Status = "running"
	}
	rt.run.UpdatedAt = time.Now().Format(time.RFC3339)
	run = rt.run
	rt.mu.Unlock()
	_ = saveAgentRun(rt.workspace.Path, run)
	method := "session/new"
	text := piProviderName + " session started."
	if resumeSessionID != "" {
		method = "session/resume"
		text = piProviderName + " session resumed."
	}
	rt.addEvent(rt.manager, "system", method, text, response.Data, "")
	return nil
}

func (p *piRPCProvider) client(rt *agentRuntime) (*piRPCClient, error) {
	rt.mu.Lock()
	runID := rt.run.ID
	rt.mu.Unlock()
	p.mu.Lock()
	defer p.mu.Unlock()
	client := p.clients[runID]
	if client == nil {
		return nil, errors.New("Pi RPC session is not ready")
	}
	return client, nil
}

func (p *piRPCProvider) SendPrompt(rt *agentRuntime, text string) error {
	client, err := p.client(rt)
	if err != nil {
		return err
	}
	_, err = client.request("prompt", map[string]any{"message": rt.withForgeSessionContext(text)})
	return err
}

func (p *piRPCProvider) SendInput(rt *agentRuntime, text string) error {
	client, err := p.client(rt)
	if err != nil {
		return err
	}
	_, err = client.request("steer", map[string]any{"message": text})
	return err
}

func (p *piRPCProvider) Interrupt(rt *agentRuntime) error {
	client, err := p.client(rt)
	if err != nil {
		return nil
	}
	_, err = client.request("abort", nil)
	return err
}

func (p *piRPCProvider) CloseSession(rt *agentRuntime) error {
	rt.mu.Lock()
	runID := rt.run.ID
	rt.mu.Unlock()
	p.mu.Lock()
	client := p.clients[runID]
	delete(p.clients, runID)
	p.mu.Unlock()
	if client != nil {
		client.close()
	}
	return nil
}

func (p *piRPCProvider) ResolveApproval(_ pendingApproval, _ string) (any, error) {
	return nil, errors.New("Pi RPC does not expose approval requests")
}

func (c *piRPCClient) request(command string, fields map[string]any) (piRPCResponse, error) {
	c.mu.Lock()
	if c.closed {
		c.mu.Unlock()
		return piRPCResponse{}, errors.New("Pi RPC process is closed")
	}
	id := c.nextID
	c.nextID++
	key := fmt.Sprintf("%d", id)
	responseCh := make(chan piRPCResponse, 1)
	c.waiting[key] = responseCh
	c.mu.Unlock()
	request := make(map[string]any, len(fields)+2)
	request["id"] = id
	request["type"] = command
	for name, value := range fields {
		request[name] = value
	}
	if err := c.write(request); err != nil {
		c.mu.Lock()
		delete(c.waiting, key)
		c.mu.Unlock()
		return piRPCResponse{}, err
	}
	response, ok := <-responseCh
	if !ok {
		return piRPCResponse{}, errors.New("Pi RPC process closed before responding")
	}
	if !response.Success {
		message := strings.TrimSpace(response.Error)
		if message == "" {
			message = "command failed"
		}
		return response, fmt.Errorf("Pi RPC %s: %s", command, message)
	}
	return response, nil
}

func (c *piRPCClient) write(value any) error {
	data, err := json.Marshal(value)
	if err != nil {
		return err
	}
	c.writeMu.Lock()
	defer c.writeMu.Unlock()
	if _, err := c.stdin.Write(append(data, '\n')); err != nil {
		return fmt.Errorf("write Pi RPC request: %w", err)
	}
	return nil
}

func (c *piRPCClient) readLoop(reader io.Reader) {
	scanner := bufio.NewScanner(reader)
	buffer := make([]byte, 64*1024)
	scanner.Buffer(buffer, 16*1024*1024)
	for scanner.Scan() {
		line := append([]byte(nil), scanner.Bytes()...)
		var envelope struct {
			Type string          `json:"type"`
			ID   json.RawMessage `json:"id"`
		}
		if err := json.Unmarshal(line, &envelope); err != nil {
			c.rt.addEvent(c.rt.manager, "error", "pi/rpc", "Invalid Pi RPC output: "+err.Error(), line, "")
			continue
		}
		if envelope.Type == "response" {
			var response piRPCResponse
			if err := json.Unmarshal(line, &response); err != nil {
				continue
			}
			key := strings.Trim(string(response.ID), `"`)
			c.mu.Lock()
			ch := c.waiting[key]
			delete(c.waiting, key)
			c.mu.Unlock()
			if ch != nil {
				ch <- response
				close(ch)
			}
			continue
		}
		c.handleEvent(line, envelope.Type)
	}
	if err := scanner.Err(); err != nil {
		c.rt.addEvent(c.rt.manager, "error", "pi/rpc", "Read Pi RPC output: "+err.Error(), nil, "")
	}
}

func (c *piRPCClient) handleEvent(raw json.RawMessage, eventType string) {
	var event struct {
		AssistantMessageEvent struct {
			Type  string `json:"type"`
			Delta string `json:"delta"`
		} `json:"assistantMessageEvent"`
		ToolCallID   string          `json:"toolCallId"`
		ToolName     string          `json:"toolName"`
		Args         json.RawMessage `json:"args"`
		IsError      bool            `json:"isError"`
		Error        string          `json:"error"`
		ErrorMessage string          `json:"errorMessage"`
		Attempt      int             `json:"attempt"`
		MaxAttempts  int             `json:"maxAttempts"`
		FinalError   string          `json:"finalError"`
	}
	_ = json.Unmarshal(raw, &event)
	switch eventType {
	case "message_update":
		switch event.AssistantMessageEvent.Type {
		case "text_delta":
			c.rt.addEvent(c.rt.manager, "assistant_delta", eventType, event.AssistantMessageEvent.Delta, raw, "")
		case "thinking_delta":
			c.rt.addEvent(c.rt.manager, "reasoning_delta", eventType, event.AssistantMessageEvent.Delta, raw, "")
		case "error":
			text := event.ErrorMessage
			if text == "" {
				text = event.Error
			}
			c.rt.addEvent(c.rt.manager, "error", eventType, text, raw, "")
		}
	case "tool_execution_start", "tool_execution_end":
		text := piToolSummary(event.ToolName, event.Args)
		if eventType == "tool_execution_end" && event.IsError {
			text += " failed"
		}
		c.rt.addEvent(c.rt.manager, "tool", eventType, text, raw, "")
	case "agent_settled":
		c.rt.addEvent(c.rt.manager, "system", "session/prompt", piProviderName+" turn finished.", raw, "")
		if c.rt.isSchedulerTurn() {
			c.rt.finishSchedulerTurn(c.rt.manager, piProviderName+" turn settled")
		} else {
			c.rt.markIdle(c.rt.manager)
		}
	case "auto_retry_start":
		text := fmt.Sprintf("Pi request failed; retrying (%d/%d).", event.Attempt, event.MaxAttempts)
		if detail := strings.TrimSpace(event.ErrorMessage); detail != "" {
			text += " " + detail
		}
		c.rt.addEvent(c.rt.manager, "system", eventType, text, raw, "")
	case "auto_retry_end":
		text := "Pi request retry finished."
		if detail := strings.TrimSpace(event.FinalError); detail != "" {
			text = "Pi request retry failed: " + detail
		}
		c.rt.addEvent(c.rt.manager, "system", eventType, text, raw, "")
	case "extension_error":
		text := event.Error
		if text == "" {
			text = "Pi extension failed"
		}
		c.rt.addEvent(c.rt.manager, "error", eventType, text, raw, "")
	default:
		// Lifecycle events (agent_start, turn_start/end, agent_end, message_start/end,
		// tool_execution_update) carry no displayable content; recording them only
		// floods the chat with noise, so they are dropped here.
	}
}

func piToolSummary(toolName string, args json.RawMessage) string {
	name := strings.TrimSpace(toolName)
	if name == "" {
		name = "Pi tool"
	}
	var fields map[string]any
	if len(args) > 0 && json.Unmarshal(args, &fields) == nil {
		for _, key := range []string{"command", "path", "pattern", "query", "url"} {
			value, ok := fields[key].(string)
			if !ok || strings.TrimSpace(value) == "" {
				continue
			}
			value = strings.Join(strings.Fields(value), " ")
			const maxLength = 80
			if len(value) > maxLength {
				value = value[:maxLength-1] + "…"
			}
			return name + " " + value
		}
	}
	return name
}

func (c *piRPCClient) stderrLoop(reader io.Reader) {
	scanner := bufio.NewScanner(reader)
	for scanner.Scan() {
		text := strings.TrimSpace(scanner.Text())
		if text != "" {
			c.rt.addEvent(c.rt.manager, "system", "pi/stderr", text, nil, "")
		}
	}
}

func (c *piRPCClient) processExited(processErr error) {
	c.mu.Lock()
	closing := c.closing
	c.closed = true
	for key, ch := range c.waiting {
		delete(c.waiting, key)
		close(ch)
	}
	c.mu.Unlock()
	c.provider.mu.Lock()
	c.rt.mu.Lock()
	runID := c.rt.run.ID
	c.rt.mu.Unlock()
	if c.provider.clients[runID] == c {
		delete(c.provider.clients, runID)
	}
	c.provider.mu.Unlock()
	if closing {
		return
	}
	message := "Pi RPC process exited"
	if processErr != nil {
		message += ": " + processErr.Error()
	}
	c.rt.addEvent(c.rt.manager, "error", "pi/exit", message, nil, "")
	if c.rt.isSchedulerTurn() {
		c.rt.recordSchedulerFailure(c.rt.manager, message)
	}
	c.rt.updateStatus(c.rt.manager, "failed")
	c.rt.signalDone()
}

func (c *piRPCClient) close() {
	c.mu.Lock()
	if c.closed || c.closing {
		c.mu.Unlock()
		return
	}
	c.closing = true
	c.mu.Unlock()
	_ = c.stdin.Close()
	if c.cmd != nil && c.cmd.Process != nil {
		_ = syscall.Kill(-c.cmd.Process.Pid, syscall.SIGTERM)
	}
}
