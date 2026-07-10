package main

import (
	"bufio"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"os"
	"os/exec"
	"path/filepath"
	"strconv"
	"strings"
	"sync"
	"syscall"
	"time"
)

type opencodeAppServer struct {
	mu        sync.Mutex
	manager   *agentManager
	client    *opencodeClient
	startedAt string
}

type opencodeClient struct {
	manager        *agentManager
	cmd            *exec.Cmd
	stdin          io.WriteCloser
	mu             sync.Mutex
	closeMu        sync.Mutex
	closed         bool
	nextID         int64
	waiting        map[string]chan rpcResponse
	done           chan struct{}
	runIDBySession map[string]string
	runtimeByRunID map[string]*agentRuntime
}

type opencodeRuntimeRef struct {
	runID     string
	sessionID string
}

func newOpencodeAppServer() *opencodeAppServer {
	return &opencodeAppServer{}
}

func (o *opencodeAppServer) ID() string { return opencodeProviderID }

func (o *opencodeAppServer) Start(m *agentManager) error {
	o.mu.Lock()
	defer o.mu.Unlock()
	o.pruneLocked()
	if o.client != nil && o.client.cmd != nil && o.client.cmd.Process != nil {
		return nil
	}
	bin := strings.TrimSpace(os.Getenv("FORGE_OPENCODE_CLI"))
	if bin == "" {
		bin = "opencode"
	}
	cmd := exec.Command(bin, "acp")
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
	client := newOpencodeClient(m, cmd, stdin)
	if err := cmd.Start(); err != nil {
		return fmt.Errorf("start opencode acp: %w", err)
	}
	go client.readLoop(stdout)
	go client.stderrLoop(stderr)
	go func() {
		_ = cmd.Wait()
		client.markClosed()
		close(client.done)
		o.mu.Lock()
		if o.client == client {
			o.client = nil
			o.startedAt = ""
		}
		o.mu.Unlock()
	}()
	o.client = client
	o.startedAt = time.Now().Format(time.RFC3339)
	if _, err := client.request("initialize", map[string]any{
		"protocolVersion": "2024-11-05",
		"clientInfo": map[string]any{
			"name":    "forge_gui",
			"version": "0.1.0",
		},
		"capabilities": map[string]any{
			"fs": map[string]any{
				"readTextFile":  true,
				"writeTextFile": true,
			},
			"terminal": true,
		},
	}); err != nil {
		client.close()
		o.client = nil
		o.startedAt = ""
		return fmt.Errorf("initialize opencode acp: %w", err)
	}
	return nil
}

func (o *opencodeAppServer) Stop() error {
	o.mu.Lock()
	defer o.mu.Unlock()
	o.pruneLocked()
	if o.client == nil {
		return nil
	}
	o.client.close()
	o.client = nil
	o.startedAt = ""
	return nil
}

func (o *opencodeAppServer) IsRunning() bool {
	o.mu.Lock()
	defer o.mu.Unlock()
	o.pruneLocked()
	return o.client != nil && o.client.cmd != nil && o.client.cmd.Process != nil
}

func (o *opencodeAppServer) Status(enabled bool) opencodeStatus {
	o.mu.Lock()
	defer o.mu.Unlock()
	o.pruneLocked()
	if o.client == nil || o.client.cmd == nil || o.client.cmd.Process == nil {
		return opencodeStatus{Enabled: enabled}
	}
	return opencodeStatus{
		Running:   true,
		Enabled:   enabled,
		PID:       o.client.cmd.Process.Pid,
		StartedAt: o.startedAt,
	}
}

func (o *opencodeAppServer) getClient() (*opencodeClient, error) {
	o.mu.Lock()
	defer o.mu.Unlock()
	o.pruneLocked()
	if o.client == nil {
		return nil, errors.New("opencode acp is not running")
	}
	return o.client, nil
}

func (o *opencodeAppServer) pruneLocked() {
	if o.client == nil || o.client.cmd == nil || o.client.cmd.Process == nil {
		return
	}
	select {
	case <-o.client.done:
		o.client = nil
		o.startedAt = ""
		return
	default:
	}
	if err := o.client.cmd.Process.Signal(syscall.Signal(0)); err != nil {
		o.client = nil
		o.startedAt = ""
	}
}

func (o *opencodeAppServer) ensureClient(m *agentManager) (*opencodeClient, error) {
	if err := o.Start(m); err != nil {
		return nil, err
	}
	return o.getClient()
}

func (o *opencodeAppServer) NewSession(rt *agentRuntime) error {
	client, err := o.ensureClient(rt.manager)
	if err != nil {
		return err
	}
	result, err := client.request("session/new", map[string]any{
		"cwd": rt.run.Cwd,
	})
	if err != nil {
		return err
	}
	sessionID := firstString(result, "sessionId", "id")
	if sessionID == "" {
		sessionID = nestedString(result, "session", "id")
	}
	if sessionID == "" {
		return errors.New("session/new returned no session id")
	}
	rt.mu.Lock()
	rt.run.ProviderSessionID = sessionID
	if !rt.stopRequested {
		rt.run.Status = "running"
	}
	rt.run.UpdatedAt = time.Now().Format(time.RFC3339)
	rt.mu.Unlock()
	_ = saveAgentRun(rt.workspace.Path, rt.run)
	client.registerRuntime(rt.run.ID, sessionID, rt)
	rt.addEvent(rt.manager, "system", "session/new", "OpenCode session started.", result, "")
	return nil
}

func (o *opencodeAppServer) ResumeSession(rt *agentRuntime) error {
	client, err := o.ensureClient(rt.manager)
	if err != nil {
		return err
	}
	sessionID := strings.TrimSpace(rt.run.ProviderSessionID)
	if sessionID == "" {
		return errors.New("no session id to resume")
	}
	result, err := client.request("session/resume", map[string]any{
		"sessionId": sessionID,
		"cwd":       rt.run.Cwd,
	})
	if err != nil {
		return err
	}
	if resID := firstString(result, "sessionId", "id"); resID != "" {
		sessionID = resID
	} else if resID := nestedString(result, "session", "id"); resID != "" {
		sessionID = resID
	}
	rt.mu.Lock()
	rt.run.ProviderSessionID = sessionID
	if !rt.stopRequested {
		rt.run.Status = "running"
	}
	rt.run.UpdatedAt = time.Now().Format(time.RFC3339)
	rt.mu.Unlock()
	_ = saveAgentRun(rt.workspace.Path, rt.run)
	client.registerRuntime(rt.run.ID, sessionID, rt)
	rt.addEvent(rt.manager, "system", "session/resume", "OpenCode session resumed.", result, "")
	return nil
}

func (o *opencodeAppServer) SendPrompt(rt *agentRuntime, text string) error {
	client, err := o.ensureClient(rt.manager)
	if err != nil {
		return err
	}
	rt.mu.Lock()
	sessionID := rt.run.ProviderSessionID
	rt.mu.Unlock()
	if sessionID == "" {
		return errors.New("opencode session is not ready")
	}
	text = rt.withForgeSessionContext(text)
	client.registerRuntime(rt.run.ID, sessionID, rt)
	_, err = client.request("session/prompt", map[string]any{
		"sessionId": sessionID,
		"prompt":    text,
	})
	return err
}

func (o *opencodeAppServer) SendInput(rt *agentRuntime, text string) error {
	return o.SendPrompt(rt, text)
}

func (o *opencodeAppServer) Interrupt(rt *agentRuntime) error {
	client, err := o.ensureClient(rt.manager)
	if err != nil {
		return err
	}
	rt.mu.Lock()
	sessionID := rt.run.ProviderSessionID
	rt.mu.Unlock()
	if sessionID == "" {
		return nil
	}
	client.notify("session/cancel", map[string]any{"sessionId": sessionID})
	return nil
}

func (o *opencodeAppServer) ResolveApproval(requestID string, response any) error {
	client, err := o.getClient()
	if err != nil {
		return err
	}
	return client.respond(json.RawMessage(requestID), response)
}

func newOpencodeClient(m *agentManager, cmd *exec.Cmd, stdin io.WriteCloser) *opencodeClient {
	return &opencodeClient{
		manager:        m,
		cmd:            cmd,
		stdin:          stdin,
		nextID:         1,
		waiting:        make(map[string]chan rpcResponse),
		done:           make(chan struct{}),
		runIDBySession: make(map[string]string),
		runtimeByRunID: make(map[string]*agentRuntime),
	}
}

func (c *opencodeClient) request(method string, params any) (json.RawMessage, error) {
	id, ch := c.nextRequest()
	if err := c.write(map[string]any{"jsonrpc": "2.0", "id": id, "method": method, "params": params}); err != nil {
		return nil, err
	}
	select {
	case response := <-ch:
		return response.result, response.err
	case <-time.After(15 * time.Minute):
		return nil, fmt.Errorf("%s timed out", method)
	case <-c.done:
		return nil, errors.New("opencode acp exited")
	}
}

func (c *opencodeClient) notify(method string, params any) {
	_ = c.write(map[string]any{"jsonrpc": "2.0", "method": method, "params": params})
}

func (c *opencodeClient) respond(id json.RawMessage, result any) error {
	payload, err := json.Marshal(result)
	if err != nil {
		return err
	}
	line := fmt.Sprintf(`{"jsonrpc":"2.0","id":%s,"result":%s}`+"\n", string(id), string(payload))
	c.mu.Lock()
	defer c.mu.Unlock()
	_, err = c.stdin.Write([]byte(line))
	return err
}

func (c *opencodeClient) close() {
	c.closeMu.Lock()
	if c.closed {
		c.closeMu.Unlock()
		return
	}
	c.closed = true
	c.closeMu.Unlock()
	if c.stdin != nil {
		_ = c.stdin.Close()
	}
	if c.cmd != nil && c.cmd.Process != nil {
		if pgid, err := syscall.Getpgid(c.cmd.Process.Pid); err == nil {
			_ = syscall.Kill(-pgid, syscall.SIGKILL)
			return
		}
		_ = c.cmd.Process.Kill()
	}
}

func (c *opencodeClient) markClosed() {
	c.closeMu.Lock()
	c.closed = true
	c.closeMu.Unlock()
}

func (c *opencodeClient) isClosed() bool {
	c.closeMu.Lock()
	defer c.closeMu.Unlock()
	return c.closed
}

func (c *opencodeClient) nextRequest() (json.RawMessage, chan rpcResponse) {
	c.mu.Lock()
	defer c.mu.Unlock()
	id := json.RawMessage(strconv.FormatInt(c.nextID, 10))
	c.nextID++
	ch := make(chan rpcResponse, 1)
	c.waiting[string(id)] = ch
	return id, ch
}

func (c *opencodeClient) write(message any) error {
	data, err := json.Marshal(message)
	if err != nil {
		return err
	}
	data = append(data, '\n')
	c.mu.Lock()
	defer c.mu.Unlock()
	_, err = c.stdin.Write(data)
	return err
}

func (c *opencodeClient) readLoop(stdout io.Reader) {
	scanner := bufio.NewScanner(stdout)
	scanner.Buffer(make([]byte, 0, 64*1024), 8*1024*1024)
	for scanner.Scan() {
		c.handleLine(scanner.Bytes())
	}
	if err := scanner.Err(); err != nil {
		if c.isClosed() || isClosedPipeError(err) {
			return
		}
	}
}

func (c *opencodeClient) stderrLoop(stderr io.Reader) {
	scanner := bufio.NewScanner(stderr)
	scanner.Buffer(make([]byte, 0, 64*1024), 1024*1024)
	for scanner.Scan() {
		text := strings.TrimSpace(scanner.Text())
		_ = text
	}
}

func (c *opencodeClient) registerRuntime(runID, sessionID string, rt *agentRuntime) {
	c.mu.Lock()
	defer c.mu.Unlock()
	c.runIDBySession[sessionID] = runID
	c.runtimeByRunID[runID] = rt
}

func (c *opencodeClient) runtimeForSession(sessionID string) *agentRuntime {
	c.mu.Lock()
	defer c.mu.Unlock()
	runID, ok := c.runIDBySession[sessionID]
	if !ok || c.manager == nil {
		return nil
	}
	if rt, ok := c.runtimeByRunID[runID]; ok {
		return rt
	}
	return c.manager.runtimeByID(runID)
}

func (c *opencodeClient) handleLine(line []byte) {
	var envelope map[string]json.RawMessage
	if err := json.Unmarshal(line, &envelope); err != nil {
		return
	}
	method := rawString(envelope["method"])
	if idRaw, ok := envelope["id"]; ok {
		if method != "" {
			params := envelope["params"]
			sessionID := firstString(params, "sessionId", "session_id")
			rt := c.runtimeForSession(sessionID)
			if rt == nil {
				_ = c.respond(idRaw, map[string]any{"error": "session is not managed by Forge GUI"})
				return
			}
			rt.handleOpencodeServerRequest(c, idRaw, method, params)
			return
		}
		idKey := string(idRaw)
		c.mu.Lock()
		ch := c.waiting[idKey]
		delete(c.waiting, idKey)
		c.mu.Unlock()
		if ch == nil {
			return
		}
		if errRaw, ok := envelope["error"]; ok && len(errRaw) > 0 {
			ch <- rpcResponse{err: fmt.Errorf("%s", compactJSON(errRaw))}
			return
		}
		ch <- rpcResponse{result: envelope["result"]}
		return
	}
	if method != "" {
		params := envelope["params"]
		sessionID := firstString(params, "sessionId", "session_id")
		if rt := c.runtimeForSession(sessionID); rt != nil {
			rt.handleOpencodeNotification(c.manager, method, params)
		}
	}
}

func (rt *agentRuntime) handleOpencodeServerRequest(client *opencodeClient, id json.RawMessage, method string, params json.RawMessage) {
	switch method {
	case "session/request_permission":
		requestID := string(id)
		rt.mu.Lock()
		rt.pending[requestID] = pendingApproval{id: append(json.RawMessage(nil), id...), method: method}
		if !rt.stopRequested {
			rt.run.Status = "waiting_approval"
		}
		rt.run.UpdatedAt = time.Now().Format(time.RFC3339)
		run := rt.run
		rt.mu.Unlock()
		_ = saveAgentRun(rt.workspace.Path, run)
		rt.addEvent(client.manager, "approval_requested", method, opencodePermissionSummary(params), params, requestID)
	case "fs/read_text_file":
		content, err := rt.handleOpencodeReadTextFile(params)
		if err != nil {
			_ = client.respond(id, map[string]any{"error": err.Error()})
			return
		}
		_ = client.respond(id, map[string]any{"content": content})
	case "fs/write_text_file":
		if err := rt.handleOpencodeWriteTextFile(params); err != nil {
			_ = client.respond(id, map[string]any{"error": err.Error()})
			return
		}
		_ = client.respond(id, map[string]any{"success": true})
	case "terminal/create":
		result, err := rt.handleOpencodeTerminalCreate(params)
		if err != nil {
			_ = client.respond(id, map[string]any{"error": err.Error()})
			return
		}
		_ = client.respond(id, result)
	case "terminal/output":
		result, err := rt.handleOpencodeTerminalOutput(params)
		if err != nil {
			_ = client.respond(id, map[string]any{"error": err.Error()})
			return
		}
		_ = client.respond(id, result)
	case "terminal/wait_for_exit":
		result, err := rt.handleOpencodeTerminalWaitForExit(params)
		if err != nil {
			_ = client.respond(id, map[string]any{"error": err.Error()})
			return
		}
		_ = client.respond(id, result)
	case "terminal/kill":
		if err := rt.handleOpencodeTerminalKill(params); err != nil {
			_ = client.respond(id, map[string]any{"error": err.Error()})
			return
		}
		_ = client.respond(id, map[string]any{"success": true})
	case "terminal/release":
		if err := rt.handleOpencodeTerminalRelease(params); err != nil {
			_ = client.respond(id, map[string]any{"error": err.Error()})
			return
		}
		_ = client.respond(id, map[string]any{"success": true})
	default:
		_ = client.respond(id, map[string]any{"error": "unsupported by Forge GUI"})
		rt.addEvent(client.manager, "server_request", method, fmt.Sprintf("Unsupported opencode request: %s", method), params, "")
	}
}

func (rt *agentRuntime) handleOpencodeNotification(m *agentManager, method string, params json.RawMessage) {
	switch method {
	case "session/update":
		updates, _ := jsonArray(params, "updates")
		for _, update := range updates {
			updateType := firstString(update, "type")
			switch updateType {
			case "agent_message_chunk":
				text, _ := agentMessageDeltaText(update)
				if text == "" {
					text = eventText(updateType, update)
				}
				rt.addEvent(m, "assistant_delta", "session/update", text, update, "")
			case "tool_call":
				rt.addEvent(m, "tool", "session/update", eventText(updateType, update), update, "")
			case "tool_call_update":
				rt.addEvent(m, "tool", "session/update", eventText(updateType, update), update, "")
			case "plan":
				rt.addEvent(m, "system", "session/update", eventText(updateType, update), update, "")
			case "usage_update":
				rt.addEvent(m, "event", "session/update", eventText(updateType, update), update, "")
			case "stop":
				rt.addEvent(m, "system", "session/update", "Session stopped.", update, "")
				if rt.isNonInteractive() {
					stopReason := firstString(update, "reason")
					turnResult := "completed"
					if stopReason != "stop" && stopReason != "" {
						turnResult = "failed"
					}
					rt.settleNonInteractive(m, turnResult, eventText(updateType, update))
				} else {
					rt.markIdle(m)
				}
			default:
				rt.addEvent(m, "event", "session/update", eventText(updateType, update), update, "")
			}
		}
	case "error":
		rt.addEvent(m, "error", method, eventText(method, params), params, "")
		if rt.isNonInteractive() {
			rt.settleNonInteractive(m, "failed", eventText(method, params))
		} else {
			rt.markIdle(m)
		}
	default:
		rt.addEvent(m, "event", method, eventText(method, params), params, "")
	}
}

func (rt *agentRuntime) handleOpencodeReadTextFile(params json.RawMessage) (string, error) {
	path := firstString(params, "path")
	if path == "" {
		return "", errors.New("path is required")
	}
	abs, err := safeWorkspacePath(rt.workspace.Path, path)
	if err != nil {
		return "", err
	}
	data, err := os.ReadFile(abs)
	if err != nil {
		return "", err
	}
	return string(data), nil
}

func (rt *agentRuntime) handleOpencodeWriteTextFile(params json.RawMessage) error {
	path := firstString(params, "path")
	content := firstString(params, "content")
	if path == "" {
		return errors.New("path is required")
	}
	abs, err := safeWorkspacePath(rt.workspace.Path, path)
	if err != nil {
		return err
	}
	if err := os.MkdirAll(filepath.Dir(abs), 0o755); err != nil {
		return err
	}
	return os.WriteFile(abs, []byte(content), 0o644)
}

func (rt *agentRuntime) handleOpencodeTerminalCreate(params json.RawMessage) (map[string]any, error) {
	command := firstString(params, "command")
	cwd := firstString(params, "cwd")
	if cwd == "" {
		cwd = rt.run.Cwd
	}
	absCwd, err := safeWorkspacePath(rt.workspace.Path, cwd)
	if err != nil {
		return nil, err
	}
	env := os.Environ()
	if extra, ok := jsonArray(params, "env"); ok {
		for _, item := range extra {
			var s string
			if err := json.Unmarshal(item, &s); err == nil && s != "" {
				env = append(env, s)
			}
		}
	}
	tid := newTerminalID()
	term := opencodeTerminal{
		id:      tid,
		rt:      rt,
		cmd:     exec.Command("sh", "-c", command),
		cwd:     absCwd,
		env:     env,
		started: true,
	}
	term.cmd.Dir = absCwd
	term.cmd.Env = env
	stdin, err := term.cmd.StdinPipe()
	if err != nil {
		return nil, err
	}
	stdout, err := term.cmd.StdoutPipe()
	if err != nil {
		return nil, err
	}
	stderr, err := term.cmd.StderrPipe()
	if err != nil {
		return nil, err
	}
	term.stdin = stdin
	go term.readLoop(stdout, stderr)
	if err := term.cmd.Start(); err != nil {
		return nil, err
	}
	rt.mu.Lock()
	if rt.opencodeTerminals == nil {
		rt.opencodeTerminals = make(map[string]*opencodeTerminal)
	}
	rt.opencodeTerminals[tid] = &term
	rt.mu.Unlock()
	return map[string]any{"terminalId": tid}, nil
}

func (rt *agentRuntime) handleOpencodeTerminalOutput(params json.RawMessage) (map[string]any, error) {
	terminalID := firstString(params, "terminalId")
	if terminalID == "" {
		return nil, errors.New("terminalId is required")
	}
	rt.mu.Lock()
	term, ok := rt.opencodeTerminals[terminalID]
	rt.mu.Unlock()
	if !ok || term == nil {
		return nil, errors.New("terminal not found")
	}
	output := term.flushOutput()
	return map[string]any{"output": output, "finished": term.finished}, nil
}

func (rt *agentRuntime) handleOpencodeTerminalWaitForExit(params json.RawMessage) (map[string]any, error) {
	terminalID := firstString(params, "terminalId")
	if terminalID == "" {
		return nil, errors.New("terminalId is required")
	}
	rt.mu.Lock()
	term, ok := rt.opencodeTerminals[terminalID]
	rt.mu.Unlock()
	if !ok || term == nil {
		return nil, errors.New("terminal not found")
	}
	exitCode := term.waitForExit()
	output := term.flushOutput()
	return map[string]any{"output": output, "exitCode": exitCode, "finished": true}, nil
}

func (rt *agentRuntime) handleOpencodeTerminalKill(params json.RawMessage) error {
	terminalID := firstString(params, "terminalId")
	if terminalID == "" {
		return errors.New("terminalId is required")
	}
	rt.mu.Lock()
	term, ok := rt.opencodeTerminals[terminalID]
	rt.mu.Unlock()
	if !ok || term == nil {
		return errors.New("terminal not found")
	}
	term.kill()
	return nil
}

func (rt *agentRuntime) handleOpencodeTerminalRelease(params json.RawMessage) error {
	terminalID := firstString(params, "terminalId")
	if terminalID == "" {
		return errors.New("terminalId is required")
	}
	rt.mu.Lock()
	delete(rt.opencodeTerminals, terminalID)
	rt.mu.Unlock()
	return nil
}

func opencodePermissionSummary(params json.RawMessage) string {
	title := firstString(params, "title")
	if title != "" {
		return "Approve permission: " + title
	}
	return "OpenCode is waiting for permission approval."
}

func jsonArray(raw json.RawMessage, key string) ([]json.RawMessage, bool) {
	var obj map[string]json.RawMessage
	if err := json.Unmarshal(raw, &obj); err != nil {
		return nil, false
	}
	arrRaw, ok := obj[key]
	if !ok {
		return nil, false
	}
	var arr []json.RawMessage
	if err := json.Unmarshal(arrRaw, &arr); err != nil {
		return nil, false
	}
	return arr, true
}

var (
	opencodeTerminalMu sync.Mutex
	opencodeTerminalSeq int64
)

func newTerminalID() string {
	opencodeTerminalMu.Lock()
	defer opencodeTerminalMu.Unlock()
	opencodeTerminalSeq++
	return fmt.Sprintf("terminal-%d", opencodeTerminalSeq)
}

type opencodeTerminal struct {
	id       string
	rt       *agentRuntime
	cmd      *exec.Cmd
	stdin    io.WriteCloser
	cwd      string
	env      []string
	started  bool
	finished bool
	exitCode int
	output   []byte
	mu       sync.Mutex
	wg       sync.WaitGroup
}

func (t *opencodeTerminal) readLoop(stdout, stderr io.Reader) {
	t.wg.Add(2)
	go t.copyOutput(stdout)
	go t.copyOutput(stderr)
	t.wg.Wait()
	if err := t.cmd.Wait(); err != nil {
		if exitErr, ok := err.(*exec.ExitError); ok {
			t.exitCode = exitErr.ExitCode()
		}
	}
	t.mu.Lock()
	t.finished = true
	t.mu.Unlock()
}

func (t *opencodeTerminal) copyOutput(r io.Reader) {
	defer t.wg.Done()
	scanner := bufio.NewScanner(r)
	scanner.Buffer(make([]byte, 0, 64*1024), 1024*1024)
	for scanner.Scan() {
		t.mu.Lock()
		t.output = append(t.output, scanner.Bytes()...)
		t.output = append(t.output, '\n')
		t.mu.Unlock()
	}
}

func (t *opencodeTerminal) flushOutput() string {
	t.mu.Lock()
	defer t.mu.Unlock()
	out := string(t.output)
	t.output = nil
	return out
}

func (t *opencodeTerminal) waitForExit() int {
	if t.cmd == nil {
		return t.exitCode
	}
	_ = t.cmd.Wait()
	t.mu.Lock()
	defer t.mu.Unlock()
	return t.exitCode
}

func (t *opencodeTerminal) kill() {
	if t.cmd != nil && t.cmd.Process != nil {
		_ = t.cmd.Process.Kill()
	}
}
