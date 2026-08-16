package serve

import (
	"encoding/json"
	"fmt"
	"net/http"
	"os"
	"path/filepath"

	"github.com/disksing/pua/internal/app"
	"github.com/disksing/pua/internal/workspacepath"
)

const workspaceUserHeader = "X-PUA-User"

func (s *server) workspaceUserName(r *http.Request, workspacePath string) (string, error) {
	name := r.Header.Get(workspaceUserHeader)
	if name == "" {
		name = app.DefaultUserName
	}
	if err := app.ValidateUserName(name); err != nil {
		return "", err
	}
	workspace, err := app.OpenWorkspace(workspacePath)
	if err != nil {
		return "", err
	}
	if _, err := workspace.User(name); err != nil {
		return "", err
	}
	return name, nil
}

func (s *server) handleUsers(w http.ResponseWriter, r *http.Request, workspaceID string, parts []string) {
	workspace, err := s.workspace(workspaceID)
	if err != nil {
		writeError(w, err, http.StatusNotFound)
		return
	}
	puaWorkspace, err := app.OpenWorkspace(workspace.Path)
	if err != nil {
		writeError(w, err, http.StatusBadRequest)
		return
	}
	if len(parts) == 0 {
		switch r.Method {
		case http.MethodGet:
			users, err := puaWorkspace.Users()
			if err != nil {
				writeError(w, err, http.StatusInternalServerError)
				return
			}
			writeJSON(w, map[string]any{"users": users})
		case http.MethodPost:
			var body struct {
				Name string `json:"name"`
			}
			decoder := json.NewDecoder(r.Body)
			decoder.DisallowUnknownFields()
			if err := decoder.Decode(&body); err != nil {
				writeError(w, err, http.StatusBadRequest)
				return
			}
			profile, err := puaWorkspace.RegisterUser(body.Name)
			if err != nil {
				writeError(w, err, http.StatusBadRequest)
				return
			}
			writeJSON(w, profile)
		default:
			w.WriteHeader(http.StatusMethodNotAllowed)
		}
		return
	}
	if len(parts) != 1 || parts[0] == "" {
		http.NotFound(w, r)
		return
	}
	name := parts[0]
	if err := app.ValidateUserName(name); err != nil {
		writeError(w, err, http.StatusBadRequest)
		return
	}
	switch r.Method {
	case http.MethodPut:
		var body struct {
			Preference string `json:"preference"`
		}
		decoder := json.NewDecoder(r.Body)
		decoder.DisallowUnknownFields()
		if err := decoder.Decode(&body); err != nil {
			writeError(w, err, http.StatusBadRequest)
			return
		}
		profile, err := puaWorkspace.UpdateUserPreference(name, body.Preference)
		if err != nil {
			writeError(w, err, http.StatusNotFound)
			return
		}
		writeJSON(w, profile)
	case http.MethodDelete:
		if err := puaWorkspace.DeleteUser(name); err != nil {
			writeError(w, err, http.StatusNotFound)
			return
		}
		w.WriteHeader(http.StatusNoContent)
	default:
		w.WriteHeader(http.StatusMethodNotAllowed)
	}
}

func (s *server) ensureWorkspaceUsersAndMigrateUIState(workspacePath string) error {
	workspace, err := app.OpenWorkspace(workspacePath)
	if err != nil {
		return err
	}
	if _, err := workspace.EnsureDefaultUser(); err != nil {
		return err
	}

	s.uiStateMu.Lock()
	defer s.uiStateMu.Unlock()
	target := userUIStatePath(workspacePath, app.DefaultUserName)
	targetExists := false
	if _, err := os.Stat(target); err == nil {
		targetExists = true
	} else if !os.IsNotExist(err) {
		return err
	}
	shared, err := loadResourceStateFile(resourceStatePath(workspacePath))
	if err != nil {
		return err
	}
	sharedChanged := false
	legacyPaths := []string{uiStatePath(workspacePath), filepath.Join(workspacepath.ControlDir(workspacePath), "gui-state.json")}
	migratedPaths := make([]string, 0, len(legacyPaths))
	for _, legacy := range legacyPaths {
		if _, err := os.Stat(legacy); os.IsNotExist(err) {
			continue
		} else if err != nil {
			return err
		}
		migratedPaths = append(migratedPaths, legacy)
		state, err := loadUIStateFile(legacy)
		if err != nil {
			return fmt.Errorf("migrate legacy UI state: %w", err)
		}
		for resourceID, attention := range state.Attention {
			if attention.TurnNumber > shared.TurnNumbers[resourceID] {
				shared.TurnNumbers[resourceID] = attention.TurnNumber
				sharedChanged = true
			}
		}
		if !targetExists {
			if err := saveUIStateFile(target, state); err != nil {
				return err
			}
			targetExists = true
		}
	}
	if sharedChanged {
		if err := saveResourceStateFile(resourceStatePath(workspacePath), shared); err != nil {
			return err
		}
	}
	for _, legacy := range migratedPaths {
		_ = os.Remove(legacy)
	}
	return nil
}

func userUIStatePath(workspacePath, userName string) string {
	return filepath.Join(workspacepath.ControlDir(workspacePath), "users", userName, "ui-state.json")
}

func resourceStatePath(workspacePath string) string {
	return filepath.Join(workspacepath.ControlDir(workspacePath), "resource-state.json")
}
