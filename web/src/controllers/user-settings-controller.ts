import type { ResourceScope } from "../runtime/resource-scope";
import { migrateStorageKey } from "./storage-migration";

const USER_SETTINGS_KEY = "pua.web.user.v1";
const LEGACY_USER_SETTINGS_KEYS = ["forge.web.user.v1", "forge.gui.user.v1"];
const USER_SETTINGS_VERSION = 1;
const USER_NAME_MAX_LENGTH = 80;

export function normalizeUserName(value: unknown): string {
	const trimmed = String(value || "").trim();
	if (!trimmed) return "User";
	return Array.from(trimmed).slice(0, USER_NAME_MAX_LENGTH).join("") || "User";
}

export function decodeStoredUserName(raw: string | null): string {
	if (!raw) return "User";
	try {
		const stored = JSON.parse(raw) as { version?: unknown; name?: unknown } | null;
		if (!stored || stored.version !== USER_SETTINGS_VERSION) return "User";
		return normalizeUserName(stored.name);
	} catch (_) {
		return "User";
	}
}

export function createUserSettingsController(scope: ResourceScope, onChange: () => void) {
	let storage: Storage | null = null;
	try {
		storage = window.localStorage;
	} catch (_) {}
	for (const legacyKey of LEGACY_USER_SETTINGS_KEYS) migrateStorageKey(storage, legacyKey, USER_SETTINGS_KEY);
	let name = read();

	function read(): string {
		try {
			return decodeStoredUserName(window.localStorage.getItem(USER_SETTINGS_KEY));
		} catch (_) {
			return "User";
		}
	}

	function save(value: unknown): string {
		const normalized = normalizeUserName(value);
		try {
			window.localStorage.setItem(USER_SETTINGS_KEY, JSON.stringify({
				version: USER_SETTINGS_VERSION,
				name: normalized
			}));
		} catch (_) {
			throw new Error("User name could not be saved in this browser.");
		}
		name = normalized;
		return name;
	}

	scope.listen(window, "storage", (event) => {
		if (event.key !== USER_SETTINGS_KEY) return;
		name = decodeStoredUserName(event.newValue);
		onChange();
	});

	return {
		current: () => name,
		save
	};
}
