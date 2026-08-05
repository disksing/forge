package serve

import (
	"bytes"
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"net/http"
	"net/url"
	"strings"
	"time"
)

const (
	defaultAgentHubEndpoint = "http://127.0.0.1:4646"
	agentHubAPIVersion      = "1"
	agentHubRequestTimeout  = 30 * time.Second
)

// agentHubMaxResponseBytes caps how much of an AgentHub response body the
// client will buffer while decoding. AgentHub is a local trusted service and
// event pages can legitimately reach tens of megabytes, so the cap only
// guards against runaway memory usage. It is a variable so tests can lower it.
var agentHubMaxResponseBytes int64 = 256 << 20

var requiredAgentHubCapabilities = []string{
	"session.source",
	"session.launch-environment",
	"session.launch-environment-update",
	"session.strict-stopped",
	"events.lossless-replay",
	"events.canonical-turn-terminals",
	"recovery.closed-turns",
}

type agentHubClient struct {
	endpoint   string
	httpClient *http.Client
}

type agentHubAPIError struct {
	StatusCode int
	Code       string
	Message    string
	Retryable  bool
	Details    json.RawMessage
	RequestID  string
}

func (e *agentHubAPIError) Error() string {
	if e == nil {
		return ""
	}
	message := strings.TrimSpace(e.Message)
	if message == "" {
		message = http.StatusText(e.StatusCode)
	}
	if e.Code == "" {
		return fmt.Sprintf("AgentHub returned %d: %s", e.StatusCode, message)
	}
	if e.RequestID == "" {
		return fmt.Sprintf("AgentHub %s: %s", e.Code, message)
	}
	return fmt.Sprintf("AgentHub %s: %s (request %s)", e.Code, message, e.RequestID)
}

type agentHubStatus struct {
	APIVersion   string          `json:"apiVersion"`
	Capabilities []string        `json:"capabilities"`
	Version      string          `json:"version"`
	StartedAt    string          `json:"startedAt,omitempty"`
	Uptime       int64           `json:"uptimeSeconds,omitempty"`
	Runtime      json.RawMessage `json:"runtime,omitempty"`
}

type agentHubProvider struct {
	ID      string `json:"id"`
	Name    string `json:"name"`
	Type    string `json:"type"`
	Enabled bool   `json:"enabled"`
}

type agentHubAgent struct {
	Name              string            `json:"name"`
	ProviderID        string            `json:"providerId"`
	Options           map[string]string `json:"options,omitempty"`
	Available         bool              `json:"available"`
	UnavailableReason string            `json:"unavailableReason,omitempty"`
}

type agentHubProbe struct {
	ProviderID string `json:"providerId"`
	Type       string `json:"type"`
	Command    string `json:"command,omitempty"`
	Available  bool   `json:"available"`
}

type agentHubCatalog struct {
	Providers []agentHubProvider `json:"providers"`
	Agents    []agentHubAgent    `json:"agents"`
	Probes    []agentHubProbe    `json:"probes"`
}

type agentHubSource struct {
	App        string `json:"app,omitempty"`
	InstanceID string `json:"instanceId,omitempty"`
	ExternalID string `json:"externalId,omitempty"`
}

type agentHubSession struct {
	ID                 string            `json:"id"`
	Title              string            `json:"title"`
	Cwd                string            `json:"cwd"`
	AgentName          string            `json:"agentName,omitempty"`
	LaunchEnvironment  map[string]string `json:"launchEnvironment,omitempty"`
	Source             *agentHubSource   `json:"source,omitempty"`
	Provider           string            `json:"provider,omitempty"`
	ProviderSessionID  string            `json:"providerSessionId,omitempty"`
	State              string            `json:"state"`
	StopReason         string            `json:"stopReason,omitempty"`
	CurrentTurnID      string            `json:"currentTurnId,omitempty"`
	PendingApprovalIDs []string          `json:"pendingApprovalIds,omitempty"`
	LastEventID        int64             `json:"lastEventId"`
	CreatedAt          string            `json:"createdAt"`
	UpdatedAt          string            `json:"updatedAt"`
}

type agentHubCreateSessionRequest struct {
	Title             string            `json:"title,omitempty"`
	Cwd               string            `json:"cwd"`
	AgentName         string            `json:"agentName"`
	LaunchEnvironment map[string]string `json:"launchEnvironment,omitempty"`
	Source            *agentHubSource   `json:"source,omitempty"`
	InitialMessage    *struct {
		Text string `json:"text"`
	} `json:"initialMessage,omitempty"`
}

type agentHubApprovalReply struct {
	Decision string `json:"decision,omitempty"`
	OptionID string `json:"optionId,omitempty"`
	Text     string `json:"text,omitempty"`
}

type agentHubSessionFilter struct {
	IncludeArchived  bool
	Archived         bool
	States           []string
	SourceApp        string
	SourceInstanceID string
	SourceExternalID string
}

type agentHubEvent struct {
	ID        int64           `json:"id"`
	Time      string          `json:"time"`
	Type      string          `json:"type"`
	SessionID string          `json:"sessionId"`
	TurnID    string          `json:"turnId,omitempty"`
	Data      json.RawMessage `json:"data,omitempty"`
}

func newAgentHubClient(endpoint string, httpClient *http.Client) (*agentHubClient, error) {
	normalized, err := normalizeAgentHubEndpoint(endpoint)
	if err != nil {
		return nil, err
	}
	if httpClient == nil {
		httpClient = &http.Client{}
	}
	return &agentHubClient{endpoint: normalized, httpClient: httpClient}, nil
}

func normalizeAgentHubEndpoint(endpoint string) (string, error) {
	endpoint = strings.TrimSpace(endpoint)
	if endpoint == "" {
		endpoint = defaultAgentHubEndpoint
	}
	parsed, err := url.Parse(endpoint)
	if err != nil {
		return "", fmt.Errorf("invalid AgentHub endpoint: %w", err)
	}
	if (parsed.Scheme != "http" && parsed.Scheme != "https") || parsed.Host == "" {
		return "", errors.New("AgentHub endpoint must be an absolute http or https URL")
	}
	if parsed.User != nil || parsed.RawQuery != "" || parsed.Fragment != "" {
		return "", errors.New("AgentHub endpoint must not contain credentials, query parameters, or a fragment")
	}
	if strings.Trim(parsed.Path, "/") != "" {
		return "", errors.New("AgentHub endpoint must not contain a path")
	}
	parsed.Path = ""
	return strings.TrimRight(parsed.String(), "/"), nil
}

func (c *agentHubClient) Status(ctx context.Context) (agentHubStatus, error) {
	var response agentHubStatus
	err := c.doJSON(ctx, http.MethodGet, "/v1/status", nil, &response)
	return response, err
}

func validateAgentHubStatus(status agentHubStatus) error {
	if status.APIVersion != agentHubAPIVersion {
		return fmt.Errorf("incompatible AgentHub apiVersion %q; Forge requires %q", status.APIVersion, agentHubAPIVersion)
	}
	available := make(map[string]bool, len(status.Capabilities))
	for _, capability := range status.Capabilities {
		available[capability] = true
	}
	var missing []string
	for _, capability := range requiredAgentHubCapabilities {
		if !available[capability] {
			missing = append(missing, capability)
		}
	}
	if len(missing) > 0 {
		return fmt.Errorf("AgentHub is missing required capabilities: %s", strings.Join(missing, ", "))
	}
	return nil
}

func (c *agentHubClient) Agents(ctx context.Context) (agentHubCatalog, error) {
	var response agentHubCatalog
	err := c.doJSON(ctx, http.MethodGet, "/v1/agents", nil, &response)
	return response, err
}

func (c *agentHubClient) CreateSession(ctx context.Context, request agentHubCreateSessionRequest) (agentHubSession, error) {
	var response struct {
		Session agentHubSession `json:"session"`
	}
	err := c.doJSON(ctx, http.MethodPost, "/v1/sessions", request, &response)
	return response.Session, err
}

func (c *agentHubClient) GetSession(ctx context.Context, sessionID string) (agentHubSession, error) {
	var response struct {
		Session agentHubSession `json:"session"`
	}
	err := c.doJSON(ctx, http.MethodGet, sessionPath(sessionID), nil, &response)
	return response.Session, err
}

func (c *agentHubClient) ListSessions(ctx context.Context, filter agentHubSessionFilter) ([]agentHubSession, error) {
	query := make(url.Values)
	if filter.IncludeArchived {
		query.Set("includeArchived", "true")
	}
	if filter.Archived {
		query.Set("archived", "true")
	}
	if len(filter.States) > 0 {
		query.Set("state", strings.Join(filter.States, ","))
	}
	query.Set("sourceApp", strings.TrimSpace(filter.SourceApp))
	query.Set("sourceInstanceId", strings.TrimSpace(filter.SourceInstanceID))
	query.Set("sourceExternalId", strings.TrimSpace(filter.SourceExternalID))
	for key, values := range query {
		if len(values) == 0 || values[0] == "" {
			query.Del(key)
		}
	}
	path := "/v1/sessions"
	if encoded := query.Encode(); encoded != "" {
		path += "?" + encoded
	}
	var response struct {
		Sessions []agentHubSession `json:"sessions"`
	}
	err := c.doJSON(ctx, http.MethodGet, path, nil, &response)
	return response.Sessions, err
}

func (c *agentHubClient) Message(ctx context.Context, sessionID, text string, steer bool) (agentHubSession, error) {
	var response struct {
		Session agentHubSession `json:"session"`
	}
	err := c.doJSON(ctx, http.MethodPost, sessionPath(sessionID)+"/messages", struct {
		Text  string `json:"text"`
		Steer bool   `json:"steer,omitempty"`
	}{Text: text, Steer: steer}, &response)
	return response.Session, err
}

func (c *agentHubClient) Approval(ctx context.Context, sessionID, approvalID string, reply agentHubApprovalReply) (agentHubSession, error) {
	var response struct {
		Session agentHubSession `json:"session"`
	}
	path := sessionPath(sessionID) + "/approvals/" + url.PathEscape(approvalID)
	err := c.doJSON(ctx, http.MethodPost, path, reply, &response)
	return response.Session, err
}

func (c *agentHubClient) Interrupt(ctx context.Context, sessionID string) (agentHubSession, error) {
	return c.sessionAction(ctx, sessionID, "interrupt")
}

func (c *agentHubClient) Stop(ctx context.Context, sessionID string) (agentHubSession, error) {
	return c.sessionAction(ctx, sessionID, "stop")
}

// agentHubResumeRequest carries the optional launchEnvironment overlay that
// replaces selected launch environment entries when a stopped session resumes.
type agentHubResumeRequest struct {
	LaunchEnvironment map[string]string `json:"launchEnvironment,omitempty"`
}

func (c *agentHubClient) Resume(ctx context.Context, sessionID string, launchEnvironment map[string]string) (agentHubSession, error) {
	var response struct {
		Session agentHubSession `json:"session"`
	}
	err := c.doJSON(ctx, http.MethodPost, sessionPath(sessionID)+"/resume",
		agentHubResumeRequest{LaunchEnvironment: launchEnvironment}, &response)
	return response.Session, err
}

func (c *agentHubClient) Archive(ctx context.Context, sessionID string) (agentHubSession, error) {
	var response struct {
		Session agentHubSession `json:"session"`
	}
	err := c.doJSON(ctx, http.MethodDelete, sessionPath(sessionID), struct{}{}, &response)
	return response.Session, err
}

func (c *agentHubClient) sessionAction(ctx context.Context, sessionID, action string) (agentHubSession, error) {
	var response struct {
		Session agentHubSession `json:"session"`
	}
	err := c.doJSON(ctx, http.MethodPost, sessionPath(sessionID)+"/"+action, struct{}{}, &response)
	return response.Session, err
}

func (c *agentHubClient) doJSON(ctx context.Context, method, path string, body, output any) error {
	requestContext := ctx
	cancel := func() {}
	if _, ok := ctx.Deadline(); !ok {
		requestContext, cancel = context.WithTimeout(ctx, agentHubRequestTimeout)
	}
	defer cancel()
	var reader io.Reader
	if body != nil {
		data, err := json.Marshal(body)
		if err != nil {
			return err
		}
		reader = bytes.NewReader(data)
	}
	request, err := http.NewRequestWithContext(requestContext, method, c.endpoint+path, reader)
	if err != nil {
		return err
	}
	request.Header.Set("Accept", "application/json")
	if body != nil {
		request.Header.Set("Content-Type", "application/json")
	}
	response, err := c.httpClient.Do(request)
	if err != nil {
		return err
	}
	defer response.Body.Close()
	if response.StatusCode < 200 || response.StatusCode >= 300 {
		return decodeAgentHubError(response)
	}
	data, err := io.ReadAll(io.LimitReader(response.Body, agentHubMaxResponseBytes+1))
	if err != nil {
		return fmt.Errorf("read AgentHub response: %w", err)
	}
	if int64(len(data)) > agentHubMaxResponseBytes {
		return fmt.Errorf("AgentHub response exceeds %d MiB limit", agentHubMaxResponseBytes>>20)
	}
	if err := json.Unmarshal(data, output); err != nil {
		return fmt.Errorf("decode AgentHub response: %w", err)
	}
	return nil
}

func decodeAgentHubError(response *http.Response) error {
	var envelope struct {
		Error struct {
			Code      string          `json:"code"`
			Message   string          `json:"message"`
			Retryable bool            `json:"retryable"`
			Details   json.RawMessage `json:"details"`
			RequestID string          `json:"requestId"`
		} `json:"error"`
	}
	data, readErr := io.ReadAll(io.LimitReader(response.Body, 1<<20))
	if readErr == nil {
		_ = json.Unmarshal(data, &envelope)
	}
	return &agentHubAPIError{
		StatusCode: response.StatusCode,
		Code:       envelope.Error.Code,
		Message:    envelope.Error.Message,
		Retryable:  envelope.Error.Retryable,
		Details:    envelope.Error.Details,
		RequestID:  envelope.Error.RequestID,
	}
}

func sessionPath(sessionID string) string {
	return "/v1/sessions/" + url.PathEscape(strings.TrimSpace(sessionID))
}
