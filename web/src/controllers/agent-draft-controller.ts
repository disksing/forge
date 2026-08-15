import { agentDraftResourceScope, createAgentDraftStore, type AgentDraftContext } from "./agent-draft-store";

export interface AgentDraftRuntime {
	chatDraft: string;
	chatMultiline: boolean;
	chatDraftKey: string;
	chatDraftWorkspaceId: string;
	chatDraftResourceId: string;
	chatDraftVersion: number;
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
		if (runtime.chatDraftWorkspaceId === workspaceId && runtime.chatDraftResourceId === resourceId && runtime.chatDraftKey) keys.add(runtime.chatDraftKey);
		return keys;
	}

	function prune(workspaceId = dependencies.workspaceId(), resourceId = runtime.chatDraftResourceId): void {
		const workspace = workspaceId.trim();
		const resource = agentDraftResourceScope(resourceId);
		if (workspace) store.prune(workspace, resource, protectedKeys(workspace, resource));
	}

	function persist(): void {
		if (!runtime.chatDraftKey) return;
		const context: AgentDraftContext = {
			workspaceId: runtime.chatDraftWorkspaceId,
			resourceId: runtime.chatDraftResourceId
		};
		store.write(runtime.chatDraftKey, runtime.chatDraft, context);
		prune(context.workspaceId, context.resourceId);
	}

	function update(text: string, persistChange = true): void {
		const next = String(text ?? "");
		if (runtime.chatDraft !== next) {
			runtime.chatDraft = next;
			runtime.chatDraftVersion++;
		}
		runtime.chatMultiline = next.includes("\n");
		if (persistChange) persist();
	}

	function clearMemory(): void {
		runtime.chatDraft = "";
		runtime.chatMultiline = false;
		runtime.chatDraftKey = "";
		runtime.chatDraftWorkspaceId = "";
		runtime.chatDraftResourceId = "";
		runtime.chatDraftVersion++;
	}

	function restoreResource(resourceId: string, workspaceId = dependencies.workspaceId(), generationId = ""): void {
		const resource = agentDraftResourceScope(resourceId);
		const key = keyForResource(resource, workspaceId);
		if (!key) return clearMemory();
		if (runtime.chatDraftKey === key) return;
		runtime.chatDraftKey = key;
		runtime.chatDraftWorkspaceId = workspaceId.trim();
		runtime.chatDraftResourceId = resource;
		runtime.chatDraft = store.read(key);
		runtime.chatMultiline = runtime.chatDraft.includes("\n");
		runtime.chatDraftVersion++;
		void generationId;
		prune(runtime.chatDraftWorkspaceId, runtime.chatDraftResourceId);
	}

	function clearResourceAfterAccepted(context: { workspaceId: string; resourceId: string; key: string; text: string; version: number }): boolean {
		if (dependencies.workspaceId() !== context.workspaceId || runtime.chatDraftResourceId !== agentDraftResourceScope(context.resourceId) || runtime.chatDraftKey !== context.key || runtime.chatDraft !== context.text || runtime.chatDraftVersion !== context.version) return false;
		store.remove(context.key);
		update("", false);
		return true;
	}

	return { clearResourceAfterAccepted, clearMemory, flush: persist, restoreResource, update };
}
