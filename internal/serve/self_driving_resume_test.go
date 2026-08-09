package serve

import (
	"strings"
	"testing"
)

func TestFrontendHasNoRetiredSelfDrivingUserActions(t *testing.T) {
	data, err := staticFiles.ReadFile("static/app.js")
	if err != nil {
		t.Fatal(err)
	}
	source := string(data)
	for _, retired := range []string{
		`/self-driving/start`, `/self-driving/cancel`, `resumeSuspendedSelfDriving`,
		`expectedSelfDrivingState`, `queueSelfDriving`, `manualSelfDriving`,
	} {
		if strings.Contains(source, retired) {
			t.Fatalf("frontend retained retired Self-Driving entry %q", retired)
		}
	}
	for _, required := range []string{
		`method: "PUT"`, `role="switch"`, `Self-Driving stays On and may create a replacement`,
		`Disable Self-Driving and close this Session instead?`,
	} {
		if !strings.Contains(source, required) {
			t.Fatalf("frontend missing %q", required)
		}
	}
}
