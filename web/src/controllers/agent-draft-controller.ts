import { agentDraftResourceScope, createAgentDraftStore, type AgentDraftContext } from "./agent-draft-store";

export interface AgentDraftRuntime {
	ttyDraft: string;
	ttyMultiline: boolean;
	ttyDraftKey: string;
	ttyDraftWorkspaceId: string;
	ttyDraftResourceId: string;
	ttyDraftVersion: number;
}

export interface AgentDraftControllerDependencies {
	runtime: AgentDraftRuntime;
	workspaceId(): string;
}

export function createAgentDraftController(dependencies: AgentDraftControllerDependencies) {
	const store = createAgentDraftStore();
	const { runtime } = dependencies;

	function keyForResource(resourceId: string, workspaceId = dependencies.workspaceId()): string {
		return store.keyForResource(workspaceId, agentDraftResourceScope(resourceId));
	}

	function protectedKeys(workspaceId: string, resourceId: string): Set<string> {
		const keys = new Set<string>();
		if (runtime.ttyDraftWorkspaceId === workspaceId && runtime.ttyDraftResourceId === resourceId && runtime.ttyDraftKey) keys.add(runtime.ttyDraftKey);
		return keys;
	}

	function prune(workspaceId = dependencies.workspaceId(), resourceId = runtime.ttyDraftResourceId): void {
		const workspace = workspaceId.trim();
		const resource = agentDraftResourceScope(resourceId);
		if (workspace) store.prune(workspace, resource, protectedKeys(workspace, resource));
	}

	function persist(): void {
		if (!runtime.ttyDraftKey) return;
		const context: AgentDraftContext = {
			workspaceId: runtime.ttyDraftWorkspaceId,
			resourceId: runtime.ttyDraftResourceId
		};
		store.write(runtime.ttyDraftKey, runtime.ttyDraft, context);
		prune(context.workspaceId, context.resourceId);
	}

	function update(text: string, persistChange = true): void {
		const next = String(text ?? "");
		if (runtime.ttyDraft !== next) {
			runtime.ttyDraft = next;
			runtime.ttyDraftVersion++;
		}
		runtime.ttyMultiline = next.includes("\n");
		if (persistChange) persist();
	}

	function clearMemory(): void {
		runtime.ttyDraft = "";
		runtime.ttyMultiline = false;
		runtime.ttyDraftKey = "";
		runtime.ttyDraftWorkspaceId = "";
		runtime.ttyDraftResourceId = "";
		runtime.ttyDraftVersion++;
	}

	function restoreResource(resourceId: string, workspaceId = dependencies.workspaceId(), generationId = ""): void {
		const resource = agentDraftResourceScope(resourceId);
		const key = keyForResource(resource, workspaceId);
		if (!key) return clearMemory();
		if (runtime.ttyDraftKey === key) return;
		runtime.ttyDraftKey = key;
		runtime.ttyDraftWorkspaceId = workspaceId.trim();
		runtime.ttyDraftResourceId = resource;
		runtime.ttyDraft = store.read(key);
		runtime.ttyMultiline = runtime.ttyDraft.includes("\n");
		runtime.ttyDraftVersion++;
		void generationId;
		prune(runtime.ttyDraftWorkspaceId, runtime.ttyDraftResourceId);
	}

	function clearResourceAfterAccepted(context: { workspaceId: string; resourceId: string; key: string; text: string; version: number }): boolean {
		if (dependencies.workspaceId() !== context.workspaceId || runtime.ttyDraftResourceId !== agentDraftResourceScope(context.resourceId) || runtime.ttyDraftKey !== context.key || runtime.ttyDraft !== context.text || runtime.ttyDraftVersion !== context.version) return false;
		store.remove(context.key);
		update("", false);
		return true;
	}

	return { clearResourceAfterAccepted, clearMemory, flush: persist, restoreResource, update };
}
