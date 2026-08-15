package serve

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
	agentHubConfigVersion = 5
	agentHubSourceApp     = "forge"
)

type systemAgentProfileDefinition struct {
	Key         string
	Description string
}

var systemAgentProfileDefinitions = []systemAgentProfileDefinition{
	{Key: "default", Description: "Balanced, recommended agent"},
	{Key: "fast", Description: "Faster responses for simple tasks"},
	{Key: "reasoning", Description: "More thorough reasoning for complex tasks"},
}

type agentHubGUIConfig struct {
	Version            int                    `json:"version"`
	ActiveID           string                 `json:"activeId,omitempty"`
	Workspaces         []guiWorkspace         `json:"workspaces"`
	AgentHubEndpoint   string                 `json:"agentHubEndpoint"`
	AgentHubInstanceID string                 `json:"agentHubInstanceId"`
	AgentProfiles      []agentHubProfileRoute `json:"agentProfiles,omitempty"`
	ResourceDefaults   resourceAgentDefaults  `json:"resourceDefaults"`
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
	cfg.ResourceDefaults = normalizeResourceAgentDefaults(cfg.ResourceDefaults)
	if cfg.AgentHubInstanceID == "" {
		cfg.AgentHubInstanceID, err = newAgentHubInstanceID()
		if err != nil {
			return agentHubGUIConfig{}, err
		}
	}
	cfg.AgentProfiles, err = normalizeAgentHubProfileRoutes(cfg.AgentProfiles, catalog)
	if err != nil {
		return agentHubGUIConfig{}, err
	}
	return cfg, nil
}

func effectiveResourceAgentDefaults(defaults resourceAgentDefaults, profiles []agentProfileRoute) resourceAgentDefaults {
	defaults = normalizeResourceAgentDefaults(defaults)
	globalAvailable := configuredAgentProfileName(profiles, "default") != ""
	resolve := func(binding resourceDefaultBinding) resourceDefaultBinding {
		if binding.Kind == "agent" {
			return binding
		}
		if configuredAgentProfileName(profiles, binding.Name) != "" {
			return binding
		}
		if globalAvailable {
			return resourceDefaultBinding{Kind: "profile", Name: "default"}
		}
		return binding
	}
	return resourceAgentDefaults{Workspace: resolve(defaults.Workspace), Project: resolve(defaults.Project), Task: resolve(defaults.Task)}
}

func defaultResourceAgentDefaults() resourceAgentDefaults {
	return resourceAgentDefaults{
		Workspace: resourceDefaultBinding{Kind: "profile", Name: "default"},
		Project:   resourceDefaultBinding{Kind: "profile", Name: "default"},
		Task:      resourceDefaultBinding{Kind: "profile", Name: "default"},
	}
}

func normalizeResourceAgentDefaultBinding(value resourceDefaultBinding) resourceDefaultBinding {
	kind := strings.ToLower(strings.TrimSpace(value.Kind))
	name := strings.TrimSpace(value.Name)
	if kind != "agent" {
		kind = "profile"
		name = strings.ToLower(name)
	}
	if name == "" {
		return resourceDefaultBinding{Kind: "profile", Name: "default"}
	}
	return resourceDefaultBinding{Kind: kind, Name: name}
}

func normalizeResourceAgentDefaults(value resourceAgentDefaults) resourceAgentDefaults {
	return resourceAgentDefaults{
		Workspace: normalizeResourceAgentDefaultBinding(value.Workspace),
		Project:   normalizeResourceAgentDefaultBinding(value.Project),
		Task:      normalizeResourceAgentDefaultBinding(value.Task),
	}
}

func normalizeAgentHubProfileRoutes(routes []agentHubProfileRoute, catalog agentHubCatalog) ([]agentHubProfileRoute, error) {
	systemTargets := make(map[string]string, len(systemAgentProfileDefinitions))
	for _, route := range routes {
		key := strings.ToLower(strings.TrimSpace(route.Key))
		if key == "" {
			return nil, errors.New("Agent Profile key is required")
		}
		if isSystemAgentProfileKey(key) {
			if _, exists := systemTargets[key]; !exists {
				systemTargets[key] = strings.TrimSpace(route.AgentName)
			}
		}
	}

	available := availableAgentHubAgents(catalog)
	fallback := ""
	if len(available) > 0 {
		fallback = available[0].Name
	}
	normalized := make([]agentHubProfileRoute, 0, len(routes)+len(systemAgentProfileDefinitions))
	seen := make(map[string]bool, len(routes)+len(systemAgentProfileDefinitions))
	for _, definition := range systemAgentProfileDefinitions {
		agentName := strings.TrimSpace(systemTargets[definition.Key])
		if agentName == "" {
			agentName = fallback
		}
		canonicalName, err := canonicalAgentHubAgentName(agentName, catalog.Agents)
		if err != nil {
			return nil, fmt.Errorf("system Agent Profile %s: %w", definition.Key, err)
		}
		normalized = append(normalized, agentHubProfileRoute{
			Key:         definition.Key,
			Description: definition.Description,
			AgentName:   canonicalName,
		})
		seen[definition.Key] = true
	}

	for _, route := range routes {
		key := strings.ToLower(strings.TrimSpace(route.Key))
		if key == "" {
			return nil, errors.New("Agent Profile key is required")
		}
		if isSystemAgentProfileKey(key) {
			continue
		}
		if seen[key] {
			return nil, fmt.Errorf("duplicate Agent Profile key: %s", key)
		}
		if strings.TrimSpace(route.AgentName) == "" {
			return nil, fmt.Errorf("Agent Profile %s requires an AgentHub agent", key)
		}
		agentName, err := canonicalAgentHubAgentName(route.AgentName, catalog.Agents)
		if err != nil {
			return nil, fmt.Errorf("Agent Profile %s: %w", key, err)
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

func normalizeConfigAgentProfileRoutes(routes []agentProfileRoute) ([]agentProfileRoute, error) {
	hubRoutes := make([]agentHubProfileRoute, 0, len(routes))
	for _, route := range routes {
		hubRoutes = append(hubRoutes, agentHubProfileRoute{
			Key: route.Key, Description: route.Description, AgentName: route.AgentName,
		})
	}
	normalized, err := normalizeAgentHubProfileRoutes(hubRoutes, agentHubCatalog{})
	if err != nil {
		return nil, err
	}
	configRoutes := make([]agentProfileRoute, 0, len(normalized))
	for _, route := range normalized {
		configRoutes = append(configRoutes, agentProfileRoute{
			Key: route.Key, Description: route.Description, AgentName: route.AgentName,
		})
	}
	return configRoutes, nil
}

func agentProfileRoutesEqual(a, b []agentProfileRoute) bool {
	if len(a) != len(b) {
		return false
	}
	for index := range a {
		if a[index] != b[index] {
			return false
		}
	}
	return true
}

func isSystemAgentProfileKey(key string) bool {
	key = strings.ToLower(strings.TrimSpace(key))
	for _, definition := range systemAgentProfileDefinitions {
		if definition.Key == key {
			return true
		}
	}
	return false
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
		return name, nil
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
