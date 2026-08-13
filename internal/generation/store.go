// Package generation owns Forge's durable generation runtime store.
//
// The store deliberately knows nothing about Serve or AgentHub. Callers give
// it a JSON payload and stable generation metadata, while this package owns
// resource addressing, migration, atomic file replacement, and the current vs
// retired state transition.
package generation

import (
	"bytes"
	"crypto/sha256"
	"encoding/base64"
	"encoding/hex"
	"encoding/json"
	"errors"
	"fmt"
	"os"
	"path/filepath"
	"sort"
	"strings"
	"sync"
	"time"
)

const (
	SchemaVersion = 2

	markerFileName   = "generation-store.json"
	resourcesDirName = "resources"
	currentFileName  = "current.json"
	retiredDirName   = "generations"
	legacyDirName    = "legacy"
	legacyIndexName  = "generations.json"
	stagingDirName   = ".generation-store-staging-v2"
)

var (
	ErrCurrentConflict = errors.New("generation store current record conflict")
	ErrImmutable       = errors.New("generation store retired manifest is immutable")

	workspaceMigrationLocks sync.Map
	resourceLocks           sync.Map
)

// Record is the storage-neutral representation of one Forge generation. The
// payload is the complete caller-owned projection (normally an agentRun). It
// is intentionally opaque here so the CLI/application package and Serve can
// share one persistence boundary without sharing their domain types.
type Record struct {
	WorkspaceInstanceID string
	ResourceID          string
	ID                  string
	Generation          int
	GenerationID        string
	CreatedAt           string
	UpdatedAt           string
	Payload             json.RawMessage
	Retired             bool
	Legacy              bool
	RetireReason        string
}

// Store is scoped to one Workspace. A single Store may read all resources for
// diagnostics, while writes are serialized only by the affected resource key.
type Store struct {
	workspaceRoot string
	instanceID    string
}

type marker struct {
	Version             int    `json:"version"`
	State               string `json:"state"`
	WorkspaceInstanceID string `json:"workspaceInstanceId"`
	StartedAt           string `json:"startedAt,omitempty"`
	CompletedAt         string `json:"completedAt,omitempty"`
}

type fileRecord struct {
	Version             int             `json:"version"`
	Kind                string          `json:"kind"`
	WorkspaceInstanceID string          `json:"workspaceInstanceId"`
	ResourceID          string          `json:"resourceId"`
	ID                  string          `json:"id,omitempty"`
	Generation          int             `json:"generation,omitempty"`
	GenerationID        string          `json:"generationId,omitempty"`
	CreatedAt           string          `json:"createdAt,omitempty"`
	UpdatedAt           string          `json:"updatedAt,omitempty"`
	RetiredAt           string          `json:"retiredAt,omitempty"`
	RetireReason        string          `json:"retireReason,omitempty"`
	Record              json.RawMessage `json:"record"`
}

type legacyRun struct {
	ID                        string            `json:"id"`
	ResourceID                string            `json:"resourceId"`
	Generation                int               `json:"generation"`
	GenerationID              string            `json:"generationId"`
	SourceInstanceID          string            `json:"sourceInstanceId"`
	Status                    string            `json:"status"`
	AgentHubSessionID         string            `json:"agentHubSessionId"`
	AgentHubStoppedObserved   bool              `json:"agentHubStoppedObserved"`
	CreatedAt                 string            `json:"createdAt"`
	UpdatedAt                 string            `json:"updatedAt"`
	ReplacementPending        bool              `json:"replacementPending"`
	IdleSleepStopRequested    bool              `json:"idleSleepStopRequested"`
	ArchivedTaskStopRequested bool              `json:"archivedTaskStopRequested"`
	PendingMessages           []json.RawMessage `json:"pendingMessages"`
}

type legacyIndex struct {
	Version     int               `json:"version"`
	Generations []json.RawMessage `json:"generations"`
}

// Open creates a Workspace-scoped store. If instanceID is empty, a stable
// path-derived fallback is used only for uninitialised test/legacy directories;
// an initialized Workspace always supplies its persisted instance id.
func Open(workspaceRoot, instanceID string) (*Store, error) {
	workspaceRoot = strings.TrimSpace(workspaceRoot)
	if workspaceRoot == "" {
		return nil, errors.New("generation store Workspace root is required")
	}
	root, err := filepath.Abs(workspaceRoot)
	if err != nil {
		return nil, err
	}
	instanceID = strings.TrimSpace(instanceID)
	if instanceID == "" {
		instanceID = fallbackInstanceID(root)
	}
	return &Store{workspaceRoot: filepath.Clean(root), instanceID: instanceID}, nil
}

// ResourceKey returns the unambiguous, path-safe key for a Workspace instance
// and resource. Each component is encoded separately so an embedded delimiter
// in either identifier cannot create a collision.
func ResourceKey(instanceID, resourceID string) (string, error) {
	instanceID = strings.TrimSpace(instanceID)
	if instanceID == "" {
		return "", errors.New("Workspace instance id is required")
	}
	resourceID = NormalizeResourceID(resourceID)
	return base64.RawURLEncoding.EncodeToString([]byte(instanceID)) + "." +
		base64.RawURLEncoding.EncodeToString([]byte(resourceID)), nil
}

// NormalizeResourceID makes the empty resource address the Workspace root.
func NormalizeResourceID(resourceID string) string {
	resourceID = strings.TrimSpace(resourceID)
	if resourceID == "" {
		return "workspace"
	}
	return resourceID
}

// EnsureReady completes the versioned migration if it has not completed. It
// is safe to call from startup and from test-only direct store access. Once a
// ready marker exists, no legacy path is opened again.
func (s *Store) EnsureReady() error {
	if s == nil {
		return errors.New("generation store is nil")
	}
	key := s.workspaceRoot
	lock := workspaceMigrationLock(key)
	lock.Lock()
	defer lock.Unlock()

	current, err := readMarker(s.workspaceRoot)
	if err != nil {
		return err
	}
	if current != nil && current.State == "ready" {
		if value := strings.TrimSpace(current.WorkspaceInstanceID); value != "" {
			s.instanceID = value
		}
		_ = os.RemoveAll(filepath.Join(s.runtimeRoot(), stagingDirName))
		return nil
	}
	return s.migrateLocked(current)
}

// List returns current, retired, and explicitly isolated legacy records. It
// is intended for history and diagnostics; runtime reconciliation should use
// ListCurrent so cold manifests are never mutated accidentally.
func (s *Store) List() ([]Record, error) {
	if err := s.EnsureReady(); err != nil {
		return nil, err
	}
	return s.list(false)
}

// ListCurrent returns only records still owned by a mutable current file.
func (s *Store) ListCurrent() ([]Record, error) {
	if err := s.EnsureReady(); err != nil {
		return nil, err
	}
	return s.list(true)
}

// Current returns the mutable current generation for one resource.
func (s *Store) Current(resourceID string) (Record, bool, error) {
	if err := s.EnsureReady(); err != nil {
		return Record{}, false, err
	}
	key, err := ResourceKey(s.instanceID, resourceID)
	if err != nil {
		return Record{}, false, err
	}
	return s.currentForKey(key, NormalizeResourceID(resourceID))
}

// NextGeneration returns the next monotonically increasing generation number
// for one resource. It only inspects that resource's current file and retired
// manifests; callers never need to load every resource in the Workspace.
func (s *Store) NextGeneration(resourceID string) (int, error) {
	if err := s.EnsureReady(); err != nil {
		return 0, err
	}
	resourceID = NormalizeResourceID(resourceID)
	key, err := ResourceKey(s.instanceID, resourceID)
	if err != nil {
		return 0, err
	}
	next := 1
	err = withResourceLock(s.workspaceRoot, key, func() error {
		if current, found, err := s.readCurrentForKey(key, resourceID); err != nil {
			return err
		} else if found && current.Generation >= next {
			next = current.Generation + 1
		}
		entries, err := os.ReadDir(filepath.Join(s.resourceDir(key), retiredDirName))
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
			record, found, err := readFileRecord(filepath.Join(s.resourceDir(key), retiredDirName, entry.Name()))
			if err != nil {
				return err
			}
			if found && record.Generation >= next {
				next = record.Generation + 1
			}
		}
		return nil
	})
	return next, err
}

// SaveCurrent atomically replaces one resource's current projection. It never
// touches another resource or any retired manifest.
func (s *Store) SaveCurrent(record Record) error {
	if err := s.EnsureReady(); err != nil {
		return err
	}
	record, err := s.normalizeRecord(record)
	if err != nil {
		return err
	}
	if record.Legacy || strings.TrimSpace(record.GenerationID) == "" {
		return s.saveLegacy(record)
	}
	key, err := ResourceKey(s.instanceID, record.ResourceID)
	if err != nil {
		return err
	}
	return withResourceLock(s.workspaceRoot, key, func() error {
		current, found, err := s.readCurrentForKey(key, record.ResourceID)
		if err != nil {
			return err
		}
		if found && !sameGenerationIdentity(current, record) {
			return fmt.Errorf("%w: resource %s already owns generation %s", ErrCurrentConflict, record.ResourceID, current.GenerationID)
		}
		if retired, found, err := s.readRetiredForKey(key, record.GenerationID); err != nil {
			return err
		} else if found {
			if sameGeneration(retired, record) {
				return fmt.Errorf("%w: generation %s is already retired", ErrImmutable, record.GenerationID)
			}
			return fmt.Errorf("%w: generation %s has a conflicting retired manifest", ErrImmutable, record.GenerationID)
		}
		return s.writeCurrentForKey(key, record)
	})
}

// SaveRetired writes an immutable cold manifest. Repeating the exact same
// write is idempotent; changing a retired generation is rejected.
func (s *Store) SaveRetired(record Record, reason string) error {
	if err := s.EnsureReady(); err != nil {
		return err
	}
	record, err := s.normalizeRecord(record)
	if err != nil {
		return err
	}
	if strings.TrimSpace(record.GenerationID) == "" {
		return s.saveLegacy(record)
	}
	key, err := ResourceKey(s.instanceID, record.ResourceID)
	if err != nil {
		return err
	}
	return withResourceLock(s.workspaceRoot, key, func() error {
		return s.writeRetiredForKey(key, record, reason)
	})
}

// RetireCurrent performs a crash-recoverable current -> immutable manifest
// transition. The manifest is durable before current.json is removed; if the
// process crashes between those operations, readers treat the matching
// manifest as authoritative and the next retry cleans up current.json.
func (s *Store) RetireCurrent(record Record, reason string) error {
	if err := s.EnsureReady(); err != nil {
		return err
	}
	record, err := s.normalizeRecord(record)
	if err != nil {
		return err
	}
	if strings.TrimSpace(record.GenerationID) == "" {
		return s.saveLegacy(record)
	}
	key, err := ResourceKey(s.instanceID, record.ResourceID)
	if err != nil {
		return err
	}
	return withResourceLock(s.workspaceRoot, key, func() error {
		current, found, err := s.readCurrentForKey(key, record.ResourceID)
		if err != nil {
			return err
		}
		manifest, manifestFound, manifestErr := s.readRetiredForKey(key, record.GenerationID)
		if manifestErr != nil {
			return manifestErr
		}
		if manifestFound {
			if !sameGeneration(manifest, record) {
				return fmt.Errorf("%w: generation %s", ErrImmutable, record.GenerationID)
			}
			if found {
				if !sameGeneration(current, record) {
					return fmt.Errorf("%w: current generation %s changed before retirement", ErrCurrentConflict, record.GenerationID)
				}
				return s.removeCurrentForKey(key)
			}
			return nil
		}
		if !found {
			return fmt.Errorf("current generation %s was not found", record.GenerationID)
		}
		if !sameGenerationIdentity(current, record) {
			return fmt.Errorf("%w: current generation %s changed before retirement", ErrCurrentConflict, record.GenerationID)
		}
		if err := s.writeRetiredForKey(key, current, reason); err != nil {
			return err
		}
		return s.removeCurrentForKey(key)
	})
}

func (s *Store) normalizeRecord(record Record) (Record, error) {
	record.ResourceID = NormalizeResourceID(record.ResourceID)
	record.WorkspaceInstanceID = s.instanceID
	record.ID = strings.TrimSpace(record.ID)
	record.GenerationID = strings.TrimSpace(record.GenerationID)
	if len(record.Payload) == 0 || !json.Valid(record.Payload) {
		return Record{}, errors.New("generation record payload must be valid JSON")
	}
	if record.ID == "" {
		record.ID = "record-" + shortHash(record.Payload)
	}
	return record, nil
}

func (s *Store) saveLegacy(record Record) error {
	key, err := ResourceKey(s.instanceID, record.ResourceID)
	if err != nil {
		return err
	}
	return withResourceLock(s.workspaceRoot, key, func() error {
		legacyDir := filepath.Join(s.resourceDir(key), legacyDirName)
		if err := os.MkdirAll(legacyDir, 0o700); err != nil {
			return err
		}
		name := base64.RawURLEncoding.EncodeToString([]byte(record.ID))
		if name == "" {
			name = shortHash(record.Payload)
		}
		path := filepath.Join(legacyDir, name+".json")
		return atomicWriteJSON(path, fileRecord{
			Version: SchemaVersion, Kind: "legacy", WorkspaceInstanceID: s.instanceID,
			ResourceID: record.ResourceID, ID: record.ID, Generation: record.Generation,
			GenerationID: record.GenerationID, CreatedAt: record.CreatedAt, UpdatedAt: record.UpdatedAt,
			Record: append(json.RawMessage(nil), record.Payload...),
		})
	})
}

func (s *Store) currentForKey(key, resourceID string) (Record, bool, error) {
	returnValue := Record{}
	err := withResourceLock(s.workspaceRoot, key, func() error {
		current, found, err := s.readCurrentForKey(key, resourceID)
		if err != nil {
			return err
		}
		if found {
			returnValue = current
		}
		return nil
	})
	return returnValue, returnValue.GenerationID != "" && err == nil, err
}

func (s *Store) list(currentOnly bool) ([]Record, error) {
	root := filepath.Join(s.runtimeRoot(), resourcesDirName)
	entries, err := os.ReadDir(root)
	if os.IsNotExist(err) {
		return []Record{}, nil
	}
	if err != nil {
		return nil, err
	}
	records := make(map[string]Record)
	for _, entry := range entries {
		if !entry.IsDir() {
			continue
		}
		key := entry.Name()
		readRecords, err := s.readResourceRecords(key, currentOnly)
		if err != nil {
			return nil, err
		}
		for _, record := range readRecords {
			identity := recordIdentity(record)
			if previous, ok := records[identity]; ok && previous.Retired && !record.Retired {
				continue
			}
			records[identity] = record
		}
	}
	result := make([]Record, 0, len(records))
	for _, record := range records {
		result = append(result, record)
	}
	sort.SliceStable(result, func(i, j int) bool {
		if result[i].ResourceID != result[j].ResourceID {
			return result[i].ResourceID < result[j].ResourceID
		}
		if result[i].Generation != result[j].Generation {
			return result[i].Generation > result[j].Generation
		}
		if result[i].UpdatedAt != result[j].UpdatedAt {
			return result[i].UpdatedAt > result[j].UpdatedAt
		}
		return result[i].ID < result[j].ID
	})
	return result, nil
}

func (s *Store) readResourceRecords(key string, currentOnly bool) ([]Record, error) {
	resourceDir := s.resourceDir(key)
	result := make([]Record, 0)
	currentPath := filepath.Join(resourceDir, currentFileName)
	if current, found, err := readFileRecord(currentPath); err != nil {
		return nil, err
	} else if found && !currentOnly {
		if _, retired, err := s.readRetiredForKey(key, current.GenerationID); err != nil {
			return nil, err
		} else if !retired {
			result = append(result, current)
		}
	} else if found && currentOnly {
		if _, retired, err := s.readRetiredForKey(key, current.GenerationID); err != nil {
			return nil, err
		} else if !retired {
			result = append(result, current)
		}
	}
	retiredDir := filepath.Join(resourceDir, retiredDirName)
	if entries, err := os.ReadDir(retiredDir); err == nil {
		for _, entry := range entries {
			if entry.IsDir() || !strings.HasSuffix(entry.Name(), ".json") {
				continue
			}
			record, found, readErr := readFileRecord(filepath.Join(retiredDir, entry.Name()))
			if readErr != nil {
				return nil, readErr
			}
			if found {
				record.Retired = true
				if !currentOnly {
					result = append(result, record)
				}
			}
		}
	} else if !os.IsNotExist(err) {
		return nil, err
	}
	if currentOnly {
		return result, nil
	}
	legacyDir := filepath.Join(resourceDir, legacyDirName)
	if entries, err := os.ReadDir(legacyDir); err == nil {
		for _, entry := range entries {
			if entry.IsDir() || !strings.HasSuffix(entry.Name(), ".json") {
				continue
			}
			record, found, readErr := readFileRecord(filepath.Join(legacyDir, entry.Name()))
			if readErr != nil {
				return nil, readErr
			}
			if found {
				record.Legacy = true
				result = append(result, record)
			}
		}
	} else if !os.IsNotExist(err) {
		return nil, err
	}
	return result, nil
}

func (s *Store) readCurrentForKey(key, resourceID string) (Record, bool, error) {
	path := filepath.Join(s.resourceDir(key), currentFileName)
	current, found, err := readFileRecord(path)
	if err != nil || !found {
		return current, found, err
	}
	if current.ResourceID == "" {
		current.ResourceID = NormalizeResourceID(resourceID)
	}
	if strings.TrimSpace(current.GenerationID) != "" {
		if _, retired, err := s.readRetiredForKey(key, current.GenerationID); err != nil {
			return Record{}, false, err
		} else if retired {
			// A manifest written before a crash is the durable retirement edge.
			return Record{}, false, nil
		}
	}
	return current, true, nil
}

func (s *Store) readRetiredForKey(key, generationID string) (Record, bool, error) {
	generationID = strings.TrimSpace(generationID)
	if generationID == "" {
		return Record{}, false, nil
	}
	name := base64.RawURLEncoding.EncodeToString([]byte(generationID))
	path := filepath.Join(s.resourceDir(key), retiredDirName, name+".json")
	record, found, err := readFileRecord(path)
	if found {
		record.Retired = true
	}
	return record, found, err
}

func (s *Store) writeCurrentForKey(key string, record Record) error {
	return atomicWriteJSON(filepath.Join(s.resourceDir(key), currentFileName), fileRecord{
		Version: SchemaVersion, Kind: "current", WorkspaceInstanceID: s.instanceID,
		ResourceID: record.ResourceID, ID: record.ID, Generation: record.Generation,
		GenerationID: record.GenerationID, CreatedAt: record.CreatedAt, UpdatedAt: record.UpdatedAt,
		Record: append(json.RawMessage(nil), record.Payload...),
	})
}

func (s *Store) writeRetiredForKey(key string, record Record, reason string) error {
	path := filepath.Join(s.resourceDir(key), retiredDirName, base64.RawURLEncoding.EncodeToString([]byte(record.GenerationID))+".json")
	manifest := fileRecord{
		Version: SchemaVersion, Kind: "retired", WorkspaceInstanceID: s.instanceID,
		ResourceID: record.ResourceID, ID: record.ID, Generation: record.Generation,
		GenerationID: record.GenerationID, CreatedAt: record.CreatedAt, UpdatedAt: record.UpdatedAt,
		RetiredAt: time.Now().UTC().Format(time.RFC3339Nano), RetireReason: strings.TrimSpace(reason),
		Record: append(json.RawMessage(nil), record.Payload...),
	}
	if existing, found, err := readFileRecord(path); err != nil {
		return err
	} else if found {
		if sameGeneration(existing, record) {
			return nil
		}
		return fmt.Errorf("%w: generation %s", ErrImmutable, record.GenerationID)
	}
	return atomicWriteJSON(path, manifest)
}

func (s *Store) removeCurrentForKey(key string) error {
	path := filepath.Join(s.resourceDir(key), currentFileName)
	if err := os.Remove(path); err != nil && !os.IsNotExist(err) {
		return err
	}
	return syncDir(s.resourceDir(key))
}

func (s *Store) resourceDir(key string) string {
	return resourceDirAt(s.runtimeRoot(), key)
}

func resourceDirAt(root, key string) string {
	return filepath.Join(root, resourcesDirName, key)
}

func (s *Store) runtimeRoot() string {
	return filepath.Join(s.workspaceRoot, ".forge", "runtime")
}

func (s *Store) migrateLocked(existing *marker) error {
	if existing != nil && existing.Version != 0 && existing.Version != SchemaVersion {
		return fmt.Errorf("unsupported generation store marker version %d; expected %d", existing.Version, SchemaVersion)
	}
	if err := os.MkdirAll(s.runtimeRoot(), 0o700); err != nil {
		return err
	}
	if existing == nil || existing.State != "migrating" {
		if err := atomicWriteJSON(filepath.Join(s.runtimeRoot(), markerFileName), marker{
			Version: SchemaVersion, State: "migrating", WorkspaceInstanceID: s.instanceID,
			StartedAt: time.Now().UTC().Format(time.RFC3339Nano),
		}); err != nil {
			return err
		}
	}
	legacyRecords, err := readLegacyRecords(s.workspaceRoot)
	if err != nil {
		return err
	}
	stagingRoot := filepath.Join(s.runtimeRoot(), stagingDirName)
	if err := os.RemoveAll(stagingRoot); err != nil {
		return err
	}
	if err := os.MkdirAll(filepath.Join(stagingRoot, resourcesDirName), 0o700); err != nil {
		return err
	}
	if err := s.migrateRecordsLocked(legacyRecords, stagingRoot); err != nil {
		return err
	}
	if err := s.promoteStaging(stagingRoot); err != nil {
		return err
	}
	if err := atomicWriteJSON(filepath.Join(s.runtimeRoot(), markerFileName), marker{
		Version: SchemaVersion, State: "ready", WorkspaceInstanceID: s.instanceID,
		CompletedAt: time.Now().UTC().Format(time.RFC3339Nano),
	}); err != nil {
		return err
	}
	if err := os.RemoveAll(stagingRoot); err != nil {
		return err
	}
	return syncDir(s.runtimeRoot())
}

func (s *Store) migrateRecordsLocked(records []json.RawMessage, stagingRoot string) error {
	type candidate struct {
		raw  json.RawMessage
		meta legacyRun
	}
	byResource := make(map[string][]candidate)
	seen := make(map[string]bool)
	for _, raw := range records {
		meta, err := decodeLegacyRun(raw)
		if err != nil {
			return err
		}
		resourceID := NormalizeResourceID(meta.ResourceID)
		identity := resourceID + "\x00" + meta.GenerationID
		if strings.TrimSpace(meta.GenerationID) == "" {
			identity = resourceID + "\x00id:" + meta.ID
		}
		if strings.TrimSpace(meta.ID) == "" {
			identity = resourceID + "\x00raw:" + shortHash(raw)
		}
		if seen[identity] {
			continue
		}
		seen[identity] = true
		byResource[resourceID] = append(byResource[resourceID], candidate{raw: append(json.RawMessage(nil), raw...), meta: meta})
	}
	for resourceID, candidates := range byResource {
		currentIndex := -1
		for index, item := range candidates {
			if strings.TrimSpace(item.meta.GenerationID) == "" || !legacyCurrentCandidate(item.meta) {
				continue
			}
			if currentIndex < 0 || legacyRunNewer(item.meta, candidates[currentIndex].meta) {
				currentIndex = index
			}
		}
		for index, item := range candidates {
			record := s.recordFromLegacy(resourceID, item.meta, item.raw)
			if strings.TrimSpace(item.meta.GenerationID) == "" {
				record.Legacy = true
				if err := s.writeLegacyMigrated(stagingRoot, record); err != nil {
					return err
				}
				continue
			}
			if index == currentIndex {
				if err := s.writeMigratedCurrent(stagingRoot, record); err != nil {
					return err
				}
				continue
			}
			reason := "migrated_retired_generation"
			if legacyCurrentCandidate(item.meta) {
				reason = "migrated_duplicate_current"
			}
			if err := s.writeMigratedRetired(stagingRoot, record, reason); err != nil {
				return err
			}
		}
	}
	return nil
}

func (s *Store) recordFromLegacy(resourceID string, meta legacyRun, raw json.RawMessage) Record {
	id := strings.TrimSpace(meta.ID)
	if id == "" {
		id = "legacy-" + shortHash(raw)
	}
	return Record{
		WorkspaceInstanceID: s.instanceID, ResourceID: resourceID, ID: id,
		Generation: meta.Generation, GenerationID: strings.TrimSpace(meta.GenerationID),
		CreatedAt: meta.CreatedAt, UpdatedAt: meta.UpdatedAt,
		Payload: append(json.RawMessage(nil), raw...),
	}
}

func (s *Store) writeMigratedCurrent(stagingRoot string, record Record) error {
	key, err := ResourceKey(s.instanceID, record.ResourceID)
	if err != nil {
		return err
	}
	return atomicWriteJSON(filepath.Join(resourceDirAt(stagingRoot, key), currentFileName), fileRecord{
		Version: SchemaVersion, Kind: "current", WorkspaceInstanceID: s.instanceID,
		ResourceID: record.ResourceID, ID: record.ID, Generation: record.Generation,
		GenerationID: record.GenerationID, CreatedAt: record.CreatedAt, UpdatedAt: record.UpdatedAt,
		Record: append(json.RawMessage(nil), record.Payload...),
	})
}

func (s *Store) writeMigratedRetired(stagingRoot string, record Record, reason string) error {
	key, err := ResourceKey(s.instanceID, record.ResourceID)
	if err != nil {
		return err
	}
	return atomicWriteJSON(filepath.Join(resourceDirAt(stagingRoot, key), retiredDirName, base64.RawURLEncoding.EncodeToString([]byte(record.GenerationID))+".json"), fileRecord{
		Version: SchemaVersion, Kind: "retired", WorkspaceInstanceID: s.instanceID,
		ResourceID: record.ResourceID, ID: record.ID, Generation: record.Generation,
		GenerationID: record.GenerationID, CreatedAt: record.CreatedAt, UpdatedAt: record.UpdatedAt,
		// Migration output must be deterministic so a retry after a partial
		// promotion can compare the same immutable manifest byte-for-byte.
		RetiredAt: record.UpdatedAt, RetireReason: strings.TrimSpace(reason),
		Record: append(json.RawMessage(nil), record.Payload...),
	})
}

func (s *Store) writeLegacyMigrated(stagingRoot string, record Record) error {
	key, err := ResourceKey(s.instanceID, record.ResourceID)
	if err != nil {
		return err
	}
	name := base64.RawURLEncoding.EncodeToString([]byte(record.ID))
	return atomicWriteJSON(filepath.Join(resourceDirAt(stagingRoot, key), legacyDirName, name+".json"), fileRecord{
		Version: SchemaVersion, Kind: "legacy", WorkspaceInstanceID: s.instanceID,
		ResourceID: record.ResourceID, ID: record.ID, Generation: record.Generation,
		GenerationID: record.GenerationID, CreatedAt: record.CreatedAt, UpdatedAt: record.UpdatedAt,
		Record: append(json.RawMessage(nil), record.Payload...),
	})
}

func (s *Store) promoteStaging(stagingRoot string) error {
	stagingResources := filepath.Join(stagingRoot, resourcesDirName)
	entries, err := os.ReadDir(stagingResources)
	if os.IsNotExist(err) {
		return nil
	}
	if err != nil {
		return err
	}
	finalResources := filepath.Join(s.runtimeRoot(), resourcesDirName)
	if err := os.MkdirAll(finalResources, 0o700); err != nil {
		return err
	}
	for _, entry := range entries {
		if !entry.IsDir() {
			continue
		}
		stagedDir := filepath.Join(stagingResources, entry.Name())
		finalDir := filepath.Join(finalResources, entry.Name())
		if err := promoteStagedResource(stagedDir, finalDir); err != nil {
			return err
		}
	}
	return syncDir(finalResources)
}

func promoteStagedResource(stagedDir, finalDir string) error {
	if err := os.MkdirAll(finalDir, 0o700); err != nil {
		return err
	}
	return filepath.WalkDir(stagedDir, func(path string, entry os.DirEntry, err error) error {
		if err != nil {
			return err
		}
		if path == stagedDir {
			return nil
		}
		relative, err := filepath.Rel(stagedDir, path)
		if err != nil {
			return err
		}
		destination := filepath.Join(finalDir, relative)
		if entry.IsDir() {
			return os.MkdirAll(destination, 0o700)
		}
		if !entry.Type().IsRegular() {
			return fmt.Errorf("unsupported staged generation entry %s", path)
		}
		if existing, readErr := os.ReadFile(destination); readErr == nil {
			incoming, incomingErr := os.ReadFile(path)
			if incomingErr != nil {
				return incomingErr
			}
			if filepath.Base(destination) != currentFileName && string(existing) != string(incoming) {
				return fmt.Errorf("%w: staged manifest conflicts with %s", ErrImmutable, destination)
			}
			if filepath.Base(destination) != currentFileName {
				return nil
			}
		} else if !os.IsNotExist(readErr) {
			return readErr
		}
		if err := os.MkdirAll(filepath.Dir(destination), 0o700); err != nil {
			return err
		}
		if err := os.Rename(path, destination); err != nil {
			return err
		}
		return syncDir(filepath.Dir(destination))
	})
}

func readLegacyRecords(workspaceRoot string) ([]json.RawMessage, error) {
	paths := []string{
		filepath.Join(workspaceRoot, ".forge", "runtime", legacyIndexName),
		filepath.Join(workspaceRoot, ".forge", "gui-agent", "runs.json"),
	}
	result := make([]json.RawMessage, 0)
	seenPath := false
	for _, path := range paths {
		data, err := os.ReadFile(path)
		if os.IsNotExist(err) {
			continue
		}
		if err != nil {
			return nil, err
		}
		seenPath = true
		items, err := decodeLegacyIndex(data)
		if err != nil {
			return nil, fmt.Errorf("read legacy generation index %s: %w", path, err)
		}
		result = append(result, items...)
	}
	if !seenPath {
		return []json.RawMessage{}, nil
	}
	return result, nil
}

func decodeLegacyIndex(data []byte) ([]json.RawMessage, error) {
	var array []json.RawMessage
	if err := json.Unmarshal(data, &array); err == nil {
		if array == nil {
			array = []json.RawMessage{}
		}
		return array, nil
	}
	var index legacyIndex
	if err := json.Unmarshal(data, &index); err != nil {
		return nil, err
	}
	if index.Version != 1 {
		return nil, fmt.Errorf("unsupported legacy generation index version %d; expected 1", index.Version)
	}
	if index.Generations == nil {
		index.Generations = []json.RawMessage{}
	}
	return index.Generations, nil
}

func decodeLegacyRun(raw json.RawMessage) (legacyRun, error) {
	var run legacyRun
	if err := json.Unmarshal(raw, &run); err != nil {
		return legacyRun{}, err
	}
	return run, nil
}

func legacyCurrentCandidate(run legacyRun) bool {
	if strings.TrimSpace(run.Status) == "archived" {
		return false
	}
	if len(run.PendingMessages) > 0 || run.ReplacementPending || run.IdleSleepStopRequested || run.ArchivedTaskStopRequested {
		return true
	}
	switch strings.TrimSpace(run.Status) {
	case "starting", "running", "waiting_approval", "idle", "stopping", "recovering":
		return true
	case "stopped":
		return !run.AgentHubStoppedObserved || strings.TrimSpace(run.AgentHubSessionID) != ""
	default:
		return strings.TrimSpace(run.AgentHubSessionID) != ""
	}
}

func legacyRunNewer(left, right legacyRun) bool {
	if left.Generation != right.Generation {
		return left.Generation > right.Generation
	}
	leftTime := parseTime(left.UpdatedAt)
	rightTime := parseTime(right.UpdatedAt)
	if !leftTime.Equal(rightTime) {
		return leftTime.After(rightTime)
	}
	return left.ID > right.ID
}

func readFileRecord(path string) (Record, bool, error) {
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
	if file.Kind != "current" && file.Kind != "retired" && file.Kind != "legacy" {
		return Record{}, false, fmt.Errorf("unsupported generation record kind %q", file.Kind)
	}
	if len(file.Record) == 0 || !json.Valid(file.Record) {
		return Record{}, false, errors.New("generation record payload is invalid")
	}
	return Record{
		WorkspaceInstanceID: file.WorkspaceInstanceID, ResourceID: NormalizeResourceID(file.ResourceID),
		ID: file.ID, Generation: file.Generation, GenerationID: file.GenerationID,
		CreatedAt: file.CreatedAt, UpdatedAt: file.UpdatedAt,
		Payload: append(json.RawMessage(nil), file.Record...), Retired: file.Kind == "retired", Legacy: file.Kind == "legacy",
		RetireReason: file.RetireReason,
	}, true, nil
}

func (s *Store) markerPath() string {
	return filepath.Join(s.runtimeRoot(), markerFileName)
}

func readMarker(root string) (*marker, error) {
	data, err := os.ReadFile(filepath.Join(root, ".forge", "runtime", markerFileName))
	if os.IsNotExist(err) {
		return nil, nil
	}
	if err != nil {
		return nil, err
	}
	var value marker
	if err := json.Unmarshal(data, &value); err != nil {
		return nil, fmt.Errorf("read generation store marker: %w", err)
	}
	if value.Version != SchemaVersion {
		return nil, fmt.Errorf("unsupported generation store marker version %d; expected %d", value.Version, SchemaVersion)
	}
	if value.State != "ready" && value.State != "migrating" {
		return nil, fmt.Errorf("unsupported generation store marker state %q", value.State)
	}
	return &value, nil
}

func sameGeneration(left, right Record) bool {
	return left.ID == right.ID && left.GenerationID == right.GenerationID &&
		left.Generation == right.Generation && sameJSON(left.Payload, right.Payload)
}

func sameJSON(left, right []byte) bool {
	var leftCompact, rightCompact bytes.Buffer
	if err := json.Compact(&leftCompact, left); err != nil {
		return bytes.Equal(left, right)
	}
	if err := json.Compact(&rightCompact, right); err != nil {
		return bytes.Equal(left, right)
	}
	return bytes.Equal(leftCompact.Bytes(), rightCompact.Bytes())
}

func sameGenerationIdentity(left, right Record) bool {
	return left.ID == right.ID && left.GenerationID == right.GenerationID && left.Generation == right.Generation
}

func recordIdentity(record Record) string {
	if strings.TrimSpace(record.GenerationID) != "" {
		return record.ResourceID + "\x00generation:" + record.GenerationID
	}
	return record.ResourceID + "\x00legacy:" + record.ID
}

func atomicWriteJSON(path string, value any) error {
	data, err := json.MarshalIndent(value, "", "  ")
	if err != nil {
		return err
	}
	data = append(data, '\n')
	if err := os.MkdirAll(filepath.Dir(path), 0o700); err != nil {
		return err
	}
	tmp := path + ".tmp-" + shortHash(append(data, byte(time.Now().UnixNano())))
	file, err := os.OpenFile(tmp, os.O_CREATE|os.O_EXCL|os.O_WRONLY, 0o600)
	if err != nil {
		return err
	}
	remove := true
	defer func() {
		if remove {
			_ = os.Remove(tmp)
		}
	}()
	if _, err := file.Write(data); err != nil {
		_ = file.Close()
		return err
	}
	if err := file.Sync(); err != nil {
		_ = file.Close()
		return err
	}
	if err := file.Close(); err != nil {
		return err
	}
	if err := os.Rename(tmp, path); err != nil {
		return err
	}
	remove = false
	return syncDir(filepath.Dir(path))
}

func syncDir(path string) error {
	directory, err := os.Open(path)
	if err != nil {
		return err
	}
	defer directory.Close()
	return directory.Sync()
}

func workspaceMigrationLock(key string) *sync.Mutex {
	value, _ := workspaceMigrationLocks.LoadOrStore(key, &sync.Mutex{})
	return value.(*sync.Mutex)
}

func withResourceLock(root, key string, fn func() error) error {
	lockKey := root + "\x00" + key
	value, _ := resourceLocks.LoadOrStore(lockKey, &sync.Mutex{})
	lock := value.(*sync.Mutex)
	lock.Lock()
	defer lock.Unlock()
	return fn()
}

func fallbackInstanceID(root string) string {
	digest := sha256.Sum256([]byte(filepath.Clean(root)))
	return "ws-path-" + hex.EncodeToString(digest[:8])
}

func shortHash(data []byte) string {
	digest := sha256.Sum256(data)
	return hex.EncodeToString(digest[:8])
}

func parseTime(value string) time.Time {
	parsed, _ := time.Parse(time.RFC3339Nano, strings.TrimSpace(value))
	return parsed
}
