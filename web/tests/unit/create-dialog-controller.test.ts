import { describe, expect, it, vi } from "vitest";

import type { CreateDialogModel, CreateDraft, TaskPreview, TaskTemplate } from "../../src/components/models";
import { createCreateDialogController } from "../../src/controllers/create-dialog-controller";

const template: TaskTemplate = {
	name: "feature",
	title: "Feature",
	valid: true,
	taskTitle: "{{ summary }}",
	fields: [{ name: "summary", label: "Summary", type: "text", required: true }],
};

interface RequestRecord {
	path: string;
	init?: RequestInit;
}

function harness(responder: (path: string, init?: RequestInit) => unknown | Promise<unknown> = (path) => path.endsWith("/projects") ? { id: "project2" } : { id: "project1.task1" }) {
	let published: CreateDialogModel | undefined;
	const requests: RequestRecord[] = [];
	const reloadTree = vi.fn().mockResolvedValue(undefined);
	const selectResource = vi.fn().mockResolvedValue(undefined);
	const controller = createCreateDialogController({
		workspaceId: () => "workspace-a",
		templates: () => [template],
		request: async <T>(path: string, init?: RequestInit): Promise<T> => {
			requests.push({ path, init });
			return await responder(path, init) as T;
		},
		publish: (model) => { published = model; },
		toast: vi.fn(),
		reloadTree,
		selectResource,
		onOpen: vi.fn(),
		onIconsChanged: vi.fn(),
		confirmTemplateSwitch: async () => true,
	});
	return {
		controller,
		requests,
		reloadTree,
		selectResource,
		current: () => {
			if (!published) throw new Error("dialog was not published");
			return published;
		},
	};
}

function body(record: RequestRecord): Record<string, unknown> {
	return JSON.parse(String(record.init?.body || "{}"));
}

describe("CreateDialogController", () => {
	it("maps Project drafts to the Project API without Task-only fields", async () => {
		const test = harness();
		test.controller.open("project");
		const created = { ...test.current().draft, description: "New workspace project", slug: "new-project" };
		await test.current().onSubmit(created);

		expect(test.requests).toHaveLength(1);
		expect(test.requests[0].path).toBe("/api/workspaces/workspace-a/projects");
		expect(body(test.requests[0])).toEqual({ description: "New workspace project", slug: "new-project" });
		expect(test.reloadTree).toHaveBeenCalledOnce();
		expect(test.selectResource).toHaveBeenCalledWith("project2");
	});

	it("renders a template before submit and sends the complete Task payload", async () => {
		const preview: TaskPreview = { title: "Generated title", markdown: "# Generated title\n", template: { digest: "sha256:template" } };
		const test = harness((path) => path.endsWith("/preview") ? preview : { id: "project1.task1" });
		test.controller.open("task", "project1");
		const next: CreateDraft = {
			...test.current().draft,
			templateName: "feature",
			templateFields: { summary: "Generated title" },
			slug: "generated-title",
		};

		await test.current().onSubmit(next);

		expect(test.requests.map((record) => record.path)).toEqual([
			"/api/workspaces/workspace-a/tasks/preview",
			"/api/workspaces/workspace-a/tasks",
		]);
		expect(body(test.requests[1])).toEqual({
			project: "project1",
			title: "",
			templateName: "feature",
			templateFields: { summary: "Generated title" },
			expectedTemplateDigest: "sha256:template",
			slug: "generated-title",
		});
		expect(test.selectResource).toHaveBeenCalledWith("project1.task1");
	});

	it("submits edited preview Markdown with its generated title", async () => {
		const preview: TaskPreview = { title: "Generated title", markdown: "# Generated title\n", template: { digest: "sha256:template" } };
		const test = harness((path) => path.endsWith("/preview") ? preview : { id: "project1.task1" });
		test.controller.open("task", "project1");
		const rendered = { ...test.current().draft, templateName: "feature", templateFields: { summary: "Generated title" } };
		await test.current().onPreview(rendered);
		await test.current().onSubmit({ ...rendered, editedMarkdown: "# Hand edited\n" });

		expect(body(test.requests.at(-1)!)).toEqual({
			project: "project1",
			title: "Generated title",
			taskMarkdown: "# Hand edited\n",
			slug: "",
		});
		expect(test.selectResource).toHaveBeenCalledWith("project1.task1");
	});

	it("deduplicates Task submission while the first request is pending", async () => {
		let resolveRequest: ((value: unknown) => void) | undefined;
		const test = harness(() => new Promise((resolve) => { resolveRequest = resolve; }));
		test.controller.open("task", "project1");
		const next = { ...test.current().draft, title: "Only once", detail: "Pending request" };

		const first = test.current().onSubmit(next);
		const second = test.current().onSubmit(next);
		expect(test.requests).toHaveLength(1);
		resolveRequest?.({ id: "project1.task1" });
		await Promise.all([first, second]);
		expect(test.requests).toHaveLength(1);
	});

	it("aborts superseded preview work and rejects its late response", async () => {
		const pending: Array<{ resolve: (preview: TaskPreview) => void }> = [];
		const test = harness((path) => {
			if (!path.endsWith("/preview")) return {};
			return new Promise<TaskPreview>((resolve) => pending.push({ resolve }));
		});
		test.controller.open("task", "project1");
		const firstDraft = { ...test.current().draft, templateName: "feature", templateFields: { summary: "older" } };
		const first = test.current().onPreview(firstDraft);
		await Promise.resolve();
		const firstSignal = test.requests[0].init?.signal;
		const secondDraft = { ...firstDraft, templateFields: { summary: "newer" } };
		const second = test.current().onPreview(secondDraft);
		await Promise.resolve();

		expect(firstSignal?.aborted).toBe(true);
		pending[1].resolve({ title: "Newer", markdown: "# Newer\n" });
		await second;
		expect(test.current().preview?.title).toBe("Newer");
		pending[0].resolve({ title: "Older", markdown: "# Older\n" });
		await first;
		expect(test.current().preview?.title).toBe("Newer");
	});
});
