import type { CreateDialogModel, CreateDraft, TaskPreview, TaskTemplate } from "../components/models";
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
}

interface CreatedResource {
	id?: unknown;
}

function createdResourceId(result: CreatedResource): string {
	const id = String(result?.id || "").trim();
	if (!id) throw new Error("The created resource did not return an id.");
	return id;
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
		titleOverride: false,
		templateDigest: "",
		preview: null,
		previewing: false,
		previewError: "",
		previewKey: "",
		activeTab: "edit",
		editedMarkdown: null,
		showOptions: false,
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
		title: dialog.templateName ? dialog.titleOverride ? dialog.title : "" : dialog.title,
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
			titleOverride: dialog.titleOverride,
			description: dialog.description,
			detail: dialog.detail,
			slug: dialog.slug,
			activeTab: dialog.activeTab,
			editedMarkdown: dialog.editedMarkdown,
			showOptions: dialog.showOptions
		};
	}

	function stateFromDraft(next: CreateDraft): Partial<CreateDialogState> {
		return {
			...next,
			templateFields: { ...next.templateFields }
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
		if (selectedTemplate && !selectedTemplate.taskTitle && (!state.titleOverride || !state.title.trim())) {
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
				let requestBody: object;
				const editedMarkdown = state.templateName && state.editedMarkdown != null && state.editedMarkdown !== state.preview?.markdown ? state.editedMarkdown : null;
				if (editedMarkdown != null) {
					const editedTitle = String(state.titleOverride ? state.title : state.preview?.title || "").trim();
					if (!editedTitle) throw new Error("Task title is required when creating from edited preview content.");
					requestBody = { project: state.projectId, title: editedTitle, taskMarkdown: editedMarkdown, slug: state.slug };
				} else {
					if (state.templateName && !state.templateDigest) {
						await refreshPreview(draft());
						if (!state.templateDigest) throw new Error(state.previewError || "Could not render the selected template.");
					}
					requestBody = createTaskRequest(state);
				}
				const created = await dependencies.request<CreatedResource>(`/api/workspaces/${workspaceId}/tasks`, { method: "POST", body: JSON.stringify(requestBody) });
				resourceId = createdResourceId(created);
				dependencies.toast("Task created.");
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
