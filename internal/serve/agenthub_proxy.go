package serve

import (
	"errors"
	"fmt"
	"io"
	"net/http"
	"net/url"
	"strconv"
	"strings"
)

// This file implements the same-origin, cache-free, on-demand AgentHub events
// proxy. The PUA serve server never parses, stores, or replays event content
// here: JSON pages are forwarded byte-for-byte and SSE frames are forwarded as
// a raw stream. The only PUA addition is the forge.notice frames interleaved
// into the proxy stream so existing browser notifications keep working.

// errAgentHubProxyUnbound marks an internal generation record that has no
// AgentHub session, which the resource proxy reports as 409 instead of a
// generic upstream failure.
var errAgentHubProxyUnbound = errors.New("run is not attached to AgentHub")

// errAgentHubProxyConfig marks AgentHub client configuration failures, which
// the proxy reports as 503 because the web UI itself is not ready to serve events.
var errAgentHubProxyConfig = errors.New("AgentHub is not configured")

// resolveAgentHubProxyTarget finds an internal generation record and a live
// AgentHub client without loading any event history. The returned status is
// the HTTP code to report when err is non-nil. Its runID argument is an
// implementation key, never a resource address.
func (m *agentManager) resolveAgentHubProxyTarget(workspaceID, runID string) (agentRun, *agentHubClient, int, error) {
	workspace, rt, err := m.workspaceRuntime(workspaceID, runID)
	if err != nil {
		return agentRun{}, nil, http.StatusNotFound, err
	}
	var run agentRun
	if rt != nil {
		run = rt.snapshotRun()
	} else {
		run, err = loadAgentRun(workspace.Path, runID)
		if err != nil || run.WorkspaceID != workspaceID || !isAgentHubRun(run) {
			if err == nil {
				err = fmt.Errorf("run not found: %s", runID)
			}
			return agentRun{}, nil, http.StatusNotFound, err
		}
	}
	if strings.TrimSpace(run.AgentHubSessionID) == "" {
		return agentRun{}, nil, http.StatusConflict, errAgentHubProxyUnbound
	}
	var client *agentHubClient
	if rt != nil {
		rt.mu.Lock()
		client = rt.agentHub
		rt.mu.Unlock()
	}
	if client == nil {
		if _, client, err = m.agentHubRuntimeConfig(); err != nil {
			return agentRun{}, nil, http.StatusServiceUnavailable, fmt.Errorf("%w: %v", errAgentHubProxyConfig, err)
		}
	}
	return run, client, http.StatusOK, nil
}

func (m *agentManager) proxyAgentHubEvents(w http.ResponseWriter, r *http.Request, workspaceID, runID string) {
	m.proxyAgentHubJSON(w, r, workspaceID, runID, "events", []string{"after", "before", "latest", "limit", "start", "end"})
}

func (m *agentManager) proxyAgentHubJSON(w http.ResponseWriter, r *http.Request, workspaceID, runID, suffix string, queryKeys []string) {
	run, client, status, err := m.resolveAgentHubProxyTarget(workspaceID, runID)
	if err != nil {
		writeError(w, err, status)
		return
	}
	// Forward the paging parameters verbatim; AgentHub validates them.
	query := make(url.Values)
	for _, key := range queryKeys {
		if value := strings.TrimSpace(r.URL.Query().Get(key)); value != "" {
			query.Set(key, value)
		}
	}
	path := sessionPath(run.AgentHubSessionID) + "/" + suffix
	if encoded := query.Encode(); encoded != "" {
		path += "?" + encoded
	}
	request, err := http.NewRequestWithContext(r.Context(), http.MethodGet, client.endpoint+path, nil)
	if err != nil {
		writeError(w, err, http.StatusBadGateway)
		return
	}
	request.Header.Set("Accept", "application/json")
	response, err := client.httpClient.Do(request)
	if err != nil {
		writeError(w, fmt.Errorf("proxy AgentHub %s: %w", suffix, err), http.StatusBadGateway)
		return
	}
	defer response.Body.Close()
	if response.StatusCode < 200 || response.StatusCode >= 300 {
		writeAgentHubProxyError(w, response)
		return
	}
	if contentType := response.Header.Get("Content-Type"); contentType != "" {
		w.Header().Set("Content-Type", contentType)
	} else {
		w.Header().Set("Content-Type", "application/json")
	}
	w.Header().Set("Cache-Control", "no-store")
	w.WriteHeader(response.StatusCode)
	_, _ = io.Copy(w, response.Body)
}

func (m *agentManager) proxyAgentHubStream(w http.ResponseWriter, r *http.Request, workspaceID, runID string) {
	run, client, status, err := m.resolveAgentHubProxyTarget(workspaceID, runID)
	if err != nil {
		writeError(w, err, status)
		return
	}
	flusher, ok := w.(http.Flusher)
	if !ok {
		writeError(w, errors.New("streaming is not supported"), http.StatusInternalServerError)
		return
	}
	afterID := agentStreamAfterID(r)
	path := sessionPath(run.AgentHubSessionID) + "/events?stream=true"
	if afterID > 0 {
		path += "&after=" + strconv.FormatInt(afterID, 10)
	}
	// Tie the upstream SSE request to the browser connection so AgentHub has no
	// stream for a run nobody is watching.
	ctx := r.Context()
	request, err := http.NewRequestWithContext(ctx, http.MethodGet, client.endpoint+path, nil)
	if err != nil {
		writeError(w, err, http.StatusBadGateway)
		return
	}
	request.Header.Set("Accept", "text/event-stream")
	if afterID > 0 {
		request.Header.Set("Last-Event-ID", strconv.FormatInt(afterID, 10))
	}
	response, err := client.httpClient.Do(request)
	if err != nil {
		writeError(w, fmt.Errorf("proxy AgentHub stream: %w", err), http.StatusBadGateway)
		return
	}
	defer response.Body.Close()
	if response.StatusCode < 200 || response.StatusCode >= 300 {
		writeAgentHubProxyError(w, response)
		return
	}
	if contentType := response.Header.Get("Content-Type"); contentType != "" {
		w.Header().Set("Content-Type", contentType)
	} else {
		w.Header().Set("Content-Type", "text/event-stream")
	}
	w.Header().Set("Cache-Control", "no-store")
	w.WriteHeader(http.StatusOK)
	flusher.Flush()

	// Subscribe to PUA notices for this run so they interleave into the
	// proxied stream; canonical event history always flows from AgentHub.
	messages := make(chan agentStreamMessage, agentHubEventMaxCount)
	m.subscribe(run.ID, messages)
	defer m.unsubscribe(run.ID, messages)

	// Pump upstream bytes through a channel so notices can be forwarded even
	// while AgentHub has no new frames.
	chunks := make(chan []byte, 8)
	go func() {
		defer close(chunks)
		buffer := make([]byte, 32*1024)
		for {
			n, readErr := response.Body.Read(buffer)
			if n > 0 {
				chunk := append([]byte(nil), buffer[:n]...)
				select {
				case chunks <- chunk:
				case <-ctx.Done():
					return
				}
			}
			if readErr != nil {
				return
			}
		}
	}()
	for {
		select {
		case chunk, ok := <-chunks:
			if !ok {
				return
			}
			if _, err := w.Write(chunk); err != nil {
				return
			}
			flusher.Flush()
		case message := <-messages:
			if message.Notice != nil {
				writeForgeNoticeSSE(w, *message.Notice)
				flusher.Flush()
			}
		case <-ctx.Done():
			return
		}
	}
}

// writeAgentHubProxyError maps an upstream failure to a PUA error response.
// Client-visible statuses (4xx) pass through unchanged so the browser can
// react to e.g. an invalid cursor; 5xx and unexpected statuses become 502.
func writeAgentHubProxyError(w http.ResponseWriter, response *http.Response) {
	status := response.StatusCode
	if status < 400 || status >= 500 {
		status = http.StatusBadGateway
	}
	writeError(w, decodeAgentHubError(response), status)
}
