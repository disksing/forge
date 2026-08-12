import { describe, expect, it, vi } from "vitest";

import { createAgentOperationController } from "../../src/controllers/agent-operation-controller";

describe("AgentOperationController", () => {
	it("tracks independent Session operations", () => {
		const changed = vi.fn();
		const operations = createAgentOperationController(changed);
		const stop = operations.begin("session-stop", "run-1");
		const turn = operations.begin("turn-stop", "run-1");

		expect(operations.begin("session-stop", "run-2")).toBeNull();
		expect(operations.key("session-stop")).toBe("run-1");
		expect(operations.active("turn-stop")).toBe(true);
		expect(operations.finish(stop)).toBe(true);
		expect(operations.finish(turn)).toBe(true);
		expect(changed).toHaveBeenCalledTimes(4);
	});

	it("rejects stale operation results after a Session reset", () => {
		const operations = createAgentOperationController(() => undefined);
		const stale = operations.begin("session-switch", "run-old");
		operations.reset();
		const current = operations.begin("session-switch", "run-new");

		expect(operations.finish(stale)).toBe(false);
		expect(operations.key("session-switch")).toBe("run-new");
		expect(operations.finish(current)).toBe(true);
	});

	it("deduplicates pending sends by Workspace and Session key", () => {
		const operations = createAgentOperationController(() => undefined);
		expect(operations.startSending("workspace:run")).toBe(true);
		expect(operations.startSending("workspace:run")).toBe(false);
		operations.stopSending("workspace:run");
		expect(operations.startSending("workspace:run")).toBe(true);
	});
});
