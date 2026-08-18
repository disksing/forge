package serve

import (
	"encoding/json"
	"reflect"
	"strconv"
	"strings"
)

const (
	agentHubOpaqueMessageSchema = 2
	puaMessagePayloadSchema     = "pua.resource-message.v1"
)

// puaMessagePayload is PUA-owned application metadata. AgentHub persists the
// JSON value but does not interpret any field in it.
type puaMessagePayload struct {
	Schema                    string                    `json:"schema"`
	Text                      string                    `json:"text"`
	Role                      string                    `json:"role"`
	Sender                    *agentHubMessageSender    `json:"sender,omitempty"`
	SenderWorkspaceInstanceID string                    `json:"senderWorkspaceInstanceId,omitempty"`
	Type                      string                    `json:"type,omitempty"`
	Causation                 *resourceMessageCausation `json:"causation,omitempty"`
}

func providerMessageText(text, role string, sender *agentHubMessageSender, steer bool) string {
	role = strings.ToLower(strings.TrimSpace(role))
	if role == "" {
		role = "user"
	}
	sender = normalizedMessageSender(sender)
	if role == "user" && sender == nil && !steer {
		return text
	}
	header := "Message from " + role
	if name := providerMessageSenderName(sender); name != "" {
		header += " " + strconv.QuoteToGraphic(name)
	}
	if steer {
		header += " (steer)"
	}
	return header + ":\n" + text
}

func normalizedMessageSender(sender *agentHubMessageSender) *agentHubMessageSender {
	if sender == nil {
		return nil
	}
	normalized := &agentHubMessageSender{
		ID: strings.TrimSpace(sender.ID), Name: strings.TrimSpace(sender.Name), SessionID: strings.TrimSpace(sender.SessionID),
	}
	if normalized.ID == "" && normalized.Name == "" && normalized.SessionID == "" {
		return nil
	}
	return normalized
}

func providerMessageSenderName(sender *agentHubMessageSender) string {
	if sender == nil {
		return ""
	}
	for _, value := range []string{sender.Name, sender.ID, sender.SessionID} {
		if value != "" {
			return value
		}
	}
	return ""
}

func puaPayloadForMailboxMessage(message resourceMailboxMessage) puaMessagePayload {
	return puaMessagePayload{
		Schema: puaMessagePayloadSchema, Text: message.Text, Role: message.Role,
		Sender: normalizedMessageSender(message.Sender), SenderWorkspaceInstanceID: message.SenderWorkspaceInstanceID,
		Type: message.Type, Causation: message.Causation,
	}
}

func marshalPUAMessagePayload(payload puaMessagePayload) (json.RawMessage, error) {
	encoded, err := json.Marshal(payload)
	return json.RawMessage(encoded), err
}

func agentHubMailboxMessage(message resourceMailboxMessage) (agentHubInboundMessage, error) {
	payload, err := marshalPUAMessagePayload(puaPayloadForMailboxMessage(message))
	if err != nil {
		return agentHubInboundMessage{}, err
	}
	steer := message.ActualMode == resourceMessageModeSteer
	return agentHubInboundMessage{
		SchemaVersion: agentHubOpaqueMessageSchema,
		Text:          providerMessageText(message.Text, message.Role, message.Sender, steer),
		Payload:       payload,
		Steer:         steer,
		MessageID:     message.ID,
	}, nil
}

func decodePUAMessagePayload(raw json.RawMessage) (puaMessagePayload, bool) {
	if len(raw) == 0 {
		return puaMessagePayload{}, false
	}
	var payload puaMessagePayload
	if json.Unmarshal(raw, &payload) != nil || payload.Schema != puaMessagePayloadSchema {
		return puaMessagePayload{}, false
	}
	return payload, true
}

// canonicalAgentHubMessageMatches accepts both the v2 representation and an
// equivalent v1 input that may have been persisted before a rolling upgrade.
func canonicalAgentHubMessageMatches(canonical agentHubInboundMessage, expected resourceMailboxMessage) bool {
	expectedWire, err := agentHubMailboxMessage(expected)
	if err != nil {
		return false
	}
	if canonical.SchemaVersion == agentHubOpaqueMessageSchema {
		actualPayload, ok := decodePUAMessagePayload(canonical.Payload)
		expectedPayload, expectedOK := decodePUAMessagePayload(expectedWire.Payload)
		expectedText := providerMessageText(expected.Text, expected.Role, expected.Sender, canonical.Steer)
		return ok && expectedOK && canonical.Text == expectedText &&
			canonical.MessageID == expectedWire.MessageID && reflect.DeepEqual(actualPayload, expectedPayload)
	}
	role := canonical.Role
	if role == "" {
		role = "user"
	}
	return canonical.Text == expected.Text && role == expected.Role && reflect.DeepEqual(canonical.Sender, normalizedMessageSender(expected.Sender)) &&
		canonical.MessageID == expected.ID
}

func puaMessagePresentation(text, role string, sender *agentHubMessageSender, payload json.RawMessage) (string, string, *agentHubMessageSender) {
	if decoded, ok := decodePUAMessagePayload(payload); ok {
		return decoded.Text, decoded.Role, decoded.Sender
	}
	if role == "" {
		role = "user"
	}
	return text, role, sender
}
