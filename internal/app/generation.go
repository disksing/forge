package app

import (
	"encoding/json"
	"fmt"
	"sort"
	"strings"
	"time"

	"github.com/disksing/forge/internal/generation"
)

// GenerationDiagnostic is the read-only view used by forge session
// diagnostics. It intentionally exposes the stable generation address and
// AgentHub correlation, but never exposes the internal run key or offers a
// lifecycle operation.
type GenerationDiagnostic struct {
	ResourceID         string `json:"resourceId,omitempty"`
	Generation         int    `json:"generation,omitempty"`
	GenerationID       string `json:"generationId"`
	Title              string `json:"title"`
	Status             string `json:"status"`
	AgentName          string `json:"agentName,omitempty"`
	ResolvedProfile    string `json:"resolvedProfile,omitempty"`
	AgentHubSessionID  string `json:"agentHubSessionId,omitempty"`
	CreatedAt          string `json:"createdAt"`
	UpdatedAt          string `json:"updatedAt"`
	CompletionMarker   string `json:"completionMarker,omitempty"`
	CompletionState    string `json:"completionState,omitempty"`
	CompletionAt       string `json:"completionAt,omitempty"`
	ReplacementPending bool   `json:"replacementPending,omitempty"`
	Retired            bool   `json:"retired,omitempty"`
	RetireReason       string `json:"retireReason,omitempty"`
	Legacy             bool   `json:"legacy,omitempty"`
}

type generationProjection struct {
	ResourceID         string `json:"resourceId,omitempty"`
	Generation         int    `json:"generation,omitempty"`
	GenerationID       string `json:"generationId,omitempty"`
	Title              string `json:"title,omitempty"`
	Status             string `json:"status,omitempty"`
	AgentHubAgentName  string `json:"agentHubAgentName,omitempty"`
	ResolvedProfile    string `json:"resolvedProfile,omitempty"`
	AgentHubSessionID  string `json:"agentHubSessionId,omitempty"`
	CreatedAt          string `json:"createdAt,omitempty"`
	UpdatedAt          string `json:"updatedAt,omitempty"`
	CompletionMarker   string `json:"completionMarker,omitempty"`
	CompletionState    string `json:"completionState,omitempty"`
	CompletionAt       string `json:"completionAt,omitempty"`
	ReplacementPending bool   `json:"replacementPending,omitempty"`
}

// GenerationDiagnostics reads durable generation records without contacting
// AgentHub. The first call after an upgrade completes the one-time generation
// store migration; after its durable marker is ready, this path only reads the
// resource-scoped current files and immutable manifests.
func (w *Workspace) GenerationDiagnostics() ([]GenerationDiagnostic, error) {
	if err := w.require(); err != nil {
		return nil, err
	}
	instanceID := ""
	if runtime, err := w.RuntimeConfig(); err == nil {
		instanceID = runtime.InstanceID
	}
	store, err := generation.Open(w.root, instanceID)
	if err != nil {
		return nil, &APIError{Operation: "open generation store", Kind: "generation", Workspace: w.root, Err: err}
	}
	records, err := store.List()
	if err != nil {
		return nil, &APIError{Operation: "read generation diagnostics", Kind: "generation", Workspace: w.root, Path: ".forge/runtime/resources", Err: err}
	}
	result := make([]GenerationDiagnostic, 0, len(records))
	for _, record := range records {
		var projection generationProjection
		if err := json.Unmarshal(record.Payload, &projection); err != nil {
			return nil, &APIError{Operation: "decode generation diagnostic", Kind: "generation", Workspace: w.root, Err: err}
		}
		resourceID := generation.NormalizeResourceID(projection.ResourceID)
		if resourceID == "workspace" && record.ResourceID != "" {
			resourceID = record.ResourceID
		}
		generationID := strings.TrimSpace(projection.GenerationID)
		if generationID == "" {
			generationID = record.GenerationID
		}
		result = append(result, GenerationDiagnostic{
			ResourceID: resourceID, Generation: valueOr(projection.Generation, record.Generation), GenerationID: generationID,
			Title: projection.Title, Status: projection.Status, AgentName: projection.AgentHubAgentName,
			ResolvedProfile: projection.ResolvedProfile, AgentHubSessionID: projection.AgentHubSessionID,
			CreatedAt: firstNonEmpty(projection.CreatedAt, record.CreatedAt), UpdatedAt: firstNonEmpty(projection.UpdatedAt, record.UpdatedAt),
			CompletionMarker: projection.CompletionMarker, CompletionState: projection.CompletionState, CompletionAt: projection.CompletionAt,
			ReplacementPending: projection.ReplacementPending, Retired: record.Retired, RetireReason: record.RetireReason, Legacy: record.Legacy,
		})
	}
	sort.SliceStable(result, func(i, j int) bool {
		left, leftOK := parseGenerationTime(result[i].UpdatedAt)
		right, rightOK := parseGenerationTime(result[j].UpdatedAt)
		if leftOK && rightOK && !left.Equal(right) {
			return left.After(right)
		}
		if leftOK != rightOK {
			return leftOK
		}
		if result[i].Generation != result[j].Generation {
			return result[i].Generation > result[j].Generation
		}
		return result[i].GenerationID > result[j].GenerationID
	})
	return result, nil
}

// GenerationDiagnostic returns one durable generation by its stable
// generationId. Internal run ids and Forge Session ids are not accepted.
func (w *Workspace) GenerationDiagnostic(generationID string) (GenerationDiagnostic, error) {
	generationID = strings.TrimSpace(generationID)
	if generationID == "" {
		return GenerationDiagnostic{}, &APIError{Operation: "show generation diagnostic", Kind: "generation", Workspace: w.root, Err: fmt.Errorf("generation id is required")}
	}
	generations, err := w.GenerationDiagnostics()
	if err != nil {
		return GenerationDiagnostic{}, err
	}
	for _, generation := range generations {
		if generation.GenerationID == generationID {
			return generation, nil
		}
	}
	return GenerationDiagnostic{}, &APIError{Operation: "show generation diagnostic", Kind: "generation", Workspace: w.root, ResourceID: generationID, Err: fmt.Errorf("generation not found: %s", generationID)}
}

func firstNonEmpty(values ...string) string {
	for _, value := range values {
		if strings.TrimSpace(value) != "" {
			return value
		}
	}
	return ""
}

func valueOr(value, fallback int) int {
	if value != 0 {
		return value
	}
	return fallback
}

func parseGenerationTime(value string) (time.Time, bool) {
	parsed, err := time.Parse(time.RFC3339Nano, strings.TrimSpace(value))
	return parsed, err == nil
}
