package serve

import (
	"strings"
	"testing"
)

func TestMainHelpAndVersionDoNotStartServer(t *testing.T) {
	if err := Main([]string{"--help"}); err != nil {
		t.Fatalf("Main(--help) failed: %v", err)
	}
	if err := Main([]string{"-h"}); err != nil {
		t.Fatalf("Main(-h) failed: %v", err)
	}
	if err := Main([]string{"--version"}); err != nil {
		t.Fatalf("Main(--version) failed: %v", err)
	}
}

func TestMainRejectsUnknownFlagsAndPositionalArgs(t *testing.T) {
	if err := Main([]string{"--bogus"}); err == nil {
		t.Fatal("expected unknown flag to fail")
	}
	if err := Main([]string{"positional"}); err == nil || !strings.Contains(err.Error(), "unexpected positional argument") {
		t.Fatalf("expected positional argument to fail, got %v", err)
	}
}

func TestMainValidatesAgentHubModeArguments(t *testing.T) {
	for _, test := range []struct {
		args []string
		want string
	}{
		{[]string{"--agenthub-mode=unknown"}, "invalid --agenthub-mode"},
		{[]string{"--agenthub-mode=external"}, "--agenthub-endpoint is required"},
		{[]string{"--agenthub-endpoint=http://127.0.0.1:4646/agenthub"}, "only valid"},
		{[]string{"--agenthub-mode=external", "--agenthub-endpoint=http://127.0.0.1:4646"}, "must end in /agenthub"},
	} {
		if err := Main(test.args); err == nil || !strings.Contains(err.Error(), test.want) {
			t.Errorf("Main(%v) error = %v, want %q", test.args, err, test.want)
		}
	}
}
