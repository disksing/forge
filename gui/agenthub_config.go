package main

import (
	"bytes"
	"crypto/rand"
	"encoding/hex"
	"encoding/json"
	"errors"
	"fmt"
	"os"
	"path/filepath"
	"sort"
	"strings"
	"unicode"
)

const (
	agentHubConfigVersion = 2
	agentHubSourceApp     = "forge"
	agentHubBackupSuffix  = ".pre-agenthub-v1.bak"
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

type legacyGUIConfig struct {
	Version            int                  `json:"version"`
	ActiveID           string               `json:"activeId,omitempty"`
	Workspaces         []guiWorkspace       `json:"workspaces"`
	DefaultChatAgentID string               `json:"defaultChatAgentId,omitempty"`
	Agents             []legacyAgentConfig  `json:"agents"`
	AgentProfiles      []legacyProfileRoute `json:"agentProfiles,omitempty"`
}

type legacyAgentConfig struct {
	ID         string            `json:"id"`
	Name       string            `json:"name"`
	ProviderID string            `json:"providerId"`
	Options    map[string]string `json:"options,omitempty"`
}

type legacyProfileRoute struct {
	Key         string `json:"key"`
	Description string `json:"description,omitempty"`
	AgentID     string `json:"agentId,omitempty"`
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

func migrateLegacyConfig(legacy legacyGUIConfig, endpoint, instanceID string, catalog agentHubCatalog) (agentHubGUIConfig, error) {
	available := availableAgentHubAgents(catalog)
	if len(available) == 0 {
		return agentHubGUIConfig{}, errors.New("AgentHub catalog has no available agents")
	}
	requiredLegacyIDs := map[string]bool{strings.TrimSpace(legacy.DefaultChatAgentID): true}
	for _, route := range legacy.AgentProfiles {
		requiredLegacyIDs[strings.TrimSpace(route.AgentID)] = true
	}
	mapped := make(map[string]string, len(requiredLegacyIDs))
	for _, legacyAgent := range legacy.Agents {
		if !requiredLegacyIDs[strings.TrimSpace(legacyAgent.ID)] {
			continue
		}
		name, err := matchLegacyAgent(legacyAgent, available)
		if err != nil {
			return agentHubGUIConfig{}, fmt.Errorf("migrate legacy agent %q: %w", legacyAgent.ID, err)
		}
		mapped[legacyAgent.ID] = name
	}
	defaultName := mapped[strings.TrimSpace(legacy.DefaultChatAgentID)]
	if defaultName == "" {
		return agentHubGUIConfig{}, fmt.Errorf("default legacy agent %q cannot be mapped uniquely", legacy.DefaultChatAgentID)
	}
	routes := make([]agentHubProfileRoute, 0, len(legacy.AgentProfiles))
	for _, route := range legacy.AgentProfiles {
		name := mapped[strings.TrimSpace(route.AgentID)]
		if name == "" {
			return agentHubGUIConfig{}, fmt.Errorf("Agent Profile %q references legacy agent %q, which cannot be mapped uniquely", route.Key, route.AgentID)
		}
		routes = append(routes, agentHubProfileRoute{
			Key: route.Key, Description: route.Description, AgentName: name,
		})
	}
	return normalizeAgentHubConfig(agentHubGUIConfig{
		Version:                  agentHubConfigVersion,
		ActiveID:                 legacy.ActiveID,
		Workspaces:               legacy.Workspaces,
		AgentHubEndpoint:         endpoint,
		AgentHubInstanceID:       instanceID,
		DefaultAgentHubAgentName: defaultName,
		AgentProfiles:            routes,
	}, catalog)
}

func matchLegacyAgent(legacy legacyAgentConfig, candidates []agentHubAgent) (string, error) {
	type scored struct {
		name  string
		score int
	}
	var matches []scored
	legacyNames := []string{legacy.ID, legacy.Name}
	legacyModel := normalizedAgentIdentity(legacy.Options[agentOptionModel])
	for _, candidate := range candidates {
		score := 0
		for _, legacyName := range legacyNames {
			if strings.EqualFold(strings.TrimSpace(legacyName), strings.TrimSpace(candidate.Name)) {
				score = max(score, 100)
			} else if normalizedAgentIdentity(legacyName) != "" && normalizedAgentIdentity(legacyName) == normalizedAgentIdentity(candidate.Name) {
				score = max(score, 80)
			}
		}
		candidateModel := normalizedAgentIdentity(candidate.Options[agentOptionModel])
		if legacyModel != "" && candidateModel == legacyModel {
			score = max(score, 90)
		}
		if legacy.ProviderID == candidate.ProviderID {
			if score > 0 {
				score += 10
			} else if countProviderCandidates(candidates, legacy.ProviderID) == 1 {
				score = 20
			}
		} else if score < 80 {
			score = 0
		}
		if score > 0 {
			matches = append(matches, scored{name: candidate.Name, score: score})
		}
	}
	if len(matches) == 0 {
		return "", errors.New("no compatible AgentHub catalog entry")
	}
	sort.Slice(matches, func(i, j int) bool { return matches[i].score > matches[j].score })
	if len(matches) > 1 && matches[0].score == matches[1].score {
		return "", fmt.Errorf("ambiguous AgentHub catalog entries %q and %q", matches[0].name, matches[1].name)
	}
	return matches[0].name, nil
}

func countProviderCandidates(candidates []agentHubAgent, providerID string) int {
	count := 0
	for _, candidate := range candidates {
		if candidate.ProviderID == providerID {
			count++
		}
	}
	return count
}

func normalizedAgentIdentity(value string) string {
	value = strings.ToLower(strings.TrimSpace(value))
	value = strings.ReplaceAll(value, "coding", "code")
	var tokens []string
	var token strings.Builder
	flush := func() {
		if token.Len() == 0 {
			return
		}
		current := token.String()
		token.Reset()
		if current != "codex" && current != "pi" && current != "agent" {
			tokens = append(tokens, current)
		}
	}
	for _, char := range value {
		if unicode.IsLetter(char) || unicode.IsDigit(char) {
			token.WriteRune(char)
		} else {
			flush()
		}
	}
	flush()
	sort.Strings(tokens)
	return strings.Join(tokens, "")
}

func migrateLegacyGUIConfigFile(path, endpoint, instanceID string, catalog agentHubCatalog) (agentHubGUIConfig, string, error) {
	original, err := os.ReadFile(path)
	if err != nil {
		return agentHubGUIConfig{}, "", err
	}
	var version struct {
		Version int `json:"version"`
	}
	if err := json.Unmarshal(original, &version); err != nil {
		return agentHubGUIConfig{}, "", fmt.Errorf("parse GUI config version: %w", err)
	}
	if version.Version >= agentHubConfigVersion {
		var cfg agentHubGUIConfig
		if err := json.Unmarshal(original, &cfg); err != nil {
			return agentHubGUIConfig{}, "", err
		}
		cfg, err = normalizeAgentHubConfig(cfg, catalog)
		return cfg, "", err
	}
	var legacy legacyGUIConfig
	if err := json.Unmarshal(original, &legacy); err != nil {
		return agentHubGUIConfig{}, "", fmt.Errorf("parse legacy GUI config: %w", err)
	}
	cfg, err := migrateLegacyConfig(legacy, endpoint, instanceID, catalog)
	if err != nil {
		return agentHubGUIConfig{}, "", err
	}
	data, err := json.MarshalIndent(cfg, "", "  ")
	if err != nil {
		return agentHubGUIConfig{}, "", err
	}
	data = append(data, '\n')
	backupPath := path + agentHubBackupSuffix
	if err := writeMigrationBackup(backupPath, original); err != nil {
		return agentHubGUIConfig{}, "", err
	}
	if err := atomicWriteConfig(path, data); err != nil {
		return agentHubGUIConfig{}, backupPath, err
	}
	return cfg, backupPath, nil
}

func writeMigrationBackup(path string, data []byte) error {
	file, err := os.OpenFile(path, os.O_WRONLY|os.O_CREATE|os.O_EXCL, 0o600)
	if err != nil {
		if os.IsExist(err) {
			existing, readErr := os.ReadFile(path)
			if readErr == nil && bytes.Equal(existing, data) {
				return nil
			}
			return fmt.Errorf("migration backup already exists with different content: %s", path)
		}
		return fmt.Errorf("create migration backup: %w", err)
	}
	if _, err := file.Write(data); err != nil {
		file.Close()
		return fmt.Errorf("write migration backup: %w", err)
	}
	if err := file.Sync(); err != nil {
		file.Close()
		return fmt.Errorf("sync migration backup: %w", err)
	}
	return file.Close()
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
