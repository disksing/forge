import { agentDraftResourceScope, agentDraftSessionIdentity, createAgentDraftStore, type AgentDraftContext } from "./agent-draft-store";
import type { AgentRunRecord } from "./agent-session-controller";

export interface AgentDraftRuntime {
  ttyDraft: string;
  ttyMultiline: boolean;
  ttyDraftKey: string;
  ttyDraftWorkspaceId: string;
  ttyDraftResourceId: string;
  ttyDraftRunId: string;
  ttyDraftVersion: number;
}

export interface AgentDraftControllerDependencies {
  runtime: AgentDraftRuntime;
  workspaceId(): string;
  runs(): AgentRunRecord[];
  currentRun(): AgentRunRecord | null;
}

export function createAgentDraftController(dependencies: AgentDraftControllerDependencies) {
  const store = createAgentDraftStore();
  const { runtime } = dependencies;

  function keyForRun(run: AgentRunRecord | null, workspaceId = dependencies.workspaceId()): string {
    return store.keyForRun(run, workspaceId);
  }

  function protectedKeys(workspaceId: string, resourceId: string): Set<string> {
    const keys = new Set<string>();
    if (runtime.ttyDraftWorkspaceId === workspaceId && runtime.ttyDraftResourceId === resourceId && runtime.ttyDraftKey) keys.add(runtime.ttyDraftKey);
    for (const run of dependencies.runs()) {
      if (agentDraftResourceScope(run.resourceId) !== resourceId) continue;
      const key = keyForRun(run, workspaceId);
      if (key) keys.add(key);
    }
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
      resourceId: runtime.ttyDraftResourceId,
      runId: runtime.ttyDraftRunId,
      sessionId: agentDraftSessionIdentity(dependencies.currentRun()),
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
    runtime.ttyDraftRunId = "";
    runtime.ttyDraftVersion++;
  }

  function restore(run: AgentRunRecord, workspaceId = dependencies.workspaceId()): void {
    const key = keyForRun(run, workspaceId);
    if (!key) return clearMemory();
    if (runtime.ttyDraftKey === key) return;
    runtime.ttyDraftKey = key;
    runtime.ttyDraftWorkspaceId = workspaceId.trim();
    runtime.ttyDraftResourceId = agentDraftResourceScope(run.resourceId);
    runtime.ttyDraftRunId = run.id;
    runtime.ttyDraft = store.read(key);
    runtime.ttyMultiline = runtime.ttyDraft.includes("\n");
    runtime.ttyDraftVersion++;
    prune(runtime.ttyDraftWorkspaceId, runtime.ttyDraftResourceId);
  }

  function clearAfterAccepted(context: { workspaceId: string; runId: string; key: string; text: string; version: number }): boolean {
    if (dependencies.workspaceId() !== context.workspaceId || dependencies.currentRun()?.id !== context.runId || runtime.ttyDraftKey !== context.key || runtime.ttyDraft !== context.text || runtime.ttyDraftVersion !== context.version) return false;
    store.remove(context.key);
    update("", false);
    return true;
  }

  return { clearAfterAccepted, clearMemory, flush: persist, restore, update };
}
