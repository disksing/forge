package app

import (
	"encoding/json"
	"fmt"
	"os"
	"path/filepath"
	"sort"
	"strings"
	"time"
)

const generationIndexPath = ".forge/runtime/generations.json"

// GenerationDiagnostic is the read-only view used by forge session
// diagnostics. It intentionally exposes the stable generation address and
// AgentHub correlation as evidence, but never exposes the internal run key or
// offers a lifecycle operation.
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
}

type generationDiagnosticIndex struct {
	Version     int                    `json:"version"`
	Generations []GenerationDiagnostic `json:"generations"`
}

// GenerationDiagnostics reads durable generation records without contacting
// AgentHub and without rewriting any file. The stage-five array format remains
// readable so an interrupted upgrade never hides existing history.
func (w *Workspace) GenerationDiagnostics() ([]GenerationDiagnostic, error) {
	if err := w.require(); err != nil {
		return nil, err
	}
	data, err := os.ReadFile(filepath.Join(w.root, generationIndexPath))
	if os.IsNotExist(err) {
		return []GenerationDiagnostic{}, nil
	}
	if err != nil {
		return nil, &APIError{Operation: "read generation diagnostics", Kind: "generation", Workspace: w.root, Path: generationIndexPath, Err: err}
	}
	generations, err := decodeGenerationDiagnostics(data)
	if err != nil {
		return nil, &APIError{Operation: "read generation diagnostics", Kind: "generation", Workspace: w.root, Path: generationIndexPath, Err: err}
	}
	for i := range generations {
		if strings.TrimSpace(generations[i].ResourceID) == "" {
			generations[i].ResourceID = "workspace"
		}
	}
	sort.SliceStable(generations, func(i, j int) bool {
		left, leftOK := parseGenerationTime(generations[i].UpdatedAt)
		right, rightOK := parseGenerationTime(generations[j].UpdatedAt)
		if leftOK && rightOK && !left.Equal(right) {
			return left.After(right)
		}
		if leftOK != rightOK {
			return leftOK
		}
		return generations[i].GenerationID > generations[j].GenerationID
	})
	return generations, nil
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

func decodeGenerationDiagnostics(data []byte) ([]GenerationDiagnostic, error) {
	var array []GenerationDiagnostic
	if err := json.Unmarshal(data, &array); err == nil {
		if array == nil {
			array = []GenerationDiagnostic{}
		}
		return array, nil
	}
	var index generationDiagnosticIndex
	if err := json.Unmarshal(data, &index); err != nil {
		return nil, err
	}
	if index.Version != 1 {
		return nil, fmt.Errorf("unsupported generation index version %d; expected 1", index.Version)
	}
	if index.Generations == nil {
		index.Generations = []GenerationDiagnostic{}
	}
	return index.Generations, nil
}

func parseGenerationTime(value string) (time.Time, bool) {
	parsed, err := time.Parse(time.RFC3339Nano, strings.TrimSpace(value))
	return parsed, err == nil
}
