import { beforeEach, describe, expect, it, vi } from "vitest";

import { createPaneLayoutController, normalizePaneSizes } from "../../src/controllers/pane-layout-controller";
import { createRouteController, forgeRoutePath, parseForgeRoute } from "../../src/controllers/route-controller";
import { MemoryStorage } from "../fixtures/memory-storage";

describe("route and pane layout controllers", () => {
	let storage: MemoryStorage;
	beforeEach(() => {
		storage = new MemoryStorage();
		Object.defineProperty(window, "matchMedia", {
			configurable: true,
			value: vi.fn(() => ({ matches: false, addEventListener: vi.fn(), removeEventListener: vi.fn() }))
		});
	});

	it("round-trips encoded Workspace and Resource routes", () => {
		const path = forgeRoutePath("workspace one", "project1.task/2");
		expect(path).toBe("/w/workspace%20one/r/project1.task%2F2");
		expect(parseForgeRoute(path)).toEqual({ workspaceId: "workspace one", resourceId: "project1.task/2" });
		expect(parseForgeRoute("/not-forge")).toEqual({});
	});

	it("increments route revisions and retains replace semantics", () => {
		const changed = vi.fn();
		const routes = createRouteController(changed);
		routes.project("alpha", "task1", { replace: true });
		routes.project("alpha", "task2");
		expect(routes.projection()).toEqual({ path: "/w/alpha/r/task2", revision: 2, replace: false });
		expect(changed).toHaveBeenCalledTimes(2);
	});

	it("normalizes legacy details width and persists committed pane sizes", () => {
		expect(normalizePaneSizes({ detailsWidth: 500, sidebarWidth: 100 }, 1_200)).toEqual({
			sidebarWidth: 220,
			chatWidth: 692,
			sidebarSessionHeight: 210
		});
		const layout = createPaneLayoutController(() => undefined, storage);
		layout.initialize();
		layout.previewPane("chatWidth", 510);
		layout.commitPane("chatWidth");
		expect(JSON.parse(storage.getItem("forge.gui.paneSizes") || "{}").chatWidth).toBe(510);
	});

	function mockMatchMedia(matches: Record<string, boolean>): void {
		Object.defineProperty(window, "matchMedia", {
			configurable: true,
			value: vi.fn((query: string) => ({ matches: Boolean(matches[query]), addEventListener: vi.fn(), removeEventListener: vi.fn() }))
		});
	}

	it("resolves the effective layout from the preference and viewport, and persists the choice", () => {
		delete document.body.dataset.layout;
		mockMatchMedia({});
		let layout = createPaneLayoutController(() => undefined, storage);
		layout.initialize();
		expect(document.body.dataset.layout).toBe("three");
		expect(layout.snapshot().layout).toEqual({ preference: "auto", effective: "three" });

		mockMatchMedia({ "(max-width: 1440px)": true });
		layout = createPaneLayoutController(() => undefined, storage);
		layout.initialize();
		expect(document.body.dataset.layout).toBe("two");

		layout.setLayoutPreference("split");
		expect(document.body.dataset.layout).toBe("split");
		expect(layout.snapshot().layout).toEqual({ preference: "split", effective: "split" });
		expect(storage.getItem("forge.gui.layoutPreference")).toBe("split");

		mockMatchMedia({});
		layout = createPaneLayoutController(() => undefined, storage);
		layout.initialize();
		expect(document.body.dataset.layout).toBe("split");

		mockMatchMedia({ "(max-width: 980px)": true, "(max-width: 1440px)": true });
		layout = createPaneLayoutController(() => undefined, storage);
		layout.initialize();
		expect(document.body.dataset.layout).toBe("single");
	});

	it("cycles the layout preference through auto, three, two, and split", () => {
		mockMatchMedia({});
		const layout = createPaneLayoutController(() => undefined, storage);
		layout.initialize();
		expect(layout.snapshot().layout.preference).toBe("auto");
		layout.cycleLayoutPreference();
		expect(layout.snapshot().layout).toEqual({ preference: "three", effective: "three" });
		layout.cycleLayoutPreference();
		expect(layout.snapshot().layout).toEqual({ preference: "two", effective: "two" });
		layout.cycleLayoutPreference();
		expect(layout.snapshot().layout).toEqual({ preference: "split", effective: "split" });
		layout.cycleLayoutPreference();
		expect(layout.snapshot().layout).toEqual({ preference: "auto", effective: "three" });
	});
});
