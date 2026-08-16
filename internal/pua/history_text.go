package pua

import (
	"bytes"
	"encoding/json"
	"fmt"
	"os"
	"strings"
)

type historySender struct {
	ID        string `json:"id,omitempty"`
	Name      string `json:"name,omitempty"`
	SessionID string `json:"sessionId,omitempty"`
}

type historyBinding struct {
	Kind string `json:"kind"`
	Name string `json:"name"`
}

type historyGeneration struct {
	Generation         int            `json:"generation"`
	GenerationID       string         `json:"generationId"`
	Title              string         `json:"title"`
	Binding            historyBinding `json:"binding"`
	ResolvedProfile    string         `json:"resolvedProfile,omitempty"`
	AgentName          string         `json:"agentName,omitempty"`
	Status             string         `json:"status"`
	CreatedAt          string         `json:"createdAt"`
	UpdatedAt          string         `json:"updatedAt"`
	AgentHubSessionID  string         `json:"agentHubSessionId,omitempty"`
	ReplacementPending bool           `json:"replacementPending,omitempty"`
}

type historyDelivery struct {
	MessageID                 string          `json:"messageId"`
	RequestedMode             string          `json:"requestedMode"`
	ActualMode                string          `json:"actualMode"`
	DowngradeReason           string          `json:"downgradeReason,omitempty"`
	Role                      string          `json:"role"`
	Sender                    *historySender  `json:"sender,omitempty"`
	SenderWorkspaceInstanceID string          `json:"senderWorkspaceInstanceId,omitempty"`
	Type                      string          `json:"type,omitempty"`
	Causation                 json.RawMessage `json:"causation,omitempty"`
	AcceptedAt                string          `json:"acceptedAt"`
	DeliveredAt               string          `json:"deliveredAt,omitempty"`
}

type historyTurnSummary struct {
	Reference         string            `json:"reference"`
	TurnID            string            `json:"turnId"`
	Status            string            `json:"status"`
	Closed            bool              `json:"closed"`
	StartedAt         string            `json:"startedAt"`
	EndedAt           string            `json:"endedAt,omitempty"`
	DurationMS        int64             `json:"durationMs"`
	TriggerPreview    string            `json:"triggerPreview,omitempty"`
	TriggerRole       string            `json:"triggerRole,omitempty"`
	TriggerSender     *historySender    `json:"triggerSender,omitempty"`
	FinalReplyPreview string            `json:"finalReplyPreview,omitempty"`
	EventCount        int               `json:"eventCount"`
	ToolEventCount    int               `json:"toolEventCount"`
	StartEventID      int64             `json:"startEventId"`
	LastEventID       int64             `json:"lastEventId"`
	EndEventID        int64             `json:"endEventId,omitempty"`
	TriggerDelivery   *historyDelivery  `json:"triggerDelivery,omitempty"`
	Generation        historyGeneration `json:"generation"`
}

type historyGap struct {
	Code      string `json:"code"`
	Message   string `json:"message"`
	Retryable bool   `json:"retryable"`
}

type historySegment struct {
	Generation historyGeneration    `json:"generation"`
	Turns      []historyTurnSummary `json:"turns"`
	Gap        *historyGap          `json:"gap,omitempty"`
}

type historyPage struct {
	ResourceID string           `json:"resourceId"`
	Segments   []historySegment `json:"segments"`
	Page       struct {
		Limit      int    `json:"limit"`
		NextCursor string `json:"nextCursor,omitempty"`
		HasMore    bool   `json:"hasMore"`
	} `json:"page"`
}

type historyTurnItem struct {
	Type          string          `json:"type"`
	Role          string          `json:"role,omitempty"`
	Sender        *historySender  `json:"sender,omitempty"`
	Steer         bool            `json:"steer,omitempty"`
	Text          string          `json:"text,omitempty"`
	StartEventID  int64           `json:"startEventId"`
	EndEventID    int64           `json:"endEventId"`
	StartEventRef string          `json:"startEventRef"`
	EndEventRef   string          `json:"endEventRef"`
	StartedAt     string          `json:"startedAt"`
	EndedAt       string          `json:"endedAt"`
	DurationMS    int64           `json:"durationMs"`
	Count         int             `json:"count"`
	Data          json.RawMessage `json:"data,omitempty"`
}

type historyTurnDetail struct {
	Turn               historyTurnSummary `json:"turn"`
	Items              []historyTurnItem  `json:"items"`
	Deliveries         []historyDelivery  `json:"deliveries"`
	LatestEventID      int64              `json:"latestEventId"`
	LatestEventRef     string             `json:"latestEventRef,omitempty"`
	TurnStartedEventID int64              `json:"turnStartedEventId,omitempty"`
	CompletedAt        string             `json:"completedAt,omitempty"`
}

type historyEvent struct {
	ID        int64           `json:"id"`
	Time      string          `json:"time"`
	Type      string          `json:"type"`
	SessionID string          `json:"sessionId"`
	TurnID    string          `json:"turnId,omitempty"`
	Data      json.RawMessage `json:"data,omitempty"`
}

type historyEventDetail struct {
	Reference  string            `json:"reference"`
	Generation historyGeneration `json:"generation"`
	Event      historyEvent      `json:"event"`
}

func decodeHistoryResponse(value map[string]any, output any) error {
	data, err := json.Marshal(value)
	if err != nil {
		return err
	}
	if err := json.Unmarshal(data, output); err != nil {
		return fmt.Errorf("decode history response for text output: %w", err)
	}
	return nil
}

func printResourceHistoryText(response map[string]any) error {
	var page historyPage
	if err := decodeHistoryResponse(response, &page); err != nil {
		return err
	}
	var output bytes.Buffer
	fmt.Fprintf(&output, "Resource: %s\n", page.ResourceID)
	if len(page.Segments) == 0 {
		output.WriteString("History: (empty)\n")
	} else {
		output.WriteString("History:\n")
		for _, segment := range page.Segments {
			writeHistoryGeneration(&output, segment.Generation, "  ")
			if segment.Gap != nil {
				fmt.Fprintf(&output, "    Gap: %s (retryable: %t)\n", segment.Gap.Code, segment.Gap.Retryable)
				writeHistoryTextBlock(&output, "      ", segment.Gap.Message)
			}
			if len(segment.Turns) == 0 && segment.Gap == nil {
				output.WriteString("    Turns: (none)\n")
			}
			for _, turn := range segment.Turns {
				writeHistoryTurn(&output, turn, "    ")
			}
		}
	}
	fmt.Fprintf(&output, "Page: limit=%d, hasMore=%t\n", page.Page.Limit, page.Page.HasMore)
	if page.Page.NextCursor != "" {
		fmt.Fprintf(&output, "Next cursor: %s\n", page.Page.NextCursor)
	}
	_, err := os.Stdout.Write(output.Bytes())
	return err
}

func printHistoryDetailText(kind string, response map[string]any) error {
	var output bytes.Buffer
	switch kind {
	case "turn":
		var detail historyTurnDetail
		if err := decodeHistoryResponse(response, &detail); err != nil {
			return err
		}
		writeHistoryTurn(&output, detail.Turn, "")
		writeHistoryGeneration(&output, detail.Turn.Generation, "  ")
		if detail.TurnStartedEventID > 0 {
			fmt.Fprintf(&output, "  Turn started event: %d\n", detail.TurnStartedEventID)
		}
		fmt.Fprintf(&output, "  Latest event: %d\n", detail.LatestEventID)
		if detail.LatestEventRef != "" {
			fmt.Fprintf(&output, "  Latest event reference: %s\n", detail.LatestEventRef)
		}
		if detail.CompletedAt != "" {
			fmt.Fprintf(&output, "  Completed: %s\n", detail.CompletedAt)
		}
		output.WriteString("Items:\n")
		if len(detail.Items) == 0 {
			output.WriteString("  (none)\n")
		}
		for index, item := range detail.Items {
			fmt.Fprintf(&output, "  %d. %s", index+1, emptyHistoryValue(item.Type))
			if item.Role != "" {
				fmt.Fprintf(&output, " [%s]", item.Role)
			}
			if item.Steer {
				output.WriteString(" [steer]")
			}
			output.WriteByte('\n')
			writeHistorySender(&output, "     Sender", item.Sender)
			fmt.Fprintf(&output, "     Events: %d-%d (count: %d)\n", item.StartEventID, item.EndEventID, item.Count)
			fmt.Fprintf(&output, "     Start event reference: %s\n", item.StartEventRef)
			fmt.Fprintf(&output, "     End event reference: %s\n", item.EndEventRef)
			writeOptionalHistoryField(&output, "     Started", item.StartedAt)
			writeOptionalHistoryField(&output, "     Ended", item.EndedAt)
			fmt.Fprintf(&output, "     Duration: %d ms\n", item.DurationMS)
			if item.Text != "" {
				output.WriteString("     Text:\n")
				writeHistoryTextBlock(&output, "       ", item.Text)
			}
			writeHistoryJSONBlock(&output, "     Data", "       ", item.Data)
		}
		output.WriteString("Deliveries:\n")
		if len(detail.Deliveries) == 0 {
			output.WriteString("  (none)\n")
		}
		for _, delivery := range detail.Deliveries {
			writeHistoryDelivery(&output, delivery, "  ")
		}
	case "event":
		var detail historyEventDetail
		if err := decodeHistoryResponse(response, &detail); err != nil {
			return err
		}
		fmt.Fprintf(&output, "Event: %d\n", detail.Event.ID)
		fmt.Fprintf(&output, "  Reference: %s\n", detail.Reference)
		fmt.Fprintf(&output, "  Type: %s\n", emptyHistoryValue(detail.Event.Type))
		writeOptionalHistoryField(&output, "  Time", detail.Event.Time)
		writeOptionalHistoryField(&output, "  Session", detail.Event.SessionID)
		writeOptionalHistoryField(&output, "  Turn", detail.Event.TurnID)
		writeHistoryGeneration(&output, detail.Generation, "  ")
		writeHistoryJSONBlock(&output, "  Data", "    ", detail.Event.Data)
	default:
		return fmt.Errorf("unsupported history detail kind %q", kind)
	}
	_, err := os.Stdout.Write(output.Bytes())
	return err
}

func writeHistoryGeneration(output *bytes.Buffer, generation historyGeneration, indent string) {
	fmt.Fprintf(output, "%sGeneration #%d: %s\n", indent, generation.Generation, emptyHistoryValue(generation.Title))
	fmt.Fprintf(output, "%s  ID: %s\n", indent, emptyHistoryValue(generation.GenerationID))
	fmt.Fprintf(output, "%s  Status: %s\n", indent, emptyHistoryValue(generation.Status))
	if generation.Binding.Kind != "" || generation.Binding.Name != "" {
		fmt.Fprintf(output, "%s  Binding: %s %s\n", indent, generation.Binding.Kind, generation.Binding.Name)
	}
	writeOptionalHistoryField(output, indent+"  Resolved profile", generation.ResolvedProfile)
	writeOptionalHistoryField(output, indent+"  Agent", generation.AgentName)
	writeOptionalHistoryField(output, indent+"  Created", generation.CreatedAt)
	writeOptionalHistoryField(output, indent+"  Updated", generation.UpdatedAt)
	writeOptionalHistoryField(output, indent+"  AgentHub session", generation.AgentHubSessionID)
	if generation.ReplacementPending {
		fmt.Fprintf(output, "%s  Replacement pending: true\n", indent)
	}
}

func writeHistoryTurn(output *bytes.Buffer, turn historyTurnSummary, indent string) {
	fmt.Fprintf(output, "%sTurn %s: %s (closed: %t)\n", indent, emptyHistoryValue(turn.TurnID), emptyHistoryValue(turn.Status), turn.Closed)
	fmt.Fprintf(output, "%s  Reference: %s\n", indent, emptyHistoryValue(turn.Reference))
	writeOptionalHistoryField(output, indent+"  Started", turn.StartedAt)
	writeOptionalHistoryField(output, indent+"  Ended", turn.EndedAt)
	fmt.Fprintf(output, "%s  Duration: %d ms\n", indent, turn.DurationMS)
	fmt.Fprintf(output, "%s  Events: %d total, %d tool, range %d-%d\n", indent, turn.EventCount, turn.ToolEventCount, turn.StartEventID, turn.LastEventID)
	if turn.TriggerRole != "" || turn.TriggerSender != nil || turn.TriggerPreview != "" {
		fmt.Fprintf(output, "%s  Trigger: %s\n", indent, historyActor(turn.TriggerRole, turn.TriggerSender))
		writeHistoryTextBlock(output, indent+"    ", turn.TriggerPreview)
	}
	if turn.FinalReplyPreview != "" {
		fmt.Fprintf(output, "%s  Final reply:\n", indent)
		writeHistoryTextBlock(output, indent+"    ", turn.FinalReplyPreview)
	}
	if turn.TriggerDelivery != nil {
		writeHistoryDelivery(output, *turn.TriggerDelivery, indent+"  ")
	}
}

func writeHistoryDelivery(output *bytes.Buffer, delivery historyDelivery, indent string) {
	fmt.Fprintf(output, "%sDelivery %s: requested=%s, actual=%s\n", indent, emptyHistoryValue(delivery.MessageID), emptyHistoryValue(delivery.RequestedMode), emptyHistoryValue(delivery.ActualMode))
	writeOptionalHistoryField(output, indent+"  Downgrade reason", delivery.DowngradeReason)
	if delivery.Role != "" || delivery.Sender != nil {
		fmt.Fprintf(output, "%s  Provenance: %s\n", indent, historyActor(delivery.Role, delivery.Sender))
	}
	writeOptionalHistoryField(output, indent+"  Sender workspace", delivery.SenderWorkspaceInstanceID)
	writeOptionalHistoryField(output, indent+"  Type", delivery.Type)
	writeOptionalHistoryField(output, indent+"  Accepted", delivery.AcceptedAt)
	writeOptionalHistoryField(output, indent+"  Delivered", delivery.DeliveredAt)
	writeHistoryJSONBlock(output, indent+"  Causation", indent+"    ", delivery.Causation)
}

func writeHistorySender(output *bytes.Buffer, label string, sender *historySender) {
	if sender != nil {
		fmt.Fprintf(output, "%s: %s\n", label, historyActor("", sender))
	}
}

func historyActor(role string, sender *historySender) string {
	parts := make([]string, 0, 4)
	if role != "" {
		parts = append(parts, role)
	}
	if sender != nil {
		if sender.Name != "" {
			parts = append(parts, sender.Name)
		}
		if sender.ID != "" && sender.ID != sender.Name {
			parts = append(parts, "id="+sender.ID)
		}
		if sender.SessionID != "" {
			parts = append(parts, "session="+sender.SessionID)
		}
	}
	if len(parts) == 0 {
		return "(unknown)"
	}
	return strings.Join(parts, ", ")
}

func writeOptionalHistoryField(output *bytes.Buffer, label, value string) {
	if value != "" {
		fmt.Fprintf(output, "%s: %s\n", label, value)
	}
}

func writeHistoryTextBlock(output *bytes.Buffer, indent, value string) {
	if value == "" {
		fmt.Fprintf(output, "%s(empty)\n", indent)
		return
	}
	for _, line := range strings.Split(value, "\n") {
		fmt.Fprintf(output, "%s%s\n", indent, line)
	}
}

func writeHistoryJSONBlock(output *bytes.Buffer, label, indent string, value json.RawMessage) {
	if len(bytes.TrimSpace(value)) == 0 || bytes.Equal(bytes.TrimSpace(value), []byte("null")) {
		return
	}
	var formatted bytes.Buffer
	if err := json.Indent(&formatted, value, "", "  "); err != nil {
		formatted.Write(value)
	}
	fmt.Fprintf(output, "%s:\n", label)
	writeHistoryTextBlock(output, indent, formatted.String())
}

func emptyHistoryValue(value string) string {
	if value == "" {
		return "(none)"
	}
	return value
}
