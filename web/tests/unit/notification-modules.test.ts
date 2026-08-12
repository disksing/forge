import { describe, expect, it } from "vitest";

import { notificationDisplayBody, notificationDisplayTitle } from "../../src/controllers/notification-delivery";
import { createNotificationRecord, notificationEventState, notificationMarkerFor } from "../../src/controllers/notification-projection";
import { normalizeNotificationStore } from "../../src/controllers/notification-store";

describe("notification modules", () => {
  it("normalizes persisted records and rejects malformed entries", () => {
    const store = normalizeNotificationStore({ version: 1, seen: [{ marker: " done ", at: 5 }, {}], pending: [{ marker: "m1", sessionId: "s1", at: 10 }, { marker: "missing-session" }], unread: "bad", effects: [{ key: "sound:m1", at: 11 }] });
    expect(store.seen).toEqual([{ marker: "done", at: 5 }]);
    expect(store.pending).toHaveLength(1);
    expect(store.pending[0]).toMatchObject({ marker: "m1", sessionId: "s1", completionState: "completed" });
    expect(store.unread).toEqual([]);
    expect(store.effects).toEqual([{ key: "sound:m1", at: 11 }]);
  });

  it("projects completion identity and display content", () => {
    const source = { id: "run-1", resourceId: "task1", forgeSessionId: "forge-1", agentHubSessionId: "hub-1", completionEventId: 42 };
    expect(notificationMarkerFor(source)).toBe("hub-1:42");
    expect(notificationEventState({ id: 42, type: "turn.failed" })).toBe("failed");
    const record = createNotificationRecord(source, {
      workspaceId: "workspace-a", marker: "hub-1:42", completionState: "failed",
      navigationTarget: () => ({ resourceId: "task1" }),
      findResource: () => ({ id: "task1", type: "task", title: "Build release" }),
      now: () => 100,
    });
    expect(record).toMatchObject({ workspaceId: "workspace-a", sessionId: "forge-1", resourceId: "task1", at: 100 });
    expect(notificationDisplayTitle(record!)).toBe("Task: Build release");
    expect(notificationDisplayBody(record!)).toBe("Turn failed.");
  });
});
