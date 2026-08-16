import type { ResourceScope } from "../runtime/resource-scope";

const USER_SETTINGS_KEY = "pua.web.user.v1";
const USER_SETTINGS_VERSION = 1;
export const USER_NAME_MAX_LENGTH = 80;
const USER_NAME_PATTERN = /^[A-Za-z0-9_-]+$/;

export function sanitizeUserNameInput(value: unknown): string {
	return String(value || "").replace(/[^A-Za-z0-9_-]/g, "").slice(0, USER_NAME_MAX_LENGTH);
}

export function validateUserName(value: unknown): string {
	const name = String(value || "");
	if (!name) throw new Error("User name is required.");
	if (name.length > USER_NAME_MAX_LENGTH) throw new Error(`User name must be at most ${USER_NAME_MAX_LENGTH} characters.`);
	if (!USER_NAME_PATTERN.test(name)) throw new Error("User name may contain only letters, numbers, underscores, and hyphens.");
	return name;
}

export function normalizeUserName(value: unknown): string {
	const trimmed = String(value || "").trim();
	if (!trimmed) return "User";
	try {
		return validateUserName(trimmed);
	} catch (_) {
		return "User";
	}
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
	let name = read();

	function read(): string {
		try {
			return decodeStoredUserName(window.localStorage.getItem(USER_SETTINGS_KEY));
		} catch (_) {
			return "User";
		}
	}

	function save(value: unknown): string {
		const normalized = validateUserName(value);
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
		validate: validateUserName,
		save
	};
}
