package main

import (
	"context"
	"crypto/sha1"
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
	"os"
	"os/exec"
	urlpath "path"
	"path/filepath"
	"runtime"
	"strings"
	"time"
	"unicode/utf8"

	"github.com/disksing/forge/internal/buildinfo"
)

//go:embed static
var staticFiles embed.FS

type config struct {
	Version            int                   `json:"version"`
	ActiveID           string                `json:"activeId,omitempty"`
	Workspaces         []guiWorkspace        `json:"workspaces"`
	AgentDefaults      agentDefaults         `json:"agentDefaults"`
	DefaultChatAgentID string                `json:"defaultChatAgentId,omitempty"`
	AgentProviders     []agentProviderConfig `json:"agentProviders"`
	Agents             []agentConfig         `json:"agents"`
	Codex              codexSettings         `json:"codex"`
}

type agentDefaults struct {
	Sandbox  string `json:"sandbox"`
	Approval string `json:"approval"`
	Model    string `json:"model,omitempty"`
}

type codexSettings struct {
	Enabled bool `json:"enabled"`
}

type agentProviderConfig struct {
	ID      string `json:"id"`
	Name    string `json:"name"`
	Type    string `json:"type"`
	Enabled bool   `json:"enabled"`
}

type agentConfig struct {
	ID         string `json:"id"`
	Name       string `json:"name"`
	ProviderID string `json:"providerId"`
	Sandbox    string `json:"sandbox"`
	Approval   string `json:"approval"`
	Model      string `json:"model,omitempty"`
}

type guiWorkspace struct {
	ID   string `json:"id"`
	Name string `json:"name"`
	Path string `json:"path"`
}

const (
	agentsManagedStart = "<!-- managed by forge cli -->"
	agentsManagedEnd   = "<!-- end of forge cli prompt -->"
)

type workspaceTree struct {
	Root     string             `json:"root"`
	Projects []resourceSnapshot `json:"projects"`
	Sessions []guiSession       `json:"sessions"`
}

type resourceSnapshot struct {
	ID       string             `json:"id"`
	Type     string             `json:"type"`
	Title    string             `json:"title"`
	Path     string             `json:"path"`
	Archived bool               `json:"archived"`
	Children []resourceSnapshot `json:"children,omitempty"`
}

type filePreview struct {
	Path      string `json:"path"`
	Name      string `json:"name"`
	Size      int64  `json:"size"`
	Truncated bool   `json:"truncated"`
	Binary    bool   `json:"binary"`
	Image     bool   `json:"image"`
	MimeType  string `json:"mimeType,omitempty"`
	Content   string `json:"content,omitempty"`
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
	Version          int      `json:"version"`
	ExpandedProjects []string `json:"expandedProjects"`
}

type guiSession struct {
	ID                   string              `json:"id"`
	Liveness             json.RawMessage     `json:"liveness,omitempty"`
	Controls             []guiSessionControl `json:"controls"`
	StartedAt            string              `json:"startedAt"`
	UpdatedAt            string              `json:"updatedAt"`
	Source               string              `json:"source"`
	AgentRunID           string              `json:"agentRunId,omitempty"`
	AgentRunTitle        string              `json:"agentRunTitle,omitempty"`
	AgentRunStatus       string              `json:"agentRunStatus,omitempty"`
	AgentRunUpdatedAt    string              `json:"agentRunUpdatedAt,omitempty"`
	AgentRunLastOutputAt string              `json:"agentRunLastOutputAt,omitempty"`
	ResourceID           string              `json:"resourceId,omitempty"`
}

type guiSessionControl struct {
	ResourceID string `json:"resourceId,omitempty"`
	Path       string `json:"path"`
}

type server struct {
	addr      string
	config    string
	repoRoot  string
	forgePath string
	agents    *agentManager
	codex     *codexAppServer
}

const (
	previewMaxBytes = 512 * 1024
	diffMaxBytes    = 4 * 1024 * 1024
)

func main() {
	var addr string
	var initialWorkspace string
	var showVersion bool
	flag.StringVar(&addr, "addr", "127.0.0.1:4936", "local address to listen on")
	flag.StringVar(&initialWorkspace, "workspace", "", "AgentWorkspace path to add before starting")
	flag.BoolVar(&showVersion, "version", false, "print build-time branch and sha")
	flag.Parse()
	if showVersion {
		fmt.Print(buildinfo.Text("forge-gui"))
		return
	}

	configPath, err := defaultConfigPath()
	if err != nil {
		log.Fatal(err)
	}
	repoRoot, err := findRepoRoot()
	if err != nil {
		log.Fatal(err)
	}
	s := &server{
		addr:      addr,
		config:    configPath,
		repoRoot:  repoRoot,
		forgePath: strings.TrimSpace(os.Getenv("FORGE_CLI")),
	}
	if err := s.prepareForgeCLI(); err != nil {
		log.Fatal(err)
	}
	s.codex = newCodexAppServer()
	s.agents = newAgentManager(s)
	if initialWorkspace != "" {
		if _, err := s.addWorkspace(context.Background(), initialWorkspace); err != nil {
			log.Fatalf("add initial workspace: %v", err)
		}
	} else {
		s.addCurrentDirectoryIfEmpty(context.Background())
	}
	if err := s.cleanupStaleInternalSessions(context.Background()); err != nil {
		log.Printf("cleanup stale internal sessions: %v", err)
	}
	if err := s.startCodexIfEnabled(); err != nil {
		log.Printf("start managed codex app-server: %v", err)
	}

	staticRoot, err := fs.Sub(staticFiles, "static")
	if err != nil {
		log.Fatal(err)
	}
	mux := http.NewServeMux()
	mux.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		serveStatic(staticRoot, w, r)
	})
	mux.HandleFunc("/api/workspaces", s.handleWorkspaces)
	mux.HandleFunc("/api/workspaces/", s.handleWorkspace)
	mux.HandleFunc("/api/settings", s.handleSettings)
	mux.HandleFunc("/api/settings/", s.handleSettings)
	mux.HandleFunc("/api/internal/", s.handleInternal)

	log.Printf("forge gui listening on http://%s", addr)
	log.Fatal(http.ListenAndServe(addr, mux))
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

func (s *server) handleInternal(w http.ResponseWriter, r *http.Request) {
	path := strings.Trim(strings.TrimPrefix(r.URL.Path, "/api/internal"), "/")
	switch path {
	case "session-liveness":
		s.agents.handleSessionLiveness(w, r)
	default:
		http.NotFound(w, r)
	}
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
		detail, err := s.resource(r.Context(), id, parts[2])
		if err != nil {
			writeError(w, err, http.StatusBadRequest)
			return
		}
		writeRawJSON(w, detail)
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
	case "diff":
		if r.Method != http.MethodGet {
			w.WriteHeader(http.StatusMethodNotAllowed)
			return
		}
		s.worktreeDiff(w, r, id)
	case "ui-state":
		s.handleUIState(w, r, id)
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
		s.createTask(w, r, id)
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
	args := []string{"project", "create"}
	if strings.TrimSpace(body.Slug) != "" {
		args = append(args, "--slug", body.Slug)
	}
	args = append(args, body.Description)
	result, err := s.runForgeForWorkspace(r.Context(), id, args...)
	if err != nil {
		writeError(w, err, http.StatusBadRequest)
		return
	}
	writeRawJSON(w, result)
}

func (s *server) createTask(w http.ResponseWriter, r *http.Request, id string) {
	var body struct {
		Project     string `json:"project"`
		Title       string `json:"title"`
		Detail      string `json:"detail"`
		Description string `json:"description"`
		Slug        string `json:"slug"`
	}
	if err := json.NewDecoder(r.Body).Decode(&body); err != nil {
		writeError(w, err, http.StatusBadRequest)
		return
	}
	title := body.Title
	if strings.TrimSpace(title) == "" {
		title = body.Description
	}
	args := []string{"task", "create", "--project", body.Project}
	if strings.TrimSpace(body.Slug) != "" {
		args = append(args, "--slug", body.Slug)
	}
	if strings.TrimSpace(body.Detail) != "" {
		args = append(args, "--detail="+body.Detail)
	}
	args = append(args, title)
	result, err := s.runForgeForWorkspace(r.Context(), id, args...)
	if err != nil {
		writeError(w, err, http.StatusBadRequest)
		return
	}
	writeRawJSON(w, result)
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
	args := []string{"project", "archive", "--project", resourceID}
	if strings.Contains(resourceID, ".task") {
		projectID, taskID, _ := strings.Cut(resourceID, ".")
		args = []string{"task", "archive", "--project", projectID, "--task", taskID}
	}
	result, err := s.runForgeForWorkspace(r.Context(), id, args...)
	if err != nil {
		writeError(w, err, http.StatusBadRequest)
		return
	}
	writeJSON(w, map[string]string{"path": strings.TrimSpace(string(result))})
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
		Path:      filepath.ToSlash(filepath.Clean(relPath)),
		Name:      info.Name(),
		Size:      info.Size(),
		Truncated: truncated,
		Binary:    binary,
		Image:     image,
		MimeType:  mimeType,
	}
	if !binary && !image {
		preview.Content = string(data)
	}
	writeJSON(w, preview)
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
	w.Header().Set("Content-Type", fileMimeType(relPath, sample))
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
	_, _ = s.addWorkspace(ctx, cwd)
}

func (s *server) addWorkspace(ctx context.Context, path string) (guiWorkspace, error) {
	return s.addWorkspaceWithOptions(ctx, path, false)
}

func (s *server) addWorkspaceWithOptions(ctx context.Context, path string, create bool) (guiWorkspace, error) {
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
	tree, err := s.treeAt(ctx, abs)
	if err != nil {
		if !create {
			return guiWorkspace{}, err
		}
		if _, initErr := s.runForge(ctx, abs, "init"); initErr != nil {
			return guiWorkspace{}, initErr
		}
		tree, err = s.treeAt(ctx, abs)
		if err != nil {
			return guiWorkspace{}, err
		}
	}
	workspace := guiWorkspace{
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

func (s *server) removeWorkspace(id string) error {
	cfg, err := s.loadConfig()
	if err != nil {
		return err
	}
	next := cfg.Workspaces[:0]
	removed := false
	for _, workspace := range cfg.Workspaces {
		if workspace.ID == id {
			removed = true
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
	return s.saveConfig(cfg)
}

func (s *server) tree(ctx context.Context, id string) (workspaceTree, error) {
	workspace, err := s.workspace(id)
	if err != nil {
		return workspaceTree{}, err
	}
	return s.treeAt(ctx, workspace.Path)
}

func (s *server) treeAt(ctx context.Context, path string) (workspaceTree, error) {
	out, err := s.runForge(ctx, path, "workspace", "tree", "--json")
	if err != nil {
		return workspaceTree{}, err
	}
	var tree workspaceTree
	if err := json.Unmarshal(out, &tree); err != nil {
		return workspaceTree{}, fmt.Errorf("decode forge workspace tree: %w", err)
	}
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
		if run.ForgeSessionID != "" {
			bySessionID[run.ForgeSessionID] = run
		}
	}
	for i := range tree.Sessions {
		tree.Sessions[i].Source = "external"
		if run, ok := bySessionID[tree.Sessions[i].ID]; ok {
			tree.Sessions[i].Source = "internal"
			tree.Sessions[i].AgentRunID = run.ID
			tree.Sessions[i].AgentRunTitle = run.Title
			tree.Sessions[i].AgentRunStatus = run.Status
			tree.Sessions[i].AgentRunUpdatedAt = run.UpdatedAt
			tree.Sessions[i].AgentRunLastOutputAt = run.LastOutputAt
			tree.Sessions[i].ResourceID = run.ResourceID
		}
	}
	return nil
}

func (s *server) resource(ctx context.Context, id string, resourceID string) ([]byte, error) {
	return s.runForgeForWorkspace(ctx, id, "workspace", "resource", "--id", resourceID, "--json")
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

func (s *server) runForgeForWorkspace(ctx context.Context, id string, args ...string) ([]byte, error) {
	workspace, err := s.workspace(id)
	if err != nil {
		return nil, err
	}
	return s.runForge(ctx, workspace.Path, args...)
}

func (s *server) runForge(ctx context.Context, workspacePath string, args ...string) ([]byte, error) {
	ctx, cancel := context.WithTimeout(ctx, 30*time.Second)
	defer cancel()

	cmdName, cmdArgs := s.forgeCommand(args...)
	cmd := exec.CommandContext(ctx, cmdName, cmdArgs...)
	cmd.Dir = workspacePath
	out, err := cmd.CombinedOutput()
	if err != nil {
		detail := strings.TrimSpace(string(out))
		if detail == "" {
			detail = err.Error()
		}
		return nil, fmt.Errorf("forge %s: %s", strings.Join(args, " "), detail)
	}
	return out, nil
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

func (s *server) forgeCommand(args ...string) (string, []string) {
	return s.forgePath, args
}

func (s *server) prepareForgeCLI() error {
	if s.forgePath != "" {
		return nil
	}
	sourceForge := filepath.Join(s.repoRoot, "cli", "cmd", "forge")
	if isDir(sourceForge) {
		cacheDir, err := os.UserCacheDir()
		if err != nil {
			return err
		}
		outDir := filepath.Join(cacheDir, "forge", "gui")
		if err := os.MkdirAll(outDir, 0o755); err != nil {
			return err
		}
		sum := sha1.Sum([]byte(s.repoRoot))
		out := filepath.Join(outDir, "forge-cli-"+hex.EncodeToString(sum[:6]))
		buildArgs := []string{"build", "-ldflags", buildinfo.LDFlagsFor(sourceBuildInfo(s.repoRoot)), "-o", out, "./cli/cmd/forge"}
		cmd := exec.Command("go", buildArgs...)
		cmd.Dir = s.repoRoot
		if buildOut, err := cmd.CombinedOutput(); err != nil {
			return fmt.Errorf("build forge cli for gui: %s", strings.TrimSpace(string(buildOut)))
		}
		s.forgePath = out
		return nil
	}
	path, err := exec.LookPath("forge")
	if err != nil {
		return errors.New("forge CLI not found; set FORGE_CLI or run GUI from the forge source tree")
	}
	s.forgePath = path
	return nil
}

func sourceBuildInfo(repoRoot string) buildinfo.Info {
	info := buildinfo.Current()
	if branch := gitOutput(repoRoot, "rev-parse", "--abbrev-ref", "HEAD"); branch != "" && branch != "HEAD" {
		info.Branch = branch
	}
	if sha := gitOutput(repoRoot, "rev-parse", "HEAD"); sha != "" {
		info.SHA = sha
	}
	return info
}

func gitOutput(repoRoot string, args ...string) string {
	cmdArgs := append([]string{"-C", repoRoot}, args...)
	out, err := exec.Command("git", cmdArgs...).Output()
	if err != nil {
		return ""
	}
	return strings.TrimSpace(string(out))
}

func (s *server) workspace(id string) (guiWorkspace, error) {
	cfg, err := s.loadConfig()
	if err != nil {
		return guiWorkspace{}, err
	}
	for _, workspace := range cfg.Workspaces {
		if workspace.ID == id {
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
			defaults := normalizeAgentDefaults(agentDefaults{})
			agents := normalizeAgents(nil, defaults)
			return config{
				Version:            1,
				Workspaces:         []guiWorkspace{},
				AgentDefaults:      defaults,
				DefaultChatAgentID: normalizeDefaultChatAgentID("", agents),
				AgentProviders:     normalizeAgentProviders(nil),
				Agents:             agents,
			}, nil
		}
		return config{}, err
	}
	if err := json.Unmarshal(data, &cfg); err != nil {
		return config{}, err
	}
	if cfg.Version == 0 {
		cfg.Version = 1
	}
	if cfg.Workspaces == nil {
		cfg.Workspaces = []guiWorkspace{}
	}
	cfg.AgentDefaults = normalizeAgentDefaults(cfg.AgentDefaults)
	cfg.AgentProviders = normalizeAgentProviders(cfg.AgentProviders)
	cfg.Agents = normalizeAgents(cfg.Agents, cfg.AgentDefaults)
	cfg.DefaultChatAgentID = normalizeDefaultChatAgentID(cfg.DefaultChatAgentID, cfg.Agents)
	return cfg, nil
}

func (s *server) saveConfig(cfg config) error {
	if cfg.Version == 0 {
		cfg.Version = 1
	}
	cfg.AgentDefaults = normalizeAgentDefaults(cfg.AgentDefaults)
	cfg.AgentProviders = normalizeAgentProviders(cfg.AgentProviders)
	cfg.Agents = normalizeAgents(cfg.Agents, cfg.AgentDefaults)
	cfg.DefaultChatAgentID = normalizeDefaultChatAgentID(cfg.DefaultChatAgentID, cfg.Agents)
	if err := os.MkdirAll(filepath.Dir(s.config), 0o755); err != nil {
		return err
	}
	data, err := json.MarshalIndent(cfg, "", "  ")
	if err != nil {
		return err
	}
	data = append(data, '\n')
	return os.WriteFile(s.config, data, 0o644)
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

func findRepoRoot() (string, error) {
	_, file, _, ok := runtime.Caller(0)
	if !ok {
		return "", errors.New("cannot locate gui source")
	}
	return filepath.Dir(filepath.Dir(file)), nil
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
	_ = json.NewEncoder(w).Encode(map[string]string{"error": err.Error()})
}

func isDir(path string) bool {
	info, err := os.Stat(path)
	return err == nil && info.IsDir()
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
