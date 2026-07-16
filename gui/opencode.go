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
	"unicode/utf8"
)

const opencodeProtocolVersion = 1

type opencodeAppServer struct {
	mu           sync.Mutex
	client       *opencodeClient
	startedAt    string
	capabilities opencodeAgentCapabilities
}

type opencodeAgentCapabilities struct {
	LoadSession         bool                       `json:"loadSession"`
	SessionCapabilities map[string]json.RawMessage `json:"sessionCapabilities"`
}

func (c opencodeAgentCapabilities) supportsSessionMethod(name string) bool {
	raw, ok := c.SessionCapabilities[name]
	return ok && len(raw) > 0 && string(raw) != "null"
}

type opencodeInitializeResult struct {
	ProtocolVersion   int                       `json:"protocolVersion"`
	AgentCapabilities opencodeAgentCapabilities `json:"agentCapabilities"`
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

type opencodeConfigOption struct {
	ID           string                       `json:"id"`
	Category     string                       `json:"category"`
	Type         string                       `json:"type"`
	CurrentValue string                       `json:"currentValue"`
	Options      []opencodeConfigOptionChoice `json:"options"`
}

type opencodeConfigOptionChoice struct {
	Value string `json:"value"`
}

type opencodeSessionResult struct {
	SessionID     string                 `json:"sessionId"`
	ConfigOptions []opencodeConfigOption `json:"configOptions"`
}

type opencodePermissionOption struct {
	OptionID string `json:"optionId"`
	Kind     string `json:"kind"`
}

type opencodePermissionRequest struct {
	Options []opencodePermissionOption `json:"options"`
}

type opencodeEnvVariable struct {
	Name  string `json:"name"`
	Value string `json:"value"`
}

type opencodeReadTextFileRequest struct {
	Path  string `json:"path"`
	Line  *int   `json:"line"`
	Limit *int   `json:"limit"`
}

type opencodeWriteTextFileRequest struct {
	Path    string `json:"path"`
	Content string `json:"content"`
}

type opencodeCreateTerminalRequest struct {
	Command         string                `json:"command"`
	Args            []string              `json:"args"`
	Env             []opencodeEnvVariable `json:"env"`
	Cwd             string                `json:"cwd"`
	OutputByteLimit *int                  `json:"outputByteLimit"`
}

type opencodeTerminalRequest struct {
	TerminalID string `json:"terminalId"`
}

func newOpencodeAppServer() *opencodeAppServer { return &opencodeAppServer{} }

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
			o.capabilities = opencodeAgentCapabilities{}
		}
		o.mu.Unlock()
	}()
	o.client = client
	o.startedAt = time.Now().Format(time.RFC3339)
	result, err := client.request("initialize", map[string]any{
		"protocolVersion": opencodeProtocolVersion,
		"clientCapabilities": map[string]any{
			"fs": map[string]any{
				"readTextFile":  true,
				"writeTextFile": true,
			},
			"terminal": true,
		},
		"clientInfo": map[string]any{
			"name":    "forge_gui",
			"title":   "Forge GUI",
			"version": "0.1.0",
		},
	})
	if err != nil {
		client.close()
		o.client = nil
		o.startedAt = ""
		return fmt.Errorf("initialize opencode acp: %w", err)
	}
	var initialized opencodeInitializeResult
	if err := json.Unmarshal(result, &initialized); err != nil {
		client.close()
		o.client = nil
		o.startedAt = ""
		return fmt.Errorf("decode opencode initialize response: %w", err)
	}
	if initialized.ProtocolVersion != opencodeProtocolVersion {
		client.close()
		o.client = nil
		o.startedAt = ""
		return fmt.Errorf("unsupported opencode ACP protocol version: %d", initialized.ProtocolVersion)
	}
	o.capabilities = initialized.AgentCapabilities
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
	o.capabilities = opencodeAgentCapabilities{}
	return nil
}

func (o *opencodeAppServer) IsRunning() bool {
	o.mu.Lock()
	defer o.mu.Unlock()
	o.pruneLocked()
	return o.client != nil && o.client.cmd != nil && o.client.cmd.Process != nil
}

func (o *opencodeAppServer) Done() <-chan struct{} {
	o.mu.Lock()
	defer o.mu.Unlock()
	o.pruneLocked()
	if o.client == nil {
		return closedProviderDone()
	}
	return o.client.done
}

func (o *opencodeAppServer) Status(enabled bool) opencodeStatus {
	o.mu.Lock()
	defer o.mu.Unlock()
	o.pruneLocked()
	if o.client == nil || o.client.cmd == nil || o.client.cmd.Process == nil {
		return opencodeStatus{Enabled: enabled}
	}
	return opencodeStatus{Running: true, Enabled: enabled, PID: o.client.cmd.Process.Pid, StartedAt: o.startedAt}
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
		o.capabilities = opencodeAgentCapabilities{}
		return
	default:
	}
	if err := o.client.cmd.Process.Signal(syscall.Signal(0)); err != nil {
		o.client = nil
		o.startedAt = ""
		o.capabilities = opencodeAgentCapabilities{}
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
		"cwd":        rt.run.Cwd,
		"mcpServers": []any{},
	})
	if err != nil {
		return err
	}
	var session opencodeSessionResult
	if err := json.Unmarshal(result, &session); err != nil {
		return fmt.Errorf("decode session/new response: %w", err)
	}
	if session.SessionID == "" {
		return errors.New("session/new returned no session id")
	}
	if err := o.configureSession(client, rt, session); err != nil {
		return err
	}
	rt.mu.Lock()
	rt.run.ProviderSessionID = session.SessionID
	if !rt.stopRequested {
		rt.run.Status = "running"
	}
	rt.run.UpdatedAt = time.Now().Format(time.RFC3339)
	run := rt.run
	rt.mu.Unlock()
	_ = saveAgentRun(rt.workspace.Path, run)
	client.registerRuntime(run.ID, session.SessionID, rt)
	rt.addEvent(rt.manager, "system", "session/new", "OpenCode session started.", result, "")
	return nil
}

func (o *opencodeAppServer) ResumeSession(rt *agentRuntime) error {
	client, err := o.ensureClient(rt.manager)
	if err != nil {
		return err
	}
	o.mu.Lock()
	supported := o.capabilities.supportsSessionMethod("resume")
	o.mu.Unlock()
	if !supported {
		return errors.New("opencode does not advertise session/resume support")
	}
	sessionID := strings.TrimSpace(rt.run.ProviderSessionID)
	if sessionID == "" {
		return errors.New("no session id to resume")
	}
	runID := rt.run.ID
	client.registerRuntime(runID, sessionID, rt)
	result, err := client.request("session/resume", map[string]any{
		"sessionId": sessionID,
		"cwd":       rt.run.Cwd,
	})
	if err != nil {
		client.unregisterRuntime(runID, sessionID)
		return err
	}
	var session opencodeSessionResult
	if len(result) > 0 && string(result) != "null" {
		if err := json.Unmarshal(result, &session); err != nil {
			client.unregisterRuntime(runID, sessionID)
			return fmt.Errorf("decode session/resume response: %w", err)
		}
	}
	if session.SessionID != "" {
		if session.SessionID != sessionID {
			client.unregisterRuntime(runID, sessionID)
		}
		sessionID = session.SessionID
	}
	session.SessionID = sessionID
	if err := o.configureSession(client, rt, session); err != nil {
		client.unregisterRuntime(runID, sessionID)
		return err
	}
	rt.mu.Lock()
	rt.run.ProviderSessionID = sessionID
	if !rt.stopRequested {
		rt.run.Status = "running"
	}
	rt.run.UpdatedAt = time.Now().Format(time.RFC3339)
	run := rt.run
	rt.mu.Unlock()
	_ = saveAgentRun(rt.workspace.Path, run)
	client.registerRuntime(runID, sessionID, rt)
	rt.addEvent(rt.manager, "system", "session/resume", "OpenCode session resumed.", result, "")
	return nil
}

func (o *opencodeAppServer) configureSession(client *opencodeClient, rt *agentRuntime, session opencodeSessionResult) error {
	rt.mu.Lock()
	model := strings.TrimSpace(rt.run.Model)
	sandbox := rt.run.Sandbox
	rt.mu.Unlock()
	settings, err := opencodeSessionSettings(session.ConfigOptions, model, sandbox)
	if err != nil {
		return err
	}
	for configID, value := range settings {
		if _, err := client.request("session/set_config_option", map[string]any{
			"sessionId": session.SessionID,
			"configId":  configID,
			"value":     value,
		}); err != nil {
			return fmt.Errorf("set opencode session option %s: %w", configID, err)
		}
	}
	return nil
}

func opencodeSessionSettings(options []opencodeConfigOption, model, sandbox string) (map[string]string, error) {
	settings := make(map[string]string)
	model = strings.TrimSpace(model)
	modelOptionFound := false
	modeOptionFound := false
	for _, option := range options {
		switch option.Category {
		case "model":
			modelOptionFound = true
			if model == "" {
				continue
			}
			if !configOptionHasValue(option, model) {
				return nil, fmt.Errorf("opencode model %q is not available; choose one of: %s", model, strings.Join(configOptionValues(option), ", "))
			}
			settings[option.ID] = model
		case "mode":
			modeOptionFound = true
			if sandbox != "read-only" {
				continue
			}
			if !configOptionHasValue(option, "plan") {
				return nil, errors.New("opencode plan mode is not available")
			}
			settings[option.ID] = "plan"
		}
	}
	if len(options) > 0 && model != "" && !modelOptionFound {
		return nil, errors.New("opencode session does not expose a model option")
	}
	if len(options) > 0 && sandbox == "read-only" && !modeOptionFound {
		return nil, errors.New("opencode session does not expose a mode option")
	}
	return settings, nil
}

func configOptionHasValue(option opencodeConfigOption, value string) bool {
	if option.CurrentValue == value {
		return true
	}
	for _, choice := range option.Options {
		if choice.Value == value {
			return true
		}
	}
	return false
}

func configOptionValues(option opencodeConfigOption) []string {
	values := make([]string, 0, len(option.Options)+1)
	seen := make(map[string]bool, len(option.Options)+1)
	for _, value := range append([]opencodeConfigOptionChoice{{Value: option.CurrentValue}}, option.Options...) {
		value.Value = strings.TrimSpace(value.Value)
		if value.Value == "" || seen[value.Value] {
			continue
		}
		seen[value.Value] = true
		values = append(values, value.Value)
	}
	return values
}

func (o *opencodeAppServer) SendPrompt(rt *agentRuntime, text string) error {
	client, err := o.ensureClient(rt.manager)
	if err != nil {
		return err
	}
	rt.mu.Lock()
	sessionID := rt.run.ProviderSessionID
	runID := rt.run.ID
	rt.mu.Unlock()
	if sessionID == "" {
		return errors.New("opencode session is not ready")
	}
	text = rt.withForgeSessionContext(text)
	client.registerRuntime(runID, sessionID, rt)
	go func() {
		result, requestErr := client.request("session/prompt", map[string]any{
			"sessionId": sessionID,
			"prompt": []map[string]any{{
				"type": "text",
				"text": text,
			}},
		})
		rt.handleOpencodePromptResult(requestErr, result)
	}()
	return nil
}

func (o *opencodeAppServer) SendInput(_ *agentRuntime, _ string) error {
	return errors.New("OpenCode does not support steering an active prompt; wait for the turn to finish")
}

func (o *opencodeAppServer) Interrupt(rt *agentRuntime) error {
	client, err := o.getClient()
	if err != nil {
		return err
	}
	rt.mu.Lock()
	sessionID := rt.run.ProviderSessionID
	pending := make([]pendingApproval, 0, len(rt.pending))
	for _, request := range rt.pending {
		pending = append(pending, request)
	}
	rt.mu.Unlock()
	if sessionID != "" {
		client.notify("session/cancel", map[string]any{"sessionId": sessionID})
	}
	for _, request := range pending {
		response := map[string]any{"outcome": map[string]any{"outcome": "cancelled"}}
		_ = client.respond(request.id, response)
	}
	return nil
}

func (o *opencodeAppServer) CloseSession(rt *agentRuntime) error {
	client, err := o.getClient()
	if err != nil {
		return nil
	}
	rt.mu.Lock()
	sessionID := rt.run.ProviderSessionID
	runID := rt.run.ID
	terminals := rt.opencodeTerminals
	rt.opencodeTerminals = nil
	rt.mu.Unlock()
	for _, terminal := range terminals {
		terminal.release()
	}
	client.unregisterRuntime(runID, sessionID)
	o.mu.Lock()
	supported := o.capabilities.supportsSessionMethod("close")
	o.mu.Unlock()
	if sessionID == "" || !supported {
		return nil
	}
	_, err = client.request("session/close", map[string]any{"sessionId": sessionID})
	return err
}

func (o *opencodeAppServer) ResolveApproval(pending pendingApproval, decision string) (any, error) {
	client, err := o.getClient()
	if err != nil {
		return nil, err
	}
	response, err := opencodeApprovalResponse(pending.params, decision)
	if err != nil {
		return nil, err
	}
	return response, client.respond(pending.id, response)
}

func opencodeApprovalResponse(params json.RawMessage, decision string) (map[string]any, error) {
	if decision == "cancel" {
		return map[string]any{"outcome": map[string]any{"outcome": "cancelled"}}, nil
	}
	var request opencodePermissionRequest
	if err := json.Unmarshal(params, &request); err != nil {
		return nil, fmt.Errorf("decode permission options: %w", err)
	}
	preferred := []string{"reject_once", "reject_always"}
	if decision == "accept" {
		preferred = []string{"allow_once", "allow_always"}
	} else if decision == "acceptForSession" {
		preferred = []string{"allow_always", "allow_once"}
	}
	for _, kind := range preferred {
		for _, option := range request.Options {
			if option.Kind == kind && option.OptionID != "" {
				return map[string]any{"outcome": map[string]any{
					"outcome":  "selected",
					"optionId": option.OptionID,
				}}, nil
			}
		}
	}
	return nil, fmt.Errorf("permission request has no option for decision %q", decision)
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
	id, key, ch := c.nextRequest()
	if err := c.write(map[string]any{"jsonrpc": "2.0", "id": id, "method": method, "params": params}); err != nil {
		c.removeWaiter(key)
		return nil, err
	}
	timer := time.NewTimer(15 * time.Minute)
	defer timer.Stop()
	select {
	case response := <-ch:
		return response.result, response.err
	case <-timer.C:
		c.removeWaiter(key)
		return nil, fmt.Errorf("%s timed out", method)
	case <-c.done:
		c.removeWaiter(key)
		return nil, errors.New("opencode acp exited")
	}
}

func (c *opencodeClient) notify(method string, params any) {
	_ = c.write(map[string]any{"jsonrpc": "2.0", "method": method, "params": params})
}

func (c *opencodeClient) respond(id json.RawMessage, result any) error {
	return c.write(map[string]any{"jsonrpc": "2.0", "id": id, "result": result})
}

func (c *opencodeClient) respondError(id json.RawMessage, code int, message string) error {
	return c.write(map[string]any{
		"jsonrpc": "2.0",
		"id":      id,
		"error": map[string]any{
			"code":    code,
			"message": message,
		},
	})
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

func (c *opencodeClient) nextRequest() (json.RawMessage, string, chan rpcResponse) {
	c.mu.Lock()
	defer c.mu.Unlock()
	id := json.RawMessage(strconv.FormatInt(c.nextID, 10))
	c.nextID++
	key := string(id)
	ch := make(chan rpcResponse, 1)
	c.waiting[key] = ch
	return id, key, ch
}

func (c *opencodeClient) removeWaiter(key string) {
	c.mu.Lock()
	delete(c.waiting, key)
	c.mu.Unlock()
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
}

func (c *opencodeClient) stderrLoop(stderr io.Reader) {
	scanner := bufio.NewScanner(stderr)
	scanner.Buffer(make([]byte, 0, 64*1024), 1024*1024)
	for scanner.Scan() {
		_ = strings.TrimSpace(scanner.Text())
	}
}

func (c *opencodeClient) registerRuntime(runID, sessionID string, rt *agentRuntime) {
	c.mu.Lock()
	defer c.mu.Unlock()
	c.runIDBySession[sessionID] = runID
	c.runtimeByRunID[runID] = rt
}

func (c *opencodeClient) unregisterRuntime(runID, sessionID string) {
	c.mu.Lock()
	defer c.mu.Unlock()
	delete(c.runtimeByRunID, runID)
	if c.runIDBySession[sessionID] == runID {
		delete(c.runIDBySession, sessionID)
	}
}

func (c *opencodeClient) runtimeForSession(sessionID string) *agentRuntime {
	c.mu.Lock()
	defer c.mu.Unlock()
	runID, ok := c.runIDBySession[sessionID]
	if !ok {
		return nil
	}
	return c.runtimeByRunID[runID]
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
				_ = c.respondError(idRaw, -32602, "session is not managed by Forge GUI")
				return
			}
			rt.handleOpencodeServerRequest(c, idRaw, method, params)
			return
		}
		key := string(idRaw)
		c.mu.Lock()
		ch := c.waiting[key]
		delete(c.waiting, key)
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
	if method == "" {
		return
	}
	params := envelope["params"]
	sessionID := firstString(params, "sessionId", "session_id")
	if rt := c.runtimeForSession(sessionID); rt != nil {
		rt.handleOpencodeNotification(c.manager, method, params)
	}
}

func (rt *agentRuntime) handleOpencodeServerRequest(client *opencodeClient, id json.RawMessage, method string, params json.RawMessage) {
	switch method {
	case "session/request_permission":
		requestID := string(id)
		rt.mu.Lock()
		rt.pending[requestID] = pendingApproval{
			id:     append(json.RawMessage(nil), id...),
			method: method,
			params: append(json.RawMessage(nil), params...),
		}
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
			_ = client.respondError(id, -32602, err.Error())
			return
		}
		_ = client.respond(id, map[string]any{"content": content})
	case "fs/write_text_file":
		if err := rt.handleOpencodeWriteTextFile(params); err != nil {
			_ = client.respondError(id, -32602, err.Error())
			return
		}
		_ = client.respond(id, nil)
	case "terminal/create":
		result, err := rt.handleOpencodeTerminalCreate(params)
		if err != nil {
			_ = client.respondError(id, -32602, err.Error())
			return
		}
		_ = client.respond(id, result)
	case "terminal/output":
		result, err := rt.handleOpencodeTerminalOutput(params)
		if err != nil {
			_ = client.respondError(id, -32602, err.Error())
			return
		}
		_ = client.respond(id, result)
	case "terminal/wait_for_exit":
		result, err := rt.handleOpencodeTerminalWaitForExit(params)
		if err != nil {
			_ = client.respondError(id, -32602, err.Error())
			return
		}
		_ = client.respond(id, result)
	case "terminal/kill":
		if err := rt.handleOpencodeTerminalKill(params); err != nil {
			_ = client.respondError(id, -32602, err.Error())
			return
		}
		_ = client.respond(id, nil)
	case "terminal/release":
		if err := rt.handleOpencodeTerminalRelease(params); err != nil {
			_ = client.respondError(id, -32602, err.Error())
			return
		}
		_ = client.respond(id, nil)
	default:
		_ = client.respondError(id, -32601, "unsupported by Forge GUI")
		rt.addEvent(client.manager, "server_request", method, fmt.Sprintf("Unsupported opencode request: %s", method), params, "")
	}
}

func (rt *agentRuntime) handleOpencodeNotification(m *agentManager, method string, params json.RawMessage) {
	if method != "session/update" {
		rt.addEvent(m, "event", method, eventText(method, params), params, "")
		return
	}
	var notification struct {
		Update json.RawMessage `json:"update"`
	}
	if err := json.Unmarshal(params, &notification); err != nil || len(notification.Update) == 0 {
		rt.addEvent(m, "error", method, "Invalid OpenCode session update.", params, "")
		return
	}
	update := notification.Update
	updateType := firstString(update, "sessionUpdate")
	switch updateType {
	case "agent_message_chunk":
		text := nestedString(update, "content", "text")
		rt.addEvent(m, "assistant_delta", method, text, update, "")
	case "agent_thought_chunk":
		text := nestedString(update, "content", "text")
		rt.addEvent(m, "reasoning_delta", method, text, update, "")
	case "tool_call", "tool_call_update":
		rt.addEvent(m, "tool", method, eventText(updateType, update), update, "")
	case "plan", "plan_update", "plan_removed":
		rt.addEvent(m, "system", method, eventText(updateType, update), update, "")
	case "available_commands_update", "current_mode_update", "config_option_update", "session_info_update", "usage_update":
		rt.addEvent(m, "metadata", method, eventText(updateType, update), update, "")
	default:
		rt.addEvent(m, "event", method, eventText(updateType, update), update, "")
	}
}

func (rt *agentRuntime) handleOpencodePromptResult(requestErr error, result json.RawMessage) {
	rt.mu.Lock()
	stopped := rt.stopRequested
	rt.mu.Unlock()
	if stopped {
		return
	}
	if requestErr != nil {
		rt.addEvent(rt.manager, "error", "session/prompt", requestErr.Error(), nil, "")
		if rt.isSchedulerTurn() {
			rt.finishSchedulerTurn(rt.manager, requestErr.Error())
		} else {
			rt.markIdle(rt.manager)
		}
		return
	}
	stopReason := firstString(result, "stopReason")
	if stopReason == "" {
		stopReason = "end_turn"
	}
	rt.addEvent(rt.manager, "system", "session/prompt", "OpenCode turn finished: "+stopReason+".", result, "")
	if rt.isSchedulerTurn() {
		rt.finishSchedulerTurn(rt.manager, "OpenCode stop reason: "+stopReason)
		return
	}
	rt.markIdle(rt.manager)
}

func (rt *agentRuntime) handleOpencodeReadTextFile(params json.RawMessage) (string, error) {
	var request opencodeReadTextFileRequest
	if err := json.Unmarshal(params, &request); err != nil {
		return "", err
	}
	abs, err := safeACPWorkspacePath(rt.workspace.Path, request.Path, false)
	if err != nil {
		return "", err
	}
	data, err := os.ReadFile(abs)
	if err != nil {
		return "", err
	}
	if request.Line == nil && request.Limit == nil {
		return string(data), nil
	}
	lines := strings.SplitAfter(string(data), "\n")
	start := 0
	if request.Line != nil && *request.Line > 1 {
		start = *request.Line - 1
	}
	if start >= len(lines) {
		return "", nil
	}
	end := len(lines)
	if request.Limit != nil && *request.Limit >= 0 && start+*request.Limit < end {
		end = start + *request.Limit
	}
	return strings.Join(lines[start:end], ""), nil
}

func (rt *agentRuntime) handleOpencodeWriteTextFile(params json.RawMessage) error {
	var request opencodeWriteTextFileRequest
	if err := json.Unmarshal(params, &request); err != nil {
		return err
	}
	abs, err := safeACPWorkspacePath(rt.workspace.Path, request.Path, true)
	if err != nil {
		return err
	}
	if err := os.MkdirAll(filepath.Dir(abs), 0o755); err != nil {
		return err
	}
	return os.WriteFile(abs, []byte(request.Content), 0o644)
}

func safeACPWorkspacePath(root, requested string, allowMissing bool) (string, error) {
	if !filepath.IsAbs(requested) {
		return "", errors.New("ACP path must be absolute")
	}
	rootAbs, err := filepath.Abs(root)
	if err != nil {
		return "", err
	}
	targetAbs := filepath.Clean(requested)
	if err := ensurePathInside(rootAbs, targetAbs); err != nil {
		return "", err
	}
	rootEval, err := filepath.EvalSymlinks(rootAbs)
	if err != nil {
		return "", fmt.Errorf("resolve workspace root: %w", err)
	}
	if targetEval, err := filepath.EvalSymlinks(targetAbs); err == nil {
		if err := ensurePathInside(rootEval, targetEval); err != nil {
			return "", err
		}
		return targetAbs, nil
	} else if !allowMissing || !os.IsNotExist(err) {
		return "", err
	}
	if info, err := os.Lstat(targetAbs); err == nil && info.Mode()&os.ModeSymlink != 0 {
		return "", errors.New("refusing to write through a dangling symlink")
	}
	ancestor := filepath.Dir(targetAbs)
	for {
		ancestorEval, evalErr := filepath.EvalSymlinks(ancestor)
		if evalErr == nil {
			if err := ensurePathInside(rootEval, ancestorEval); err != nil {
				return "", err
			}
			return targetAbs, nil
		}
		if !os.IsNotExist(evalErr) {
			return "", evalErr
		}
		if info, err := os.Lstat(ancestor); err == nil && info.Mode()&os.ModeSymlink != 0 {
			return "", errors.New("refusing to write through a dangling symlink")
		}
		next := filepath.Dir(ancestor)
		if next == ancestor {
			return "", errors.New("could not resolve an existing parent directory")
		}
		ancestor = next
	}
}

func (rt *agentRuntime) handleOpencodeTerminalCreate(params json.RawMessage) (map[string]any, error) {
	var request opencodeCreateTerminalRequest
	if err := json.Unmarshal(params, &request); err != nil {
		return nil, err
	}
	if strings.TrimSpace(request.Command) == "" {
		return nil, errors.New("command is required")
	}
	cwd := request.Cwd
	if cwd == "" {
		cwd = rt.run.Cwd
	}
	absCwd, err := safeACPWorkspacePath(rt.workspace.Path, cwd, false)
	if err != nil {
		return nil, err
	}
	info, err := os.Stat(absCwd)
	if err != nil {
		return nil, err
	}
	if !info.IsDir() {
		return nil, errors.New("terminal cwd is not a directory")
	}
	env := mergeOpencodeTerminalEnv(os.Environ(), request.Env, rt.run)
	limit := 1024 * 1024
	if request.OutputByteLimit != nil && *request.OutputByteLimit >= 0 {
		limit = *request.OutputByteLimit
	}
	terminal := newOpencodeTerminal(newTerminalID(), exec.Command(request.Command, request.Args...), limit)
	terminal.cmd.Dir = absCwd
	terminal.cmd.Env = env
	terminal.cmd.SysProcAttr = &syscall.SysProcAttr{Setpgid: true}
	stdout, err := terminal.cmd.StdoutPipe()
	if err != nil {
		return nil, err
	}
	stderr, err := terminal.cmd.StderrPipe()
	if err != nil {
		return nil, err
	}
	if err := terminal.cmd.Start(); err != nil {
		return nil, err
	}
	terminal.start(stdout, stderr)
	rt.mu.Lock()
	if rt.opencodeTerminals == nil {
		rt.opencodeTerminals = make(map[string]*opencodeTerminal)
	}
	rt.opencodeTerminals[terminal.id] = terminal
	rt.mu.Unlock()
	return map[string]any{"terminalId": terminal.id}, nil
}

func mergeOpencodeTerminalEnv(base []string, extra []opencodeEnvVariable, run agentRun) []string {
	values := make(map[string]string, len(base)+len(extra)+3)
	order := make([]string, 0, len(base)+len(extra)+3)
	set := func(name, value string) {
		if name == "" {
			return
		}
		if _, ok := values[name]; !ok {
			order = append(order, name)
		}
		values[name] = value
	}
	for _, item := range base {
		name, value, ok := strings.Cut(item, "=")
		if ok {
			set(name, value)
		}
	}
	for _, item := range extra {
		set(item.Name, item.Value)
	}
	if run.ForgeSessionID != "" {
		set("FORGE_SESSION_ID", run.ForgeSessionID)
	}
	result := make([]string, 0, len(order))
	for _, name := range order {
		result = append(result, name+"="+values[name])
	}
	return result
}

func (rt *agentRuntime) opencodeTerminal(params json.RawMessage) (*opencodeTerminal, error) {
	var request opencodeTerminalRequest
	if err := json.Unmarshal(params, &request); err != nil {
		return nil, err
	}
	if request.TerminalID == "" {
		return nil, errors.New("terminalId is required")
	}
	rt.mu.Lock()
	terminal := rt.opencodeTerminals[request.TerminalID]
	rt.mu.Unlock()
	if terminal == nil {
		return nil, errors.New("terminal not found")
	}
	return terminal, nil
}

func (rt *agentRuntime) handleOpencodeTerminalOutput(params json.RawMessage) (map[string]any, error) {
	terminal, err := rt.opencodeTerminal(params)
	if err != nil {
		return nil, err
	}
	return terminal.outputResult(), nil
}

func (rt *agentRuntime) handleOpencodeTerminalWaitForExit(params json.RawMessage) (map[string]any, error) {
	terminal, err := rt.opencodeTerminal(params)
	if err != nil {
		return nil, err
	}
	return terminal.waitResult(), nil
}

func (rt *agentRuntime) handleOpencodeTerminalKill(params json.RawMessage) error {
	terminal, err := rt.opencodeTerminal(params)
	if err != nil {
		return err
	}
	terminal.kill()
	return nil
}

func (rt *agentRuntime) handleOpencodeTerminalRelease(params json.RawMessage) error {
	terminal, err := rt.opencodeTerminal(params)
	if err != nil {
		return err
	}
	terminal.release()
	rt.mu.Lock()
	delete(rt.opencodeTerminals, terminal.id)
	rt.mu.Unlock()
	return nil
}

func opencodePermissionSummary(params json.RawMessage) string {
	if title := nestedString(params, "toolCall", "title"); title != "" {
		return "Approve permission: " + title
	}
	return "OpenCode is waiting for permission approval."
}

var (
	opencodeTerminalMu  sync.Mutex
	opencodeTerminalSeq int64
)

func newTerminalID() string {
	opencodeTerminalMu.Lock()
	defer opencodeTerminalMu.Unlock()
	opencodeTerminalSeq++
	return fmt.Sprintf("terminal-%d", opencodeTerminalSeq)
}

type opencodeTerminal struct {
	id              string
	cmd             *exec.Cmd
	outputByteLimit int
	mu              sync.Mutex
	output          []byte
	truncated       bool
	finished        bool
	exitCode        *int
	signal          *string
	done            chan struct{}
	doneOnce        sync.Once
}

func newOpencodeTerminal(id string, cmd *exec.Cmd, outputByteLimit int) *opencodeTerminal {
	return &opencodeTerminal{id: id, cmd: cmd, outputByteLimit: outputByteLimit, done: make(chan struct{})}
}

func (t *opencodeTerminal) start(stdout, stderr io.Reader) {
	var readers sync.WaitGroup
	readers.Add(2)
	go func() { defer readers.Done(); t.copyOutput(stdout) }()
	go func() { defer readers.Done(); t.copyOutput(stderr) }()
	go func() {
		readers.Wait()
		err := t.cmd.Wait()
		t.mu.Lock()
		if err == nil {
			code := 0
			t.exitCode = &code
		} else {
			if exitErr, ok := err.(*exec.ExitError); ok {
				if status, ok := exitErr.Sys().(syscall.WaitStatus); ok && status.Signaled() {
					signal := status.Signal().String()
					t.signal = &signal
				} else {
					code := exitErr.ExitCode()
					t.exitCode = &code
				}
			}
		}
		t.finished = true
		t.mu.Unlock()
		t.doneOnce.Do(func() { close(t.done) })
	}()
}

func (t *opencodeTerminal) copyOutput(reader io.Reader) {
	buffer := make([]byte, 32*1024)
	for {
		n, err := reader.Read(buffer)
		if n > 0 {
			t.appendOutput(buffer[:n])
		}
		if err != nil {
			return
		}
	}
}

func (t *opencodeTerminal) appendOutput(data []byte) {
	t.mu.Lock()
	defer t.mu.Unlock()
	t.output = append(t.output, data...)
	if t.outputByteLimit >= 0 && len(t.output) > t.outputByteLimit {
		drop := len(t.output) - t.outputByteLimit
		t.output = append([]byte(nil), t.output[drop:]...)
		t.truncated = true
		for len(t.output) > 0 && !utf8.RuneStart(t.output[0]) {
			t.output = t.output[1:]
		}
	}
}

func (t *opencodeTerminal) outputResult() map[string]any {
	t.mu.Lock()
	defer t.mu.Unlock()
	result := map[string]any{
		"output":    strings.ToValidUTF8(string(t.output), ""),
		"truncated": t.truncated,
	}
	if t.finished {
		result["exitStatus"] = map[string]any{"exitCode": t.exitCode, "signal": t.signal}
	}
	return result
}

func (t *opencodeTerminal) waitResult() map[string]any {
	<-t.done
	t.mu.Lock()
	defer t.mu.Unlock()
	return map[string]any{"exitCode": t.exitCode, "signal": t.signal}
}

func (t *opencodeTerminal) kill() {
	t.mu.Lock()
	finished := t.finished
	t.mu.Unlock()
	if finished || t.cmd == nil || t.cmd.Process == nil {
		return
	}
	if pgid, err := syscall.Getpgid(t.cmd.Process.Pid); err == nil {
		_ = syscall.Kill(-pgid, syscall.SIGKILL)
		return
	}
	_ = t.cmd.Process.Kill()
}

func (t *opencodeTerminal) release() {
	t.kill()
	<-t.done
}
