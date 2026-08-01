package main

import (
	"crypto/rand"
	"encoding/hex"
	"errors"
	"fmt"
	"os"
	"path/filepath"
	"strings"
)

const (
	agentHubConfigVersion = 2
	agentHubSourceApp     = "forge"
)

type agentHubGUIConfig struct {
	Version                  int                    `json:"version"`
	ActiveID                 string                 `json:"activeId,omitempty"`
	Workspaces               []guiWorkspace         `json:"workspaces"`
	AgentHubEndpoint         string                 `json:"agentHubEndpoint"`
	AgentHubInstanceID       string                 `json:"agentHubInstanceId"`
	DefaultAgentHubAgentName string                 `json:"defaultAgentHubAgentName"`
	AgentProfiles            []agentHubProfileRoute `json:"agentProfiles,omitempty"`
}

type agentHubProfileRoute struct {
	Key         string `json:"key"`
	Description string `json:"description,omitempty"`
	AgentName   string `json:"agentName"`
}

func effectiveAgentHubEndpoint(configured string) (string, error) {
	if override := strings.TrimSpace(os.Getenv("FORGE_AGENTHUB_URL")); override != "" {
		return normalizeAgentHubEndpoint(override)
	}
	return normalizeAgentHubEndpoint(configured)
}

func newAgentHubInstanceID() (string, error) {
	var random [16]byte
	if _, err := rand.Read(random[:]); err != nil {
		return "", fmt.Errorf("generate AgentHub instance id: %w", err)
	}
	return "forge-" + hex.EncodeToString(random[:]), nil
}

func normalizeAgentHubConfig(cfg agentHubGUIConfig, catalog agentHubCatalog) (agentHubGUIConfig, error) {
	cfg.Version = agentHubConfigVersion
	if cfg.Workspaces == nil {
		cfg.Workspaces = []guiWorkspace{}
	}
	endpoint, err := normalizeAgentHubEndpoint(cfg.AgentHubEndpoint)
	if err != nil {
		return agentHubGUIConfig{}, err
	}
	cfg.AgentHubEndpoint = endpoint
	cfg.AgentHubInstanceID = strings.TrimSpace(cfg.AgentHubInstanceID)
	if cfg.AgentHubInstanceID == "" {
		cfg.AgentHubInstanceID, err = newAgentHubInstanceID()
		if err != nil {
			return agentHubGUIConfig{}, err
		}
	}
	available := availableAgentHubAgents(catalog)
	cfg.DefaultAgentHubAgentName, err = canonicalAgentHubAgentName(cfg.DefaultAgentHubAgentName, available)
	if err != nil {
		return agentHubGUIConfig{}, fmt.Errorf("default AgentHub agent: %w", err)
	}
	if cfg.DefaultAgentHubAgentName == "" && len(available) > 0 {
		cfg.DefaultAgentHubAgentName = available[0].Name
	}
	cfg.AgentProfiles, err = normalizeAgentHubProfileRoutes(cfg.AgentProfiles, available)
	if err != nil {
		return agentHubGUIConfig{}, err
	}
	return cfg, nil
}

func normalizeAgentHubProfileRoutes(routes []agentHubProfileRoute, agents []agentHubAgent) ([]agentHubProfileRoute, error) {
	normalized := make([]agentHubProfileRoute, 0, len(routes))
	seen := make(map[string]bool, len(routes))
	for _, route := range routes {
		key := strings.ToLower(strings.TrimSpace(route.Key))
		if key == "" {
			return nil, errors.New("Agent Profile key is required")
		}
		if seen[key] {
			return nil, fmt.Errorf("duplicate Agent Profile key: %s", key)
		}
		agentName, err := canonicalAgentHubAgentName(route.AgentName, agents)
		if err != nil || agentName == "" {
			return nil, fmt.Errorf("Agent Profile %s references unavailable AgentHub agent %q", key, route.AgentName)
		}
		seen[key] = true
		normalized = append(normalized, agentHubProfileRoute{
			Key:         key,
			Description: strings.Join(strings.Fields(route.Description), " "),
			AgentName:   agentName,
		})
	}
	return normalized, nil
}

func canonicalAgentHubAgentName(name string, agents []agentHubAgent) (string, error) {
	name = strings.TrimSpace(name)
	if name == "" {
		return "", nil
	}
	var matches []string
	for _, agent := range agents {
		if strings.EqualFold(strings.TrimSpace(agent.Name), name) {
			matches = append(matches, agent.Name)
		}
	}
	if len(matches) == 1 {
		return matches[0], nil
	}
	if len(matches) == 0 {
		return "", fmt.Errorf("%q is not present in the AgentHub catalog", name)
	}
	return "", fmt.Errorf("%q is ambiguous in the AgentHub catalog", name)
}

func availableAgentHubAgents(catalog agentHubCatalog) []agentHubAgent {
	agents := make([]agentHubAgent, 0, len(catalog.Agents))
	for _, agent := range catalog.Agents {
		if agent.Available {
			agents = append(agents, agent)
		}
	}
	return agents
}

func atomicWriteConfig(path string, data []byte) error {
	dir := filepath.Dir(path)
	if err := os.MkdirAll(dir, 0o755); err != nil {
		return err
	}
	file, err := os.CreateTemp(dir, ".gui-agenthub-*.tmp")
	if err != nil {
		return err
	}
	tempPath := file.Name()
	defer os.Remove(tempPath)
	if err := file.Chmod(0o600); err != nil {
		file.Close()
		return err
	}
	if _, err := file.Write(data); err != nil {
		file.Close()
		return err
	}
	if err := file.Sync(); err != nil {
		file.Close()
		return err
	}
	if err := file.Close(); err != nil {
		return err
	}
	return os.Rename(tempPath, path)
}
