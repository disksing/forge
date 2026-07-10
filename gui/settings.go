package main

import (
	"encoding/json"
	"errors"
	"fmt"
	"net/http"
	"strings"
)

type settingsResponse struct {
	Workspaces         []guiWorkspace        `json:"workspaces"`
	ActiveID           string                `json:"activeId,omitempty"`
	AgentDefaults      agentDefaults         `json:"agentDefaults"`
	DefaultChatAgentID string                `json:"defaultChatAgentId,omitempty"`
	AgentProviders     []agentProviderConfig `json:"agentProviders"`
	Agents             []agentConfig         `json:"agents"`
	Codex              codexStatus           `json:"codex"`
	Opencode           opencodeStatus        `json:"opencode"`
}

type codexStatus struct {
	Running   bool   `json:"running"`
	Enabled   bool   `json:"enabled"`
	PID       int    `json:"pid,omitempty"`
	StartedAt string `json:"startedAt,omitempty"`
}

type opencodeStatus struct {
	Running   bool   `json:"running"`
	Enabled   bool   `json:"enabled"`
	PID       int    `json:"pid,omitempty"`
	StartedAt string `json:"startedAt,omitempty"`
}

const (
	codexProviderID      = "codex"
	codexProviderName    = "Codex app-server"
	opencodeProviderID   = "opencode"
	opencodeProviderName = "OpenCode"
	defaultAgentID       = "codex-default"
)

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
	case "agent/default-chat":
		if r.Method != http.MethodPut {
			w.WriteHeader(http.StatusMethodNotAllowed)
			return
		}
		s.updateDefaultChatAgent(w, r)
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
	case "opencode/start":
		if r.Method != http.MethodPost {
			w.WriteHeader(http.StatusMethodNotAllowed)
			return
		}
		if err := s.setOpencodeEnabled(true); err != nil {
			writeError(w, err, http.StatusBadRequest)
			return
		}
		writeJSON(w, s.opencodeStatus())
	case "opencode/stop":
		if r.Method != http.MethodPost {
			w.WriteHeader(http.StatusMethodNotAllowed)
			return
		}
		if err := s.setOpencodeEnabled(false); err != nil {
			writeError(w, err, http.StatusBadRequest)
			return
		}
		writeJSON(w, s.opencodeStatus())
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
		Workspaces:         cfg.Workspaces,
		ActiveID:           cfg.ActiveID,
		AgentDefaults:      cfg.AgentDefaults,
		DefaultChatAgentID: cfg.DefaultChatAgentID,
		AgentProviders:     cfg.AgentProviders,
		Agents:             cfg.Agents,
		Codex:              s.codexStatus(),
		Opencode:           s.opencodeStatus(),
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

func (s *server) updateDefaultChatAgent(w http.ResponseWriter, r *http.Request) {
	var body struct {
		AgentID string `json:"agentId"`
	}
	if err := json.NewDecoder(r.Body).Decode(&body); err != nil {
		writeError(w, err, http.StatusBadRequest)
		return
	}
	cfg, err := s.loadConfig()
	if err != nil {
		writeError(w, err, http.StatusInternalServerError)
		return
	}
	cfg.DefaultChatAgentID = normalizeDefaultChatAgentID(body.AgentID, cfg.Agents)
	if err := s.saveConfig(cfg); err != nil {
		writeError(w, err, http.StatusInternalServerError)
		return
	}
	writeJSON(w, map[string]string{"defaultChatAgentId": cfg.DefaultChatAgentID})
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
	cfg.Opencode.Enabled = providerEnabled(cfg.AgentProviders, opencodeProviderID) && cfg.Opencode.Enabled
	if !providerEnabled(cfg.AgentProviders, codexProviderID) {
		if err := s.codex.Stop(); err != nil {
			writeError(w, err, http.StatusBadRequest)
			return
		}
	}
	if !providerEnabled(cfg.AgentProviders, opencodeProviderID) {
		if err := s.opencode.Stop(); err != nil {
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
		_ = s.codex.Start(s.agents)
	}
	return s.codex.Status(enabled)
}

func (s *server) opencodeStatus() opencodeStatus {
	cfg, err := s.loadConfig()
	enabled := false
	if err == nil {
		enabled = providerEnabled(cfg.AgentProviders, opencodeProviderID)
	}
	if enabled && cfg.Opencode.Enabled {
		_ = s.opencode.Start(s.agents)
	}
	return s.opencode.Status(enabled)
}

func (s *server) startProvidersIfEnabled() error {
	cfg, err := s.loadConfig()
	if err != nil {
		return err
	}
	var startErrors []error
	if cfg.Codex.Enabled && providerEnabled(cfg.AgentProviders, codexProviderID) {
		if err := s.codex.Start(s.agents); err != nil {
			startErrors = append(startErrors, fmt.Errorf("start Codex provider: %w", err))
		}
	}
	if cfg.Opencode.Enabled && providerEnabled(cfg.AgentProviders, opencodeProviderID) {
		if err := s.opencode.Start(s.agents); err != nil {
			startErrors = append(startErrors, fmt.Errorf("start OpenCode provider: %w", err))
		}
	}
	return errors.Join(startErrors...)
}

func (s *server) setCodexEnabled(enabled bool) error {
	cfg, err := s.loadConfig()
	if err != nil {
		return err
	}
	cfg.AgentProviders = setProviderEnabled(cfg.AgentProviders, codexProviderID, enabled)
	cfg.Codex.Enabled = enabled
	if enabled {
		if err := s.codex.Start(s.agents); err != nil {
			return err
		}
	} else if err := s.codex.Stop(); err != nil {
		return err
	}
	return s.saveConfig(cfg)
}

func (s *server) setOpencodeEnabled(enabled bool) error {
	cfg, err := s.loadConfig()
	if err != nil {
		return err
	}
	cfg.AgentProviders = setProviderEnabled(cfg.AgentProviders, opencodeProviderID, enabled)
	cfg.Opencode.Enabled = enabled
	if enabled {
		if err := s.opencode.Start(s.agents); err != nil {
			return err
		}
	} else if err := s.opencode.Stop(); err != nil {
		return err
	}
	return s.saveConfig(cfg)
}

func normalizeAgentDefaults(defaults agentDefaults) agentDefaults {
	defaults.Sandbox = normalizeSandbox(defaults.Sandbox)
	defaults.Approval = normalizeApproval(defaults.Approval)
	defaults.Model = strings.TrimSpace(defaults.Model)
	return defaults
}

func normalizeDefaultChatAgentID(agentID string, agents []agentConfig) string {
	agentID = strings.TrimSpace(agentID)
	for _, agent := range agents {
		if agent.ID == agentID {
			return agentID
		}
	}
	if len(agents) > 0 {
		return agents[0].ID
	}
	return ""
}

func normalizeAgentProviders(providers []agentProviderConfig) []agentProviderConfig {
	normalized := make([]agentProviderConfig, 0, len(providers)+2)
	seen := make(map[string]bool, len(providers)+2)
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
		if provider.ID == opencodeProviderID {
			provider.Name = opencodeProviderName
			provider.Type = opencodeProviderID
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
	if !seen[opencodeProviderID] {
		normalized = append(normalized, agentProviderConfig{
			ID:      opencodeProviderID,
			Name:    opencodeProviderName,
			Type:    opencodeProviderID,
			Enabled: false,
		})
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
