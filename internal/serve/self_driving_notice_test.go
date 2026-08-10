package serve

import "testing"

func TestBeginSchedulerTurnAssignsStableBoundaries(t *testing.T) {
	run := agentRun{ResourceID: "project1.task1", SelfDrivingRevision: 4}
	beginSchedulerTurn(&run)
	if !run.SchedulerTurn || run.SchedulerTurnSequence != 1 || run.SchedulerTurnID == "" {
		t.Fatalf("first SchedulerTurn boundary is incomplete: %+v", run)
	}
	firstID := run.SchedulerTurnID
	beginSchedulerTurn(&run)
	if run.SchedulerTurnSequence != 1 || run.SchedulerTurnID != firstID {
		t.Fatalf("repeated begin changed the active SchedulerTurn: %+v", run)
	}
	run.SchedulerTurn = false
	beginSchedulerTurn(&run)
	if run.SchedulerTurnSequence != 2 || run.SchedulerTurnID == firstID || run.SchedulerTurnID == "" {
		t.Fatalf("new SchedulerTurn boundary did not advance: %+v", run)
	}
}

func TestSelfDrivingFinishNoticeCarriesScopedLifecycle(t *testing.T) {
	runID := "run-notice"
	manager := &agentManager{subscribers: make(map[string]map[chan agentStreamMessage]bool)}
	channel := make(chan agentStreamMessage, 2)
	manager.subscribe(runID, channel)
	defer manager.unsubscribe(runID, channel)
	rt := &agentRuntime{run: agentRun{
		ID: runID, ResourceID: "project1.task1", SelfDrivingRevision: 7,
		SchedulerTurnID: "turn-2", SchedulerTurnSequence: 2,
	}}
	rt.addSelfDrivingFinishNotice(manager, "info", selfDrivingFinishNoticeWaitingLifecycle, "waiting")
	message := <-channel
	if message.Notice == nil {
		t.Fatal("finish notice was not published")
	}
	data := message.Notice.Data
	if data.Kind != selfDrivingFinishNoticeKind || data.Lifecycle != selfDrivingFinishNoticeWaitingLifecycle ||
		data.RunID != runID || data.ResourceID != "project1.task1" || data.SelfDrivingRevision != 7 ||
		data.SchedulerTurnID != "turn-2" || data.SchedulerTurnSequence != 2 {
		t.Fatalf("finish notice is missing lifecycle scope: %+v", data)
	}
}
