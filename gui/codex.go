package main

import (
	"bufio"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"os"
	"os/exec"
	"strconv"
	"strings"
	"sync"
	"syscall"
	"time"
)

type agentProvider interface {
	ID() string
	Start(m *agentManager) error
	Stop() error
	IsRunning() bool
	Done() <-chan struct{}
	NewSession(rt *agentRuntime) error
	ResumeSession(rt *agentRuntime) error
	SendPrompt(rt *agentRuntime, text string) error
	SendInput(rt *agentRuntime, text string) error
	Interrupt(rt *agentRuntime) error
	CloseSession(rt *agentRuntime) error
	ResolveApproval(pending pendingApproval, decision string) (any, error)
}

type codexAppServer struct {
	mu        sync.Mutex
	manager   *agentManager
	client    *codexClient
	startedAt string
}

func newCodexAppServer() *codexAppServer {
	return &codexAppServer{}
}

func (c *codexAppServer) ID() string { return codexProviderID }

func (c *codexAppServer) Start(m *agentManager) error {
	c.mu.Lock()
	defer c.mu.Unlock()
	c.pruneLocked()
	if c.client != nil && c.client.cmd != nil && c.client.cmd.Process != nil {
		return nil
	}
	bin := strings.TrimSpace(os.Getenv("FORGE_CODEX_CLI"))
	if bin == "" {
		bin = "codex"
	}
	cmd := exec.Command(bin, "app-server")
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
	client := newCodexClient(m, cmd, stdin)
	if err := cmd.Start(); err != nil {
		return fmt.Errorf("start codex app-server: %w", err)
	}
	go client.readLoop(stdout)
	go client.stderrLoop(stderr)
	go func() {
		_ = cmd.Wait()
		client.markClosed()
		close(client.done)
		c.mu.Lock()
		if c.client == client {
			c.client = nil
			c.startedAt = ""
		}
		c.mu.Unlock()
	}()
	c.client = client
	c.startedAt = time.Now().Format(time.RFC3339)
	if _, err := client.request("initialize", map[string]any{
		"clientInfo": map[string]any{
			"name":    "forge_gui",
			"title":   "Forge GUI",
			"version": "0.1.0",
		},
		"capabilities": map[string]any{"experimentalApi": true},
	}); err != nil {
		client.close()
		c.client = nil
		c.startedAt = ""
		return fmt.Errorf("initialize codex app-server: %w", err)
	}
	client.notify("initialized", map[string]any{})
	return nil
}

func (c *codexAppServer) Stop() error {
	c.mu.Lock()
	defer c.mu.Unlock()
	c.pruneLocked()
	if c.client == nil {
		return nil
	}
	c.client.close()
	c.client = nil
	c.startedAt = ""
	return nil
}

func (c *codexAppServer) IsRunning() bool {
	c.mu.Lock()
	defer c.mu.Unlock()
	c.pruneLocked()
	return c.client != nil && c.client.cmd != nil && c.client.cmd.Process != nil
}

func (c *codexAppServer) Done() <-chan struct{} {
	c.mu.Lock()
	defer c.mu.Unlock()
	c.pruneLocked()
	if c.client == nil {
		return closedProviderDone()
	}
	return c.client.done
}

func (c *codexAppServer) Status(enabled bool) codexStatus {
	c.mu.Lock()
	defer c.mu.Unlock()
	c.pruneLocked()
	if c.client == nil || c.client.cmd == nil || c.client.cmd.Process == nil {
		return codexStatus{Enabled: enabled}
	}
	return codexStatus{
		Running:   true,
		Enabled:   enabled,
		PID:       c.client.cmd.Process.Pid,
		StartedAt: c.startedAt,
	}
}

func (c *codexAppServer) getClient() (*codexClient, error) {
	c.mu.Lock()
	defer c.mu.Unlock()
	c.pruneLocked()
	if c.client == nil {
		return nil, errors.New("codex app-server is not running")
	}
	return c.client, nil
}

func (c *codexAppServer) pruneLocked() {
	if c.client == nil || c.client.cmd == nil || c.client.cmd.Process == nil {
		return
	}
	select {
	case <-c.client.done:
		c.client = nil
		c.startedAt = ""
		return
	default:
	}
	if err := c.client.cmd.Process.Signal(syscall.Signal(0)); err != nil {
		c.client = nil
		c.startedAt = ""
	}
}

func (c *codexAppServer) NewSession(rt *agentRuntime) error {
	client, err := c.ensureClient(rt.manager)
	if err != nil {
		return err
	}
	threadParams := map[string]any{
		"cwd":               rt.run.Cwd,
		"sandbox":           rt.run.Sandbox,
		"approvalPolicy":    rt.run.Approval,
		"approvalsReviewer": "user",
		"threadSource":      "api",
		"config":            forgeThreadConfig(rt.run),
	}
	if rt.run.Model != "" {
		threadParams["model"] = rt.run.Model
	}
	result, err := client.request("thread/start", threadParams)
	if err != nil {
		return err
	}
	threadID := firstString(result, "threadId", "id")
	if threadID == "" {
		threadID = nestedString(result, "thread", "id")
	}
	if threadID == "" {
		return errors.New("thread/start returned no thread id")
	}
	rt.mu.Lock()
	rt.run.CodexThreadID = threadID
	rt.run.ProviderSessionID = threadID
	if !rt.stopRequested {
		rt.run.Status = "running"
	}
	rt.run.UpdatedAt = time.Now().Format(time.RFC3339)
	rt.mu.Unlock()
	_ = saveAgentRun(rt.workspace.Path, rt.run)
	rt.addEvent(rt.manager, "system", "thread/start", "Codex thread started.", result, "")
	return nil
}

func (c *codexAppServer) ResumeSession(rt *agentRuntime) error {
	client, err := c.ensureClient(rt.manager)
	if err != nil {
		return err
	}
	threadID := strings.TrimSpace(rt.run.CodexThreadID)
	if threadID == "" {
		return errors.New("no thread id to resume")
	}
	threadParams := map[string]any{
		"threadId":          threadID,
		"cwd":               rt.run.Cwd,
		"sandbox":           rt.run.Sandbox,
		"approvalPolicy":    rt.run.Approval,
		"approvalsReviewer": "user",
		"config":            forgeThreadConfig(rt.run),
	}
	if rt.run.Model != "" {
		threadParams["model"] = rt.run.Model
	}
	result, err := client.request("thread/resume", threadParams)
	if err != nil {
		return err
	}
	if resID := firstString(result, "threadId", "id"); resID != "" {
		threadID = resID
	} else if resID := nestedString(result, "thread", "id"); resID != "" {
		threadID = resID
	}
	rt.mu.Lock()
	rt.run.CodexThreadID = threadID
	rt.run.ProviderSessionID = threadID
	if !rt.stopRequested {
		rt.run.Status = "running"
	}
	rt.run.UpdatedAt = time.Now().Format(time.RFC3339)
	rt.mu.Unlock()
	_ = saveAgentRun(rt.workspace.Path, rt.run)
	rt.addEvent(rt.manager, "system", "thread/resume", "Codex thread resumed.", result, "")
	return nil
}

func (c *codexAppServer) SendPrompt(rt *agentRuntime, text string) error {
	client, err := c.ensureClient(rt.manager)
	if err != nil {
		return err
	}
	rt.mu.Lock()
	threadID := rt.run.CodexThreadID
	model := rt.run.Model
	approval := rt.run.Approval
	cwd := rt.run.Cwd
	rt.mu.Unlock()
	if threadID == "" {
		return errors.New("codex thread is not ready")
	}
	text = rt.withForgeSessionContext(text)
	params := map[string]any{
		"threadId":       threadID,
		"cwd":            cwd,
		"approvalPolicy": approval,
		"input":          []map[string]string{{"type": "text", "text": text}},
	}
	if model != "" {
		params["model"] = model
	}
	_, err = client.request("turn/start", params)
	return err
}

func (c *codexAppServer) SendInput(rt *agentRuntime, text string) error {
	client, err := c.ensureClient(rt.manager)
	if err != nil {
		return err
	}
	rt.mu.Lock()
	threadID := rt.run.CodexThreadID
	turnID := rt.run.CodexTurnID
	schedulerTurn := rt.run.SchedulerTurn
	rt.mu.Unlock()
	if threadID == "" {
		return errors.New("codex thread is not ready")
	}
	if turnID != "" {
		_, err := client.request("turn/steer", map[string]any{
			"threadId":       threadID,
			"expectedTurnId": turnID,
			"input":          []map[string]string{{"type": "text", "text": rt.withForgeSessionContext(text)}},
		})
		return err
	}
	if schedulerTurn {
		return errors.New("AutoRun turn is starting; try again")
	}
	return c.SendPrompt(rt, text)
}

func (c *codexAppServer) Interrupt(rt *agentRuntime) error {
	client, err := c.ensureClient(rt.manager)
	if err != nil {
		return err
	}
	rt.mu.Lock()
	threadID := rt.run.CodexThreadID
	turnID := rt.run.CodexTurnID
	rt.mu.Unlock()
	if client != nil && threadID != "" && turnID != "" {
		_, _ = client.request("turn/interrupt", map[string]any{"threadId": threadID, "turnId": turnID})
	}
	return nil
}

func (c *codexAppServer) CloseSession(_ *agentRuntime) error { return nil }

func (c *codexAppServer) ResolveApproval(pending pendingApproval, decision string) (any, error) {
	client, err := c.getClient()
	if err != nil {
		return nil, err
	}
	response := approvalResponse(pending.method, decision)
	return response, client.respond(pending.id, response)
}

func (c *codexAppServer) ensureClient(m *agentManager) (*codexClient, error) {
	if err := c.Start(m); err != nil {
		return nil, err
	}
	return c.getClient()
}

func forgeThreadConfig(run agentRun) map[string]any {
	config := map[string]any{}
	if sessionID := strings.TrimSpace(run.ForgeSessionID); sessionID != "" {
		config["shell_environment_policy.set.FORGE_SESSION_ID"] = sessionID
	}
	return config
}

func (rt *agentRuntime) withForgeSessionContext(text string) string {
	rt.mu.Lock()
	sessionID := strings.TrimSpace(rt.run.ForgeSessionID)
	contextPath := strings.TrimSpace(rt.run.ForgeSessionContextPath)
	schedulerTurn := rt.run.SchedulerTurn
	generation := rt.run.AutoRunGeneration
	rt.mu.Unlock()
	if sessionID == "" {
		return text
	}
	var b strings.Builder
	b.WriteString("Forge session context:\n")
	b.WriteString("- This run is managed by Forge GUI.\n")
	if schedulerTurn {
		b.WriteString(fmt.Sprintf("- AutoRun generation: %d. This turn was started by the scheduler.\n", generation))
		b.WriteString("- Before ending, run exactly one of: forge task autorun complete, forge task autorun wait, forge task autorun pause, or forge task autorun fail as the last side-effecting command.\n")
	}
	b.WriteString("- FORGE_SESSION_ID=")
	b.WriteString(sessionID)
	b.WriteString("\n")
	if contextPath != "" {
		b.WriteString("- Session context file: ")
		b.WriteString(contextPath)
		b.WriteString("\n")
	}
	b.WriteString("- This session and the current directory resource are managed by Forge GUI. Do not create another Forge session, do not lock/unlock the current resource, and do not end this session yourself.\n")
	b.WriteString("- If the process environment does not contain FORGE_SESSION_ID, use the id above as the managed session id for temporary locks on other resources only.\n")
	if catalog := rt.agentProfileCatalog(); catalog != "" {
		b.WriteString(catalog)
	}
	b.WriteString("\n")
	b.WriteString("User request:\n")
	b.WriteString(text)
	return b.String()
}

func (rt *agentRuntime) agentProfileCatalog() string {
	if rt.manager == nil || rt.manager.server == nil {
		return ""
	}
	cfg, err := rt.manager.server.loadConfig()
	if err != nil || len(cfg.AgentProfiles) == 0 {
		return ""
	}
	var lines []string
	for _, route := range cfg.AgentProfiles {
		if !agentConfigAvailable(cfg, route.AgentID) {
			continue
		}
		agent, _ := findAgentConfig(cfg.Agents, route.AgentID)
		provider, _ := findAgentProvider(cfg.AgentProviders, agent.ProviderID)
		clean := func(value string) string { return strings.Join(strings.Fields(value), " ") }
		parts := []string{clean(agent.Name), clean(provider.Name)}
		if model := agentOption(agent, agentOptionModel); model != "" {
			parts = append(parts, "model "+clean(model))
		}
		if provider.Type == opencodeProviderID {
			parts = append(parts, agentOption(agent, agentOptionMode)+" mode")
		}
		if route.Description != "" {
			parts = append([]string{clean(route.Description)}, parts...)
		}
		lines = append(lines, fmt.Sprintf("  - %s: %s", route.Key, strings.Join(parts, " · ")))
	}
	if len(lines) == 0 {
		return ""
	}
	return "- Available Agent Profiles for AutoRun child tasks:\n" + strings.Join(lines, "\n") + "\n- When creating an AutoRun task, use repeatable --agent-profile=<profile> preferences instead of GUI Agent IDs.\n"
}

func codexThreadReadyText(method string) string {
	if method == "thread/resume" {
		return "Codex thread resumed."
	}
	return "Codex thread started."
}

type rpcResponse struct {
	result json.RawMessage
	err    error
}

type codexClient struct {
	manager *agentManager
	cmd     *exec.Cmd
	stdin   io.WriteCloser
	mu      sync.Mutex
	closeMu sync.Mutex
	closed  bool
	nextID  int64
	waiting map[int64]chan rpcResponse
	done    chan struct{}
}

func newCodexClient(m *agentManager, cmd *exec.Cmd, stdin io.WriteCloser) *codexClient {
	return &codexClient{
		manager: m,
		cmd:     cmd,
		stdin:   stdin,
		nextID:  1,
		waiting: make(map[int64]chan rpcResponse),
		done:    make(chan struct{}),
	}
}

func agentProcessEnv(forgeSessionID string) []string {
	env := os.Environ()
	if forgeSessionID == "" {
		return env
	}
	filtered := make([]string, 0, len(env)+1)
	for _, item := range env {
		if !strings.HasPrefix(item, "FORGE_SESSION_ID=") {
			filtered = append(filtered, item)
		}
	}
	return append(filtered, "FORGE_SESSION_ID="+forgeSessionID)
}

func (c *codexClient) request(method string, params any) (json.RawMessage, error) {
	id, ch := c.nextRequest()
	if err := c.write(map[string]any{"id": id, "method": method, "params": params}); err != nil {
		return nil, err
	}
	select {
	case response := <-ch:
		return response.result, response.err
	case <-time.After(15 * time.Minute):
		return nil, fmt.Errorf("%s timed out", method)
	case <-c.done:
		return nil, errors.New("codex app-server exited")
	}
}

func (c *codexClient) notify(method string, params any) {
	_ = c.write(map[string]any{"method": method, "params": params})
}

func (c *codexClient) respond(id json.RawMessage, result any) error {
	payload, err := json.Marshal(result)
	if err != nil {
		return err
	}
	line := fmt.Sprintf(`{"id":%s,"result":%s}`+"\n", string(id), string(payload))
	c.mu.Lock()
	defer c.mu.Unlock()
	_, err = c.stdin.Write([]byte(line))
	return err
}

func (c *codexClient) close() {
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

func (c *codexClient) markClosed() {
	c.closeMu.Lock()
	c.closed = true
	c.closeMu.Unlock()
}

func (c *codexClient) isClosed() bool {
	c.closeMu.Lock()
	defer c.closeMu.Unlock()
	return c.closed
}

func (c *codexClient) nextRequest() (int64, chan rpcResponse) {
	c.mu.Lock()
	defer c.mu.Unlock()
	id := c.nextID
	c.nextID++
	ch := make(chan rpcResponse, 1)
	c.waiting[id] = ch
	return id, ch
}

func (c *codexClient) write(message any) error {
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

func (c *codexClient) readLoop(stdout io.Reader) {
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

func (c *codexClient) stderrLoop(stderr io.Reader) {
	scanner := bufio.NewScanner(stderr)
	scanner.Buffer(make([]byte, 0, 64*1024), 1024*1024)
	for scanner.Scan() {
		text := strings.TrimSpace(scanner.Text())
		_ = text
	}
}

func (c *codexClient) handleLine(line []byte) {
	var envelope map[string]json.RawMessage
	if err := json.Unmarshal(line, &envelope); err != nil {
		return
	}
	method := rawString(envelope["method"])
	if idRaw, ok := envelope["id"]; ok {
		if method != "" {
			rt := c.runtimeForParams(envelope["params"])
			if rt == nil {
				_ = c.respond(idRaw, map[string]any{"error": "thread is not managed by Forge GUI"})
				return
			}
			rt.handleServerRequest(c, idRaw, method, envelope["params"])
			return
		}
		id, _ := strconv.ParseInt(strings.Trim(string(idRaw), `"`), 10, 64)
		c.mu.Lock()
		ch := c.waiting[id]
		delete(c.waiting, id)
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
		if rt := c.runtimeForParams(envelope["params"]); rt != nil {
			rt.handleNotification(c.manager, method, envelope["params"])
		}
	}
}

func (c *codexClient) runtimeForParams(params json.RawMessage) *agentRuntime {
	threadID := firstString(params, "threadId", "thread_id")
	if threadID == "" {
		threadID = nestedString(params, "thread", "id")
	}
	if threadID == "" || c.manager == nil {
		return nil
	}
	return c.manager.runtimeByThreadID(threadID)
}

func isClosedPipeError(err error) bool {
	if err == nil {
		return false
	}
	if errors.Is(err, os.ErrClosed) {
		return true
	}
	text := strings.ToLower(err.Error())
	return strings.Contains(text, "file already closed") || strings.Contains(text, "use of closed file")
}

func isApprovalMethod(method string) bool {
	return method == "item/commandExecution/requestApproval" ||
		method == "item/fileChange/requestApproval" ||
		method == "item/permissions/requestApproval"
}

func approvalResponse(method, decision string) any {
	decision = strings.TrimSpace(decision)
	if decision == "" {
		decision = "decline"
	}
	switch method {
	case "item/permissions/requestApproval":
		return map[string]any{
			"permissions": map[string]any{},
			"scope":       "turn",
		}
	default:
		if decision != "accept" && decision != "acceptForSession" && decision != "cancel" {
			decision = "decline"
		}
		return map[string]any{"decision": decision}
	}
}

func approvalSummary(method string, params json.RawMessage) string {
	switch method {
	case "item/commandExecution/requestApproval":
		if command := firstString(params, "command"); command != "" {
			return "Approve command: " + command
		}
	case "item/fileChange/requestApproval":
		return "Approve file changes."
	case "item/permissions/requestApproval":
		return "Approve additional permissions."
	}
	return "Codex is waiting for approval."
}
