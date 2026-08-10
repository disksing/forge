import { beforeEach, describe, expect, it, vi } from "vitest";

import { createNotificationController, type NotificationControllerDependencies } from "../../src/controllers/notification-controller";
import { ResourceScope } from "../../src/runtime/resource-scope";
import { MemoryStorage } from "../fixtures/memory-storage";

class FakeBroadcastChannel {
	static channels = new Map<string, Set<FakeBroadcastChannel>>();
	onmessage: ((event: MessageEvent) => void) | null = null;

	constructor(readonly name: string) {
		const members = FakeBroadcastChannel.channels.get(name) || new Set();
		members.add(this);
		FakeBroadcastChannel.channels.set(name, members);
	}

	postMessage(data: unknown): void {
		for (const peer of FakeBroadcastChannel.channels.get(this.name) || []) {
			if (peer !== this) peer.onmessage?.(new MessageEvent("message", { data }));
		}
	}

	close(): void {
		FakeBroadcastChannel.channels.get(this.name)?.delete(this);
	}
}

function dependencies(scope: ResourceScope, storage: Storage): NotificationControllerDependencies {
	return {
		scope,
		storage,
		selectedResourceId: () => "other-task",
		treeSessions: () => [],
		agentRuns: () => [],
		hasTree: () => true,
		findResource: (id) => ({ id, title: "Task title", type: "task" }),
		sessionNavigationTarget: () => ({ primaryResourceId: "task1" }),
		selectResource: async () => undefined,
		activateRun: () => undefined,
		notificationsSettingsVisible: () => false,
		renderSettings: () => undefined,
		renderSessions: () => undefined,
		refreshIcons: () => undefined,
		flushDraft: () => undefined
	};
}

describe("NotificationController", () => {
	let storage: MemoryStorage;
	beforeEach(() => {
		storage = new MemoryStorage();
		FakeBroadcastChannel.channels.clear();
		vi.stubGlobal("BroadcastChannel", FakeBroadcastChannel as unknown as typeof BroadcastChannel);
	});

	it("deduplicates completion records across tabs and clears unread state everywhere", () => {
		const firstScope = new ResourceScope();
		const secondScope = new ResourceScope();
		const first = createNotificationController(dependencies(firstScope, storage));
		const second = createNotificationController(dependencies(secondScope, storage));
		first.initialize("workspace-a");
		second.initialize("workspace-a");
		first.establishBaseline();
		second.establishBaseline();

		const completion = {
			id: "run-1",
			resourceId: "task1",
			completionMarker: "session-1:42",
			forgeSessionId: "forge-session-1",
			completionState: "completed"
		};
		expect(first.observeProjections([completion])).toBeUndefined();
		first.observeProjections([completion]);

		expect(first.hasUnreadForSession("forge-session-1")).toBe(true);
		expect(second.hasUnreadForSession("forge-session-1")).toBe(true);
		expect(JSON.parse(storage.getItem("forge.gui.notifications.v1.state.workspace-a") || "{}").unread).toHaveLength(1);

		second.clearResource("task1");
		expect(first.hasUnreadForSession("forge-session-1")).toBe(false);
		expect(second.hasUnreadForSession("forge-session-1")).toBe(false);

		first.dispose();
		second.dispose();
		firstScope.dispose();
		secondScope.dispose();
	});
});
