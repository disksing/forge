// Legacy directory cleanup is the one-shot, permanently retained migration
// that rewrites legacy/ record files into immutable retired manifests.
//
// Legacy files were produced by the retired v1->v2 index migration (and by
// the removed saveLegacy write path) for records that predate generation
// IDs. They are live history data in older Workspaces, so the read/write
// code could not be deleted before the data itself moved to the current
// format. The cleanup runs once per Workspace from EnsureReady, is
// idempotent, and is safe to interrupt: each manifest is durable before its
// legacy source file is removed, and the marker timestamp is written last.
package generation

import (
	"encoding/json"
	"errors"
	"fmt"
	"os"
	"path/filepath"
	"strings"
	"time"
)

// legacyCleanupRetireReason marks retired manifests produced by the legacy/
// directory cleanup so they stay distinguishable in history diagnostics.
const legacyCleanupRetireReason = "legacy_record_migration"

// cleanupLegacyDirsLocked rewrites every legacy/ record directory into the
// current store layout, then stamps the ready marker so later opens skip the
// scan entirely. The caller holds the Workspace migration lock.
func (s *Store) cleanupLegacyDirsLocked(current *marker) error {
	root := filepath.Join(s.runtimeRoot(), resourcesDirName)
	entries, err := os.ReadDir(root)
	if err != nil && !os.IsNotExist(err) {
		return err
	}
	if err == nil {
		for _, entry := range entries {
			if !entry.IsDir() {
				continue
			}
			if err := s.cleanupLegacyResourceLocked(entry.Name()); err != nil {
				return err
			}
		}
	}
	updated := *current
	updated.LegacyCleanupCompletedAt = time.Now().UTC().Format(time.RFC3339Nano)
	if err := atomicWriteJSON(s.markerPath(), updated); err != nil {
		return err
	}
	return syncDir(s.runtimeRoot())
}

func (s *Store) cleanupLegacyResourceLocked(key string) error {
	legacyDir := filepath.Join(s.resourceDir(key), legacyDirName)
	entries, err := os.ReadDir(legacyDir)
	if os.IsNotExist(err) {
		return nil
	}
	if err != nil {
		return err
	}
	for _, entry := range entries {
		if entry.IsDir() || !strings.HasSuffix(entry.Name(), ".json") {
			continue
		}
		if err := s.cleanupLegacyFileLocked(key, filepath.Join(legacyDir, entry.Name())); err != nil {
			return err
		}
	}
	remaining, err := os.ReadDir(legacyDir)
	if err != nil {
		return err
	}
	if len(remaining) > 0 {
		return fmt.Errorf("legacy generation directory %s still holds unmigrated entries", legacyDir)
	}
	if err := os.Remove(legacyDir); err != nil {
		return err
	}
	return syncDir(s.resourceDir(key))
}

func (s *Store) cleanupLegacyFileLocked(key, path string) error {
	record, found, err := readLegacyFileRecord(path)
	if err != nil || !found {
		return err
	}
	record.ID = strings.TrimSpace(record.ID)
	if record.ID == "" {
		record.ID = "legacy-" + shortHash(record.Payload)
	}
	record.GenerationID = strings.TrimSpace(record.GenerationID)
	if record.GenerationID == "" {
		record.GenerationID = "gen-" + record.ID
	}
	// A live current file owning the same generation makes the legacy copy a
	// stale duplicate. Dropping it (instead of writing a retired manifest)
	// keeps readCurrentForKey from hiding the mutable current record.
	current, found, err := s.readCurrentForKey(key, record.ResourceID)
	if err != nil {
		return err
	}
	if found && current.GenerationID == record.GenerationID {
		return removeLegacyFile(path)
	}
	if err := s.writeRetiredForKey(key, record, legacyCleanupRetireReason); err != nil {
		if !errors.Is(err, ErrImmutable) {
			return err
		}
		// A conflicting manifest already owns the derived generation id. Fall
		// back to a deterministic alternate id so one corrupt pre-existing
		// manifest can never block the whole Workspace from opening.
		record.GenerationID = "gen-legacy-" + record.ID + "-" + shortHash(record.Payload)
		if err := s.writeRetiredForKey(key, record, legacyCleanupRetireReason); err != nil {
			return err
		}
	}
	return removeLegacyFile(path)
}

func removeLegacyFile(path string) error {
	if err := os.Remove(path); err != nil {
		return err
	}
	return syncDir(filepath.Dir(path))
}

// readLegacyFileRecord parses one legacy/ record file. It intentionally stays
// private to the cleanup so the hot read path no longer accepts kind "legacy".
func readLegacyFileRecord(path string) (Record, bool, error) {
	data, err := os.ReadFile(path)
	if os.IsNotExist(err) {
		return Record{}, false, nil
	}
	if err != nil {
		return Record{}, false, err
	}
	var file fileRecord
	if err := json.Unmarshal(data, &file); err != nil {
		return Record{}, false, err
	}
	if file.Version != SchemaVersion {
		return Record{}, false, fmt.Errorf("unsupported generation record version %d; expected %d", file.Version, SchemaVersion)
	}
	if file.Kind != "legacy" {
		return Record{}, false, fmt.Errorf("unexpected generation record kind %q in legacy directory", file.Kind)
	}
	if len(file.Record) == 0 || !json.Valid(file.Record) {
		return Record{}, false, errors.New("generation record payload is invalid")
	}
	return Record{
		WorkspaceInstanceID: file.WorkspaceInstanceID, ResourceID: NormalizeResourceID(file.ResourceID),
		ID: file.ID, Generation: file.Generation, GenerationID: file.GenerationID,
		CreatedAt: file.CreatedAt, UpdatedAt: file.UpdatedAt,
		Payload: append(json.RawMessage(nil), file.Record...),
		RetireReason: file.RetireReason,
	}, true, nil
}
