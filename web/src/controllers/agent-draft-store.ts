const STORAGE_PREFIX = "forge.gui.agentDraft.v2";
const STORAGE_VERSION = 2;
const DEFAULT_MAX_ORPHAN_COUNT = 50;
const DEFAULT_MAX_AGE_MS = 90 * 24 * 60 * 60 * 1000;

export interface AgentDraftContext {
	workspaceId: string;
	resourceId: string;
	generationId?: string;
}

export interface AgentDraftRecord extends AgentDraftContext {
	version: number;
	text: string;
	updatedAt: number;
}

export interface AgentDraftStoreOptions {
	storage?: Storage | null;
	now?: () => number;
	maxOrphanCount?: number;
	maxAgeMs?: number;
}

function storagePart(value: unknown): string {
	return encodeURIComponent(String(value || "").trim());
}

export function agentDraftResourceScope(resourceId: unknown): string {
	return String(resourceId || "").trim() || "workspace";
}

export function createAgentDraftStore(options: AgentDraftStoreOptions = {}) {
	const now = options.now || Date.now;
	const maxOrphanCount = options.maxOrphanCount ?? DEFAULT_MAX_ORPHAN_COUNT;
	const maxAgeMs = options.maxAgeMs ?? DEFAULT_MAX_AGE_MS;

	function storage(): Storage | null {
		if ("storage" in options) return options.storage || null;
		try {
			return window.localStorage;
		} catch (_) {
			return null;
		}
	}

	function keyForResource(workspaceId: unknown, resourceId: unknown): string {
		const workspace = String(workspaceId || "").trim();
		const resource = agentDraftResourceScope(resourceId);
		if (!workspace || !resource) return "";
		return `${STORAGE_PREFIX}.resource.${storagePart(workspace)}.${storagePart(resource)}`;
	}

	function decode(raw: string | null): AgentDraftRecord | null {
		if (!raw) return null;
		try {
			const record = JSON.parse(raw) as Partial<AgentDraftRecord> | null;
			if (!record || record.version !== STORAGE_VERSION || typeof record.text !== "string") return null;
			return {
				version: STORAGE_VERSION,
				text: record.text,
				updatedAt: Number(record.updatedAt) || 0,
				workspaceId: String(record.workspaceId || ""),
				resourceId: agentDraftResourceScope(record.resourceId),
				generationId: String(record.generationId || "") || undefined
			};
		} catch (_) {
			return null;
		}
	}

	function readRecord(key: string): AgentDraftRecord | null {
		const target = storage();
		if (!target || !key) return null;
		let raw: string | null = null;
		try {
			raw = target.getItem(key);
		} catch (_) {
			return null;
		}
		const record = decode(raw);
		if (record) return record;
		if (raw) remove(key);
		return null;
	}

	function read(key: string): string {
		const record = readRecord(key);
		if (!record?.text) {
			if (record) remove(key);
			return "";
		}
		return record.text;
	}

	function remove(key: string): void {
		const target = storage();
		if (!target || !key) return;
		try {
			target.removeItem(key);
		} catch (_) {}
	}

	function write(key: string, text: string, context: AgentDraftContext): void {
		if (!key) return;
		if (!text) {
			remove(key);
			return;
		}
		const target = storage();
		if (!target) return;
		try {
			target.setItem(key, JSON.stringify({
				version: STORAGE_VERSION,
				text,
				updatedAt: now(),
				workspaceId: context.workspaceId,
				resourceId: agentDraftResourceScope(context.resourceId),
				generationId: String(context.generationId || "") || undefined
			} satisfies AgentDraftRecord));
		} catch (_) {}
	}

	function prune(workspaceId: string, resourceId: string, protectedKeys: ReadonlySet<string>): void {
		const target = storage();
		const workspace = String(workspaceId || "").trim();
		const resource = agentDraftResourceScope(resourceId);
		if (!target || !workspace) return;
		const prefix = `${STORAGE_PREFIX}.resource.${storagePart(workspace)}.`;
		const candidates: Array<{ key: string; updatedAt: number }> = [];
		const currentTime = now();
		try {
			for (let index = 0; index < target.length; index++) {
				const key = target.key(index);
				if (!key || !key.startsWith(prefix)) continue;
				const record = readRecord(key);
				if (!record || agentDraftResourceScope(record.resourceId) !== resource || protectedKeys.has(key)) continue;
				if (!record.text || (record.updatedAt > 0 && currentTime - record.updatedAt > maxAgeMs)) {
					remove(key);
					continue;
				}
				candidates.push({ key, updatedAt: record.updatedAt });
			}
			candidates.sort((left, right) => left.updatedAt - right.updatedAt);
			while (candidates.length > maxOrphanCount) {
				const candidate = candidates.shift();
				if (candidate) remove(candidate.key);
			}
		} catch (_) {}
	}

	return { keyForResource, read, remove, write, prune };
}
