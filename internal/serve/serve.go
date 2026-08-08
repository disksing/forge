package serve

import (
	"context"
	"crypto/sha1"
	"crypto/sha256"
	"embed"
	"encoding/hex"
	"encoding/json"
	"errors"
	"flag"
	"fmt"
	"io"
	"io/fs"
	"log"
	"mime"
	"net"
	"net/http"
	"net/url"
	"os"
	"os/exec"
	urlpath "path"
	"path/filepath"
	"strconv"
	"strings"
	"sync"
	"time"
	"unicode/utf8"

	"github.com/disksing/forge/internal/app"
	"github.com/disksing/forge/internal/buildinfo"
)

//go:embed static
var staticFiles embed.FS

type config struct {
	Version            int                 `json:"version"`
	ActiveID           string              `json:"activeId,omitempty"`
	Workspaces         []guiWorkspace      `json:"workspaces"`
	AgentHubEndpoint   string              `json:"agentHubEndpoint,omitempty"`
	AgentHubInstanceID string              `json:"agentHubInstanceId,omitempty"`
	AgentProfiles      []agentProfileRoute `json:"agentProfiles,omitempty"`
}

type agentProfileRoute struct {
	Key         string `json:"key"`
	Description string `json:"description,omitempty"`
	AgentName   string `json:"agentName,omitempty"`
}

type guiWorkspace struct {
	ID   string `json:"id"`
	Name string `json:"name"`
	Path string `json:"path"`
	Icon string `json:"icon,omitempty"`
}

var workspaceIconFiles = map[string]string{
	"home-base":               "01-home-base.png",
	"personal-tasks":          "02-personal-tasks.png",
	"product-roadmap":         "03-product-roadmap.png",
	"software-engineering":    "04-software-engineering.png",
	"design-studio":           "05-design-studio.png",
	"marketing-campaign":      "06-marketing-campaign.png",
	"sales-pipeline":          "07-sales-pipeline.png",
	"operations":              "08-operations.png",
	"finance":                 "09-finance.png",
	"research-lab":            "10-research-lab.png",
	"learning-education":      "11-learning-education.png",
	"customer-support":        "12-customer-support.png",
	"events-calendar":         "13-events-calendar.png",
	"documentation-knowledge": "14-documentation-knowledge.png",
	"analytics":               "15-analytics.png",
	"community-team":          "16-community-team.png",
}

const (
	agentsManagedStart = "<!-- managed by forge cli -->"
	agentsManagedEnd   = "<!-- end of forge cli prompt -->"
)

type workspaceTree struct {
	Root     string             `json:"root"`
	Projects []resourceSnapshot `json:"projects"`
	Sessions []guiSession       `json:"sessions"`
	Wiki     workspaceWiki      `json:"wiki"`
}

type workspaceWiki struct {
	Exists  bool            `json:"exists"`
	Entries []fileTreeEntry `json:"entries"`
	Error   string          `json:"error,omitempty"`
}

type fileTreeEntry struct {
	Name     string          `json:"name"`
	Path     string          `json:"path"`
	Type     string          `json:"type"`
	Size     int64           `json:"size,omitempty"`
	Modified string          `json:"modified,omitempty"`
	Children []fileTreeEntry `json:"children,omitempty"`
}

type resourceSnapshot struct {
	ID       string             `json:"id"`
	Type     string             `json:"type"`
	Title    string             `json:"title"`
	Path     string             `json:"path"`
	Archived bool               `json:"archived"`
	AutoRun  *autoRunSnapshot   `json:"autoRun,omitempty"`
	Children []resourceSnapshot `json:"children,omitempty"`
}

type autoRunSnapshot struct {
	Generation int    `json:"generation"`
	State      string `json:"state"`
}

type filePreview struct {
	Path        string `json:"path"`
	Name        string `json:"name"`
	Size        int64  `json:"size"`
	Truncated   bool   `json:"truncated"`
	Binary      bool   `json:"binary"`
	Image       bool   `json:"image"`
	MimeType    string `json:"mimeType,omitempty"`
	Content     string `json:"content,omitempty"`
	ContentHash string `json:"contentHash,omitempty"`
}

type diffResponse struct {
	Path       string `json:"path"`
	Name       string `json:"name"`
	Branch     string `json:"branch"`
	Base       string `json:"base,omitempty"`
	Diff       string `json:"diff"`
	HasChanges bool   `json:"hasChanges"`
}

type guiState struct {
	Version          int                 `json:"version"`
	ExpandedProjects []string            `json:"expandedProjects"`
	LastResourceID   string              `json:"lastResourceId,omitempty"`
	ProjectOrder     []string            `json:"projectOrder,omitempty"`
	TaskOrder        map[string][]string `json:"taskOrder,omitempty"`
	SessionOrder     []string            `json:"sessionOrder,omitempty"`
}

type guiSession struct {
	ID                       string              `json:"id"`
	Liveness                 json.RawMessage     `json:"liveness,omitempty"`
	Controls                 []guiSessionControl `json:"controls"`
	StartedAt                string              `json:"startedAt"`
	UpdatedAt                string              `json:"updatedAt"`
	Source                   string              `json:"source"`
	AgentRunID               string              `json:"agentRunId,omitempty"`
	AgentRunAgentName        string              `json:"agentRunAgentName,omitempty"`
	AgentRunTitle            string              `json:"agentRunTitle,omitempty"`
	AgentRunStatus           string              `json:"agentRunStatus,omitempty"`
	AgentRunUpdatedAt        string              `json:"agentRunUpdatedAt,omitempty"`
	AgentRunLastOutputAt     string              `json:"agentRunLastOutputAt,omitempty"`
	SchedulerTurn            bool                `json:"schedulerTurn,omitempty"`
	AutoRunGeneration        int                 `json:"autoRunGeneration,omitempty"`
	ResourceID               string              `json:"resourceId,omitempty"`
	AgentRunCompletionMarker string              `json:"agentRunCompletionMarker,omitempty"`
	AgentRunCompletionState  string              `json:"agentRunCompletionState,omitempty"`
	AgentRunCompletionAt     string              `json:"agentRunCompletionAt,omitempty"`
}

type guiSessionControl struct {
	ResourceID string `json:"resourceId,omitempty"`
	Path       string `json:"path"`
}

type resourceLogRequest struct {
	paged  bool
	cursor string
	limit  int
}

type server struct {
	addr   string
	config string
	agents *agentManager
	locks  *workspaceLockManager
	// autoRunDispatchMu serializes AutoRun dispatch decisions between the
	// background driver and the unified Chat start endpoint, so concurrent
	// scans and manual clicks never start the same generation twice.
	autoRunDispatchMu sync.Mutex
}

const (
	previewMaxBytes  = 512 * 1024
	diffMaxBytes     = 4 * 1024 * 1024
	workspaceWikiDir = "wiki"
)

const serveUsage = `usage: forge serve [--addr=<address>] [--workspace=<path>] [--version]

Start the Forge web service: Workspace API, AutoRun scheduler, AgentHub
session orchestration and recovery, and the static web UI.
The service uses the in-process application API rooted at each explicit
Workspace path; it does not invoke the forge CLI as a child process.

Options:
  --addr <address>       local address to listen on (default 127.0.0.1:4936)
  --workspace <path>     AgentWorkspace path to add before starting
  --version              print build-time branch and sha

Workspace ownership:
  Each managed Workspace is exclusively owned by one forge serve process via
  an OS advisory lock at <workspace>/.forge/serve.lock. A second instance
  using a different FORGE_GUI_CONFIG cannot manage the same Workspace; it
  fails at startup before scheduling or recovery begins. The OS releases the
  lock automatically when the owning process exits.

Environment overrides:
  FORGE_AGENTHUB_URL  AgentHub endpoint override
  FORGE_GUI_CONFIG    GUI configuration file path
`

// Main runs the forge serve subcommand.
func Main(args []string) error {
	for _, arg := range args {
		if arg == "-h" || arg == "--help" {
			fmt.Print(serveUsage)
			return nil
		}
	}
	flags := flag.NewFlagSet("forge serve", flag.ContinueOnError)
	flags.SetOutput(io.Discard)
	var addr string
	var initialWorkspace string
	var showVersion bool
	flags.StringVar(&addr, "addr", "127.0.0.1:4936", "local address to listen on")
	flags.StringVar(&initialWorkspace, "workspace", "", "AgentWorkspace path to add before starting")
	flags.BoolVar(&showVersion, "version", false, "print build-time branch and sha")
	if err := flags.Parse(args); err != nil {
		fmt.Fprint(os.Stderr, serveUsage)
		return err
	}
	if flags.NArg() != 0 {
		fmt.Fprint(os.Stderr, serveUsage)
		return fmt.Errorf("unexpected positional argument %q", flags.Arg(0))
	}
	if showVersion {
		fmt.Print(buildinfo.Text("forge"))
		return nil
	}

	configPath, err := defaultConfigPath()
	if err != nil {
		return err
	}
	configLock, err := acquireGUIConfigLock(configPath, addr)
	if err != nil {
		return err
	}
	defer configLock.Close()
	s := &server{
		addr:   addr,
		config: configPath,
		locks:  newWorkspaceLockManager(addr, configPath),
	}
	defer s.locks.closeAll()
	_, err = s.validatePersistedAgentHubConfig(context.Background())
	if err != nil {
		return fmt.Errorf("validate AgentHub configuration: %w", err)
	}
	s.agents = newAgentManager(s)
	if initialWorkspace != "" {
		if _, err := s.addWorkspace(context.Background(), initialWorkspace); err != nil {
			return fmt.Errorf("add initial workspace: %w", err)
		}
	} else {
		s.addCurrentDirectoryIfEmpty(context.Background())
	}
	// Every configured Workspace must be owned before the AutoRun scheduler,
	// AgentHub recovery, or any writable HTTP endpoint may touch it.
	if err := s.acquireConfiguredWorkspaceLocks(); err != nil {
		return err
	}
	s.agents.startAgentRecovery(context.Background())
	go s.runTaskScheduler(context.Background())

	staticRoot, err := fs.Sub(staticFiles, "static")
	if err != nil {
		return err
	}
	mux := http.NewServeMux()
	mux.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		serveStatic(staticRoot, w, r)
	})
	mux.HandleFunc("/api/workspaces", s.handleWorkspaces)
	mux.HandleFunc("/api/workspaces/", s.handleWorkspace)
	mux.HandleFunc("/api/settings", s.handleSettings)
	mux.HandleFunc("/api/settings/", s.handleSettings)

	log.Printf("forge serve listening on http://%s", addr)
	return http.ListenAndServe(addr, mux)
}

func (s *server) internalEndpoint() string {
	addr := strings.TrimSpace(s.addr)
	if addr == "" {
		addr = "127.0.0.1:4936"
	}
	if strings.HasPrefix(addr, "http://") || strings.HasPrefix(addr, "https://") {
		return strings.TrimRight(addr, "/")
	}
	host, port, err := net.SplitHostPort(addr)
	if err == nil {
		if host == "" || host == "0.0.0.0" || host == "::" {
			host = "127.0.0.1"
		}
		return "http://" + net.JoinHostPort(host, port)
	}
	return "http://" + strings.TrimRight(addr, "/")
}

func (s *server) handleWorkspaces(w http.ResponseWriter, r *http.Request) {
	switch r.Method {
	case http.MethodGet:
		cfg, err := s.loadConfig()
		if err != nil {
			writeError(w, err, http.StatusInternalServerError)
			return
		}
		writeJSON(w, cfg)
	case http.MethodPost:
		var body struct {
			Path   string `json:"path"`
			Create bool   `json:"create"`
		}
		if err := json.NewDecoder(r.Body).Decode(&body); err != nil {
			writeError(w, err, http.StatusBadRequest)
			return
		}
		workspace, err := s.addWorkspaceWithOptions(r.Context(), body.Path, body.Create)
		if err != nil {
			var conflict *workspaceLockConflictError
			if errors.As(err, &conflict) {
				writeError(w, err, http.StatusConflict)
				return
			}
			writeError(w, err, http.StatusBadRequest)
			return
		}
		writeJSON(w, workspace)
	default:
		w.WriteHeader(http.StatusMethodNotAllowed)
	}
}

func (s *server) handleWorkspace(w http.ResponseWriter, r *http.Request) {
	parts := strings.Split(strings.Trim(strings.TrimPrefix(r.URL.Path, "/api/workspaces/"), "/"), "/")
	if len(parts) == 0 || parts[0] == "" {
		writeError(w, errors.New("workspace id is required"), http.StatusBadRequest)
		return
	}
	id := parts[0]
	if len(parts) == 1 {
		if r.Method == http.MethodPut {
			var body struct {
				Icon string `json:"icon"`
			}
			decoder := json.NewDecoder(r.Body)
			decoder.DisallowUnknownFields()
			if err := decoder.Decode(&body); err != nil {
				writeError(w, err, http.StatusBadRequest)
				return
			}
			workspace, err := s.updateWorkspaceIcon(id, body.Icon)
			if err != nil {
				writeError(w, err, http.StatusBadRequest)
				return
			}
			writeJSON(w, workspace)
			return
		}
		if r.Method != http.MethodDelete {
			w.WriteHeader(http.StatusMethodNotAllowed)
			return
		}
		if err := s.removeWorkspace(id); err != nil {
			writeError(w, err, http.StatusNotFound)
			return
		}
		w.WriteHeader(http.StatusNoContent)
		return
	}

	switch parts[1] {
	case "tree":
		if r.Method != http.MethodGet {
			w.WriteHeader(http.StatusMethodNotAllowed)
			return
		}
		tree, err := s.tree(r.Context(), id)
		if err != nil {
			writeError(w, err, http.StatusBadRequest)
			return
		}
		writeJSON(w, tree)
	case "resources":
		if r.Method != http.MethodGet {
			w.WriteHeader(http.StatusMethodNotAllowed)
			return
		}
		if len(parts) != 3 || parts[2] == "" {
			writeError(w, errors.New("resource id is required"), http.StatusBadRequest)
			return
		}
		logRequest, err := parseResourceLogRequest(r.URL.Query())
		if err != nil {
			writeError(w, err, http.StatusBadRequest)
			return
		}
		detail, err := s.resource(r.Context(), id, parts[2], logRequest)
		if err != nil {
			writeError(w, err, http.StatusBadRequest)
			return
		}
		writeJSON(w, detail)
	case "files":
		if len(parts) == 3 && parts[2] == "raw" {
			if r.Method != http.MethodGet {
				w.WriteHeader(http.StatusMethodNotAllowed)
				return
			}
			s.serveRawFile(w, r, id)
			return
		}
		if len(parts) != 2 {
			http.NotFound(w, r)
			return
		}
		switch r.Method {
		case http.MethodGet:
			s.previewFile(w, r, id)
		case http.MethodPut:
			s.saveWorkspaceAgentsFile(w, r, id)
		default:
			w.WriteHeader(http.StatusMethodNotAllowed)
		}
	case "wiki":
		if len(parts) == 4 && parts[2] == "files" && parts[3] == "raw" {
			if r.Method != http.MethodGet {
				w.WriteHeader(http.StatusMethodNotAllowed)
				return
			}
			s.serveRawWikiFile(w, r, id)
			return
		}
		if len(parts) != 3 || parts[2] != "files" {
			http.NotFound(w, r)
			return
		}
		if r.Method != http.MethodGet {
			w.WriteHeader(http.StatusMethodNotAllowed)
			return
		}
		s.previewWikiFile(w, r, id)
	case "diff":
		if r.Method != http.MethodGet {
			w.WriteHeader(http.StatusMethodNotAllowed)
			return
		}
		s.worktreeDiff(w, r, id)
	case "ui-state":
		s.handleUIState(w, r, id)
	case "autorun":
		if len(parts) != 3 || (parts[2] != "start" && parts[2] != "cancel") {
			http.NotFound(w, r)
			return
		}
		if r.Method != http.MethodPost {
			w.WriteHeader(http.StatusMethodNotAllowed)
			return
		}
		if parts[2] == "start" {
			s.startChatAutoRun(w, r, id)
		} else {
			s.cancelChatAutoRun(w, r, id)
		}
	case "agent":
		s.agents.handle(w, r, id, parts[2:])
	case "projects":
		if r.Method != http.MethodPost {
			w.WriteHeader(http.StatusMethodNotAllowed)
			return
		}
		s.createProject(w, r, id)
	case "tasks":
		if r.Method != http.MethodPost {
			w.WriteHeader(http.StatusMethodNotAllowed)
			return
		}
		if len(parts) == 3 && parts[2] == "preview" {
			s.previewTask(w, r, id)
			return
		}
		if len(parts) != 2 {
			http.NotFound(w, r)
			return
		}
		s.createTask(w, r, id)
	case "templates":
		s.handleTemplates(w, r, id, parts[2:])
	case "archive":
		if r.Method != http.MethodPost {
			w.WriteHeader(http.StatusMethodNotAllowed)
			return
		}
		s.archiveResource(w, r, id)
	default:
		http.NotFound(w, r)
	}
}

func (s *server) handleUIState(w http.ResponseWriter, r *http.Request, id string) {
	switch r.Method {
	case http.MethodGet:
		state, err := s.loadUIState(id)
		if err != nil {
			writeError(w, err, http.StatusBadRequest)
			return
		}
		writeJSON(w, state)
	case http.MethodPut:
		var state guiState
		if err := json.NewDecoder(r.Body).Decode(&state); err != nil {
			writeError(w, err, http.StatusBadRequest)
			return
		}
		if err := s.saveUIState(id, state); err != nil {
			writeError(w, err, http.StatusBadRequest)
			return
		}
		saved, err := s.loadUIState(id)
		if err != nil {
			writeError(w, err, http.StatusBadRequest)
			return
		}
		writeJSON(w, saved)
	default:
		w.WriteHeader(http.StatusMethodNotAllowed)
	}
}

func (s *server) createProject(w http.ResponseWriter, r *http.Request, id string) {
	var body struct {
		Description string `json:"description"`
		Slug        string `json:"slug"`
	}
	if err := json.NewDecoder(r.Body).Decode(&body); err != nil {
		writeError(w, err, http.StatusBadRequest)
		return
	}
	workspace, err := s.workspace(id)
	if err != nil {
		writeError(w, err, http.StatusBadRequest)
		return
	}
	forgeWorkspace, err := app.OpenWorkspace(workspace.Path)
	if err != nil {
		writeError(w, err, http.StatusBadRequest)
		return
	}
	result, err := forgeWorkspace.CreateProject(body.Description, body.Slug)
	if err != nil {
		writeError(w, err, http.StatusBadRequest)
		return
	}
	writeJSON(w, result)
}

type createTaskRequest struct {
	Project                string         `json:"project"`
	Title                  string         `json:"title"`
	Detail                 string         `json:"detail"`
	TaskMarkdown           *string        `json:"taskMarkdown"`
	Description            string         `json:"description"`
	TemplateName           string         `json:"templateName"`
	TemplateFields         map[string]any `json:"templateFields"`
	ExpectedTemplateDigest string         `json:"expectedTemplateDigest"`
	Slug                   string         `json:"slug"`
	AutoRun                bool           `json:"autorun"`
	AgentName              string         `json:"agentName"`
	PreferredAgentProfiles []string       `json:"preferredAgentProfiles"`
	Prompt                 string         `json:"prompt"`
	CompletionCriteria     string         `json:"completionCriteria"`
}

func decodeCreateTaskRequest(r *http.Request) (createTaskRequest, error) {
	var body createTaskRequest
	decoder := json.NewDecoder(r.Body)
	decoder.DisallowUnknownFields()
	if err := decoder.Decode(&body); err != nil {
		return body, err
	}
	if strings.TrimSpace(body.Title) == "" {
		body.Title = body.Description
	}
	if body.TaskMarkdown != nil && strings.TrimSpace(body.Detail) != "" {
		return body, errors.New("detail and taskMarkdown are mutually exclusive")
	}
	if strings.TrimSpace(body.TemplateName) != "" && (body.TaskMarkdown != nil || strings.TrimSpace(body.Detail) != "") {
		return body, errors.New("templateName is mutually exclusive with detail and taskMarkdown")
	}
	if !body.AutoRun && (strings.TrimSpace(body.AgentName) != "" || len(body.PreferredAgentProfiles) > 0 || strings.TrimSpace(body.Prompt) != "" || strings.TrimSpace(body.CompletionCriteria) != "") {
		return body, errors.New("agentName, preferredAgentProfiles, prompt, and completionCriteria require autorun")
	}
	return body, nil
}

func createTaskInputFromRequest(body createTaskRequest) app.CreateTaskInput {
	input := app.CreateTaskInput{
		ProjectID: body.Project, Title: body.Title, Detail: body.Detail, Slug: body.Slug,
		TemplateName: body.TemplateName, TemplateFields: body.TemplateFields, ExpectedTemplateDigest: body.ExpectedTemplateDigest,
		AutoRun: body.AutoRun, AgentName: body.AgentName, PreferredAgentProfiles: body.PreferredAgentProfiles,
		Prompt: body.Prompt, CompletionCriteria: body.CompletionCriteria,
	}
	if body.TaskMarkdown != nil {
		input.CompleteMarkdown, input.CompleteMarkdownSet = *body.TaskMarkdown, true
	}
	return input
}

func (s *server) createTask(w http.ResponseWriter, r *http.Request, id string) {
	body, err := decodeCreateTaskRequest(r)
	if err != nil {
		writeError(w, err, http.StatusBadRequest)
		return
	}
	workspace, err := s.workspace(id)
	if err != nil {
		writeError(w, err, http.StatusBadRequest)
		return
	}
	forgeWorkspace, err := app.OpenWorkspace(workspace.Path)
	if err != nil {
		writeError(w, err, http.StatusBadRequest)
		return
	}
	result, err := forgeWorkspace.CreateTask(createTaskInputFromRequest(body))
	if err != nil {
		status := http.StatusBadRequest
		if app.IsKind(err, "template_conflict") {
			status = http.StatusConflict
		}
		writeError(w, err, status)
		return
	}
	writeJSON(w, result)
}

func (s *server) previewTask(w http.ResponseWriter, r *http.Request, id string) {
	body, err := decodeCreateTaskRequest(r)
	if err != nil {
		writeError(w, err, http.StatusBadRequest)
		return
	}
	workspace, err := s.workspace(id)
	if err != nil {
		writeError(w, err, http.StatusBadRequest)
		return
	}
	forgeWorkspace, err := app.OpenWorkspace(workspace.Path)
	if err != nil {
		writeError(w, err, http.StatusBadRequest)
		return
	}
	result, err := forgeWorkspace.PreviewTask(createTaskInputFromRequest(body))
	if err != nil {
		writeError(w, err, http.StatusBadRequest)
		return
	}
	writeJSON(w, result)
}

func (s *server) handleTemplates(w http.ResponseWriter, r *http.Request, id string, parts []string) {
	workspace, err := s.workspace(id)
	if err != nil {
		writeError(w, err, http.StatusBadRequest)
		return
	}
	forgeWorkspace, err := app.OpenWorkspace(workspace.Path)
	if err != nil {
		writeError(w, err, http.StatusBadRequest)
		return
	}
	projectID := strings.TrimSpace(r.URL.Query().Get("project"))
	if len(parts) == 0 {
		if r.Method != http.MethodGet {
			w.WriteHeader(http.StatusMethodNotAllowed)
			return
		}
		result, err := forgeWorkspace.Templates(projectID)
		if err != nil {
			writeError(w, err, http.StatusBadRequest)
			return
		}
		writeJSON(w, map[string]any{"templates": result})
		return
	}
	if len(parts) == 1 && parts[0] == "validate" {
		if r.Method != http.MethodPost {
			w.WriteHeader(http.StatusMethodNotAllowed)
			return
		}
		var body struct {
			Name    string `json:"name"`
			Content string `json:"content"`
		}
		decoder := json.NewDecoder(r.Body)
		decoder.DisallowUnknownFields()
		if err := decoder.Decode(&body); err != nil {
			writeError(w, err, http.StatusBadRequest)
			return
		}
		writeJSON(w, forgeWorkspace.ValidateTemplateContent(body.Name, body.Content))
		return
	}
	name := parts[0]
	if len(parts) == 1 {
		if r.Method != http.MethodGet {
			w.WriteHeader(http.StatusMethodNotAllowed)
			return
		}
		result, err := forgeWorkspace.Template(projectID, name)
		if err != nil {
			writeError(w, err, http.StatusNotFound)
			return
		}
		writeJSON(w, result)
		return
	}
	if len(parts) == 2 && parts[1] == "render" {
		if r.Method != http.MethodPost {
			w.WriteHeader(http.StatusMethodNotAllowed)
			return
		}
		var body struct {
			Fields map[string]any `json:"fields"`
			Title  string         `json:"title"`
		}
		decoder := json.NewDecoder(r.Body)
		decoder.DisallowUnknownFields()
		if err := decoder.Decode(&body); err != nil {
			writeError(w, err, http.StatusBadRequest)
			return
		}
		result, err := forgeWorkspace.RenderTemplate(app.TemplateRenderInput{ProjectID: projectID, Name: name, Fields: body.Fields, Title: body.Title})
		if err != nil {
			writeError(w, err, http.StatusBadRequest)
			return
		}
		writeJSON(w, result)
		return
	}
	http.NotFound(w, r)
}

func (s *server) archiveResource(w http.ResponseWriter, r *http.Request, id string) {
	var body struct {
		ResourceID string `json:"resourceId"`
	}
	if err := json.NewDecoder(r.Body).Decode(&body); err != nil {
		writeError(w, err, http.StatusBadRequest)
		return
	}
	resourceID := strings.TrimSpace(body.ResourceID)
	if resourceID == "" {
		writeError(w, errors.New("resourceId is required"), http.StatusBadRequest)
		return
	}
	workspace, err := s.workspace(id)
	if err != nil {
		writeError(w, err, http.StatusBadRequest)
		return
	}
	forgeWorkspace, err := app.OpenWorkspace(workspace.Path)
	if err != nil {
		writeError(w, err, http.StatusBadRequest)
		return
	}
	result, err := forgeWorkspace.ArchiveResource(resourceID)
	if err != nil {
		writeError(w, err, http.StatusBadRequest)
		return
	}
	// Keep the existing HTTP response contract while the application layer
	// returns the richer typed ArchiveResult to in-process callers.
	writeJSON(w, map[string]string{"path": result.Path})
}

func (s *server) worktreeDiff(w http.ResponseWriter, r *http.Request, id string) {
	workspace, err := s.workspace(id)
	if err != nil {
		writeError(w, err, http.StatusNotFound)
		return
	}
	relPath := strings.TrimSpace(r.URL.Query().Get("path"))
	if relPath == "" {
		writeError(w, errors.New("path is required"), http.StatusBadRequest)
		return
	}
	cleanRelPath := filepath.ToSlash(filepath.Clean(relPath))
	if isHiddenAgentsPath(cleanRelPath) {
		writeError(w, errors.New("project and task AGENTS.md files are hidden in Forge GUI"), http.StatusNotFound)
		return
	}
	abs, err := safeWorkspacePath(workspace.Path, relPath)
	if err != nil {
		writeError(w, err, http.StatusBadRequest)
		return
	}
	info, err := os.Stat(abs)
	if err != nil {
		writeError(w, err, http.StatusNotFound)
		return
	}
	if !info.IsDir() {
		writeError(w, errors.New("diff path must be a worktree directory"), http.StatusBadRequest)
		return
	}
	if _, err := s.runGit(r.Context(), abs, "rev-parse", "--show-toplevel"); err != nil {
		writeError(w, fmt.Errorf("not a git worktree: %w", err), http.StatusBadRequest)
		return
	}
	branchOut, _ := s.runGit(r.Context(), abs, "rev-parse", "--abbrev-ref", "HEAD")
	branch := strings.TrimSpace(string(branchOut))
	base := strings.TrimSpace(r.URL.Query().Get("base"))
	if !safeGitRef(base) {
		base = ""
	}
	diff, err := s.buildDiff(r.Context(), abs, base)
	if err != nil {
		writeError(w, err, http.StatusBadRequest)
		return
	}
	writeJSON(w, diffResponse{
		Path:       filepath.ToSlash(filepath.Clean(relPath)),
		Name:       info.Name(),
		Branch:     branch,
		Base:       base,
		Diff:       diff,
		HasChanges: strings.TrimSpace(diff) != "",
	})
}

func (s *server) previewFile(w http.ResponseWriter, r *http.Request, id string) {
	workspace, err := s.workspace(id)
	if err != nil {
		writeError(w, err, http.StatusNotFound)
		return
	}
	relPath := strings.TrimSpace(r.URL.Query().Get("path"))
	if relPath == "" {
		writeError(w, errors.New("path is required"), http.StatusBadRequest)
		return
	}
	abs, err := safeWorkspacePath(workspace.Path, relPath)
	if err != nil {
		writeError(w, err, http.StatusBadRequest)
		return
	}
	previewPath(w, relPath, abs)
}

func (s *server) previewWikiFile(w http.ResponseWriter, r *http.Request, id string) {
	workspace, err := s.workspace(id)
	if err != nil {
		writeError(w, err, http.StatusNotFound)
		return
	}
	relPath := strings.TrimSpace(r.URL.Query().Get("path"))
	if relPath == "" {
		writeError(w, errors.New("path is required"), http.StatusBadRequest)
		return
	}
	abs, err := safeWikiPath(workspace.Path, relPath)
	if err != nil {
		writeError(w, err, http.StatusBadRequest)
		return
	}
	previewPath(w, relPath, abs)
}

func previewPath(w http.ResponseWriter, relPath, abs string) {
	info, err := os.Stat(abs)
	if err != nil {
		writeError(w, err, http.StatusNotFound)
		return
	}
	if info.IsDir() {
		writeError(w, errors.New("cannot preview a directory"), http.StatusBadRequest)
		return
	}

	file, err := os.Open(abs)
	if err != nil {
		writeError(w, err, http.StatusInternalServerError)
		return
	}
	defer file.Close()

	data, err := io.ReadAll(io.LimitReader(file, previewMaxBytes+1))
	if err != nil {
		writeError(w, err, http.StatusInternalServerError)
		return
	}
	truncated := len(data) > previewMaxBytes
	if truncated {
		data = data[:previewMaxBytes]
	}
	binary := containsNUL(data) || !utf8.Valid(data)
	mimeType := fileMimeType(relPath, data)
	image := isPreviewableImage(relPath)
	preview := filePreview{
		Path:        filepath.ToSlash(filepath.Clean(relPath)),
		Name:        info.Name(),
		Size:        info.Size(),
		Truncated:   truncated,
		Binary:      binary,
		Image:       image,
		MimeType:    mimeType,
		ContentHash: previewContentHash(data),
	}
	if !binary && !image {
		preview.Content = string(data)
	}
	writeJSON(w, preview)
}

func previewContentHash(data []byte) string {
	digest := sha256.Sum256(data)
	return hex.EncodeToString(digest[:])
}

func (s *server) saveWorkspaceAgentsFile(w http.ResponseWriter, r *http.Request, id string) {
	workspace, err := s.workspace(id)
	if err != nil {
		writeError(w, err, http.StatusNotFound)
		return
	}
	relPath := filepath.ToSlash(filepath.Clean(strings.TrimSpace(r.URL.Query().Get("path"))))
	if relPath != "AGENTS.md" {
		writeError(w, errors.New("only workspace AGENTS.md can be edited"), http.StatusBadRequest)
		return
	}
	var body struct {
		Content string `json:"content"`
	}
	if err := json.NewDecoder(r.Body).Decode(&body); err != nil {
		writeError(w, err, http.StatusBadRequest)
		return
	}
	path := filepath.Join(workspace.Path, "AGENTS.md")
	current := ""
	if data, err := os.ReadFile(path); err == nil {
		current = string(data)
	} else if !os.IsNotExist(err) {
		writeError(w, err, http.StatusInternalServerError)
		return
	}
	updated, err := replaceAgentsUserContent(current, body.Content)
	if err != nil {
		writeError(w, err, http.StatusBadRequest)
		return
	}
	if err := os.WriteFile(path, []byte(updated), 0o644); err != nil {
		writeError(w, err, http.StatusInternalServerError)
		return
	}
	s.previewFile(w, r, id)
}

func replaceAgentsUserContent(current, userContent string) (string, error) {
	start := strings.Index(current, agentsManagedStart)
	end := strings.Index(current, agentsManagedEnd)
	if (start == -1) != (end == -1) {
		return "", errors.New("AGENTS.md has only one forge managed marker")
	}
	userContent = strings.TrimRight(userContent, " \t\r\n")
	if start == -1 {
		if userContent == "" {
			return "", nil
		}
		return userContent + "\n", nil
	}
	if end < start {
		return "", errors.New("AGENTS.md forge managed end marker appears before start marker")
	}
	end += len(agentsManagedEnd)
	managedBlock := strings.TrimRight(current[start:end], " \t\r\n")
	if userContent == "" {
		return managedBlock + "\n", nil
	}
	return userContent + "\n\n" + managedBlock + "\n", nil
}

func isHiddenAgentsPath(relPath string) bool {
	return relPath != "AGENTS.md" && urlpath.Base(relPath) == "AGENTS.md"
}

func (s *server) serveRawFile(w http.ResponseWriter, r *http.Request, id string) {
	workspace, err := s.workspace(id)
	if err != nil {
		writeError(w, err, http.StatusNotFound)
		return
	}
	relPath := strings.TrimSpace(r.URL.Query().Get("path"))
	if relPath == "" {
		writeError(w, errors.New("path is required"), http.StatusBadRequest)
		return
	}
	abs, err := safeWorkspacePath(workspace.Path, relPath)
	if err != nil {
		writeError(w, err, http.StatusBadRequest)
		return
	}
	serveRawPath(w, r, relPath, abs)
}

func (s *server) serveRawWikiFile(w http.ResponseWriter, r *http.Request, id string) {
	workspace, err := s.workspace(id)
	if err != nil {
		writeError(w, err, http.StatusNotFound)
		return
	}
	relPath := strings.TrimSpace(r.URL.Query().Get("path"))
	if relPath == "" {
		writeError(w, errors.New("path is required"), http.StatusBadRequest)
		return
	}
	abs, err := safeWikiPath(workspace.Path, relPath)
	if err != nil {
		writeError(w, err, http.StatusBadRequest)
		return
	}
	serveRawPath(w, r, relPath, abs)
}

func serveRawPath(w http.ResponseWriter, r *http.Request, relPath, abs string) {
	file, err := os.Open(abs)
	if err != nil {
		writeError(w, err, http.StatusNotFound)
		return
	}
	defer file.Close()
	info, err := file.Stat()
	if err != nil {
		writeError(w, err, http.StatusInternalServerError)
		return
	}
	if info.IsDir() {
		writeError(w, errors.New("cannot preview a directory"), http.StatusBadRequest)
		return
	}
	if r.URL.Query().Get("download") == "1" {
		w.Header().Set("Content-Type", "application/octet-stream")
		w.Header().Set("Content-Disposition", mime.FormatMediaType("attachment", map[string]string{"filename": info.Name()}))
		w.Header().Set("X-Content-Type-Options", "nosniff")
		http.ServeContent(w, r, info.Name(), info.ModTime(), file)
		return
	}
	sample, err := io.ReadAll(io.LimitReader(file, previewMaxBytes+1))
	if err != nil {
		writeError(w, err, http.StatusInternalServerError)
		return
	}
	if _, err := file.Seek(0, io.SeekStart); err != nil {
		writeError(w, err, http.StatusInternalServerError)
		return
	}
	if !isPreviewableImage(relPath) && (containsNUL(sample) || !utf8.Valid(sample)) {
		writeError(w, errors.New("raw preview is only available for text and common image formats"), http.StatusBadRequest)
		return
	}
	w.Header().Set("Content-Type", contentTypeWithCharset(fileMimeType(relPath, sample)))
	w.Header().Set("Content-Disposition", "inline")
	w.Header().Set("X-Content-Type-Options", "nosniff")
	http.ServeContent(w, r, info.Name(), info.ModTime(), file)
}

func (s *server) addCurrentDirectoryIfEmpty(ctx context.Context) {
	cfg, err := s.loadConfig()
	if err != nil || len(cfg.Workspaces) > 0 {
		return
	}
	cwd, err := os.Getwd()
	if err != nil {
		return
	}
	if _, err := s.addWorkspace(ctx, cwd); err != nil {
		log.Printf("add current directory as workspace: %v", err)
	}
}

func (s *server) addWorkspace(ctx context.Context, path string) (guiWorkspace, error) {
	return s.addWorkspaceWithOptions(ctx, path, false)
}

func (s *server) addWorkspaceWithOptions(ctx context.Context, path string, create bool) (workspace guiWorkspace, err error) {
	path = strings.TrimSpace(path)
	if path == "" {
		return guiWorkspace{}, errors.New("workspace path is required")
	}
	abs, err := filepath.Abs(path)
	if err != nil {
		return guiWorkspace{}, err
	}
	if create {
		if err := os.MkdirAll(abs, 0o755); err != nil {
			return guiWorkspace{}, err
		}
	}
	canonical, err := canonicalWorkspacePath(abs)
	if err != nil {
		return guiWorkspace{}, err
	}
	// Ownership comes first: the lock is acquired before the Workspace is
	// inspected or persisted, and rolled back if any later step fails, so a
	// failed add never leaves a half-written config or a stray lock.
	locked := false
	if s.locks != nil && !s.locks.owns(canonical) {
		if _, err := s.locks.acquire(canonical); err != nil {
			return guiWorkspace{}, err
		}
		locked = true
	}
	defer func() {
		if err != nil && locked {
			s.locks.release(canonical)
		}
	}()
	tree, err := s.treeAt(ctx, canonical)
	if err != nil {
		if !create {
			return guiWorkspace{}, err
		}
		if _, initErr := app.Initialize(canonical, ""); initErr != nil {
			return guiWorkspace{}, initErr
		}
		tree, err = s.treeAt(ctx, canonical)
		if err != nil {
			return guiWorkspace{}, err
		}
	}
	workspace = guiWorkspace{
		ID:   workspaceID(tree.Root),
		Name: workspaceName(tree.Root),
		Path: tree.Root,
	}
	cfg, err := s.loadConfig()
	if err != nil {
		return guiWorkspace{}, err
	}
	replaced := false
	for i := range cfg.Workspaces {
		if cfg.Workspaces[i].ID == workspace.ID {
			workspace.Icon = cfg.Workspaces[i].Icon
			cfg.Workspaces[i] = workspace
			replaced = true
			break
		}
	}
	if !replaced {
		cfg.Workspaces = append(cfg.Workspaces, workspace)
	}
	cfg.ActiveID = workspace.ID
	if err := s.saveConfig(cfg); err != nil {
		return guiWorkspace{}, err
	}
	return workspace, nil
}

func (s *server) updateWorkspaceIcon(id, icon string) (guiWorkspace, error) {
	icon = strings.TrimSpace(icon)
	if icon != "" {
		if _, ok := workspaceIconFiles[icon]; !ok {
			return guiWorkspace{}, fmt.Errorf("unknown workspace icon: %s", icon)
		}
	}
	cfg, err := s.loadConfig()
	if err != nil {
		return guiWorkspace{}, err
	}
	for i := range cfg.Workspaces {
		if cfg.Workspaces[i].ID != id {
			continue
		}
		cfg.Workspaces[i].Icon = icon
		if err := s.saveConfig(cfg); err != nil {
			return guiWorkspace{}, err
		}
		return cfg.Workspaces[i], nil
	}
	return guiWorkspace{}, fmt.Errorf("workspace not found: %s", id)
}

func (s *server) removeWorkspace(id string) error {
	cfg, err := s.loadConfig()
	if err != nil {
		return err
	}
	next := cfg.Workspaces[:0]
	removed := false
	var removedPath string
	for _, workspace := range cfg.Workspaces {
		if workspace.ID == id {
			removed = true
			removedPath = workspace.Path
			continue
		}
		next = append(next, workspace)
	}
	if !removed {
		return fmt.Errorf("workspace not found: %s", id)
	}
	cfg.Workspaces = next
	if cfg.ActiveID == id {
		cfg.ActiveID = ""
		if len(cfg.Workspaces) > 0 {
			cfg.ActiveID = cfg.Workspaces[0].ID
		}
	}
	if err := s.saveConfig(cfg); err != nil {
		return err
	}
	// The Workspace is no longer managed once it leaves the persisted config;
	// release the serve lock so another instance can take ownership.
	if s.locks != nil {
		s.locks.release(removedPath)
	}
	return nil
}

func (s *server) tree(ctx context.Context, id string) (workspaceTree, error) {
	workspace, err := s.workspace(id)
	if err != nil {
		return workspaceTree{}, err
	}
	return s.treeAt(ctx, workspace.Path)
}

func (s *server) treeAt(ctx context.Context, path string) (workspaceTree, error) {
	if err := s.requireWorkspaceOwnership(path); err != nil {
		return workspaceTree{}, err
	}
	forgeWorkspace, err := app.OpenWorkspace(path)
	if err != nil {
		return workspaceTree{}, err
	}
	_ = ctx
	typedTree, err := forgeWorkspace.Tree()
	if err != nil {
		return workspaceTree{}, err
	}
	tree := workspaceTreeFromApp(typedTree)
	if err := s.enrichTreeSessions(path, &tree); err != nil {
		return workspaceTree{}, err
	}
	return tree, nil
}

func (s *server) enrichTreeSessions(workspacePath string, tree *workspaceTree) error {
	runs, err := loadAgentRuns(workspacePath)
	if err != nil {
		return fmt.Errorf("load agent runs for sessions: %w", err)
	}
	bySessionID := make(map[string]agentRun)
	for _, run := range runs {
		if isAgentHubRun(run) && run.ForgeSessionID != "" {
			bySessionID[run.ForgeSessionID] = run
		}
	}
	for i := range tree.Sessions {
		tree.Sessions[i].Source = "external"
		if run, ok := bySessionID[tree.Sessions[i].ID]; ok {
			tree.Sessions[i].Source = "internal"
			tree.Sessions[i].AgentRunID = run.ID
			tree.Sessions[i].AgentRunAgentName = run.AgentHubAgentName
			tree.Sessions[i].AgentRunTitle = run.Title
			tree.Sessions[i].AgentRunStatus = run.Status
			tree.Sessions[i].AgentRunUpdatedAt = run.UpdatedAt
			tree.Sessions[i].AgentRunLastOutputAt = run.LastOutputAt
			tree.Sessions[i].SchedulerTurn = run.SchedulerTurn
			tree.Sessions[i].AutoRunGeneration = run.AutoRunGeneration
			tree.Sessions[i].ResourceID = run.ResourceID
			tree.Sessions[i].AgentRunCompletionMarker = run.CompletionMarker
			tree.Sessions[i].AgentRunCompletionState = run.CompletionState
			tree.Sessions[i].AgentRunCompletionAt = run.CompletionAt
		}
	}
	return nil
}

func parseResourceLogRequest(values url.Values) (resourceLogRequest, error) {
	request := resourceLogRequest{}
	cursorValues, cursorSet := values["logsCursor"]
	limitValues, limitSet := values["logsLimit"]
	if !cursorSet && !limitSet {
		return request, nil
	}
	if len(cursorValues) > 1 || len(limitValues) > 1 {
		return request, errors.New("resource log pagination parameters must not be repeated")
	}
	request.paged = true
	if cursorSet {
		request.cursor = cursorValues[0]
		if strings.TrimSpace(request.cursor) == "" {
			return resourceLogRequest{}, errors.New("logsCursor cannot be empty")
		}
	}
	request.limit = app.DefaultResourceLogPageLimit
	if cursorSet {
		request.limit = app.OlderResourceLogPageLimit
	}
	if limitSet {
		value := strings.TrimSpace(limitValues[0])
		parsed, err := strconv.Atoi(value)
		if err != nil || parsed <= 0 || parsed > app.MaxResourceLogPageLimit {
			return resourceLogRequest{}, fmt.Errorf("logsLimit must be an integer between 1 and %d", app.MaxResourceLogPageLimit)
		}
		request.limit = parsed
	}
	return request, nil
}

func (s *server) resource(ctx context.Context, id string, resourceID string, logRequest resourceLogRequest) (app.ResourceDetailView, error) {
	_ = ctx
	workspace, err := s.workspace(id)
	if err != nil {
		return app.ResourceDetailView{}, err
	}
	forgeWorkspace, err := app.OpenWorkspace(workspace.Path)
	if err != nil {
		return app.ResourceDetailView{}, err
	}
	if logRequest.paged {
		return forgeWorkspace.ResourcePage(resourceID, logRequest.cursor, logRequest.limit)
	}
	return forgeWorkspace.Resource(resourceID)
}

func (s *server) loadUIState(id string) (guiState, error) {
	workspace, err := s.workspace(id)
	if err != nil {
		return guiState{}, err
	}
	path := guiStatePath(workspace.Path)
	var state guiState
	data, err := os.ReadFile(path)
	if err != nil {
		if os.IsNotExist(err) {
			return guiState{Version: 1, ExpandedProjects: []string{}}, nil
		}
		return guiState{}, err
	}
	if err := json.Unmarshal(data, &state); err != nil {
		return guiState{}, err
	}
	if state.Version == 0 {
		state.Version = 1
	}
	if state.ExpandedProjects == nil {
		state.ExpandedProjects = []string{}
	}
	return state, nil
}

func (s *server) saveUIState(id string, state guiState) error {
	workspace, err := s.workspace(id)
	if err != nil {
		return err
	}
	state.Version = 1
	state.ExpandedProjects = uniqueNonEmpty(state.ExpandedProjects)
	path := guiStatePath(workspace.Path)
	if err := os.MkdirAll(filepath.Dir(path), 0o755); err != nil {
		return err
	}
	data, err := json.MarshalIndent(state, "", "  ")
	if err != nil {
		return err
	}
	data = append(data, '\n')
	return os.WriteFile(path, data, 0o644)
}

func (s *server) buildDiff(ctx context.Context, worktreePath string, base string) (string, error) {
	var parts []string
	if base != "" && s.gitRefExists(ctx, worktreePath, base) {
		if out, err := s.runGit(ctx, worktreePath, "diff", "--no-ext-diff", "--find-renames", "--src-prefix=a/", "--dst-prefix=b/", base+"...HEAD", "--"); err == nil {
			parts = append(parts, string(out))
		}
	}
	if out, err := s.runGit(ctx, worktreePath, "diff", "--no-ext-diff", "--find-renames", "--src-prefix=a/", "--dst-prefix=b/", "HEAD", "--"); err == nil {
		parts = append(parts, string(out))
	}
	if out, err := s.untrackedDiff(ctx, worktreePath); err == nil {
		parts = append(parts, out)
	}
	diff := strings.TrimLeft(strings.Join(parts, "\n"), "\n")
	if len(diff) > diffMaxBytes {
		diff = diff[:diffMaxBytes] + "\n\n--- Diff truncated by Forge GUI ---\n"
	}
	return diff, nil
}

func (s *server) untrackedDiff(ctx context.Context, worktreePath string) (string, error) {
	out, err := s.runGit(ctx, worktreePath, "ls-files", "--others", "--exclude-standard", "-z")
	if err != nil {
		return "", err
	}
	var builder strings.Builder
	for _, name := range strings.Split(string(out), "\x00") {
		name = strings.TrimSpace(name)
		if name == "" {
			continue
		}
		if builder.Len() > diffMaxBytes {
			break
		}
		diff, err := s.runGit(ctx, worktreePath, "diff", "--no-ext-diff", "--no-index", "--src-prefix=a/", "--dst-prefix=b/", "--", "/dev/null", name)
		if err != nil && len(diff) == 0 {
			continue
		}
		builder.Write(diff)
		if len(diff) > 0 && diff[len(diff)-1] != '\n' {
			builder.WriteByte('\n')
		}
	}
	return builder.String(), nil
}

func (s *server) gitRefExists(ctx context.Context, worktreePath string, ref string) bool {
	_, err := s.runGit(ctx, worktreePath, "rev-parse", "--verify", ref+"^{commit}")
	return err == nil
}

func (s *server) runGit(ctx context.Context, worktreePath string, args ...string) ([]byte, error) {
	ctx, cancel := context.WithTimeout(ctx, 30*time.Second)
	defer cancel()
	cmd := exec.CommandContext(ctx, "git", args...)
	cmd.Dir = worktreePath
	out, err := cmd.CombinedOutput()
	if err != nil {
		detail := strings.TrimSpace(string(out))
		if detail == "" {
			detail = err.Error()
		}
		return out, fmt.Errorf("git %s: %s", strings.Join(args, " "), detail)
	}
	return out, nil
}

func (s *server) workspace(id string) (guiWorkspace, error) {
	cfg, err := s.loadConfig()
	if err != nil {
		return guiWorkspace{}, err
	}
	for _, workspace := range cfg.Workspaces {
		if workspace.ID == id {
			if err := s.requireWorkspaceOwnership(workspace.Path); err != nil {
				return guiWorkspace{}, err
			}
			return workspace, nil
		}
	}
	return guiWorkspace{}, fmt.Errorf("workspace not found: %s", id)
}

func (s *server) loadConfig() (config, error) {
	var cfg config
	data, err := os.ReadFile(s.config)
	if err != nil {
		if os.IsNotExist(err) {
			cfg = config{
				Version:          agentHubConfigVersion,
				Workspaces:       []guiWorkspace{},
				AgentHubEndpoint: defaultAgentHubEndpoint,
				AgentProfiles:    []agentProfileRoute{},
			}
			normalized, normalizeErr := normalizeConfigAgentProfileRoutes(cfg.AgentProfiles)
			if normalizeErr != nil {
				return config{}, normalizeErr
			}
			cfg.AgentProfiles = normalized
			return cfg, nil
		}
		return config{}, err
	}
	if err := json.Unmarshal(data, &cfg); err != nil {
		return config{}, err
	}
	if cfg.Workspaces == nil {
		cfg.Workspaces = []guiWorkspace{}
	}
	if cfg.Version < agentHubConfigVersion {
		return config{}, fmt.Errorf("unsupported Forge GUI configuration version %d; migrate the configuration before starting Forge GUI", cfg.Version)
	}
	cfg.AgentHubEndpoint, err = normalizeAgentHubEndpoint(cfg.AgentHubEndpoint)
	if err != nil {
		return config{}, err
	}
	normalizedProfiles, err := normalizeConfigAgentProfileRoutes(cfg.AgentProfiles)
	if err != nil {
		return config{}, err
	}
	if !agentProfileRoutesEqual(cfg.AgentProfiles, normalizedProfiles) {
		cfg.AgentProfiles = normalizedProfiles
		if err := s.saveConfig(cfg); err != nil {
			return config{}, err
		}
	}
	return cfg, nil
}

func (s *server) saveConfig(cfg config) error {
	if cfg.Version < agentHubConfigVersion {
		return fmt.Errorf("unsupported Forge GUI configuration version %d", cfg.Version)
	}
	normalizedProfiles, err := normalizeConfigAgentProfileRoutes(cfg.AgentProfiles)
	if err != nil {
		return err
	}
	routes := make([]agentHubProfileRoute, 0, len(normalizedProfiles))
	for _, route := range normalizedProfiles {
		routes = append(routes, agentHubProfileRoute{
			Key: route.Key, Description: route.Description, AgentName: route.AgentName,
		})
	}
	data, err := json.MarshalIndent(agentHubGUIConfig{
		Version:            agentHubConfigVersion,
		ActiveID:           cfg.ActiveID,
		Workspaces:         cfg.Workspaces,
		AgentHubEndpoint:   cfg.AgentHubEndpoint,
		AgentHubInstanceID: cfg.AgentHubInstanceID,
		AgentProfiles:      routes,
	}, "", "  ")
	if err != nil {
		return err
	}
	return atomicWriteConfig(s.config, append(data, '\n'))
}

func defaultConfigPath() (string, error) {
	if path := strings.TrimSpace(os.Getenv("FORGE_GUI_CONFIG")); path != "" {
		return path, nil
	}
	dir, err := os.UserConfigDir()
	if err != nil {
		return "", err
	}
	return filepath.Join(dir, "forge", "gui.json"), nil
}

func workspaceID(path string) string {
	sum := sha1.Sum([]byte(filepath.Clean(path)))
	return hex.EncodeToString(sum[:8])
}

func workspaceName(path string) string {
	name := filepath.Base(filepath.Clean(path))
	if name == "." || name == string(filepath.Separator) || name == "" {
		return "AgentWorkspace"
	}
	return name
}

func guiStatePath(workspacePath string) string {
	return filepath.Join(workspacePath, ".forge", "gui-state.json")
}

func uniqueNonEmpty(values []string) []string {
	seen := make(map[string]bool, len(values))
	result := make([]string, 0, len(values))
	for _, value := range values {
		value = strings.TrimSpace(value)
		if value == "" || seen[value] {
			continue
		}
		seen[value] = true
		result = append(result, value)
	}
	return result
}

func safeWorkspacePath(root string, relPath string) (string, error) {
	if filepath.IsAbs(relPath) {
		return "", errors.New("path must be relative to the workspace")
	}
	rootAbs, err := filepath.Abs(root)
	if err != nil {
		return "", err
	}
	targetAbs, err := filepath.Abs(filepath.Join(rootAbs, filepath.Clean(relPath)))
	if err != nil {
		return "", err
	}
	if err := ensurePathInside(rootAbs, targetAbs); err != nil {
		return "", err
	}
	if rootEval, err := filepath.EvalSymlinks(rootAbs); err == nil {
		if targetEval, err := filepath.EvalSymlinks(targetAbs); err == nil {
			if err := ensurePathInside(rootEval, targetEval); err != nil {
				return "", err
			}
		}
	}
	return targetAbs, nil
}

func safeWikiPath(workspaceRoot, relPath string) (string, error) {
	if strings.TrimSpace(relPath) == "" {
		return "", errors.New("path is required")
	}
	wikiRoot, err := safeWorkspacePath(workspaceRoot, workspaceWikiDir)
	if err != nil {
		return "", err
	}
	target, err := safeWorkspacePath(wikiRoot, relPath)
	if err != nil && strings.Contains(err.Error(), "path escapes the workspace") {
		return "", errors.New("path escapes the Workspace Wiki")
	}
	return target, err
}

func ensurePathInside(root string, target string) error {
	rel, err := filepath.Rel(root, target)
	if err != nil {
		return err
	}
	if rel == ".." || strings.HasPrefix(rel, ".."+string(filepath.Separator)) {
		return errors.New("path escapes the workspace")
	}
	return nil
}

func containsNUL(data []byte) bool {
	for _, b := range data {
		if b == 0 {
			return true
		}
	}
	return false
}

func fileMimeType(path string, data []byte) string {
	switch strings.ToLower(filepath.Ext(path)) {
	case ".md", ".markdown", ".mdown", ".mkdn":
		return "text/markdown"
	}
	if mimeType := mime.TypeByExtension(strings.ToLower(filepath.Ext(path))); mimeType != "" {
		return strings.Split(mimeType, ";")[0]
	}
	if len(data) > 0 {
		return http.DetectContentType(data)
	}
	return "application/octet-stream"
}

func contentTypeWithCharset(mimeType string) string {
	if strings.HasPrefix(mimeType, "text/") && !strings.Contains(mimeType, "charset") {
		return mimeType + "; charset=utf-8"
	}
	return mimeType
}

func isPreviewableImage(path string) bool {
	switch strings.ToLower(filepath.Ext(path)) {
	case ".apng", ".avif", ".bmp", ".gif", ".ico", ".jpg", ".jpeg", ".png", ".svg", ".webp":
		return true
	default:
		return false
	}
}

func safeGitRef(ref string) bool {
	if ref == "" || strings.HasPrefix(ref, "-") {
		return false
	}
	for _, r := range ref {
		if (r >= 'a' && r <= 'z') || (r >= 'A' && r <= 'Z') || (r >= '0' && r <= '9') {
			continue
		}
		switch r {
		case '/', '.', '_', '-':
			continue
		default:
			return false
		}
	}
	return !strings.Contains(ref, "..") && !strings.HasSuffix(ref, ".lock")
}

func writeJSON(w http.ResponseWriter, value any) {
	w.Header().Set("Content-Type", "application/json")
	encoder := json.NewEncoder(w)
	encoder.SetIndent("", "  ")
	_ = encoder.Encode(value)
}

func writeRawJSON(w http.ResponseWriter, data []byte) {
	w.Header().Set("Content-Type", "application/json")
	_, _ = w.Write(data)
}

func writeError(w http.ResponseWriter, err error, status int) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	payload := map[string]any{"error": err.Error()}
	var validation *app.TemplateValidationError
	if errors.As(err, &validation) {
		payload["code"] = "template_validation"
		payload["template"] = validation.Template
		payload["issues"] = validation.Issues
	}
	if app.IsKind(err, "template_conflict") {
		payload["code"] = "template_digest_conflict"
	}
	_ = json.NewEncoder(w).Encode(payload)
}

func serveStatic(root fs.FS, w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet && r.Method != http.MethodHead {
		w.WriteHeader(http.StatusMethodNotAllowed)
		return
	}
	name := strings.TrimPrefix(r.URL.Path, "/")
	if name == "" {
		name = "index.html"
	} else {
		name = strings.TrimPrefix(urlpath.Clean("/"+name), "/")
	}
	data, err := fs.ReadFile(root, name)
	if err != nil {
		if filepath.Ext(name) != "" && !strings.Contains(name, "/") {
			http.NotFound(w, r)
			return
		}
		name = "index.html"
		data, err = fs.ReadFile(root, name)
		if err != nil {
			writeError(w, err, http.StatusInternalServerError)
			return
		}
	} else if info, statErr := fs.Stat(root, name); statErr == nil && info.IsDir() {
		name = "index.html"
		data, err = fs.ReadFile(root, name)
		if err != nil {
			writeError(w, err, http.StatusInternalServerError)
			return
		}
	}
	if contentType := mime.TypeByExtension(filepath.Ext(name)); contentType != "" {
		w.Header().Set("Content-Type", contentType)
	} else {
		w.Header().Set("Content-Type", http.DetectContentType(data))
	}
	w.Header().Set("Cache-Control", "no-store")
	if r.Method == http.MethodHead {
		return
	}
	_, _ = w.Write(data)
}
