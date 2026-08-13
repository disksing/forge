import { describe, expect, it, vi } from "vitest";

import { createAgentOperationController } from "../../src/controllers/agent-operation-controller";

describe("AgentOperationController", () => {
	it("tracks turn operations by resource", () => {
		const changed = vi.fn();
		const operations = createAgentOperationController(changed);
		const stop = operations.begin("turn-stop", "resource-a");
		const other = operations.begin("turn-stop", "resource-b");

		expect(other).toBeNull();
		expect(operations.key("turn-stop")).toBe("resource-a");
		expect(operations.active("turn-stop")).toBe(true);
		expect(operations.finish(stop)).toBe(true);
		expect(changed).toHaveBeenCalledTimes(2);
	});

	it("rejects stale operation results after a resource reset", () => {
		const operations = createAgentOperationController(() => undefined);
		const stale = operations.begin("turn-stop", "resource-old");
		operations.reset();
		const current = operations.begin("turn-stop", "resource-new");

		expect(operations.finish(stale)).toBe(false);
		expect(operations.key("turn-stop")).toBe("resource-new");
		expect(operations.finish(current)).toBe(true);
	});

	it("deduplicates pending sends by Workspace and Resource key", () => {
		const operations = createAgentOperationController(() => undefined);
		expect(operations.startSending("workspace:resource-a")).toBe(true);
		expect(operations.startSending("workspace:resource-a")).toBe(false);
		expect(operations.startSending("workspace:resource-b")).toBe(true);
		operations.stopSending("workspace:resource-a");
		expect(operations.startSending("workspace:resource-a")).toBe(true);
	});
});
