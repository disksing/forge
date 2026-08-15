import { describe, expect, it, vi } from "vitest";

import { createAgentDraftStore } from "../../src/controllers/agent-draft-store";
import { createNotificationRepository } from "../../src/controllers/notification-store";
import { createPaneLayoutController } from "../../src/controllers/pane-layout-controller";
import { migrateStorageKey, migrateStoragePrefix } from "../../src/controllers/storage-migration";
import { MemoryStorage } from "../fixtures/memory-storage";

describe("storage-migration helpers", () => {
	it("moves a single legacy key and keeps an existing new value", () => {
		const storage = new MemoryStorage();
		storage.setItem("forge.gui.user.v1", "old");
		migrateStorageKey(storage, "forge.gui.user.v1", "forge.web.user.v1");
		expect(storage.getItem("forge.web.user.v1")).toBe("old");
		expect(storage.getItem("forge.gui.user.v1")).toBeNull();

		storage.setItem("forge.gui.other", "legacy");
		storage.setItem("forge.web.other", "current");
		migrateStorageKey(storage, "forge.gui.other", "forge.web.other");
		expect(storage.getItem("forge.web.other")).toBe("current");
		expect(storage.getItem("forge.gui.other")).toBeNull();
	});

	it("moves every key under a legacy prefix", () => {
		const storage = new MemoryStorage();
		storage.setItem("forge.gui.notifications.v1.settings", "{}");
		storage.setItem("forge.gui.notifications.v1.state.ws", "{\"version\":1}");
		storage.setItem("unrelated", "keep");
		migrateStoragePrefix(storage, "forge.gui.notifications.v1", "forge.web.notifications.v1");
		expect(storage.getItem("forge.web.notifications.v1.settings")).toBe("{}");
		expect(storage.getItem("forge.web.notifications.v1.state.ws")).toBe("{\"version\":1}");
		expect(storage.getItem("forge.gui.notifications.v1.settings")).toBeNull();
		expect(storage.getItem("unrelated")).toBe("keep");
	});

	it("tolerates a null storage", () => {
		migrateStorageKey(null, "a", "b");
		migrateStoragePrefix(null, "a", "b");
	});
});

describe("forge.gui to forge.web key migration", () => {
	function mockMatchMedia(): void {
		Object.defineProperty(window, "matchMedia", {
			configurable: true,
			value: vi.fn(() => ({ matches: false, addEventListener: vi.fn(), removeEventListener: vi.fn() }))
		});
	}

	it("migrates pane layout keys on initialize", () => {
		mockMatchMedia();
		const storage = new MemoryStorage();
		storage.setItem("forge.gui.paneSizes", JSON.stringify({ sidebarWidth: 300, chatWidth: 480, sidebarAttentionHeight: 260 }));
		storage.setItem("forge.gui.layoutPreference", "split");
		storage.setItem("forge.gui.fontScales", JSON.stringify({ sidebar: 1.2, details: 1, chat: 0.9 }));
		storage.setItem("forge.gui.mobileImmersive", "1");
		const layout = createPaneLayoutController(() => undefined, storage);
		layout.initialize();
		expect(layout.snapshot().paneSizes.sidebarWidth).toBe(300);
		expect(layout.snapshot().layout.preference).toBe("split");
		expect(layout.snapshot().fontScales.sidebar).toBe(1.2);
		expect(storage.getItem("forge.gui.paneSizes")).toBeNull();
		expect(storage.getItem("forge.gui.layoutPreference")).toBeNull();
		expect(storage.getItem("forge.gui.fontScales")).toBeNull();
		expect(storage.getItem("forge.gui.mobileImmersive")).toBeNull();
		expect(storage.getItem("forge.web.mobileImmersive")).toBe("1");
	});

	it("migrates notification state and settings under the legacy prefix", () => {
		const storage = new MemoryStorage();
		const store = { version: 1, seen: [], pending: [], unread: [{ workspaceId: "ws", generationId: "gen-1", marker: "m-1", at: 1 }], effects: [] };
		storage.setItem("forge.gui.notifications.v1.state.ws", JSON.stringify(store));
		storage.setItem("forge.gui.notifications.v1.settings", JSON.stringify({ version: 1, browser: true, sound: true }));
		const repository = createNotificationRepository(storage);
		expect(repository.readStore("ws").unread[0]?.generationId).toBe("gen-1");
		expect(repository.readSettings()).toEqual({ browser: true, sound: true });
		expect(storage.getItem("forge.gui.notifications.v1.state.ws")).toBeNull();
		expect(storage.getItem("forge.gui.notifications.v1.settings")).toBeNull();
	});

	it("migrates agent drafts under the legacy prefix", () => {
		const storage = new MemoryStorage();
		const drafts = createAgentDraftStore({ storage });
		drafts.write(drafts.keyForResource("ws", "task1"), "hello", { workspaceId: "ws", resourceId: "task1" });
		const key = drafts.keyForResource("ws", "task1");
		storage.setItem(key.replace("forge.web.agentDraft.v2", "forge.gui.agentDraft.v2"), storage.getItem(key) || "");
		storage.removeItem(key);
		const migrated = createAgentDraftStore({ storage });
		expect(migrated.read(migrated.keyForResource("ws", "task1"))).toBe("hello");
	});
});
