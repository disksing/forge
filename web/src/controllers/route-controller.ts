export interface RouteState {
	workspaceId?: string;
	resourceId?: string;
}

export interface RouteProjection {
	path: string;
	revision: number;
	replace: boolean;
}

function decodePathPart(value = ""): string {
	try {
		return decodeURIComponent(value);
	} catch (_) {
		return "";
	}
}

export function parsePUARoute(pathname: string): RouteState {
	const parts = pathname.split("/").filter(Boolean);
	if (parts[0] !== "w") return {};
	return {
		workspaceId: decodePathPart(parts[1]),
		resourceId: parts[2] === "r" ? decodePathPart(parts[3]) : "workspace"
	};
}

export function puaRoutePath(workspaceId: string, resourceId = ""): string {
	const workspace = String(workspaceId || "").trim();
	if (!workspace) return "";
	const resource = resourceId && resourceId !== "workspace" ? String(resourceId) : "";
	return resource
		? `/w/${encodeURIComponent(workspace)}/r/${encodeURIComponent(resource)}`
		: `/w/${encodeURIComponent(workspace)}`;
}

export function createRouteController(onChange: () => void) {
	let projection: RouteProjection = { path: "", revision: 0, replace: true };

	function project(workspaceId: string, resourceId: string, options: { replace?: boolean } = {}): void {
		const nextPath = puaRoutePath(workspaceId, resourceId);
		if (!nextPath) return;
		if (window.location.pathname === nextPath && projection.path === nextPath) return;
		projection = {
			path: nextPath,
			revision: projection.revision + 1,
			replace: Boolean(options.replace)
		};
		onChange();
	}

	return {
		parse: (pathname = window.location.pathname) => parsePUARoute(pathname),
		project,
		projection: () => ({ ...projection })
	};
}
