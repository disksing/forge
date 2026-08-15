package serve

import (
	"encoding/json"
	"errors"
	"fmt"
	"net/http"
	"os"
	"path/filepath"
	"sort"
	"strings"
	"time"
)

// resourceAttentionState is the server-owned per-resource focus state. A nil
// dismissed turn means the user has never dismissed the resource, so a newly
// followed resource is visible even before its first turn.
type resourceAttentionState struct {
	Followed      bool `json:"followed"`
	DismissedTurn *int `json:"dismissedTurn,omitempty"`
	TurnNumber    int  `json:"turnNumber,omitempty"`
}

type resourceAttentionSnapshot struct {
	Followed      bool `json:"followed"`
	DismissedTurn *int `json:"dismissedTurn,omitempty"`
}

func resourceAttentionSnapshotForState(state resourceAttentionState) *resourceAttentionSnapshot {
	return &resourceAttentionSnapshot{Followed: state.Followed, DismissedTurn: cloneIntPointer(state.DismissedTurn)}
}

func cloneIntPointer(value *int) *int {
	if value == nil {
		return nil
	}
	cloned := *value
	return &cloned
}

func loadUIStateFile(path string) (uiState, error) {
	data, err := os.ReadFile(path)
	if err != nil {
		if os.IsNotExist(err) {
			return uiState{Version: 1, ExpandedProjects: []string{}, Attention: map[string]resourceAttentionState{}}, nil
		}
		return uiState{}, err
	}
	var state uiState
	if err := json.Unmarshal(data, &state); err != nil {
		return uiState{}, err
	}
	if state.Version == 0 {
		state.Version = 1
	}
	if state.ExpandedProjects == nil {
		state.ExpandedProjects = []string{}
	}
	if state.Attention == nil {
		state.Attention = map[string]resourceAttentionState{}
	}
	return state, nil
}

func saveUIStateFile(path string, state uiState) error {
	state.Version = 1
	state.ExpandedProjects = uniqueNonEmpty(state.ExpandedProjects)
	if state.Attention == nil {
		state.Attention = map[string]resourceAttentionState{}
	}
	data, err := json.MarshalIndent(state, "", "  ")
	if err != nil {
		return err
	}
	data = append(data, '\n')
	if err := os.MkdirAll(filepath.Dir(path), 0o755); err != nil {
		return err
	}
	file, err := os.CreateTemp(filepath.Dir(path), ".gui-state-*.tmp")
	if err != nil {
		return err
	}
	tempPath := file.Name()
	defer os.Remove(tempPath)
	if err := file.Chmod(0o644); err != nil {
		_ = file.Close()
		return err
	}
	if _, err := file.Write(data); err != nil {
		_ = file.Close()
		return err
	}
	if err := file.Sync(); err != nil {
		_ = file.Close()
		return err
	}
	if err := file.Close(); err != nil {
		return err
	}
	return os.Rename(tempPath, path)
}

func (s *server) loadAttentionAtPath(path string) (map[string]resourceAttentionState, error) {
	s.uiStateMu.Lock()
	defer s.uiStateMu.Unlock()
	state, err := loadUIStateFile(uiStatePath(path))
	if err != nil {
		return nil, err
	}
	return state.Attention, nil
}

func (s *server) mutateResourceAttentionAtPath(path, resourceID string, mutate func(*resourceAttentionState)) (resourceAttentionState, error) {
	s.uiStateMu.Lock()
	defer s.uiStateMu.Unlock()
	state, err := loadUIStateFile(uiStatePath(path))
	if err != nil {
		return resourceAttentionState{}, err
	}
	if state.Attention == nil {
		state.Attention = map[string]resourceAttentionState{}
	}
	resourceID = normalizedResourceID(resourceID)
	attention := state.Attention[resourceID]
	mutate(&attention)
	state.Attention[resourceID] = attention
	if err := saveUIStateFile(uiStatePath(path), state); err != nil {
		return resourceAttentionState{}, err
	}
	return attention, nil
}

func (s *server) followResource(path, resourceID string) error {
	_, err := s.mutateResourceAttentionAtPath(path, resourceID, func(state *resourceAttentionState) {
		state.Followed = true
		state.DismissedTurn = nil
	})
	return err
}

// allocateResourceTurnNumber advances the resource-wide turn ordinal. It is
// separate from the generation record because a replacement generation must
// not reset the dismiss boundary of the resource.
func (s *server) allocateResourceTurnNumber(path, resourceID string) (int, error) {
	s.uiStateMu.Lock()
	defer s.uiStateMu.Unlock()
	state, err := loadUIStateFile(uiStatePath(path))
	if err != nil {
		return 0, err
	}
	if state.Attention == nil {
		state.Attention = map[string]resourceAttentionState{}
	}
	resourceID = normalizedResourceID(resourceID)
	attention := state.Attention[resourceID]
	maximum := attention.TurnNumber
	runs, err := loadAgentRuns(path)
	if err != nil {
		return 0, err
	}
	for _, run := range runs {
		candidateID := normalizedResourceID(run.ResourceID)
		if candidateID == resourceID && run.TurnNumber > maximum {
			maximum = run.TurnNumber
		}
	}
	attention.TurnNumber = maximum + 1
	state.Attention[resourceID] = attention
	if err := saveUIStateFile(uiStatePath(path), state); err != nil {
		return 0, err
	}
	return attention.TurnNumber, nil
}

func (s *server) handleResourceAttention(w http.ResponseWriter, r *http.Request, workspaceID, resourceID string) {
	workspace, err := s.workspace(workspaceID)
	if err != nil {
		writeError(w, err, http.StatusNotFound)
		return
	}
	resourceID = normalizedResourceID(resourceID)
	if err := validateAttentionResource(workspace.Path, resourceID); err != nil {
		writeError(w, err, http.StatusBadRequest)
		return
	}
	switch r.Method {
	case http.MethodGet:
		attention, err := s.attentionForResource(workspace.Path, resourceID)
		if err != nil {
			writeError(w, err, http.StatusInternalServerError)
			return
		}
		writeJSON(w, resourceAttentionSnapshotForState(attention))
	case http.MethodPut:
		var body struct {
			Followed *bool `json:"followed"`
		}
		decoder := json.NewDecoder(r.Body)
		decoder.DisallowUnknownFields()
		if err := decoder.Decode(&body); err != nil || body.Followed == nil {
			if err == nil {
				err = errors.New("followed is required")
			}
			writeError(w, err, http.StatusBadRequest)
			return
		}
		attention, err := s.mutateResourceAttentionAtPath(workspace.Path, resourceID, func(state *resourceAttentionState) {
			state.Followed = *body.Followed
			if *body.Followed {
				state.DismissedTurn = nil
			}
		})
		if err != nil {
			writeError(w, err, http.StatusInternalServerError)
			return
		}
		writeJSON(w, resourceAttentionSnapshotForState(attention))
	default:
		w.WriteHeader(http.StatusMethodNotAllowed)
	}
}

func (s *server) handleResourceAttentionDismiss(w http.ResponseWriter, r *http.Request, workspaceID, resourceID string) {
	if r.Method != http.MethodPost {
		w.WriteHeader(http.StatusMethodNotAllowed)
		return
	}
	workspace, err := s.workspace(workspaceID)
	if err != nil {
		writeError(w, err, http.StatusNotFound)
		return
	}
	resourceID = normalizedResourceID(resourceID)
	if err := validateAttentionResource(workspace.Path, resourceID); err != nil {
		writeError(w, err, http.StatusBadRequest)
		return
	}
	turnNumber, err := s.currentResourceTurnNumber(workspace.Path, resourceID)
	if err != nil {
		writeError(w, err, http.StatusInternalServerError)
		return
	}
	attention, err := s.mutateResourceAttentionAtPath(workspace.Path, resourceID, func(state *resourceAttentionState) {
		if state.DismissedTurn == nil || *state.DismissedTurn < turnNumber {
			state.DismissedTurn = cloneIntPointer(&turnNumber)
		}
	})
	if err != nil {
		writeError(w, err, http.StatusInternalServerError)
		return
	}
	writeJSON(w, resourceAttentionSnapshotForState(attention))
}

func (s *server) attentionForResource(path, resourceID string) (resourceAttentionState, error) {
	attention, err := s.loadAttentionAtPath(path)
	if err != nil {
		return resourceAttentionState{}, err
	}
	return attention[normalizedResourceID(resourceID)], nil
}

func validateAttentionResource(path, resourceID string) error {
	exists, archived, _, err := resourceExistsAndArchived(path, normalizedResourceID(resourceID))
	if err != nil {
		return err
	}
	if !exists {
		return fmt.Errorf("resource not found: %s", resourceID)
	}
	if archived {
		return fmt.Errorf("resource %s is archived", resourceID)
	}
	return nil
}

func selectLatestAgentHubResourceRuns(runs []agentRun) map[string]agentRun {
	byResourceID := make(map[string]agentRun)
	for _, run := range runs {
		if strings.TrimSpace(run.GenerationID) == "" || !isAgentHubRun(run) {
			continue
		}
		resourceID := normalizedResourceID(run.ResourceID)
		if resourceID == "" {
			resourceID = "workspace"
		}
		if current, ok := byResourceID[resourceID]; !ok || resourceRuntimeRunNewer(run, current) {
			byResourceID[resourceID] = run
		}
	}
	return byResourceID
}

func attentionAgentHubResourceRuns(workspacePath string) (map[string]agentRun, error) {
	runs, err := loadAgentRunsCurrent(workspacePath)
	if err != nil {
		return nil, fmt.Errorf("load resource generations for active attention turns: %w", err)
	}
	latest := selectLatestAgentHubResourceRuns(runs)
	active := make(map[string]agentRun)
	for _, run := range runs {
		if strings.TrimSpace(run.GenerationID) == "" || !isAgentHubRun(run) || !resourceRunHasActiveTurn(run) {
			continue
		}
		resourceID := normalizedResourceID(run.ResourceID)
		if current, ok := active[resourceID]; !ok || resourceRuntimeRunNewer(run, current) {
			active[resourceID] = run
		}
	}
	for resourceID, run := range active {
		latest[resourceID] = run
	}
	return latest, nil
}

func (s *server) currentResourceTurnNumber(workspacePath, resourceID string) (int, error) {
	runs, err := loadAgentRuns(workspacePath)
	if err != nil {
		return 0, err
	}
	state, err := s.loadAttentionAtPath(workspacePath)
	if err != nil {
		return 0, err
	}
	turnNumber := state[normalizedResourceID(resourceID)].TurnNumber
	resourceID = normalizedResourceID(resourceID)
	for _, run := range runs {
		if normalizedResourceID(run.ResourceID) == resourceID && run.TurnNumber > turnNumber {
			turnNumber = run.TurnNumber
		}
	}
	return turnNumber, nil
}

func resourceRuntimeSnapshotForRun(run agentRun) *resourceRuntimeSnapshot {
	return &resourceRuntimeSnapshot{
		Generation: run.Generation, GenerationID: run.GenerationID, Status: run.Status,
		AgentName: run.AgentHubAgentName, UpdatedAt: run.UpdatedAt, LastOutputAt: run.LastOutputAt,
		CompletionMarker: run.CompletionMarker, CompletionState: run.CompletionState, CompletionHasFinalReply: run.CompletionHasFinalReply,
		CompletionAt: run.CompletionAt, ReplacementPending: run.ReplacementPending,
		Resumable:         (run.Status == "stopped" || run.Status == "idle-suspended") && run.AgentHubSessionID != "" && !run.SessionResumeUnavailable && !run.ReplacementPending && !run.ArchivedTaskStopRequested,
		IdleSuspended:     run.Status == "idle-suspended" || (run.IdleSleepStopRequested && run.Status == "stopped"),
		ResumeUnavailable: run.SessionResumeUnavailable,
		TurnNumber:        run.TurnNumber, ActiveTurn: resourceRunHasActiveTurn(run), TurnStartedAt: run.TurnStartedAt,
	}
}

func resourceAttentionVisible(item resourceSnapshot) bool {
	if item.Archived {
		return false
	}
	attention := item.Attention
	if attention == nil || !attention.Followed {
		return item.Runtime != nil && item.Runtime.ActiveTurn
	}
	if item.Runtime == nil {
		return attention.DismissedTurn == nil
	}
	if item.Runtime.ActiveTurn {
		return true
	}
	return attention.DismissedTurn == nil || item.Runtime.TurnNumber > *attention.DismissedTurn
}

func resourceAttentionSortTime(item resourceSnapshot) time.Time {
	if item.Runtime == nil {
		return time.Time{}
	}
	value := item.Runtime.CompletionAt
	if item.Runtime.ActiveTurn {
		value = item.Runtime.TurnStartedAt
	}
	parsed, err := time.Parse(time.RFC3339Nano, strings.TrimSpace(value))
	if err != nil {
		return time.Time{}
	}
	return parsed
}

func (s *server) enrichTreeResourceAttention(workspacePath string, tree *workspaceTree) error {
	attention, err := s.loadAttentionAtPath(workspacePath)
	if err != nil {
		return fmt.Errorf("load resource attention for tree: %w", err)
	}
	runs, err := attentionAgentHubResourceRuns(workspacePath)
	if err != nil {
		return err
	}
	var applyState func(*resourceSnapshot)
	applyState = func(item *resourceSnapshot) {
		if state, ok := attention[normalizedResourceID(item.ID)]; ok {
			item.Attention = resourceAttentionSnapshotForState(state)
		}
		for i := range item.Children {
			applyState(&item.Children[i])
		}
	}
	applyState(&tree.Scheduler)
	for i := range tree.Projects {
		applyState(&tree.Projects[i])
	}
	var applyRuntime func(*resourceSnapshot)
	applyRuntime = func(item *resourceSnapshot) {
		if run, ok := runs[normalizedResourceID(item.ID)]; ok {
			item.Runtime = resourceRuntimeSnapshotForRun(run)
		}
		for i := range item.Children {
			applyRuntime(&item.Children[i])
		}
	}
	applyRuntime(&tree.Scheduler)
	for i := range tree.Projects {
		applyRuntime(&tree.Projects[i])
	}

	workspaceItem := resourceSnapshot{ID: "workspace", Type: "workspace", Title: workspaceName(workspacePath), Path: ".", AgentBinding: tree.AgentBinding}
	if run, ok := runs["workspace"]; ok {
		workspaceItem.Runtime = resourceRuntimeSnapshotForRun(run)
	}
	applyState(&workspaceItem)

	candidates := make([]resourceSnapshot, 0, 2+len(tree.Projects))
	candidates = append(candidates, workspaceItem, tree.Scheduler)
	for _, project := range tree.Projects {
		project.Children = append([]resourceSnapshot(nil), project.Children...)
		candidates = append(candidates, project)
		candidates = append(candidates, project.Children...)
	}
	tree.AttentionList = make([]resourceSnapshot, 0, len(candidates))
	for _, item := range candidates {
		if !resourceAttentionVisible(item) {
			continue
		}
		item.Children = nil
		tree.AttentionList = append(tree.AttentionList, item)
	}
	sort.SliceStable(tree.AttentionList, func(i, j int) bool {
		left, right := tree.AttentionList[i], tree.AttentionList[j]
		leftActive := left.Runtime != nil && left.Runtime.ActiveTurn
		rightActive := right.Runtime != nil && right.Runtime.ActiveTurn
		if leftActive != rightActive {
			return leftActive
		}
		leftTime, rightTime := resourceAttentionSortTime(left), resourceAttentionSortTime(right)
		if !leftTime.Equal(rightTime) {
			return leftTime.After(rightTime)
		}
		if left.Title != right.Title {
			return left.Title < right.Title
		}
		return left.ID < right.ID
	})
	return nil
}
