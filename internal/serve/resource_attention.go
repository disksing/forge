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

	"github.com/disksing/pua/internal/app"
)

// resourceAttentionState is the per-user, per-resource focus state. A nil read
// turn means the user has never marked the resource as read, so a newly
// followed resource is visible even before its first turn. DismissedTurn and
// TurnNumber are read-only legacy fields used while migrating the old shared
// ui-state.json.
type resourceAttentionState struct {
	Followed       bool `json:"followed"`
	ReadTurnNumber *int `json:"readTurnNumber,omitempty"`
	DismissedTurn  *int `json:"dismissedTurn,omitempty"`
	TurnNumber     int  `json:"turnNumber,omitempty"`
}

type resourceAttentionSnapshot struct {
	Followed       bool `json:"followed"`
	ReadTurnNumber *int `json:"readTurnNumber,omitempty"`
}

func resourceAttentionSnapshotForState(state resourceAttentionState) *resourceAttentionSnapshot {
	return &resourceAttentionSnapshot{Followed: state.Followed, ReadTurnNumber: cloneIntPointer(state.ReadTurnNumber)}
}

type resourceState struct {
	Version     int            `json:"version"`
	TurnNumbers map[string]int `json:"turnNumbers,omitempty"`
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
	for resourceID, attention := range state.Attention {
		if attention.ReadTurnNumber == nil && attention.DismissedTurn != nil {
			attention.ReadTurnNumber = cloneIntPointer(attention.DismissedTurn)
		}
		state.Attention[resourceID] = attention
	}
	return state, nil
}

func saveUIStateFile(path string, state uiState) error {
	state.Version = 1
	state.ExpandedProjects = uniqueNonEmpty(state.ExpandedProjects)
	if state.Attention == nil {
		state.Attention = map[string]resourceAttentionState{}
	}
	for resourceID, attention := range state.Attention {
		attention.DismissedTurn = nil
		attention.TurnNumber = 0
		state.Attention[resourceID] = attention
	}
	return saveJSONStateFile(path, ".ui-state-*.tmp", state)
}

func saveJSONStateFile(path, pattern string, value any) error {
	data, err := json.MarshalIndent(value, "", "  ")
	if err != nil {
		return err
	}
	data = append(data, '\n')
	if err := os.MkdirAll(filepath.Dir(path), 0o755); err != nil {
		return err
	}
	file, err := os.CreateTemp(filepath.Dir(path), pattern)
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
	if err := os.Rename(tempPath, path); err != nil {
		return err
	}
	return nil
}

func loadResourceStateFile(path string) (resourceState, error) {
	data, err := os.ReadFile(path)
	if err != nil {
		if os.IsNotExist(err) {
			return resourceState{Version: 1, TurnNumbers: map[string]int{}}, nil
		}
		return resourceState{}, err
	}
	var state resourceState
	if err := json.Unmarshal(data, &state); err != nil {
		return resourceState{}, err
	}
	state.Version = 1
	if state.TurnNumbers == nil {
		state.TurnNumbers = map[string]int{}
	}
	return state, nil
}

func saveResourceStateFile(path string, state resourceState) error {
	state.Version = 1
	if state.TurnNumbers == nil {
		state.TurnNumbers = map[string]int{}
	}
	return saveJSONStateFile(path, ".resource-state-*.tmp", state)
}

func selectedUserName(userNames []string) string {
	if len(userNames) > 0 && strings.TrimSpace(userNames[0]) != "" {
		return userNames[0]
	}
	return app.DefaultUserName
}

func (s *server) loadAttentionAtPath(path string, userNames ...string) (map[string]resourceAttentionState, error) {
	s.uiStateMu.Lock()
	defer s.uiStateMu.Unlock()
	state, err := loadUIStateFile(userUIStatePath(path, selectedUserName(userNames)))
	if err != nil {
		return nil, err
	}
	return state.Attention, nil
}

func (s *server) mutateResourceAttentionAtPath(path, resourceID string, mutate func(*resourceAttentionState), userNames ...string) (resourceAttentionState, error) {
	s.uiStateMu.Lock()
	defer s.uiStateMu.Unlock()
	statePath := userUIStatePath(path, selectedUserName(userNames))
	state, err := loadUIStateFile(statePath)
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
	if err := saveUIStateFile(statePath, state); err != nil {
		return resourceAttentionState{}, err
	}
	return attention, nil
}

// pruneUIStateForArchivedResources removes persisted UI state entries that
// reference resources removed by an archive, so follow stars, expansion state
// and custom ordering cannot leak into a resource that later reuses the ID.
func (s *server) pruneUIStateForArchivedResources(workspacePath string, resourceIDs []string) error {
	if len(resourceIDs) == 0 {
		return nil
	}
	archived := make(map[string]bool, len(resourceIDs))
	for _, id := range resourceIDs {
		archived[normalizedResourceID(id)] = true
	}
	workspace, err := app.OpenWorkspace(workspacePath)
	if err != nil {
		return err
	}
	users, err := workspace.Users()
	if err != nil {
		return err
	}
	s.uiStateMu.Lock()
	defer s.uiStateMu.Unlock()
	for _, user := range users {
		statePath := userUIStatePath(workspacePath, user.Name)
		state, err := loadUIStateFile(statePath)
		if err != nil {
			return err
		}
		state, changed := prunedUIState(state, archived)
		if changed {
			if err := saveUIStateFile(statePath, state); err != nil {
				return err
			}
		}
	}
	sharedPath := resourceStatePath(workspacePath)
	shared, err := loadResourceStateFile(sharedPath)
	if err != nil {
		return err
	}
	sharedChanged := false
	for id := range shared.TurnNumbers {
		if archived[id] {
			delete(shared.TurnNumbers, id)
			sharedChanged = true
		}
	}
	if sharedChanged {
		return saveResourceStateFile(sharedPath, shared)
	}
	return nil
}

func prunedUIState(state uiState, archived map[string]bool) (uiState, bool) {
	changed := false
	for id := range state.Attention {
		if archived[id] {
			delete(state.Attention, id)
			changed = true
		}
	}
	if kept, dropped := dropArchivedResourceIDs(state.ExpandedProjects, archived); dropped {
		state.ExpandedProjects = kept
		changed = true
	}
	if kept, dropped := dropArchivedResourceIDs(state.ProjectOrder, archived); dropped {
		state.ProjectOrder = kept
		changed = true
	}
	for projectID, order := range state.TaskOrder {
		if archived[projectID] {
			delete(state.TaskOrder, projectID)
			changed = true
			continue
		}
		if kept, dropped := dropArchivedResourceIDs(order, archived); dropped {
			state.TaskOrder[projectID] = kept
			changed = true
		}
	}
	if archived[state.LastResourceID] {
		state.LastResourceID = ""
		changed = true
	}
	return state, changed
}

func dropArchivedResourceIDs(ids []string, archived map[string]bool) ([]string, bool) {
	dropped := false
	kept := make([]string, 0, len(ids))
	for _, id := range ids {
		if archived[id] {
			dropped = true
			continue
		}
		kept = append(kept, id)
	}
	if !dropped {
		return ids, false
	}
	return kept, true
}

// allocateResourceTurnNumber advances the resource-wide turn ordinal. It is
// separate from the generation record because a replacement generation must
// not reset the dismiss boundary of the resource.
func (s *server) allocateResourceTurnNumber(path, resourceID string) (int, error) {
	s.uiStateMu.Lock()
	defer s.uiStateMu.Unlock()
	statePath := resourceStatePath(path)
	state, err := loadResourceStateFile(statePath)
	if err != nil {
		return 0, err
	}
	resourceID = normalizedResourceID(resourceID)
	maximum := state.TurnNumbers[resourceID]
	records, err := loadGenerationRecords(path)
	if err != nil {
		return 0, err
	}
	for _, record := range records {
		candidateID := normalizedResourceID(record.ResourceID)
		if candidateID == resourceID && record.TurnNumber > maximum {
			maximum = record.TurnNumber
		}
	}
	state.TurnNumbers[resourceID] = maximum + 1
	if err := saveResourceStateFile(statePath, state); err != nil {
		return 0, err
	}
	return state.TurnNumbers[resourceID], nil
}

func (s *server) handleResourceAttention(w http.ResponseWriter, r *http.Request, workspaceID, resourceID string) {
	workspace, err := s.workspace(workspaceID)
	if err != nil {
		writeError(w, err, http.StatusNotFound)
		return
	}
	resourceID = normalizedResourceID(resourceID)
	userName, err := s.workspaceUserName(r, workspace.Path)
	if err != nil {
		writeError(w, err, http.StatusBadRequest)
		return
	}
	if err := validateAttentionResource(workspace.Path, resourceID); err != nil {
		writeError(w, err, http.StatusBadRequest)
		return
	}
	switch r.Method {
	case http.MethodGet:
		attention, err := s.attentionForResource(workspace.Path, resourceID, userName)
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
				state.ReadTurnNumber = nil
			}
		}, userName)
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
	userName, err := s.workspaceUserName(r, workspace.Path)
	if err != nil {
		writeError(w, err, http.StatusBadRequest)
		return
	}
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
		if state.ReadTurnNumber == nil || *state.ReadTurnNumber < turnNumber {
			state.ReadTurnNumber = cloneIntPointer(&turnNumber)
		}
	}, userName)
	if err != nil {
		writeError(w, err, http.StatusInternalServerError)
		return
	}
	writeJSON(w, resourceAttentionSnapshotForState(attention))
}

func (s *server) attentionForResource(path, resourceID string, userNames ...string) (resourceAttentionState, error) {
	attention, err := s.loadAttentionAtPath(path, userNames...)
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

func selectLatestAgentHubResourceGenerations(records []generationRecord) map[string]generationRecord {
	byResourceID := make(map[string]generationRecord)
	for _, record := range records {
		if strings.TrimSpace(record.GenerationID) == "" || !isAgentHubGeneration(record) {
			continue
		}
		resourceID := normalizedResourceID(record.ResourceID)
		if resourceID == "" {
			resourceID = "workspace"
		}
		if current, ok := byResourceID[resourceID]; !ok || resourceRuntimeGenerationNewer(record, current) {
			byResourceID[resourceID] = record
		}
	}
	return byResourceID
}

func attentionAgentHubResourceGenerations(workspacePath string) (map[string]generationRecord, error) {
	records, err := loadCurrentGenerationRecords(workspacePath)
	if err != nil {
		return nil, fmt.Errorf("load resource generations for active attention turns: %w", err)
	}
	latest := selectLatestAgentHubResourceGenerations(records)
	active := make(map[string]generationRecord)
	for _, record := range records {
		if strings.TrimSpace(record.GenerationID) == "" || !isAgentHubGeneration(record) || !generationHasActiveTurn(record) {
			continue
		}
		resourceID := normalizedResourceID(record.ResourceID)
		if current, ok := active[resourceID]; !ok || resourceRuntimeGenerationNewer(record, current) {
			active[resourceID] = record
		}
	}
	for resourceID, record := range active {
		latest[resourceID] = record
	}
	return latest, nil
}

func (s *server) currentResourceTurnNumber(workspacePath, resourceID string) (int, error) {
	records, err := loadGenerationRecords(workspacePath)
	if err != nil {
		return 0, err
	}
	state, err := loadResourceStateFile(resourceStatePath(workspacePath))
	if err != nil {
		return 0, err
	}
	turnNumber := state.TurnNumbers[normalizedResourceID(resourceID)]
	resourceID = normalizedResourceID(resourceID)
	for _, record := range records {
		if normalizedResourceID(record.ResourceID) == resourceID && record.TurnNumber > turnNumber {
			turnNumber = record.TurnNumber
		}
	}
	return turnNumber, nil
}

func resourceRuntimeSnapshotForGeneration(record generationRecord) *resourceRuntimeSnapshot {
	return &resourceRuntimeSnapshot{
		Generation: record.Generation, GenerationID: record.GenerationID, Status: record.Status,
		AgentName: record.AgentHubAgentName, UpdatedAt: record.UpdatedAt, LastOutputAt: record.LastOutputAt,
		CompletionMarker: record.CompletionMarker, CompletionState: record.CompletionState, CompletionHasFinalReply: record.CompletionHasFinalReply,
		CompletionAt: record.CompletionAt, ReplacementPending: record.ReplacementPending,
		Resumable:         (record.Status == "stopped" || record.Status == "idle-suspended") && record.AgentHubSessionID != "" && !record.SessionResumeUnavailable && !record.ReplacementPending && !record.ArchivedTaskStopRequested,
		IdleSuspended:     record.Status == "idle-suspended" || (record.IdleSleepStopRequested && record.Status == "stopped"),
		ResumeUnavailable: record.SessionResumeUnavailable,
		TurnNumber:        record.TurnNumber, ActiveTurn: generationHasActiveTurn(record), TurnStartedAt: record.TurnStartedAt,
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
		return attention.ReadTurnNumber == nil
	}
	if item.Runtime.ActiveTurn {
		return true
	}
	return attention.ReadTurnNumber == nil || item.Runtime.TurnNumber > *attention.ReadTurnNumber
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

func (s *server) enrichTreeResourceAttention(workspacePath string, tree *workspaceTree, userNames ...string) error {
	attention, err := s.loadAttentionAtPath(workspacePath, userNames...)
	if err != nil {
		return fmt.Errorf("load resource attention for tree: %w", err)
	}
	records, err := attentionAgentHubResourceGenerations(workspacePath)
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
		if record, ok := records[normalizedResourceID(item.ID)]; ok {
			item.Runtime = resourceRuntimeSnapshotForGeneration(record)
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
	if record, ok := records["workspace"]; ok {
		workspaceItem.Runtime = resourceRuntimeSnapshotForGeneration(record)
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
