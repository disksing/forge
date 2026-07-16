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
	DefaultChatAgentID string                `json:"defaultChatAgentId,omitempty"`
	AgentProviders     []agentProviderConfig `json:"agentProviders"`
	Agents             []agentConfig         `json:"agents"`
	AgentProfiles      []agentProfileRoute   `json:"agentProfiles"`
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
	agentOptionModel     = "model"
	agentOptionSandbox   = "sandbox"
	agentOptionApproval  = "approval"
	agentOptionMode      = "mode"
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
	case "agent-profiles":
		if r.Method != http.MethodPut {
			w.WriteHeader(http.StatusMethodNotAllowed)
			return
		}
		s.updateAgentProfiles(w, r)
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
		DefaultChatAgentID: cfg.DefaultChatAgentID,
		AgentProviders:     cfg.AgentProviders,
		Agents:             cfg.Agents,
		AgentProfiles:      cfg.AgentProfiles,
		Codex:              s.codexStatus(),
		Opencode:           s.opencodeStatus(),
	})
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
	cfg.Agents = normalizeAgents(agents, cfg.AgentProviders)
	cfg.AgentProfiles = filterAgentProfileRoutes(cfg.AgentProfiles, cfg.Agents)
	if err := s.saveConfig(cfg); err != nil {
		writeError(w, err, http.StatusInternalServerError)
		return
	}
	writeJSON(w, cfg.Agents)
}

func (s *server) updateAgentProfiles(w http.ResponseWriter, r *http.Request) {
	var profiles []agentProfileRoute
	if err := json.NewDecoder(r.Body).Decode(&profiles); err != nil {
		writeError(w, err, http.StatusBadRequest)
		return
	}
	cfg, err := s.loadConfig()
	if err != nil {
		writeError(w, err, http.StatusInternalServerError)
		return
	}
	profiles, err = normalizeAgentProfileRoutes(profiles, cfg.Agents)
	if err != nil {
		writeError(w, err, http.StatusBadRequest)
		return
	}
	cfg.AgentProfiles = profiles
	if err := s.saveConfig(cfg); err != nil {
		writeError(w, err, http.StatusInternalServerError)
		return
	}
	writeJSON(w, cfg.AgentProfiles)
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

func normalizeAgentProfileRoutes(routes []agentProfileRoute, agents []agentConfig) ([]agentProfileRoute, error) {
	normalized := make([]agentProfileRoute, 0, len(routes))
	seen := make(map[string]bool, len(routes))
	for _, route := range routes {
		key, err := normalizeAgentProfileKey(route.Key)
		if err != nil {
			return nil, err
		}
		if seen[key] {
			return nil, fmt.Errorf("duplicate agent profile: %s", key)
		}
		agentID := strings.TrimSpace(route.AgentID)
		if _, ok := findAgentConfig(agents, agentID); !ok {
			return nil, fmt.Errorf("agent profile %s references missing agent: %s", key, agentID)
		}
		seen[key] = true
		normalized = append(normalized, agentProfileRoute{
			Key:         key,
			Description: strings.Join(strings.Fields(route.Description), " "),
			AgentID:     agentID,
		})
	}
	return normalized, nil
}

func normalizeAgentProfileKey(value string) (string, error) {
	key := strings.ToLower(strings.TrimSpace(value))
	if key == "" {
		return "", errors.New("agent profile key is required")
	}
	for _, r := range key {
		if (r >= 'a' && r <= 'z') || (r >= '0' && r <= '9') || r == '.' || r == '_' || r == '-' {
			continue
		}
		return "", fmt.Errorf("invalid agent profile %q: use lowercase letters, numbers, '.', '_', or '-'", value)
	}
	return key, nil
}

func filterAgentProfileRoutes(routes []agentProfileRoute, agents []agentConfig) []agentProfileRoute {
	filtered := make([]agentProfileRoute, 0, len(routes))
	for _, route := range routes {
		if _, ok := findAgentConfig(agents, route.AgentID); ok {
			filtered = append(filtered, route)
		}
	}
	return filtered
}

func findAgentProfileRoute(routes []agentProfileRoute, key string) (agentProfileRoute, bool) {
	key = strings.ToLower(strings.TrimSpace(key))
	for _, route := range routes {
		if route.Key == key {
			return route, true
		}
	}
	return agentProfileRoute{}, false
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

func normalizeAgents(agents []agentConfig, providers []agentProviderConfig) []agentConfig {
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
		agent = normalizeAgentOptions(agent, agentProviderType(providers, agent.ProviderID))
		seen[agent.ID] = true
		normalized = append(normalized, agent)
	}
	if len(normalized) == 0 {
		normalized = append(normalized, agentConfig{
			ID:         defaultAgentID,
			Name:       "Codex",
			ProviderID: codexProviderID,
			Options:    defaultCodexAgentOptions(),
		})
	}
	return normalized
}

func normalizeAgentOptions(agent agentConfig, providerType string) agentConfig {
	option := func(key string) string {
		return strings.TrimSpace(agent.Options[key])
	}
	model := option(agentOptionModel)
	switch providerType {
	case opencodeProviderID:
		mode := normalizeOpencodeMode(option(agentOptionMode))
		agent.Options = map[string]string{agentOptionMode: mode}
		if model != "" {
			agent.Options[agentOptionModel] = model
		}
	default:
		agent.Options = map[string]string{
			agentOptionSandbox:  normalizeSandbox(option(agentOptionSandbox)),
			agentOptionApproval: normalizeApproval(option(agentOptionApproval)),
		}
		if model != "" {
			agent.Options[agentOptionModel] = model
		}
	}
	return agent
}

func agentProviderType(providers []agentProviderConfig, providerID string) string {
	if provider, ok := findAgentProvider(providers, providerID); ok {
		return provider.Type
	}
	return strings.TrimSpace(providerID)
}

func defaultCodexAgentOptions() map[string]string {
	return map[string]string{
		agentOptionSandbox:  "workspace-write",
		agentOptionApproval: "on-request",
	}
}

func normalizeOpencodeMode(value string) string {
	if strings.TrimSpace(value) == "plan" {
		return "plan"
	}
	return "build"
}

func agentOption(agent agentConfig, key string) string {
	return strings.TrimSpace(agent.Options[key])
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
