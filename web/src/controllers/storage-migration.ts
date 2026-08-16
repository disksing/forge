// These helpers move browser state between renamed keys and prefixes. PUA uses
// them to retain both forge.gui.* and forge.web.* state during the rename.

export function migrateStorageKey(storage: Storage | null, oldKey: string, newKey: string): void {
	if (!storage || oldKey === newKey) return;
	try {
		const value = storage.getItem(oldKey);
		if (value === null) return;
		if (storage.getItem(newKey) === null) storage.setItem(newKey, value);
		storage.removeItem(oldKey);
	} catch (_) {}
}

export function migrateStoragePrefix(storage: Storage | null, oldPrefix: string, newPrefix: string): void {
	if (!storage || oldPrefix === newPrefix) return;
	try {
		const moves: Array<[string, string]> = [];
		for (let index = 0; index < storage.length; index++) {
			const key = storage.key(index);
			if (key && key.startsWith(oldPrefix)) moves.push([key, newPrefix + key.slice(oldPrefix.length)]);
		}
		for (const [oldKey, newKey] of moves) migrateStorageKey(storage, oldKey, newKey);
	} catch (_) {}
}
