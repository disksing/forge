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

func agentRunToGenerationRecord(run agentRun) (generation.Record, error) {
	payload, err := json.Marshal(run)
	if err != nil {
		return generation.Record{}, fmt.Errorf("encode generation %s: %w", run.GenerationID, err)
	}
	return generation.Record{
		WorkspaceInstanceID: strings.TrimSpace(run.SourceInstanceID),
		ResourceID:          generation.NormalizeResourceID(run.ResourceID),
		ID:                  run.ID,
		Generation:          run.Generation,
		GenerationID:        run.GenerationID,
		CreatedAt:           run.CreatedAt,
		UpdatedAt:           run.UpdatedAt,
		Payload:             payload,
		Retired:             run.Retired,
		Legacy:              run.Legacy,
		RetireReason:        run.RetireReason,
	}, nil
}

func generationRecordToAgentRun(record generation.Record) (agentRun, error) {
	var run agentRun
	if err := json.Unmarshal(record.Payload, &run); err != nil {
		return agentRun{}, fmt.Errorf("decode generation %s: %w", record.GenerationID, err)
	}
	if strings.TrimSpace(run.ResourceID) == "" {
		run.ResourceID = record.ResourceID
	}
	if strings.TrimSpace(run.ID) == "" {
		run.ID = record.ID
	}
	if run.Generation == 0 {
		run.Generation = record.Generation
	}
	if strings.TrimSpace(run.GenerationID) == "" {
		run.GenerationID = record.GenerationID
	}
	if strings.TrimSpace(run.CreatedAt) == "" {
		run.CreatedAt = record.CreatedAt
	}
	if strings.TrimSpace(run.UpdatedAt) == "" {
		run.UpdatedAt = record.UpdatedAt
	}
	run.Retired = record.Retired
	run.Legacy = record.Legacy
	if strings.TrimSpace(record.RetireReason) != "" {
		run.RetireReason = record.RetireReason
	}
	return run, nil
}

func generationRecordsToAgentRuns(records []generation.Record) ([]agentRun, error) {
	runs := make([]agentRun, 0, len(records))
	for _, record := range records {
		run, err := generationRecordToAgentRun(record)
		if err != nil {
			return nil, err
		}
		runs = append(runs, run)
	}
	return runs, nil
}

// loadAgentRunsLocked remains source-compatible with the mailbox migration
// helper while the old process-wide mutex is retired from generation writes.
// The caller may hold agentIndexMu for mailbox and generation compatibility
// work; this function itself deliberately does not acquire it.
func loadAgentRunsLocked(workspacePath string) ([]agentRun, error) {
	return loadAgentRuns(workspacePath)
}

func retireStoredAgentRun(rt *agentRuntime, run agentRun, reason string) error {
	if rt == nil {
		return nil
	}
	rt.retirementMu.Lock()
	defer rt.retirementMu.Unlock()
	run = rt.snapshotRun()
	if strings.TrimSpace(run.GenerationID) == "" || run.Retired {
		return nil
	}
	reason = strings.TrimSpace(reason)
	if reason != "" {
		run.RetireReason = reason
	}
	// RetireCurrent writes the immutable manifest from the durable current
	// payload and stores the reason in the manifest envelope. Keep the
	// payload unchanged here so a retry after the manifest/current crash edge
	// compares the same generation bytes.
	record, err := agentRunToGenerationRecord(run)
	if err != nil {
		return err
	}
	store, err := openGenerationStore(rt.workspace.Path, run.SourceInstanceID)
	if err != nil {
		return err
	}
	if err := store.RetireCurrent(record, run.RetireReason); err != nil {
		return err
	}
	rt.mu.Lock()
	if rt.run.GenerationID == run.GenerationID {
		rt.run.Retired = true
		rt.run.RetireReason = run.RetireReason
	}
	rt.mu.Unlock()
	return nil
}
