import type { AgentOption } from "../models/common";
import type { CreateDialogModel, CreateDraft, TaskPreview, TaskTemplate } from "../models/create";
import type { ResourceAgentBindingModel, ResourceAgentProfileModel } from "../models/detail";
import { errorMessage } from "../runtime/errors";

interface CreateDialogState extends CreateDraft {
	identity: number;
	open: boolean;
	templateDirty: boolean;
	templateDigest: string;
	preview: TaskPreview | null;
	previewing: boolean;
	previewError: string;
	previewKey: string;
	submitting: boolean;
}

export interface CreateDialogDependencies {
	workspaceId(): string;
	templates(projectId: string): TaskTemplate[];
	request<T>(path: string, init?: RequestInit): Promise<T>;
	publish(model: CreateDialogModel): void;
	toast(message: string): void;
	reloadTree(): Promise<void>;
	selectResource(resourceId: string): Promise<void>;
	onOpen(): void;
	onIconsChanged(): void;
	confirmTemplateSwitch(): Promise<boolean>;
	agents(): AgentOption[];
	agentProfiles(): ResourceAgentProfileModel[];
	// The binding a task created in this project would resolve to: the project
	// task default when set, otherwise the workspace task default.
	defaultTaskBinding(projectId: string): ResourceAgentBindingModel;
	currentUserName(): string;
}

interface CreatedResource {
	id?: unknown;
}

export const DEFAULT_TASK_START_PROMPT = "请阅读 task.md 和 AGENTS.md，了解任务背景后开始工作。";

function createdResourceId(result: CreatedResource): string {
	const id = String(result?.id || "").trim();
	if (!id) throw new Error("The created resource did not return an id.");
	return id;
}

function normalizeBindingName(value: string): string {
	return value.trim().toLowerCase();
}

function sameBinding(left: ResourceAgentBindingModel, right: ResourceAgentBindingModel): boolean {
	return left.kind === right.kind && normalizeBindingName(left.name) === normalizeBindingName(right.name);
}

function emptyState(identity: number): CreateDialogState {
	return {
		open: false,
		identity,
		type: "project",
		projectId: "",
		templateName: "",
		templateFields: {},
		templateDirty: false,
		templateDigest: "",
		preview: null,
		previewing: false,
		previewError: "",
		previewKey: "",
		startAfterCreate: false,
		startBinding: { kind: "profile", name: "" },
		startPrompt: DEFAULT_TASK_START_PROMPT,
		title: "",
		description: "",
		detail: "",
		slug: "",
		submitting: false
	};
}

export function createTaskRequest(dialog: CreateDialogState) {
	return {
		project: dialog.projectId,
		// Templates that generate the task title ignore any manual title.
		title: dialog.templateName ? "" : dialog.title,
		...(dialog.templateName ? {
			templateName: dialog.templateName,
			templateFields: dialog.templateFields,
			...(dialog.templateDigest ? { expectedTemplateDigest: dialog.templateDigest } : {})
		} : { detail: dialog.detail }),
		slug: dialog.slug
	};
}

export function createCreateDialogController(dependencies: CreateDialogDependencies) {
	let identity = 0;
	let state = emptyState(identity);
	let previewGeneration = 0;
	let previewController: AbortController | null = null;
	let previewPendingKey = "";

	function draft(dialog = state): CreateDraft {
		return {
			type: dialog.type === "task" ? "task" : "project",
			projectId: dialog.projectId,
			templateName: dialog.templateName,
			templateFields: { ...dialog.templateFields },
			title: dialog.title,
			description: dialog.description,
			detail: dialog.detail,
			slug: dialog.slug,
			startAfterCreate: dialog.startAfterCreate,
			startBinding: { ...dialog.startBinding },
			startPrompt: dialog.startPrompt
		};
	}

	function stateFromDraft(next: CreateDraft): Partial<CreateDialogState> {
		return {
			...next,
			templateFields: { ...next.templateFields },
			startBinding: { ...next.startBinding }
		};
	}

	function cancelPreview(): void {
		previewGeneration++;
		previewController?.abort();
		previewController = null;
		previewPendingKey = "";
	}

	function syncDraft(next: CreateDraft): void {
		if (!next || !state.open) return;
		if (next.templateName !== state.templateName) {
			state.preview = null;
			state.templateDigest = "";
			state.previewError = "";
			state.previewKey = "";
			state.previewing = false;
			cancelPreview();
		}
		Object.assign(state, stateFromDraft(next));
	}

	function render(): void {
		const dialog = state;
		dependencies.publish({
			open: dialog.open,
			identity: `${dialog.identity}:${dialog.type}:${dialog.projectId}`,
			workspaceId: dependencies.workspaceId(),
			draft: draft(),
			templates: dialog.type === "task" ? dependencies.templates(dialog.projectId) : [],
			preview: dialog.preview,
			previewKey: dialog.previewKey,
			previewing: dialog.previewing,
			previewError: dialog.previewError,
			templateDigest: dialog.templateDigest,
			submitting: dialog.submitting,
			agents: dependencies.agents(),
			agentProfiles: dependencies.agentProfiles(),
			defaultTaskBinding: dialog.type === "task" ? dependencies.defaultTaskBinding(dialog.projectId) : { kind: "profile", name: "" },
			onClose: close,
			onPreview: refreshPreview,
			onSubmit: submit,
			previewRequestKey: (next) => JSON.stringify(createTaskRequest({ ...dialog, ...stateFromDraft(next), templateDigest: "" } as CreateDialogState)),
			onConfirmTemplateSwitch: dependencies.confirmTemplateSwitch,
			onIconsChanged: dependencies.onIconsChanged
		});
	}

	function open(type: "project" | "task", projectId = ""): void {
		cancelPreview();
		state = {
			...emptyState(++identity),
			open: true,
			type,
			projectId
		};
		dependencies.onOpen();
		render();
	}

	function close(): void {
		if (state.submitting) return;
		cancelPreview();
		state = emptyState(++identity);
		render();
	}

	async function refreshPreview(next: CreateDraft): Promise<void> {
		syncDraft(next);
		if (!state.open || !state.templateName) return;
		const request = createTaskRequest({ ...state, templateDigest: "" });
		const requestKey = JSON.stringify(request);
		if (state.previewing) {
			if (requestKey === previewPendingKey) return;
			cancelPreview();
			state.previewing = false;
		}
		const selectedTemplate = dependencies.templates(state.projectId).find((item) => item.name === state.templateName);
		if (selectedTemplate && !selectedTemplate.taskTitle && !state.title.trim()) {
			state.previewError = "This template does not generate a title. Enter a task title to render the preview.";
			render();
			return;
		}
		state.previewing = true;
		state.previewError = "";
		const workspaceId = dependencies.workspaceId();
		const dialogIdentity = state.identity;
		const generation = ++previewGeneration;
		previewController?.abort();
		const controller = new AbortController();
		previewController = controller;
		previewPendingKey = requestKey;
		render();
		try {
			const preview = await dependencies.request<TaskPreview>(`/api/workspaces/${workspaceId}/tasks/preview`, {
				method: "POST",
				body: JSON.stringify(request),
				signal: controller.signal
			});
			if (generation !== previewGeneration || dialogIdentity !== state.identity || workspaceId !== dependencies.workspaceId()) return;
			state.preview = preview;
			state.templateDigest = preview.template?.digest || "";
			state.previewKey = requestKey;
		} catch (error) {
			if (controller.signal.aborted || generation !== previewGeneration || dialogIdentity !== state.identity) return;
			state.previewError = errorMessage(error);
		} finally {
			if (generation === previewGeneration && dialogIdentity === state.identity) {
				state.previewing = false;
				if (previewController === controller) previewController = null;
				if (previewPendingKey === requestKey) previewPendingKey = "";
				render();
			}
		}
	}

	// Auto-start a freshly created task: rebind the agent when the user picked
	// something other than the resolved default, then send the start prompt as
	// the first message so the task begins running.
	async function startCreatedTask(workspaceId: string, resourceId: string): Promise<void> {
		const fallback = dependencies.defaultTaskBinding(state.projectId);
		const selected = state.startBinding.name ? state.startBinding : fallback;
		if (selected.name && !sameBinding(selected, fallback)) {
			await dependencies.request(`/api/workspaces/${workspaceId}/resources/${encodeURIComponent(resourceId)}/agent-binding`, {
				method: "PUT",
				body: JSON.stringify({ kind: selected.kind, name: selected.name })
			});
		}
		const text = state.startPrompt.trim() || DEFAULT_TASK_START_PROMPT;
		await dependencies.request(`/api/workspaces/${workspaceId}/resources/${encodeURIComponent(resourceId)}/messages`, {
			method: "POST",
			body: JSON.stringify({ text, role: "user", sender: { name: dependencies.currentUserName() } })
		});
	}

	async function submit(next: CreateDraft): Promise<void> {
		if (!state.open || state.submitting) return;
		syncDraft(next);
		const workspaceId = dependencies.workspaceId();
		const dialogIdentity = state.identity;
		state.submitting = true;
		render();
		try {
			let resourceId = "";
			if (state.type === "project") {
				const created = await dependencies.request<CreatedResource>(`/api/workspaces/${workspaceId}/projects`, {
					method: "POST",
					body: JSON.stringify({ description: state.description, slug: state.slug })
				});
				resourceId = createdResourceId(created);
				dependencies.toast("Project created.");
			} else {
				if (state.templateName && !state.templateDigest) {
					await refreshPreview(draft());
					if (!state.templateDigest) throw new Error(state.previewError || "Could not render the selected template.");
				}
				const created = await dependencies.request<CreatedResource>(`/api/workspaces/${workspaceId}/tasks`, { method: "POST", body: JSON.stringify(createTaskRequest(state)) });
				resourceId = createdResourceId(created);
				if (state.startAfterCreate) {
					try {
						await startCreatedTask(workspaceId, resourceId);
						dependencies.toast("Task created and started.");
					} catch (error) {
						dependencies.toast(`Task created, but auto-start failed: ${errorMessage(error)}`);
					}
				} else {
					dependencies.toast("Task created.");
				}
			}
			if (workspaceId !== dependencies.workspaceId() || state.identity !== dialogIdentity) return;
			state.open = false;
			const completedDialogIdentity = ++identity;
			state.identity = completedDialogIdentity;
			await dependencies.reloadTree();
			if (workspaceId === dependencies.workspaceId() && state.identity === completedDialogIdentity) await dependencies.selectResource(resourceId);
		} catch (error) {
			if (state.identity === dialogIdentity) {
				state.submitting = false;
				render();
				dependencies.toast(errorMessage(error));
			}
		}
	}

	return { open, close, render, dispose: cancelPreview };
}
