package generation

import (
	"encoding/base64"
	"encoding/json"
	"errors"
	"os"
	"path/filepath"
	"testing"
)

// writeTestLegacyFile stores one production-shaped legacy record: no
// generation id, no generation number, kind "legacy".
func writeTestLegacyFile(t *testing.T, store *Store, resourceID, id, payload string) string {
	t.Helper()
	key, err := ResourceKey(store.instanceID, resourceID)
	if err != nil {
		t.Fatal(err)
	}
	name := base64.RawURLEncoding.EncodeToString([]byte(id))
	path := filepath.Join(store.resourceDir(key), legacyDirName, name+".json")
	file := fileRecord{
		Version: SchemaVersion, Kind: "legacy", WorkspaceInstanceID: store.instanceID,
		ResourceID: resourceID, ID: id,
		CreatedAt: "2026-08-10T15:00:36+08:00", UpdatedAt: "2026-08-11T00:48:28Z",
		Record: json.RawMessage(payload),
	}
	data, err := json.Marshal(file)
	if err != nil {
		t.Fatal(err)
	}
	writeTestFile(t, path, data)
	return path
}

func retiredManifestPath(t *testing.T, store *Store, resourceID, generationID string) string {
	t.Helper()
	key, err := ResourceKey(store.instanceID, resourceID)
	if err != nil {
		t.Fatal(err)
	}
	return filepath.Join(store.resourceDir(key), retiredDirName,
		base64.RawURLEncoding.EncodeToString([]byte(generationID))+".json")
}

func TestLegacyCleanupRewritesLegacyDirsAsRetiredManifests(t *testing.T) {
	root := t.TempDir()
	store, err := Open(root, "instance-cleanup")
	if err != nil {
		t.Fatal(err)
	}
	if err := store.EnsureReady(); err != nil {
		t.Fatal(err)
	}
	legacyPath := writeTestLegacyFile(t, store, "project1.task256", "run-4720bac3d0eff81e",
		`{"id":"run-4720bac3d0eff81e","resourceId":"project1.task256","status":"stopped"}`)
	writeTestLegacyFile(t, store, "project1.task256", "run-second",
		`{"id":"run-second","resourceId":"project1.task256","status":"stopped"}`)
	writeTestLegacyFile(t, store, "project2", "run-other",
		`{"id":"run-other","resourceId":"project2","status":"stopped"}`)
	// The ready marker predates the cleanup: clear the stamp to simulate an
	// existing production Workspace opened by this build for the first time.
	markerValue, err := readMarker(root)
	if err != nil || markerValue == nil {
		t.Fatalf("marker = %#v err=%v", markerValue, err)
	}
	markerValue.LegacyCleanupCompletedAt = ""
	writeTestFile(t, store.markerPath(), mustMarshalTestJSON(t, markerValue))

	records, err := store.List()
	if err != nil {
		t.Fatal(err)
	}
	if len(records) != 3 {
		t.Fatalf("cleaned records = %#v", records)
	}
	for _, record := range records {
		if !record.Retired {
			t.Fatalf("cleaned record is not retired: %#v", record)
		}
		if record.GenerationID != "gen-"+record.ID {
			t.Fatalf("cleaned record generation id = %q, want gen-%s", record.GenerationID, record.ID)
		}
		if record.RetireReason != legacyCleanupRetireReason {
			t.Fatalf("cleaned record retire reason = %q", record.RetireReason)
		}
	}
	if _, err := os.Stat(legacyPath); !os.IsNotExist(err) {
		t.Fatalf("legacy source file survived cleanup: %v", err)
	}
	key, err := ResourceKey(store.instanceID, "project1.task256")
	if err != nil {
		t.Fatal(err)
	}
	if entries, err := os.ReadDir(store.resourceDir(key)); err != nil || len(entries) != 1 || entries[0].Name() != retiredDirName {
		t.Fatalf("legacy directory was not removed: entries=%v err=%v", entries, err)
	}
	currentRecords, err := store.ListCurrent()
	if err != nil || len(currentRecords) != 0 {
		t.Fatalf("cleaned records must not be current: %#v err=%v", currentRecords, err)
	}
	markerValue, err = readMarker(root)
	if err != nil || markerValue == nil || markerValue.LegacyCleanupCompletedAt == "" {
		t.Fatalf("cleanup marker stamp = %#v err=%v", markerValue, err)
	}

	// A second open must skip the scan and keep the manifests byte-identical.
	manifestPath := retiredManifestPath(t, store, "project1.task256", "gen-run-4720bac3d0eff81e")
	before := mustReadTestFile(t, manifestPath)
	again, err := Open(root, "instance-cleanup")
	if err != nil {
		t.Fatal(err)
	}
	if _, err := again.List(); err != nil {
		t.Fatal(err)
	}
	if after := mustReadTestFile(t, manifestPath); string(before) != string(after) {
		t.Fatal("reopening rewrote a migrated retired manifest")
	}
}

func TestLegacyCleanupResumesAfterCrashBetweenManifestAndSourceRemoval(t *testing.T) {
	root := t.TempDir()
	store, err := Open(root, "instance-crash")
	if err != nil {
		t.Fatal(err)
	}
	if err := store.EnsureReady(); err != nil {
		t.Fatal(err)
	}
	record := testRecord("project1.task1", "run-crash", "gen-run-crash", 0, `{"status":"stopped"}`)
	key, err := ResourceKey(store.instanceID, record.ResourceID)
	if err != nil {
		t.Fatal(err)
	}
	// Simulate the crash edge: the manifest is durable but the legacy source
	// file was never removed and the marker was never stamped.
	if err := store.writeRetiredForKey(key, record, legacyCleanupRetireReason); err != nil {
		t.Fatal(err)
	}
	legacyPath := writeTestLegacyFile(t, store, "project1.task1", "run-crash", `{"status":"stopped"}`)
	markerValue, err := readMarker(root)
	if err != nil || markerValue == nil {
		t.Fatalf("marker = %#v err=%v", markerValue, err)
	}
	markerValue.LegacyCleanupCompletedAt = ""
	writeTestFile(t, store.markerPath(), mustMarshalTestJSON(t, markerValue))
	manifestPath := retiredManifestPath(t, store, record.ResourceID, record.GenerationID)
	before := mustReadTestFile(t, manifestPath)

	if _, err := store.List(); err != nil {
		t.Fatal(err)
	}
	if _, err := os.Stat(legacyPath); !os.IsNotExist(err) {
		t.Fatalf("legacy source file survived cleanup retry: %v", err)
	}
	if after := mustReadTestFile(t, manifestPath); string(before) != string(after) {
		t.Fatal("cleanup retry rewrote the durable manifest")
	}
}

func TestLegacyCleanupDropsDuplicateOfLiveCurrent(t *testing.T) {
	root := t.TempDir()
	store, err := Open(root, "instance-dup")
	if err != nil {
		t.Fatal(err)
	}
	live := testRecord("project1.task1", "run-live", "gen-run-live", 3, `{"status":"running"}`)
	if err := store.SaveCurrent(live); err != nil {
		t.Fatal(err)
	}
	legacyPath := writeTestLegacyFile(t, store, "project1.task1", "run-live", `{"status":"stopped"}`)
	markerValue, err := readMarker(root)
	if err != nil || markerValue == nil {
		t.Fatalf("marker = %#v err=%v", markerValue, err)
	}
	markerValue.LegacyCleanupCompletedAt = ""
	writeTestFile(t, store.markerPath(), mustMarshalTestJSON(t, markerValue))

	records, err := store.List()
	if err != nil {
		t.Fatal(err)
	}
	if len(records) != 1 || records[0].Retired || records[0].Generation != 3 {
		t.Fatalf("live current was disturbed by cleanup: %#v", records)
	}
	if _, err := os.Stat(legacyPath); !os.IsNotExist(err) {
		t.Fatalf("stale legacy duplicate survived cleanup: %v", err)
	}
	manifestPath := retiredManifestPath(t, store, "project1.task1", "gen-run-live")
	if _, err := os.Stat(manifestPath); !os.IsNotExist(err) {
		t.Fatalf("cleanup must not retire a live current generation: %v", err)
	}
	if current, found, err := store.Current("project1.task1"); err != nil || !found || current.GenerationID != "gen-run-live" {
		t.Fatalf("current after cleanup = %#v found=%v err=%v", current, found, err)
	}
}

func TestLegacyCleanupFallsBackOnConflictingManifest(t *testing.T) {
	root := t.TempDir()
	store, err := Open(root, "instance-conflict")
	if err != nil {
		t.Fatal(err)
	}
	conflicting := testRecord("project1.task1", "run-other", "gen-run-conflict", 1, `{"status":"archived"}`)
	if err := store.SaveRetired(conflicting, "replaced"); err != nil {
		t.Fatal(err)
	}
	writeTestLegacyFile(t, store, "project1.task1", "run-conflict", `{"status":"stopped"}`)
	markerValue, err := readMarker(root)
	if err != nil || markerValue == nil {
		t.Fatalf("marker = %#v err=%v", markerValue, err)
	}
	markerValue.LegacyCleanupCompletedAt = ""
	writeTestFile(t, store.markerPath(), mustMarshalTestJSON(t, markerValue))

	records, err := store.List()
	if err != nil {
		t.Fatal(err)
	}
	if len(records) != 2 {
		t.Fatalf("cleanup with conflict = %#v", records)
	}
	fallbackPath := retiredManifestPath(t, store, "project1.task1",
		"gen-legacy-run-conflict-"+shortHash([]byte(`{"status":"stopped"}`)))
	if _, err := os.Stat(fallbackPath); err != nil {
		t.Fatalf("fallback manifest was not written: %v", err)
	}
}

func TestLegacyCleanupPreservesExistingGenerationID(t *testing.T) {
	root := t.TempDir()
	store, err := Open(root, "instance-preserve")
	if err != nil {
		t.Fatal(err)
	}
	if err := store.EnsureReady(); err != nil {
		t.Fatal(err)
	}
	key, err := ResourceKey(store.instanceID, "project1")
	if err != nil {
		t.Fatal(err)
	}
	file := fileRecord{
		Version: SchemaVersion, Kind: "legacy", WorkspaceInstanceID: store.instanceID,
		ResourceID: "project1", ID: "run-kept", Generation: 2, GenerationID: "gen-run-kept",
		CreatedAt: "2026-08-10T15:00:36+08:00", UpdatedAt: "2026-08-11T00:48:28Z",
		Record: json.RawMessage(`{"status":"stopped"}`),
	}
	data, err := json.Marshal(file)
	if err != nil {
		t.Fatal(err)
	}
	writeTestFile(t, filepath.Join(store.resourceDir(key), legacyDirName, "run-kept.json"), data)
	markerValue, err := readMarker(root)
	if err != nil || markerValue == nil {
		t.Fatalf("marker = %#v err=%v", markerValue, err)
	}
	markerValue.LegacyCleanupCompletedAt = ""
	writeTestFile(t, store.markerPath(), mustMarshalTestJSON(t, markerValue))

	records, err := store.List()
	if err != nil {
		t.Fatal(err)
	}
	if len(records) != 1 || records[0].GenerationID != "gen-run-kept" || records[0].Generation != 2 || !records[0].Retired {
		t.Fatalf("cleanup did not preserve the recorded generation identity: %#v", records)
	}
}

func TestStoreRejectsRecordsWithoutGenerationID(t *testing.T) {
	store, err := Open(t.TempDir(), "instance-strict")
	if err != nil {
		t.Fatal(err)
	}
	record := testRecord("project1", "run-no-id", "", 0, `{"status":"running"}`)
	if err := store.SaveCurrent(record); !errors.Is(err, ErrGenerationIDRequired) {
		t.Fatalf("SaveCurrent without generation id = %v, want ErrGenerationIDRequired", err)
	}
	if err := store.SaveRetired(record, "cold"); !errors.Is(err, ErrGenerationIDRequired) {
		t.Fatalf("SaveRetired without generation id = %v, want ErrGenerationIDRequired", err)
	}
	if err := store.RetireCurrent(record, "replaced"); !errors.Is(err, ErrGenerationIDRequired) {
		t.Fatalf("RetireCurrent without generation id = %v, want ErrGenerationIDRequired", err)
	}
}

func mustMarshalTestJSON(t *testing.T, value any) []byte {
	t.Helper()
	data, err := json.Marshal(value)
	if err != nil {
		t.Fatal(err)
	}
	return data
}
