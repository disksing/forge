package serve

import (
	"encoding/json"
	"fmt"
	"strings"

	"github.com/disksing/pua/internal/app"
	"github.com/disksing/pua/internal/generation"
)

func openGenerationStore(workspacePath, instanceHint string) (*generation.Store, error) {
	instanceID := strings.TrimSpace(instanceHint)
	if workspace, err := app.OpenWorkspace(workspacePath); err == nil {
		if runtime, runtimeErr := workspace.RuntimeConfig(); runtimeErr == nil {
			instanceID = runtime.InstanceID
		}
	}
	return generation.Open(workspacePath, instanceID)
}

func toStoreRecord(record generationRecord) (generation.Record, error) {
	payload, err := json.Marshal(record)
	if err != nil {
		return generation.Record{}, fmt.Errorf("encode generation %s: %w", record.GenerationID, err)
	}
	return generation.Record{
		WorkspaceInstanceID: strings.TrimSpace(record.SourceInstanceID),
		ResourceID:          generation.NormalizeResourceID(record.ResourceID),
		ID:                  record.ID,
		Generation:          record.Generation,
		GenerationID:        record.GenerationID,
		CreatedAt:           record.CreatedAt,
		UpdatedAt:           record.UpdatedAt,
		Payload:             payload,
		Retired:             record.Retired,
		RetireReason:        record.RetireReason,
	}, nil
}

func fromStoreRecord(storeRecord generation.Record) (generationRecord, error) {
	var record generationRecord
	if err := json.Unmarshal(storeRecord.Payload, &record); err != nil {
		return generationRecord{}, fmt.Errorf("decode generation %s: %w", storeRecord.GenerationID, err)
	}
	if strings.TrimSpace(record.ResourceID) == "" {
		record.ResourceID = storeRecord.ResourceID
	}
	if strings.TrimSpace(record.ID) == "" {
		record.ID = storeRecord.ID
	}
	if record.Generation == 0 {
		record.Generation = storeRecord.Generation
	}
	if strings.TrimSpace(record.GenerationID) == "" {
		record.GenerationID = storeRecord.GenerationID
	}
	if strings.TrimSpace(record.CreatedAt) == "" {
		record.CreatedAt = storeRecord.CreatedAt
	}
	if strings.TrimSpace(record.UpdatedAt) == "" {
		record.UpdatedAt = storeRecord.UpdatedAt
	}
	record.Retired = storeRecord.Retired
	if strings.TrimSpace(storeRecord.RetireReason) != "" {
		record.RetireReason = storeRecord.RetireReason
	}
	return record, nil
}

func fromStoreRecords(storeRecords []generation.Record) ([]generationRecord, error) {
	records := make([]generationRecord, 0, len(storeRecords))
	for _, storeRecord := range storeRecords {
		record, err := fromStoreRecord(storeRecord)
		if err != nil {
			return nil, err
		}
		records = append(records, record)
	}
	return records, nil
}

func retireStoredGeneration(rt *agentRuntime, record generationRecord, reason string) error {
	if rt == nil {
		return nil
	}
	rt.retirementMu.Lock()
	defer rt.retirementMu.Unlock()
	record = rt.snapshotGeneration()
	if strings.TrimSpace(record.GenerationID) == "" || record.Retired {
		return nil
	}
	reason = strings.TrimSpace(reason)
	if reason != "" {
		record.RetireReason = reason
	}
	// RetireCurrent writes the immutable manifest from the durable current
	// payload and stores the reason in the manifest envelope. Keep the
	// payload unchanged here so a retry after the manifest/current crash edge
	// compares the same generation bytes.
	storeRecord, err := toStoreRecord(record)
	if err != nil {
		return err
	}
	store, err := openGenerationStore(rt.workspace.Path, record.SourceInstanceID)
	if err != nil {
		return err
	}
	if err := store.RetireCurrent(storeRecord, record.RetireReason); err != nil {
		return err
	}
	rt.mu.Lock()
	if rt.record.GenerationID == record.GenerationID {
		rt.record.Retired = true
		rt.record.RetireReason = record.RetireReason
	}
	rt.mu.Unlock()
	return nil
}
