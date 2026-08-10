import { errorMessage } from "../runtime/errors";

export interface ResourceLogEntry {
	[key: string]: unknown;
	id?: string;
	time?: string;
}

export interface ResourceDetailRecord {
	[key: string]: unknown;
	id: string;
	logs?: ResourceLogEntry[];
	logPage?: { entries?: ResourceLogEntry[]; hasMore?: boolean; nextCursor?: string };
}

export interface ResourceLogPageState {
	loaded: boolean;
	hasMore: boolean;
	nextCursor: string;
	loading: boolean;
	error: string;
	requestVersion: number;
}

export interface ResourceDetailContext {
	workspaceId: string;
	navigationVersion: number;
	selectedId: string;
	detailRequestVersion: number;
}

export interface ResourceDetailDependencies {
	details: Record<string, ResourceDetailRecord>;
	pages: Record<string, ResourceLogPageState>;
	context(): ResourceDetailContext;
	nextDetailRequestVersion(): number;
	isCurrentWorkspace(workspaceId: string, navigationVersion: number): boolean;
	request<T>(path: string, init?: RequestInit): Promise<T>;
	render(): void;
	refreshIcons(): void;
}

export interface FetchDetailOptions {
	logsCursor?: string | number;
	cursor?: string | number;
	logsLimit?: number;
	limit?: number;
}

export function compareLogTimeDesc(leftEntry: ResourceLogEntry, rightEntry: ResourceLogEntry): number {
	const left = Date.parse(String(leftEntry?.time || ""));
	const right = Date.parse(String(rightEntry?.time || ""));
	if (Number.isFinite(left) && Number.isFinite(right) && left !== right) return right - left;
	return String(rightEntry?.time || "").localeCompare(String(leftEntry?.time || ""));
}

export function mergeResourceLogs(existing: ResourceLogEntry[], incoming: ResourceLogEntry[], prepend: boolean): ResourceLogEntry[] {
	const next: ResourceLogEntry[] = [];
	const byID = new Map<string, number>();
	const add = (entry: ResourceLogEntry, replaceDuplicate: boolean) => {
		const id = String(entry?.id || "");
		if (id && byID.has(id)) {
			if (replaceDuplicate) next[byID.get(id) as number] = entry;
			return;
		}
		if (id) byID.set(id, next.length);
		next.push(entry);
	};
	for (const entry of prepend ? incoming : existing) add(entry, false);
	for (const entry of prepend ? existing : incoming) add(entry, !prepend);
	return next.sort(compareLogTimeDesc);
}

export function createResourceDetailController(dependencies: ResourceDetailDependencies, initialLimit = 10, moreLimit = 20) {
	function reset(resourceId: string): void {
		if (resourceId) delete dependencies.pages[resourceId];
	}

	function page(resourceId: string): ResourceLogPageState {
		return dependencies.pages[resourceId] ||= {
			loaded: false, hasMore: false, nextCursor: "", loading: false, error: "", requestVersion: 0
		};
	}

	function entries(detail: ResourceDetailRecord | null | undefined): ResourceLogEntry[] {
		if (Array.isArray(detail?.logs) && detail.logs.length) return detail.logs;
		if (Array.isArray(detail?.logPage?.entries)) return detail.logPage.entries;
		return Array.isArray(detail?.logs) ? detail.logs : [];
	}

	function snapshot(resourceId: string) {
		const currentPage = dependencies.pages[resourceId];
		return {
			detail: dependencies.details[resourceId] || null,
			page: currentPage ? {
				loaded: currentPage.loaded,
				hasMore: currentPage.hasMore,
				nextCursor: currentPage.nextCursor,
				loading: currentPage.loading,
				error: currentPage.error
			} : null
		};
	}

	function apply(detail: ResourceDetailRecord, mode: "head" | "replace" | "older" = "head"): ResourceDetailRecord | null {
		if (!detail?.id) return null;
		const resourceId = detail.id;
		const incoming = entries(detail);
		const incomingPage = detail.logPage || null;
		const currentPage = page(resourceId);
		if (mode === "replace" || !currentPage.loaded || !dependencies.details[resourceId]) {
			currentPage.loaded = true;
			currentPage.hasMore = Boolean(incomingPage?.hasMore);
			currentPage.nextCursor = String(incomingPage?.nextCursor || "");
			currentPage.error = "";
			dependencies.details[resourceId] = {
				...detail,
				logs: mergeResourceLogs([], incoming, true),
				logPage: { hasMore: currentPage.hasMore, nextCursor: currentPage.nextCursor }
			};
			return dependencies.details[resourceId];
		}
		const current = dependencies.details[resourceId];
		const logs = mergeResourceLogs(current.logs || [], incoming, mode !== "older");
		if (mode === "older" && incomingPage) {
			currentPage.hasMore = Boolean(incomingPage.hasMore);
			currentPage.nextCursor = String(incomingPage.nextCursor || "");
		}
		currentPage.loaded = true;
		currentPage.error = "";
		const nextDetail = mode === "older" ? current : { ...current, ...detail };
		dependencies.details[resourceId] = {
			...nextDetail,
			logs,
			logPage: { hasMore: currentPage.hasMore, nextCursor: currentPage.nextCursor }
		};
		return dependencies.details[resourceId];
	}

	function fetch(resourceId: string, workspaceId = dependencies.context().workspaceId, options: FetchDetailOptions = {}): Promise<ResourceDetailRecord> {
		const params = new URLSearchParams();
		const cursor = options.logsCursor ?? options.cursor;
		const limit = options.logsLimit ?? options.limit ?? initialLimit;
		params.set("logsLimit", String(limit));
		if (cursor !== undefined && cursor !== null && String(cursor) !== "") params.set("logsCursor", String(cursor));
		return dependencies.request(`/api/workspaces/${workspaceId}/resources/${encodeURIComponent(resourceId)}?${params.toString()}`);
	}

	async function load(resourceId: string, options: { force?: boolean } = {}): Promise<ResourceDetailRecord | null | undefined> {
		if (!resourceId || resourceId === "workspace" || dependencies.details[resourceId] && !options.force) return;
		if (options.force) {
			reset(resourceId);
			delete dependencies.details[resourceId];
		}
		const context = dependencies.context();
		const requestVersion = dependencies.nextDetailRequestVersion();
		const detail = await fetch(resourceId, context.workspaceId, { logsLimit: initialLimit });
		const current = dependencies.context();
		if (!dependencies.isCurrentWorkspace(context.workspaceId, context.navigationVersion) || current.selectedId !== resourceId || requestVersion !== current.detailRequestVersion) return null;
		return apply(detail, "replace");
	}

	async function loadMore(resourceId = dependencies.context().selectedId): Promise<void> {
		const context = dependencies.context();
		if (!resourceId || resourceId === "workspace" || context.selectedId !== resourceId) return;
		const currentPage = page(resourceId);
		if (!currentPage.loaded || !currentPage.hasMore || currentPage.loading) return;
		const cursor = String(currentPage.nextCursor || "");
		if (!cursor) {
			currentPage.error = "The log page did not provide a continuation cursor.";
			dependencies.render();
			return;
		}
		const requestVersion = ++currentPage.requestVersion;
		currentPage.loading = true;
		currentPage.error = "";
		dependencies.render();
		try {
			const detail = await fetch(resourceId, context.workspaceId, { logsCursor: cursor, logsLimit: moreLimit });
			if (!currentPageIsCurrent(context, resourceId, currentPage, requestVersion)) return;
			apply(detail, "older");
		} catch (error) {
			if (currentPageIsCurrent(context, resourceId, currentPage, requestVersion)) currentPage.error = errorMessage(error, "Could not load older logs.");
		} finally {
			if (currentPageIsCurrent(context, resourceId, currentPage, requestVersion)) {
				currentPage.loading = false;
				dependencies.render();
				dependencies.refreshIcons();
			}
		}
	}

	function currentPageIsCurrent(context: ResourceDetailContext, resourceId: string, currentPage: ResourceLogPageState, requestVersion: number): boolean {
		const current = dependencies.context();
		return dependencies.isCurrentWorkspace(context.workspaceId, context.navigationVersion) && current.selectedId === resourceId && dependencies.pages[resourceId] === currentPage && requestVersion === currentPage.requestVersion;
	}

	return { reset, page, snapshot, apply, fetch, load, loadMore };
}
