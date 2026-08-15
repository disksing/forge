package app

import (
	"encoding/json"
	"os"
	"path/filepath"
	"strings"
	"time"
)

// legacyMetadataMigrationMarker is intentionally isolated from the normal
// resource schema. The one-time migration removes the retired resource
// creation metadata without making any hot read path depend on it.
type legacyMetadataMigrationMarker struct {
	Version     int    `json:"version"`
	Status      string `json:"status"`
	CommittedAt string `json:"committedAt"`
}

const legacyMetadataMigrationVersion = 1

func legacyMetadataMigrationPath(root string) string {
	return filepath.Join(root, ".forge", "runtime", "legacy-metadata-migration.json")
}

func migrateLegacyMetadata(root string) error {
	var marker legacyMetadataMigrationMarker
	if found, err := readResourceMailboxJSONCompat(legacyMetadataMigrationPath(root), &marker); err != nil {
		return err
	} else if found {
		if marker.Version != legacyMetadataMigrationVersion || marker.Status != "committed" {
			return os.ErrInvalid
		}
		return nil
	}

	files := make([]string, 0)
	err := filepath.WalkDir(root, func(path string, entry os.DirEntry, walkErr error) error {
		if walkErr != nil {
			return walkErr
		}
		if entry.IsDir() {
			if path != root && (entry.Name() == ".forge" || entry.Name() == "repos") {
				return filepath.SkipDir
			}
			return nil
		}
		name := entry.Name()
		if name == workspaceConfigFile || name == legacyWorkspaceConfigFile || name == "project.json" || name == "task.json" || name == "scheduler.json" {
			files = append(files, path)
		}
		return nil
	})
	if err != nil {
		return err
	}
	for _, path := range files {
		data, err := os.ReadFile(path)
		if err != nil {
			return err
		}
		var document map[string]json.RawMessage
		if err := json.Unmarshal(data, &document); err != nil {
			return err
		}
		changed := deleteLegacyMetadata(document)
		if filepath.Base(path) == "scheduler.json" {
			var schedules []map[string]json.RawMessage
			if raw := document["schedules"]; len(raw) > 0 {
				if err := json.Unmarshal(raw, &schedules); err != nil {
					return err
				}
				for _, schedule := range schedules {
					if deleteLegacyMetadata(schedule) {
						changed = true
					}
				}
				updated, err := json.Marshal(schedules)
				if err != nil {
					return err
				}
				document["schedules"] = updated
			}
		}
		if changed {
			if err := writeJSON(path, document); err != nil {
				return err
			}
		}
	}
	marker = legacyMetadataMigrationMarker{
		Version: legacyMetadataMigrationVersion, Status: "committed",
		CommittedAt: time.Now().Format(time.RFC3339Nano),
	}
	return writeJSON(legacyMetadataMigrationPath(root), marker)
}

func deleteLegacyMetadata(document map[string]json.RawMessage) bool {
	changed := false
	for _, key := range []string{"creator", "createdBy"} {
		if _, ok := document[key]; ok {
			delete(document, key)
			changed = true
		}
	}
	return changed
}

// readResourceMailboxJSONCompat keeps this migration independent from the
// serve package while retaining the same missing-file convention.
func readResourceMailboxJSONCompat(path string, target any) (bool, error) {
	data, err := os.ReadFile(path)
	if os.IsNotExist(err) {
		return false, nil
	}
	if err != nil {
		return false, err
	}
	if err := json.Unmarshal(data, target); err != nil {
		return false, err
	}
	return true, nil
}

func legacyMetadataMigrationNeedsRun(root string) bool {
	var marker legacyMetadataMigrationMarker
	found, err := readResourceMailboxJSONCompat(legacyMetadataMigrationPath(root), &marker)
	return err != nil || !found || marker.Version != legacyMetadataMigrationVersion ||
		marker.Status != "committed" || strings.TrimSpace(marker.CommittedAt) == ""
}
