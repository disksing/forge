package serve

import (
	"reflect"
	"testing"
)

func TestProviderMessageTextMatchesLegacyAgentHubFormat(t *testing.T) {
	tests := []struct {
		name   string
		text   string
		role   string
		sender *agentHubMessageSender
		steer  bool
		want   string
	}{
		{name: "plain user", text: "hello", role: "user", want: "hello"},
		{name: "named agent", text: "review", role: "agent", sender: &agentHubMessageSender{Name: "Review Agent"}, want: "Message from agent \"Review Agent\":\nreview"},
		{name: "steer", text: "urgent", role: "agent", sender: &agentHubMessageSender{ID: "project1.task2"}, steer: true, want: "Message from agent \"project1.task2\" (steer):\nurgent"},
		{name: "escaped sender", text: "body", role: "system", sender: &agentHubMessageSender{Name: "line\n\"quoted\""}, want: "Message from system \"line\\n\\\"quoted\\\"\":\nbody"},
	}
	for _, test := range tests {
		t.Run(test.name, func(t *testing.T) {
			if got := providerMessageText(test.text, test.role, test.sender, test.steer); got != test.want {
				t.Fatalf("provider text = %q, want %q", got, test.want)
			}
		})
	}
}

func TestAgentHubMailboxMessageOwnsPayloadAndProviderPrompt(t *testing.T) {
	message := resourceMailboxMessage{
		ID: "msg-1", Text: "inspect", Role: "agent", Type: "resource.message",
		Sender:                    &agentHubMessageSender{ID: "project1.task2", Name: "Worker"},
		SenderWorkspaceInstanceID: "workspace-1", ActualMode: resourceMessageModeSteer,
		Causation: &resourceMessageCausation{Type: "task", SourceResourceID: "project1.task2", MessageID: "cause-1"},
	}
	wire, err := agentHubMailboxMessage(message)
	if err != nil {
		t.Fatal(err)
	}
	payload, ok := decodePUAMessagePayload(wire.Payload)
	if !ok {
		t.Fatalf("payload did not decode: %s", wire.Payload)
	}
	if wire.SchemaVersion != agentHubOpaqueMessageSchema || wire.MessageID != message.ID || !wire.Steer ||
		wire.Text != "Message from agent \"Worker\" (steer):\ninspect" {
		t.Fatalf("wire message = %+v", wire)
	}
	if payload.Text != message.Text || payload.Role != message.Role || payload.SenderWorkspaceInstanceID != "workspace-1" ||
		!reflect.DeepEqual(payload.Sender, message.Sender) || !reflect.DeepEqual(payload.Causation, message.Causation) {
		t.Fatalf("payload = %+v", payload)
	}
}

func TestCanonicalAgentHubMessageMatchesV2AndLegacyData(t *testing.T) {
	expected := resourceMailboxMessage{
		ID: "msg-1", Text: "inspect", Role: "agent", Sender: &agentHubMessageSender{Name: "Worker"},
		ActualMode: resourceMessageModeEnqueue,
	}
	v2, err := agentHubMailboxMessage(expected)
	if err != nil {
		t.Fatal(err)
	}
	legacy := agentHubInboundMessage{Text: expected.Text, Role: expected.Role, Sender: expected.Sender, MessageID: expected.ID}
	if !canonicalAgentHubMessageMatches(v2, expected) || !canonicalAgentHubMessageMatches(legacy, expected) {
		t.Fatal("equivalent v2 and legacy canonical inputs must both match")
	}
	v2.Text = "changed"
	if canonicalAgentHubMessageMatches(v2, expected) {
		t.Fatal("changed provider text matched canonical input")
	}
}

func TestPUAMessagePresentationDecodesV2AndKeepsLegacy(t *testing.T) {
	payload, err := marshalPUAMessagePayload(puaMessagePayload{
		Schema: puaMessagePayloadSchema, Text: "original", Role: "agent", Sender: &agentHubMessageSender{Name: "Worker"},
	})
	if err != nil {
		t.Fatal(err)
	}
	text, role, sender := puaMessagePresentation("provider prompt", "", nil, payload)
	if text != "original" || role != "agent" || sender == nil || sender.Name != "Worker" {
		t.Fatalf("v2 presentation = %q %q %+v", text, role, sender)
	}
	legacySender := &agentHubMessageSender{Name: "Old Client"}
	text, role, sender = puaMessagePresentation("legacy", "system", legacySender, nil)
	if text != "legacy" || role != "system" || sender != legacySender {
		t.Fatalf("legacy presentation = %q %q %+v", text, role, sender)
	}
}
