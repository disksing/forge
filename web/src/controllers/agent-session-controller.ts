import type { createAgentOperationController } from "./agent-operation-controller";
import { errorMessage } from "../runtime/errors";
import type { AgentConfig, ResourceRecord } from "../models/workspace";

export interface AgentRunRecord {
	id: string;
	status: string;
	resourceId: string;
	workspaceId?: string;
	agentHubSessionId?: string;
	sourceExternalId?: string;
	agentHubAgentName?: string;
	title?: string;
	createdAt?: string;
	updatedAt?: string;
	agentProfile?: string;
	agentSelectionReason?: string;
	wakeContext?: { summary?: string; wakeCondition?: string; fallback?: boolean };
}
export type AgentResourceRecord = ResourceRecord;
export type AgentConfigRecord = AgentConfig;

export interface AgentInputContext {
	workspaceId: string;
	resourceId: string;
	runId: string;
	draftKey: string;
}

export interface AgentSessionDependencies {
	operations: ReturnType<typeof createAgentOperationController>;
	workspaceId(): string;
	selectedResource(): AgentResourceRecord | null;
	taskDetail(): AgentResourceRecord | null;
	currentRun(): AgentRunRecord | null;
	runs(): AgentRunRecord[];
	activeRunId(): string;
	selectedAgent(): AgentConfigRecord | null;
	enabledAgents(): AgentConfigRecord[];
	setAgentName(name: string): void;
	setActiveRun(id: string): void;
	setHistoryOpen(open: boolean): void;
	closeAgentMenus(): void;
	resetDraft(): void;
	flushDraft(): void;
	restoreDraft(run: AgentRunRecord): void;
	currentDraft(): { key: string; text: string; version: number };
	updateDraft(text: string): void;
	clearDraftAfterAccepted(context: { workspaceId: string; runId: string; key: string; text: string; version: number }): boolean;
	bumpDraftResetVersion(): void;
	userName(): string;
	workspaceName(): string;
	defaultCwd(): string;
	isLive(run: AgentRunRecord | null): boolean;
	isTurnInterruptible(run: AgentRunRecord | null): boolean;
	mutate<T>(action: () => Promise<T>): Promise<T>;
	request<T>(path: string, init?: RequestInit): Promise<T>;
	reloadRuns(): Promise<void>;
	refreshTree(): Promise<void>;
	fetchDetail(resourceId: string, workspaceId: string): Promise<AgentResourceRecord>;
	applyDetail(detail: AgentResourceRecord): void;
	refreshInputProjection(workspaceId: string, resourceId: string): Promise<void>;
	publish(): void;
	renderAgent(): void;
	renderComposer(): void;
	refreshIcons(): void;
	toast(message: string): void;
}

export function createAgentSessionController(dependencies: AgentSessionDependencies) {
	const { operations } = dependencies;

	async function refreshSessionProjection(): Promise<void> {
		await Promise.all([dependencies.reloadRuns(), dependencies.refreshTree()]);
	}

	async function start(agentName = ""): Promise<void> {
		if (operations.active("session-start")) return;
		return dependencies.mutate(async () => {
			const workspaceId = dependencies.workspaceId();
			if (!workspaceId) throw new Error("Select a workspace first.");
			const selected = dependencies.selectedResource();
			const requested = String(agentName || "").trim();
			const agent = requested ? dependencies.enabledAgents().find((candidate) => candidate.id === requested) || null : dependencies.selectedAgent();
			if (!agent) throw new Error("Select an enabled agent first.");
			dependencies.setAgentName(agent.id);
			const operation = operations.begin("session-start", agent.id);
			if (!operation) return;
			try {
				const response = await dependencies.request<{ run: AgentRunRecord }>(`/api/workspaces/${workspaceId}/agent/runs`, {
					method: "POST",
					body: JSON.stringify({
						agentName: agent.id,
						userName: dependencies.userName(),
						resourceId: selected?.id || "",
						title: selected?.title || dependencies.workspaceName(),
						prompt: "",
						cwd: dependencies.defaultCwd()
					})
				});
				dependencies.resetDraft();
				dependencies.closeAgentMenus();
				dependencies.setActiveRun(response.run.id);
				await refreshSessionProjection();
				dependencies.publish();
				dependencies.toast("Agent session started.");
			} finally {
				operations.finish(operation);
			}
		});
	}

	async function closeRun(runId: string): Promise<unknown> {
		if (!runId) return;
		return dependencies.request(`/api/workspaces/${dependencies.workspaceId()}/agent/runs/${runId}/stop`, { method: "POST" });
	}

	async function stopSession(): Promise<void> {
		if (!dependencies.activeRunId() || operations.active("session-stop") || operations.active("turn-stop")) return;
		const run = dependencies.currentRun();
		if (!run || !dependencies.isLive(run) || run.status === "stopping") return;
		return dependencies.mutate(async () => {
			const runId = dependencies.activeRunId();
			const operation = operations.begin("session-stop", runId);
			if (!operation) return;
			try {
				await closeRun(runId);
				await refreshSessionProjection();
				dependencies.publish();
				dependencies.toast("Agent session closed.");
			} catch (error) {
				try { await refreshSessionProjection(); dependencies.publish(); } catch (_) {}
				throw error;
			} finally {
				operations.finish(operation);
			}
		});
	}

	async function stopTurn(): Promise<void> {
		if (!dependencies.activeRunId() || operations.active("turn-stop") || operations.active("session-stop") || !dependencies.isTurnInterruptible(dependencies.currentRun())) return;
		return dependencies.mutate(async () => {
			const runId = dependencies.activeRunId();
			const operation = operations.begin("turn-stop", runId);
			if (!operation) return;
			try {
				await dependencies.request(`/api/workspaces/${dependencies.workspaceId()}/agent/runs/${runId}/interrupt`, { method: "POST" });
				await refreshSessionProjection();
				dependencies.publish();
				dependencies.toast("Turn ended. The AgentHub Session remains open.");
			} catch (error) {
				try { await refreshSessionProjection(); dependencies.publish(); } catch (_) {}
				throw error;
			} finally {
				operations.finish(operation);
			}
		});
	}

	async function switchRun(runId: string): Promise<void> {
		if (!runId || runId === dependencies.activeRunId()) return;
		return dependencies.mutate(async () => {
			const operation = operations.begin("session-switch", runId);
			if (!operation) return;
			const workspaceId = dependencies.workspaceId();
			dependencies.flushDraft();
			const previousRun = dependencies.currentRun();
			dependencies.setActiveRun(runId);
			dependencies.resetDraft();
			const nextRun = dependencies.runs().find((run) => run.id === runId);
			if (nextRun) dependencies.restoreDraft(nextRun);
			dependencies.publish();
			try {
				if (previousRun && dependencies.isLive(previousRun)) try {
					await closeRun(previousRun.id);
				} catch (error) {
					if (workspaceId === dependencies.workspaceId() && dependencies.activeRunId() === runId) {
						dependencies.setActiveRun(previousRun.id);
						dependencies.resetDraft();
						dependencies.restoreDraft(previousRun);
						dependencies.publish();
					}
					throw error;
				}
				if (workspaceId !== dependencies.workspaceId() || dependencies.activeRunId() !== runId) return;
				await refreshSessionProjection();
				if (workspaceId === dependencies.workspaceId()) dependencies.publish();
			} finally {
				operations.finish(operation);
			}
		});
	}

	async function resume(): Promise<void> {
		const runId = dependencies.activeRunId();
		if (!runId) return;
		return dependencies.mutate(async () => {
			dependencies.flushDraft();
			const response = await dependencies.request<{ run: AgentRunRecord }>(`/api/workspaces/${dependencies.workspaceId()}/agent/runs/${runId}/resume`, { method: "POST" });
			dependencies.setActiveRun(response.run.id);
			dependencies.restoreDraft(response.run);
			dependencies.setHistoryOpen(false);
			await refreshSessionProjection();
			dependencies.publish();
			dependencies.toast("Agent session resumed.");
		});
	}

	async function resolveApproval(runId: string, requestId: string, reply: Record<string, unknown>): Promise<void> {
		if (!runId || !requestId) return;
		const workspaceId = dependencies.workspaceId();
		await dependencies.request(`/api/workspaces/${workspaceId}/agent/runs/${runId}/approval`, {
			method: "POST", body: JSON.stringify({ requestId, ...reply })
		});
		if (workspaceId === dependencies.workspaceId()) {
			await dependencies.reloadRuns();
			dependencies.publish();
		}
	}

	async function send(rawText: string, context: AgentInputContext): Promise<{ accepted: boolean; clear: boolean }> {
		const sendingKey = `${context?.workspaceId || "workspace"}:${context?.runId || context?.resourceId || "resource"}`;
		if (operations.isSending(sendingKey) || !String(rawText || "").trim()) return { accepted: false, clear: false };
		const sendingRun = dependencies.currentRun();
		if (!sendingRun || !dependencies.isLive(sendingRun)) {
			const selectedResourceID = dependencies.selectedResource()?.id || "workspace";
			if (context.workspaceId !== dependencies.workspaceId() || context.resourceId !== selectedResourceID) throw new Error("The selected Workspace or resource changed before the message could be sent.");
			if (!operations.startSending(sendingKey)) return { accepted: false, clear: false };
			try {
				const selected = dependencies.selectedResource();
				const response = await dependencies.request<{ run?: AgentRunRecord; status?: string; messageId?: string; lastError?: string }>(`/api/workspaces/${context.workspaceId}/agent/runs`, {
					method: "POST",
					body: JSON.stringify({
						userName: dependencies.userName(),
						resourceId: context.resourceId,
						title: selected?.title || dependencies.workspaceName(),
						prompt: rawText,
						cwd: dependencies.defaultCwd()
					})
				});
				if (context.workspaceId !== dependencies.workspaceId() || context.resourceId !== (dependencies.selectedResource()?.id || "workspace")) return { accepted: true, clear: false };
				dependencies.resetDraft();
				if (response.run?.id) dependencies.setActiveRun(response.run.id);
				await refreshSessionProjection();
				dependencies.publish();
				if (!response.run?.id) dependencies.toast(response.lastError ? `Message accepted and queued: ${response.lastError}` : "Message accepted and queued until the resource Agent is available.");
				return { accepted: true, clear: true };
			} finally {
				operations.stopSending(sendingKey);
			}
		}
		dependencies.restoreDraft(sendingRun);
		const draft = dependencies.currentDraft();
		if (context.workspaceId !== dependencies.workspaceId() || context.runId !== dependencies.activeRunId() || context.draftKey !== draft.key) throw new Error("The selected Workspace or Session changed before the message could be sent.");
		dependencies.updateDraft(rawText);
		const sendVersion = dependencies.currentDraft().version;
		if (!operations.startSending(sendingKey)) return { accepted: false, clear: false };
		try {
			const run = dependencies.currentRun();
			if (!run || context.runId !== run.id || context.resourceId !== (run.resourceId || "")) throw new Error("The selected Workspace or Session changed before the message could be sent.");
			const body: Record<string, unknown> = { text: rawText, userName: dependencies.userName() };
			const result = await dependencies.request<{ status?: string }>(`/api/workspaces/${context.workspaceId}/agent/runs/${context.runId}/input`, {
				method: "POST", body: JSON.stringify(body)
			});
			let cleared = false;
			if (result?.status === "accepted") {
				cleared = dependencies.clearDraftAfterAccepted({ workspaceId: context.workspaceId, runId: context.runId, key: context.draftKey, text: rawText, version: sendVersion });
				if (cleared) dependencies.bumpDraftResetVersion();
				try { await dependencies.refreshInputProjection(context.workspaceId, context.resourceId); }
				catch (refreshError) { dependencies.toast(`Message accepted, but the view could not refresh: ${errorMessage(refreshError)}`); }
			}
			return { accepted: result?.status === "accepted", clear: cleared };
		} finally {
			operations.stopSending(sendingKey);
		}
	}

	return { start, stopSession, stopTurn, switchRun, closeRun, resume, resolveApproval, send };
}
