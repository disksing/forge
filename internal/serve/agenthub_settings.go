package serve

import (
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"os"
	"strings"
)

type agentHubSettingsResponse struct {
	Config             agentHubGUIConfig `json:"config"`
	ConfiguredEndpoint string            `json:"configuredEndpoint"`
	EffectiveEndpoint  string            `json:"effectiveEndpoint"`
	Connected          bool              `json:"connected"`
	Compatible         bool              `json:"compatible"`
	Status             *agentHubStatus   `json:"status,omitempty"`
	Catalog            agentHubCatalog   `json:"catalog"`
	Error              string            `json:"error,omitempty"`
}

type updateAgentHubSettingsRequest struct {
	Endpoint      string                 `json:"endpoint"`
	AgentProfiles []agentHubProfileRoute `json:"agentProfiles"`
}

func (s *server) handleAgentHubSettings(w http.ResponseWriter, r *http.Request) {
	switch r.Method {
	case http.MethodGet:
		response, err := s.readAgentHubSettings(r.Context())
		if err != nil {
			writeError(w, err, http.StatusInternalServerError)
			return
		}
		writeJSON(w, response)
	case http.MethodPut:
		var request updateAgentHubSettingsRequest
		decoder := json.NewDecoder(http.MaxBytesReader(w, r.Body, 1<<20))
		decoder.DisallowUnknownFields()
		if err := decoder.Decode(&request); err != nil {
			writeError(w, err, http.StatusBadRequest)
			return
		}
		response, err := s.saveAgentHubSettings(r.Context(), request)
		if err != nil {
			writeError(w, err, http.StatusBadRequest)
			return
		}
		writeJSON(w, response)
	default:
		w.WriteHeader(http.StatusMethodNotAllowed)
	}
}

func (s *server) readAgentHubSettings(ctx context.Context) (agentHubSettingsResponse, error) {
	cfg, err := readAgentHubConfigFile(s.config)
	if err != nil {
		return agentHubSettingsResponse{}, err
	}
	configured := cfg.AgentHubEndpoint
	if configured == "" {
		configured = defaultAgentHubEndpoint
	}
	effective, err := effectiveAgentHubEndpoint(configured)
	if err != nil {
		return agentHubSettingsResponse{}, err
	}
	response := agentHubSettingsResponse{
		Config:             cfg,
		ConfiguredEndpoint: configured,
		EffectiveEndpoint:  effective,
		Catalog:            agentHubCatalog{Providers: []agentHubProvider{}, Agents: []agentHubAgent{}, Probes: []agentHubProbe{}},
	}
	client, err := newAgentHubClient(effective, nil)
	if err != nil {
		response.Error = err.Error()
		return response, nil
	}
	status, err := client.Status(ctx)
	if err != nil {
		response.Error = err.Error()
		return response, nil
	}
	response.Connected = true
	response.Status = &status
	if err := validateAgentHubStatus(status); err != nil {
		response.Error = err.Error()
		return response, nil
	}
	response.Compatible = true
	catalog, err := client.Agents(ctx)
	if err != nil {
		response.Error = err.Error()
		return response, nil
	}
	response.Catalog = catalog
	cfg, err = normalizeAgentHubConfig(cfg, catalog)
	if err != nil {
		return agentHubSettingsResponse{}, err
	}
	response.Config = cfg
	return response, nil
}

func (s *server) saveAgentHubSettings(ctx context.Context, request updateAgentHubSettingsRequest) (agentHubSettingsResponse, error) {
	cfg, err := readAgentHubConfigFile(s.config)
	if err != nil {
		return agentHubSettingsResponse{}, err
	}
	configured, err := normalizeAgentHubEndpoint(request.Endpoint)
	if err != nil {
		return agentHubSettingsResponse{}, err
	}
	effective := configured
	if override := strings.TrimSpace(os.Getenv("FORGE_AGENTHUB_URL")); override != "" {
		effective, err = normalizeAgentHubEndpoint(override)
		if err != nil {
			return agentHubSettingsResponse{}, err
		}
	}
	client, err := newAgentHubClient(effective, nil)
	if err != nil {
		return agentHubSettingsResponse{}, err
	}
	status, err := client.Status(ctx)
	if err != nil {
		return agentHubSettingsResponse{}, fmt.Errorf("validate AgentHub status: %w", err)
	}
	if err := validateAgentHubStatus(status); err != nil {
		return agentHubSettingsResponse{}, err
	}
	catalog, err := client.Agents(ctx)
	if err != nil {
		return agentHubSettingsResponse{}, fmt.Errorf("validate AgentHub catalog: %w", err)
	}
	cfg.AgentHubEndpoint = configured
	cfg.AgentProfiles = request.AgentProfiles
	cfg, err = normalizeAgentHubConfig(cfg, catalog)
	if err != nil {
		return agentHubSettingsResponse{}, err
	}
	data, err := json.MarshalIndent(cfg, "", "  ")
	if err != nil {
		return agentHubSettingsResponse{}, err
	}
	data = append(data, '\n')
	if err := atomicWriteConfig(s.config, data); err != nil {
		return agentHubSettingsResponse{}, err
	}
	return agentHubSettingsResponse{
		Config:             cfg,
		ConfiguredEndpoint: configured,
		EffectiveEndpoint:  effective,
		Connected:          true,
		Compatible:         true,
		Status:             &status,
		Catalog:            catalog,
	}, nil
}

func readAgentHubConfigFile(path string) (agentHubGUIConfig, error) {
	data, err := os.ReadFile(path)
	if err != nil {
		if os.IsNotExist(err) {
			return agentHubGUIConfig{
				Version: agentHubConfigVersion, Workspaces: []guiWorkspace{},
				AgentHubEndpoint: defaultAgentHubEndpoint,
			}, nil
		}
		return agentHubGUIConfig{}, err
	}
	var version struct {
		Version int `json:"version"`
	}
	if err := json.Unmarshal(data, &version); err != nil {
		return agentHubGUIConfig{}, err
	}
	if version.Version < agentHubConfigVersion {
		return agentHubGUIConfig{}, fmt.Errorf("unsupported Forge GUI configuration version %d; migrate the configuration before starting Forge GUI", version.Version)
	}
	var cfg agentHubGUIConfig
	if err := json.Unmarshal(data, &cfg); err != nil {
		return agentHubGUIConfig{}, err
	}
	return cfg, nil
}

func (s *server) validatePersistedAgentHubConfig(ctx context.Context) (bool, error) {
	cfg, err := readAgentHubConfigFile(s.config)
	if err != nil {
		return false, err
	}
	if cfg.AgentHubInstanceID == "" {
		return false, nil
	}
	effective, err := effectiveAgentHubEndpoint(cfg.AgentHubEndpoint)
	if err != nil {
		return true, err
	}
	client, err := newAgentHubClient(effective, nil)
	if err != nil {
		return true, err
	}
	status, err := client.Status(ctx)
	if err != nil {
		return true, fmt.Errorf("connect to AgentHub: %w", err)
	}
	if err := validateAgentHubStatus(status); err != nil {
		return true, err
	}
	catalog, err := client.Agents(ctx)
	if err != nil {
		return true, err
	}
	_, err = normalizeAgentHubConfig(cfg, catalog)
	return true, err
}
