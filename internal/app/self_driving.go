package app

import (
	"errors"
	"fmt"
	"strings"
	"time"
)

const (
	selfDrivingConditionDisabled           = "disabled"
	selfDrivingConditionReady              = "ready"
	selfDrivingConditionWaiting            = "waiting"
	selfDrivingConditionBlocked            = "blocked"
	selfDrivingConditionError              = "error"
	selfDrivingConditionNeedsConfiguration = "needs_configuration"
	selfDrivingSuspensionFallback          = "Re-check whether the blocking condition has changed"
	selfDrivingSuspensionLimit             = 30 * time.Minute
)

type runnableTask struct {
	ID                     string                  `json:"id"`
	Path                   string                  `json:"path"`
	Title                  string                  `json:"title"`
	Revision               int                     `json:"revision"`
	Condition              string                  `json:"condition"`
	Ready                  bool                    `json:"ready"`
	Reason                 string                  `json:"reason"`
	AgentName              string                  `json:"agentName,omitempty"`
	Prompt                 string                  `json:"prompt,omitempty"`
	PreferredAgentProfiles []string                `json:"preferredAgentProfiles,omitempty"`
	CompletionCriteria     string                  `json:"completionCriteria,omitempty"`
	WakeContext            *SelfDrivingWakeContext `json:"wakeContext,omitempty"`
}

func normalizeAgentProfiles(values []string) ([]string, error) {
	normalized := make([]string, 0, len(values))
	seen := make(map[string]bool, len(values))
	for _, value := range values {
		profile := strings.ToLower(strings.TrimSpace(value))
		if profile == "" {
			return nil, errors.New("agent profile cannot be empty")
		}
		for _, r := range profile {
			if (r >= 'a' && r <= 'z') || (r >= '0' && r <= '9') || r == '.' || r == '_' || r == '-' {
				continue
			}
			return nil, fmt.Errorf("invalid agent profile %q: use lowercase letters, numbers, '.', '_', or '-'", value)
		}
		if seen[profile] {
			continue
		}
		seen[profile] = true
		normalized = append(normalized, profile)
	}
	return normalized, nil
}

func selfDrivingReady(task Task) (bool, string) {
	if task.SelfDriving == nil || !task.SelfDriving.Enabled {
		return false, "disabled"
	}
	switch task.SelfDriving.Condition {
	case selfDrivingConditionReady, selfDrivingConditionWaiting:
		return true, task.SelfDriving.Condition
	default:
		return false, task.SelfDriving.Condition
	}
}
