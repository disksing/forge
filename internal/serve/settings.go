package serve

import (
	"net/http"
	"strings"
)

type settingsResponse struct {
	Workspaces []serveWorkspace `json:"workspaces"`
	ActiveID   string           `json:"activeId,omitempty"`
}

const agentOptionModel = "model"

func (s *server) handleSettings(w http.ResponseWriter, r *http.Request) {
	path := strings.Trim(strings.TrimPrefix(r.URL.Path, "/api/settings"), "/")
	if path == "" {
		if r.Method != http.MethodGet {
			w.WriteHeader(http.StatusMethodNotAllowed)
			return
		}
		s.writeSettings(w)
		return
	}
	if path == "agenthub" {
		s.handleAgentHubSettings(w, r)
		return
	}
	http.NotFound(w, r)
}

func (s *server) writeSettings(w http.ResponseWriter) {
	cfg, err := s.loadConfig()
	if err != nil {
		writeError(w, err, http.StatusInternalServerError)
		return
	}
	writeJSON(w, settingsResponse{Workspaces: cfg.Workspaces, ActiveID: cfg.ActiveID})
}

func findAgentProfileRoute(routes []agentProfileRoute, key string) (agentProfileRoute, bool) {
	key = strings.ToLower(strings.TrimSpace(key))
	for _, route := range routes {
		if strings.ToLower(strings.TrimSpace(route.Key)) == key {
			return route, true
		}
	}
	return agentProfileRoute{}, false
}

func configuredAgentProfileName(routes []agentProfileRoute, key string) string {
	route, ok := findAgentProfileRoute(routes, key)
	if !ok {
		return ""
	}
	return strings.TrimSpace(route.AgentName)
}
