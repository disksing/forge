package main

import (
	"bufio"
	"bytes"
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"net/http"
	"net/url"
	"strconv"
	"strings"
	"time"
)

const (
	defaultAgentHubEndpoint = "http://127.0.0.1:4646"
	agentHubAPIVersion      = "1"
	agentHubRequestTimeout  = 30 * time.Second
	agentHubEventsPageSize  = 500
)

var requiredAgentHubCapabilities = []string{
	"session.source",
	"session.launch-environment",
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

type agentHubEventPage struct {
	Events []agentHubEvent `json:"events"`
	Page   struct {
		After     int64 `json:"after"`
		Limit     int   `json:"limit"`
		NextAfter int64 `json:"nextAfter"`
		HasMore   bool  `json:"hasMore"`
	} `json:"page"`
	LatestCursor int64 `json:"latestCursor"`
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

func (c *agentHubClient) Events(ctx context.Context, sessionID string, after int64, limit int) (agentHubEventPage, error) {
	if limit <= 0 {
		limit = agentHubEventsPageSize
	}
	path := fmt.Sprintf("%s/events?after=%d&limit=%d", sessionPath(sessionID), after, limit)
	var response agentHubEventPage
	err := c.doJSON(ctx, http.MethodGet, path, nil, &response)
	return response, err
}

func (c *agentHubClient) StreamEvents(ctx context.Context, sessionID string, after int64, receive func(agentHubEvent) error) error {
	if receive == nil {
		return errors.New("AgentHub event receiver is required")
	}
	path := fmt.Sprintf("%s/events?stream=true&after=%d", sessionPath(sessionID), after)
	request, err := http.NewRequestWithContext(ctx, http.MethodGet, c.endpoint+path, nil)
	if err != nil {
		return err
	}
	request.Header.Set("Accept", "text/event-stream")
	if after > 0 {
		request.Header.Set("Last-Event-ID", strconv.FormatInt(after, 10))
	}
	response, err := c.httpClient.Do(request)
	if err != nil {
		return err
	}
	defer response.Body.Close()
	if response.StatusCode < 200 || response.StatusCode >= 300 {
		return decodeAgentHubError(response)
	}
	if !strings.HasPrefix(strings.ToLower(response.Header.Get("Content-Type")), "text/event-stream") {
		return fmt.Errorf("AgentHub events returned unexpected content type %q", response.Header.Get("Content-Type"))
	}
	return readAgentHubSSE(response.Body, after, receive)
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

func (c *agentHubClient) Resume(ctx context.Context, sessionID string) (agentHubSession, error) {
	return c.sessionAction(ctx, sessionID, "resume")
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
	decoder := json.NewDecoder(io.LimitReader(response.Body, 8<<20))
	if err := decoder.Decode(output); err != nil {
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

func readAgentHubSSE(reader io.Reader, after int64, receive func(agentHubEvent) error) error {
	scanner := bufio.NewScanner(reader)
	scanner.Buffer(make([]byte, 64*1024), 4<<20)
	var eventID string
	var data []string
	dispatch := func() error {
		if len(data) == 0 {
			eventID = ""
			return nil
		}
		var event agentHubEvent
		if err := json.Unmarshal([]byte(strings.Join(data, "\n")), &event); err != nil {
			return fmt.Errorf("decode AgentHub SSE event: %w", err)
		}
		if eventID != "" {
			frameID, err := strconv.ParseInt(eventID, 10, 64)
			if err != nil {
				return fmt.Errorf("invalid AgentHub SSE id %q", eventID)
			}
			if event.ID != frameID {
				return fmt.Errorf("AgentHub SSE id mismatch: frame %d, payload %d", frameID, event.ID)
			}
		}
		if event.ID > after {
			if event.ID != after+1 {
				return fmt.Errorf("AgentHub event cursor gap: expected %d, got %d", after+1, event.ID)
			}
			after = event.ID
		}
		// Frames at or below the cursor are delta-merge replacements: the
		// store folded a new fragment into an already-delivered event and
		// republished it under the same id. Pass them through so the receiver
		// can swap in the accumulated content; only new ids move the cursor.
		eventID = ""
		data = data[:0]
		return receive(event)
	}
	for scanner.Scan() {
		line := scanner.Text()
		if line == "" {
			if err := dispatch(); err != nil {
				return err
			}
			continue
		}
		if strings.HasPrefix(line, ":") {
			continue
		}
		field, value, found := strings.Cut(line, ":")
		if found {
			value = strings.TrimPrefix(value, " ")
		}
		switch field {
		case "id":
			eventID = value
		case "data":
			data = append(data, value)
		}
	}
	if err := scanner.Err(); err != nil {
		return err
	}
	return dispatch()
}

func sessionPath(sessionID string) string {
	return "/v1/sessions/" + url.PathEscape(strings.TrimSpace(sessionID))
}
