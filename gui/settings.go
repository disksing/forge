package main

import (
	"encoding/json"
	"errors"
	"fmt"
	"net/http"
	"os"
	"os/exec"
	"strings"
	"sync"
	"syscall"
	"time"
)

type settingsResponse struct {
	Workspaces     []guiWorkspace        `json:"workspaces"`
	ActiveID       string                `json:"activeId,omitempty"`
	AgentDefaults  agentDefaults         `json:"agentDefaults"`
	AgentProviders []agentProviderConfig `json:"agentProviders"`
	Agents         []agentConfig         `json:"agents"`
	Codex          codexStatus           `json:"codex"`
}

type codexStatus struct {
	Running   bool   `json:"running"`
	Enabled   bool   `json:"enabled"`
	PID       int    `json:"pid,omitempty"`
	StartedAt string `json:"startedAt,omitempty"`
}

type codexAppServer struct {
	mu        sync.Mutex
	client    *codexClient
	startedAt string
}

const (
	codexProviderID   = "codex"
	codexProviderName = "Codex app-server"
	defaultAgentID    = "codex-default"
)

func newCodexAppServer() *codexAppServer {
	return &codexAppServer{}
}

func (s *server) handleSettings(w http.ResponseWriter, r *http.Request) {
	path := strings.Trim(strings.TrimPrefix(r.URL.Path, "/api/settings"), "/")
	if path == "" {
		switch r.Method {
		case http.MethodGet:
			s.writeSettings(w)
		default:
			w.WriteHeader(http.StatusMethodNotAllowed)
		}
		return
	}

	switch path {
	case "agent/defaults":
		if r.Method != http.MethodPut {
			w.WriteHeader(http.StatusMethodNotAllowed)
			return
		}
		s.updateAgentDefaults(w, r)
	case "agent/providers":
		if r.Method != http.MethodPut {
			w.WriteHeader(http.StatusMethodNotAllowed)
			return
		}
		s.updateAgentProviders(w, r)
	case "agents":
		if r.Method != http.MethodPut {
			w.WriteHeader(http.StatusMethodNotAllowed)
			return
		}
		s.updateAgents(w, r)
	case "codex/start":
		if r.Method != http.MethodPost {
			w.WriteHeader(http.StatusMethodNotAllowed)
			return
		}
		if err := s.setCodexEnabled(true); err != nil {
			writeError(w, err, http.StatusBadRequest)
			return
		}
		writeJSON(w, s.codexStatus())
	case "codex/stop":
		if r.Method != http.MethodPost {
			w.WriteHeader(http.StatusMethodNotAllowed)
			return
		}
		if err := s.setCodexEnabled(false); err != nil {
			writeError(w, err, http.StatusBadRequest)
			return
		}
		writeJSON(w, s.codexStatus())
	default:
		http.NotFound(w, r)
	}
}

func (s *server) writeSettings(w http.ResponseWriter) {
	cfg, err := s.loadConfig()
	if err != nil {
		writeError(w, err, http.StatusInternalServerError)
		return
	}
	writeJSON(w, settingsResponse{
		Workspaces:     cfg.Workspaces,
		ActiveID:       cfg.ActiveID,
		AgentDefaults:  cfg.AgentDefaults,
		AgentProviders: cfg.AgentProviders,
		Agents:         cfg.Agents,
		Codex:          s.codexStatus(),
	})
}

func (s *server) updateAgentDefaults(w http.ResponseWriter, r *http.Request) {
	var defaults agentDefaults
	if err := json.NewDecoder(r.Body).Decode(&defaults); err != nil {
		writeError(w, err, http.StatusBadRequest)
		return
	}
	cfg, err := s.loadConfig()
	if err != nil {
		writeError(w, err, http.StatusInternalServerError)
		return
	}
	cfg.AgentDefaults = normalizeAgentDefaults(defaults)
	cfg.Agents = updateDefaultAgentFromDefaults(cfg.Agents, cfg.AgentDefaults)
	if err := s.saveConfig(cfg); err != nil {
		writeError(w, err, http.StatusInternalServerError)
		return
	}
	writeJSON(w, cfg.AgentDefaults)
}

func (s *server) updateAgentProviders(w http.ResponseWriter, r *http.Request) {
	var providers []agentProviderConfig
	if err := json.NewDecoder(r.Body).Decode(&providers); err != nil {
		writeError(w, err, http.StatusBadRequest)
		return
	}
	cfg, err := s.loadConfig()
	if err != nil {
		writeError(w, err, http.StatusInternalServerError)
		return
	}
	cfg.AgentProviders = normalizeAgentProviders(providers)
	cfg.Codex.Enabled = providerEnabled(cfg.AgentProviders, codexProviderID) && cfg.Codex.Enabled
	if !providerEnabled(cfg.AgentProviders, codexProviderID) {
		if err := s.codex.stop(); err != nil {
			writeError(w, err, http.StatusBadRequest)
			return
		}
	}
	if err := s.saveConfig(cfg); err != nil {
		writeError(w, err, http.StatusInternalServerError)
		return
	}
	writeJSON(w, cfg.AgentProviders)
}

func (s *server) updateAgents(w http.ResponseWriter, r *http.Request) {
	var agents []agentConfig
	if err := json.NewDecoder(r.Body).Decode(&agents); err != nil {
		writeError(w, err, http.StatusBadRequest)
		return
	}
	cfg, err := s.loadConfig()
	if err != nil {
		writeError(w, err, http.StatusInternalServerError)
		return
	}
	cfg.Agents = normalizeAgents(agents, cfg.AgentDefaults)
	if len(cfg.Agents) > 0 {
		cfg.AgentDefaults = normalizeAgentDefaults(agentDefaults{
			Sandbox:  cfg.Agents[0].Sandbox,
			Approval: cfg.Agents[0].Approval,
			Model:    cfg.Agents[0].Model,
		})
	}
	if err := s.saveConfig(cfg); err != nil {
		writeError(w, err, http.StatusInternalServerError)
		return
	}
	writeJSON(w, cfg.Agents)
}

func (s *server) codexStatus() codexStatus {
	cfg, err := s.loadConfig()
	enabled := false
	if err == nil {
		enabled = providerEnabled(cfg.AgentProviders, codexProviderID)
	}
	if enabled && cfg.Codex.Enabled {
		_ = s.codex.start(s.agents)
	}
	return s.codex.status(enabled)
}

func (s *server) startCodexIfEnabled() error {
	cfg, err := s.loadConfig()
	if err != nil || !cfg.Codex.Enabled || !providerEnabled(cfg.AgentProviders, codexProviderID) {
		return err
	}
	return s.codex.start(s.agents)
}

func (s *server) setCodexEnabled(enabled bool) error {
	cfg, err := s.loadConfig()
	if err != nil {
		return err
	}
	cfg.AgentProviders = setProviderEnabled(cfg.AgentProviders, codexProviderID, enabled)
	cfg.Codex.Enabled = enabled
	if enabled {
		if err := s.codex.start(s.agents); err != nil {
			return err
		}
	} else if err := s.codex.stop(); err != nil {
		return err
	}
	return s.saveConfig(cfg)
}

func (s *server) codexClient(m *agentManager) (*codexClient, error) {
	if m == nil {
		m = s.agents
	}
	if err := s.codex.start(m); err != nil {
		return nil, err
	}
	cfg, err := s.loadConfig()
	if err != nil {
		return nil, err
	}
	if !cfg.Codex.Enabled {
		cfg.Codex.Enabled = true
		cfg.AgentProviders = setProviderEnabled(cfg.AgentProviders, codexProviderID, true)
		if err := s.saveConfig(cfg); err != nil {
			return nil, err
		}
	}
	return s.codex.getClient(m)
}

func (c *codexAppServer) status(enabled bool) codexStatus {
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

func (c *codexAppServer) start(m *agentManager) error {
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

func (c *codexAppServer) getClient(m *agentManager) (*codexClient, error) {
	if err := c.start(m); err != nil {
		return nil, err
	}
	c.mu.Lock()
	defer c.mu.Unlock()
	if c.client == nil {
		return nil, errors.New("codex app-server is not running")
	}
	return c.client, nil
}

func (c *codexAppServer) stop() error {
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

func normalizeAgentDefaults(defaults agentDefaults) agentDefaults {
	defaults.Sandbox = normalizeSandbox(defaults.Sandbox)
	defaults.Approval = normalizeApproval(defaults.Approval)
	defaults.Model = strings.TrimSpace(defaults.Model)
	return defaults
}

func normalizeAgentProviders(providers []agentProviderConfig) []agentProviderConfig {
	normalized := make([]agentProviderConfig, 0, len(providers)+1)
	seen := make(map[string]bool, len(providers)+1)
	for _, provider := range providers {
		provider.ID = strings.TrimSpace(provider.ID)
		if provider.ID == "" || seen[provider.ID] {
			continue
		}
		provider.Name = strings.TrimSpace(provider.Name)
		provider.Type = strings.TrimSpace(provider.Type)
		if provider.Name == "" {
			provider.Name = provider.ID
		}
		if provider.Type == "" {
			provider.Type = provider.ID
		}
		if provider.ID == codexProviderID {
			provider.Name = codexProviderName
			provider.Type = codexProviderID
		}
		seen[provider.ID] = true
		normalized = append(normalized, provider)
	}
	if !seen[codexProviderID] {
		normalized = append([]agentProviderConfig{{
			ID:      codexProviderID,
			Name:    codexProviderName,
			Type:    codexProviderID,
			Enabled: true,
		}}, normalized...)
	}
	return normalized
}

func normalizeAgents(agents []agentConfig, defaults agentDefaults) []agentConfig {
	defaults = normalizeAgentDefaults(defaults)
	normalized := make([]agentConfig, 0, len(agents)+1)
	seen := make(map[string]bool, len(agents)+1)
	for _, agent := range agents {
		agent.ID = strings.TrimSpace(agent.ID)
		agent.Name = strings.TrimSpace(agent.Name)
		agent.ProviderID = strings.TrimSpace(agent.ProviderID)
		if agent.ID == "" {
			agent.ID = slugID(agent.Name)
		}
		if agent.ID == "" || seen[agent.ID] {
			continue
		}
		if agent.Name == "" {
			agent.Name = agent.ID
		}
		if agent.ProviderID == "" {
			agent.ProviderID = codexProviderID
		}
		agent.Sandbox = normalizeSandbox(agent.Sandbox)
		agent.Approval = normalizeApproval(agent.Approval)
		agent.Model = strings.TrimSpace(agent.Model)
		seen[agent.ID] = true
		normalized = append(normalized, agent)
	}
	if len(normalized) == 0 {
		name := "Codex"
		if defaults.Model != "" {
			name = defaults.Model
		}
		normalized = append(normalized, agentConfig{
			ID:         defaultAgentID,
			Name:       name,
			ProviderID: codexProviderID,
			Sandbox:    defaults.Sandbox,
			Approval:   defaults.Approval,
			Model:      defaults.Model,
		})
	}
	return normalized
}

func updateDefaultAgentFromDefaults(agents []agentConfig, defaults agentDefaults) []agentConfig {
	agents = normalizeAgents(agents, defaults)
	agents[0].Sandbox = defaults.Sandbox
	agents[0].Approval = defaults.Approval
	agents[0].Model = defaults.Model
	if agents[0].Name == "" || agents[0].ID == defaultAgentID {
		agents[0].Name = "Codex"
		if defaults.Model != "" {
			agents[0].Name = defaults.Model
		}
	}
	return agents
}

func providerEnabled(providers []agentProviderConfig, id string) bool {
	id = strings.TrimSpace(id)
	for _, provider := range providers {
		if provider.ID == id {
			return provider.Enabled
		}
	}
	return false
}

func setProviderEnabled(providers []agentProviderConfig, id string, enabled bool) []agentProviderConfig {
	providers = normalizeAgentProviders(providers)
	for i := range providers {
		if providers[i].ID == id {
			providers[i].Enabled = enabled
			return providers
		}
	}
	return providers
}

func slugID(value string) string {
	value = strings.ToLower(strings.TrimSpace(value))
	var b strings.Builder
	lastDash := false
	for _, r := range value {
		if (r >= 'a' && r <= 'z') || (r >= '0' && r <= '9') {
			b.WriteRune(r)
			lastDash = false
			continue
		}
		if !lastDash {
			b.WriteByte('-')
			lastDash = true
		}
	}
	return strings.Trim(b.String(), "-")
}
