package app

import (
	"bytes"
	"crypto/sha256"
	"encoding/base64"
	"encoding/hex"
	"encoding/json"
	"errors"
	"fmt"
	"html"
	"os"
	"path/filepath"
	"strings"
)

const (
	legacyLogFileName     = "log.jsonl"
	legacyLogArtifactName = "legacy-log.md"
	// legacyLogMarker and legacyLogEntryMarker are written by new
	// migrations. The forge-branded markers are still recognized so
	// artifacts written before the rebrand count as already migrated.
	legacyLogMarker           = "<!-- pua legacy log v1 -->"
	forgeLegacyLogMarker      = "<!-- forge legacy log v1 -->"
	legacyLogEntryMarker      = "pua-legacy-entry-base64"
	forgeLegacyLogEntryMarker = "forge-legacy-entry-base64"
)

// legacyLogEntry is deliberately private to the migration. The application
// no longer exposes a manual log type or reads log.jsonl on a normal request.
type legacyLogEntry struct {
	ID      string `json:"id"`
	Time    string `json:"time"`
	Title   string `json:"title"`
	Details string `json:"details,omitempty"`
}

type legacyResourcePath struct {
	ID   string
	Path string
}

func migrateLegacyLogs(root string) error {
	resources, err := legacyResourcePaths(root)
	if err != nil {
		return err
	}
	for _, resource := range resources {
		if err := migrateLegacyLogFile(resource.Path); err != nil {
			return fmt.Errorf("migrate %s (%s): %w", resource.ID, relPath(root, resource.Path), err)
		}
	}
	return nil
}

func legacyResourcePaths(root string) ([]legacyResourcePath, error) {
	projects, err := readProjectEntriesInDirs([]string{root, filepath.Join(root, archiveDir)})
	if err != nil {
		return nil, err
	}
	resources := make([]legacyResourcePath, 0, len(projects))
	for _, project := range projects {
		resources = append(resources, legacyResourcePath{ID: project.Project.ID, Path: project.Path})
		tasks, taskErr := readTaskEntriesInDirs(
			[]string{project.Path, filepath.Join(project.Path, archiveDir)},
			projectTaskName(project.Project.ID),
		)
		if taskErr != nil {
			return nil, taskErr
		}
		for _, task := range tasks {
			resources = append(resources, legacyResourcePath{ID: task.Task.ID, Path: task.Path})
		}
	}
	return resources, nil
}

func migrateLegacyLogFile(resourceDir string) error {
	sourcePath := filepath.Join(resourceDir, legacyLogFileName)
	sourceInfo, err := os.Lstat(sourcePath)
	if os.IsNotExist(err) {
		return nil
	}
	if err != nil {
		return err
	}
	if sourceInfo.Mode()&os.ModeSymlink != 0 {
		return fmt.Errorf("legacy source must not be a symbolic link: %s", sourcePath)
	}
	source, err := os.ReadFile(sourcePath)
	if err != nil {
		return err
	}
	entries, err := parseLegacyLogEntries(sourcePath, source)
	if err != nil {
		return err
	}
	digest := legacyLogDigest(source)
	expectedArtifact := []byte(formatLegacyLogArtifact(digest, entries, legacyLogMarker, legacyLogEntryMarker))
	forgeArtifact := []byte(formatLegacyLogArtifact(digest, entries, forgeLegacyLogMarker, forgeLegacyLogEntryMarker))
	artifactDir, err := ensureLegacyArtifactDir(resourceDir)
	if err != nil {
		return err
	}
	artifactPath := filepath.Join(artifactDir, legacyLogArtifactName)
	artifactInfo, artifactStatErr := os.Lstat(artifactPath)
	if artifactStatErr != nil && !os.IsNotExist(artifactStatErr) {
		return artifactStatErr
	}
	if artifactStatErr == nil && artifactInfo.Mode()&os.ModeSymlink != 0 {
		return fmt.Errorf("legacy artifact must not be a symbolic link: %s", artifactPath)
	}
	if existing, readErr := os.ReadFile(artifactPath); readErr == nil {
		switch {
		case bytes.Equal(existing, expectedArtifact):
		case bytes.Equal(existing, forgeArtifact):
			// The artifact was written before the rebrand; keep it as is and
			// verify against the forge-branded format.
			expectedArtifact = forgeArtifact
		default:
			return fmt.Errorf("legacy artifact already exists with different or altered content: %s", artifactPath)
		}
	} else if !os.IsNotExist(readErr) {
		return readErr
	} else {
		if err := writeLegacyLogArtifact(artifactDir, artifactPath, digest, entries); err != nil {
			return err
		}
	}

	// The source is removed only after the target is durable and has been read
	// back with the same migration marker and source digest. If removal fails,
	// the source remains available and the next migrate retry is idempotent.
	validated, err := os.ReadFile(artifactPath)
	if err != nil {
		return fmt.Errorf("verify legacy artifact: %w", err)
	}
	if !bytes.Equal(validated, expectedArtifact) {
		return errors.New("legacy artifact verification failed; source log was retained")
	}
	if err := os.Remove(sourcePath); err != nil {
		return fmt.Errorf("remove migrated source: %w", err)
	}
	if err := syncDirectory(resourceDir); err != nil {
		return fmt.Errorf("sync resource directory after removing source: %w", err)
	}
	return nil
}

func parseLegacyLogEntries(path string, source []byte) ([]legacyLogEntry, error) {
	lines := strings.Split(string(source), "\n")
	entries := make([]legacyLogEntry, 0, len(lines))
	for lineNumber, line := range lines {
		line = strings.TrimSuffix(line, "\r")
		if strings.TrimSpace(line) == "" {
			continue
		}
		var entry legacyLogEntry
		if err := json.Unmarshal([]byte(line), &entry); err != nil {
			return nil, fmt.Errorf("%s:%d: %w", path, lineNumber+1, err)
		}
		entries = append(entries, entry)
	}
	return entries, nil
}

func ensureLegacyArtifactDir(resourceDir string) (string, error) {
	artifacts := filepath.Join(resourceDir, "artifacts")
	info, err := os.Lstat(artifacts)
	switch {
	case os.IsNotExist(err):
		if err := os.Mkdir(artifacts, 0o755); err != nil {
			return "", err
		}
	case err != nil:
		return "", err
	case info.Mode()&os.ModeSymlink != 0:
		return "", fmt.Errorf("artifacts path must not be a symbolic link: %s", artifacts)
	case !info.IsDir():
		return "", fmt.Errorf("artifacts path is not a directory: %s", artifacts)
	}
	return artifacts, nil
}

func writeLegacyLogArtifact(dir, path, digest string, entries []legacyLogEntry) error {
	data := []byte(formatLegacyLogArtifact(digest, entries, legacyLogMarker, legacyLogEntryMarker))
	tmp, err := os.OpenFile(filepath.Join(dir, ".legacy-log.md.tmp"), os.O_CREATE|os.O_EXCL|os.O_WRONLY, 0o644)
	if err != nil {
		if os.IsExist(err) {
			return fmt.Errorf("legacy artifact staging file already exists: %w", err)
		}
		return err
	}
	tmpPath := tmp.Name()
	defer os.Remove(tmpPath)
	if _, err := tmp.Write(data); err != nil {
		_ = tmp.Close()
		return err
	}
	if err := tmp.Sync(); err != nil {
		_ = tmp.Close()
		return err
	}
	if err := tmp.Close(); err != nil {
		return err
	}
	if err := os.Rename(tmpPath, path); err != nil {
		return err
	}
	return syncDirectory(dir)
}

func formatLegacyLogArtifact(digest string, entries []legacyLogEntry, marker, entryMarker string) string {
	var builder strings.Builder
	fmt.Fprintf(&builder, "# Legacy history\n\n%s\n<!-- source: %s -->\n<!-- source-digest: %s -->\n<!-- entry-count: %d -->\n\n", marker, legacyLogFileName, digest, len(entries))
	for index, entry := range entries {
		encoded, _ := json.Marshal(entry)
		base64Entry := base64.RawStdEncoding.EncodeToString(encoded)
		fmt.Fprintf(&builder, "## %d. %s\n\n", index+1, html.EscapeString(entry.Title))
		fmt.Fprintf(&builder, "- **ID:** <code>%s</code>\n- **Time:** <code>%s</code>\n\n", html.EscapeString(entry.ID), html.EscapeString(entry.Time))
		fmt.Fprintf(&builder, "<details><summary>Details</summary>\n\n<pre>%s</pre>\n\n</details>\n\n", html.EscapeString(entry.Details))
		fmt.Fprintf(&builder, "<!-- %s: %s -->\n\n", entryMarker, base64Entry)
	}
	return builder.String()
}

func legacyLogDigest(source []byte) string {
	digest := sha256.Sum256(source)
	return "sha256:" + hex.EncodeToString(digest[:])
}

func legacyLogArtifactMatches(data []byte, digest string) bool {
	text := string(data)
	hasMarker := strings.Contains(text, legacyLogMarker) || strings.Contains(text, forgeLegacyLogMarker)
	return hasMarker && strings.Contains(text, "<!-- source: "+legacyLogFileName+" -->") && strings.Contains(text, "<!-- source-digest: "+digest+" -->")
}
