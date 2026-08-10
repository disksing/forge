import { describe, expect, it, vi } from "vitest";

import { createResourceDetailController, mergeResourceLogs, type ResourceDetailContext, type ResourceDetailRecord, type ResourceLogPageState } from "../../src/controllers/resource-detail-controller";

describe("ResourceDetailController", () => {
	it("merges overlapping head and older log pages without duplicates", () => {
		const merged = mergeResourceLogs(
			[{ id: "2", time: "2026-01-02T00:00:00Z", value: "old" }, { id: "1", time: "2026-01-01T00:00:00Z" }],
			[{ id: "3", time: "2026-01-03T00:00:00Z" }, { id: "2", time: "2026-01-02T00:00:00Z", value: "fresh" }],
			true
		);
		expect(merged.map((entry) => entry.id)).toEqual(["3", "2", "1"]);
		expect(merged.find((entry) => entry.id === "2")?.value).toBe("fresh");
	});

	it("rejects a late Resource result after selection changes", async () => {
		const details: Record<string, ResourceDetailRecord> = {};
		const pages: Record<string, ResourceLogPageState> = {};
		let context: ResourceDetailContext = { workspaceId: "alpha", navigationVersion: 1, selectedId: "task1", detailRequestVersion: 0 };
		let resolve!: (detail: ResourceDetailRecord) => void;
		const request = vi.fn(() => new Promise<ResourceDetailRecord>((done) => { resolve = done; }));
		const controller = createResourceDetailController({
			details,
			pages,
			context: () => context,
			nextDetailRequestVersion: () => ++context.detailRequestVersion,
			isCurrentWorkspace: (workspaceId, navigationVersion) => workspaceId === context.workspaceId && navigationVersion === context.navigationVersion,
			request: async <T>() => await request() as T,
			render: () => undefined,
			refreshIcons: () => undefined
		});

		const pending = controller.load("task1");
		context = { ...context, selectedId: "task2", navigationVersion: 2 };
		resolve({ id: "task1", logs: [] });

		await expect(pending).resolves.toBeNull();
		expect(details).toEqual({});
	});
});
