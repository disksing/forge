package app

import (
	"bytes"
	"errors"
	"os"
	"path/filepath"
	"strings"
	"testing"
)

func TestMigrateLegacyLogsIsIdempotentAndPreservesSourceOrder(t *testing.T) {
	root := t.TempDir()
	workspace, err := Initialize(root, "en")
	if err != nil {
		t.Fatal(err)
	}
	project, err := workspace.CreateProject("Legacy migration", "legacy")
	if err != nil {
		t.Fatal(err)
	}
	task, err := workspace.CreateTask(CreateTaskInput{ProjectID: project.ID, Title: "Legacy task", Slug: "legacy"})
	if err != nil {
		t.Fatal(err)
	}
	source := []byte("{\"id\":\"log-old\",\"time\":\"2025-01-01T00:00:00Z\",\"title\":\"Old first\",\"details\":\"line one\"}\n" +
		"{\"id\":\"log-new\",\"time\":\"2025-01-02T00:00:00Z\",\"title\":\"Old second\",\"details\":\"line two\"}\n")
	taskResult, err := workspace.ResourceValue(task.ID)
	if err != nil {
		t.Fatal(err)
	}
	taskDir := filepath.Join(root, filepath.FromSlash(taskResult.Path))
	if err := os.WriteFile(filepath.Join(taskDir, legacyLogFileName), source, 0o644); err != nil {
		t.Fatal(err)
	}
	if err := workspace.Migrate(""); err != nil {
		t.Fatal(err)
	}
	artifactPath := filepath.Join(taskDir, "artifacts", legacyLogArtifactName)
	artifact, err := os.ReadFile(artifactPath)
	if err != nil {
		t.Fatal(err)
	}
	if strings.Contains(string(artifact), "Old first") == false || strings.Index(string(artifact), "Old first") > strings.Index(string(artifact), "Old second") {
		t.Fatalf("legacy entries were not kept in source order:\n%s", artifact)
	}
	if !legacyLogArtifactMatches(artifact, legacyLogDigest(source)) || !strings.Contains(string(artifact), "entry-count: 2") {
		t.Fatalf("legacy artifact metadata is incomplete:\n%s", artifact)
	}
	if _, err := os.Stat(filepath.Join(taskDir, legacyLogFileName)); !os.IsNotExist(err) {
		t.Fatalf("legacy source was not removed after durable migration: %v", err)
	}

	// Reintroducing the exact old source is a useful idempotence check: the
	// matching artifact is reused byte-for-byte and the source is then removed.
	if err := os.WriteFile(filepath.Join(taskDir, legacyLogFileName), source, 0o644); err != nil {
		t.Fatal(err)
	}
	if err := workspace.Migrate(""); err != nil {
		t.Fatal(err)
	}
	repeated, err := os.ReadFile(artifactPath)
	if err != nil {
		t.Fatal(err)
	}
	if !bytes.Equal(artifact, repeated) {
		t.Fatal("matching legacy artifact was rewritten during an idempotent retry")
	}
}

func TestMigrateLegacyLogsFailsClosedForMalformedSourceAndConflicts(t *testing.T) {
	root := t.TempDir()
	workspace, err := Initialize(root, "en")
	if err != nil {
		t.Fatal(err)
	}
	project, err := workspace.CreateProject("Legacy failure", "legacy-failure")
	if err != nil {
		t.Fatal(err)
	}
	result, err := workspace.ResourceValue(project.ID)
	if err != nil {
		t.Fatal(err)
	}
	dir := filepath.Join(root, filepath.FromSlash(result.Path))
	sourcePath := filepath.Join(dir, legacyLogFileName)
	malformed := []byte("{\"id\":\"ok\",\"title\":\"valid\"}\nnot-json\n")
	if err := os.WriteFile(sourcePath, malformed, 0o644); err != nil {
		t.Fatal(err)
	}
	if err := workspace.Migrate(""); err == nil || !IsKind(err, "legacy_log") {
		t.Fatalf("malformed legacy source should fail with legacy_log, got %v", err)
	}
	if _, err := os.Stat(sourcePath); err != nil {
		t.Fatalf("malformed source was not retained: %v", err)
	}
	if _, err := os.Stat(filepath.Join(dir, "artifacts", legacyLogArtifactName)); !os.IsNotExist(err) {
		t.Fatalf("malformed source unexpectedly produced an artifact: %v", err)
	}

	valid := []byte("{\"id\":\"conflict\",\"time\":\"2025-01-01T00:00:00Z\",\"title\":\"conflict\"}\n")
	if err := os.WriteFile(sourcePath, valid, 0o644); err != nil {
		t.Fatal(err)
	}
	artifactPath := filepath.Join(dir, "artifacts", legacyLogArtifactName)
	conflicting := []byte(legacyLogMarker + "\n<!-- source: " + legacyLogFileName + " -->\n<!-- source-digest: sha256:different -->\n")
	if err := os.WriteFile(artifactPath, conflicting, 0o644); err != nil {
		t.Fatal(err)
	}
	if err := workspace.Migrate(""); err == nil || !IsKind(err, "legacy_log") {
		t.Fatalf("conflicting artifact should fail with legacy_log, got %v", err)
	}
	if _, err := os.Stat(sourcePath); err != nil {
		t.Fatalf("conflicting source was not retained: %v", err)
	}
	if got, readErr := os.ReadFile(artifactPath); readErr != nil || !bytes.Equal(got, conflicting) {
		t.Fatalf("conflicting artifact was changed: %v", readErr)
	}
}

func TestResourceDoesNotReadLegacyLogHotPath(t *testing.T) {
	root := t.TempDir()
	workspace, err := Initialize(root, "en")
	if err != nil {
		t.Fatal(err)
	}
	project, err := workspace.CreateProject("Hot path", "hot-path")
	if err != nil {
		t.Fatal(err)
	}
	result, err := workspace.ResourceValue(project.ID)
	if err != nil {
		t.Fatal(err)
	}
	sourcePath := filepath.Join(root, filepath.FromSlash(result.Path), legacyLogFileName)
	if err := os.WriteFile(sourcePath, []byte("not-json\n"), 0o644); err != nil {
		t.Fatal(err)
	}
	if _, err := workspace.Resource(project.ID); err != nil {
		t.Fatalf("normal Resource read consulted legacy log: %v", err)
	}
	if _, err := os.Stat(sourcePath); err != nil {
		t.Fatal(err)
	}
}

func TestLegacyLogMigrationErrorKindIsStable(t *testing.T) {
	var apiErr *APIError
	err := &APIError{Kind: "legacy_log", Err: errors.New("retained")}
	if !errors.As(err, &apiErr) || !IsKind(err, "legacy_log") {
		t.Fatal("legacy_log API error did not preserve its kind")
	}
}
