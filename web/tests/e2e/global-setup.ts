const port = Number(process.env.FORGE_E2E_PORT || "14936");
const baseURL = `http://127.0.0.1:${port}`;
// The e2e server script (scripts/frontend-e2e-server) always runs its
// workspace under a runtime directory named after this marker. Playwright may
// reuse whatever already listens on the port (reuseExistingServer), so verify
// the responding forge instance actually belongs to this e2e run instead of
// silently running tests against an unrelated local forge instance.
const runtimeDirMarker = `forge-frontend-e2e-${port}`;

interface workspacesPayload {
  workspaces?: Array<{ id?: string; path?: string }>;
}

export default async function globalSetup(): Promise<void> {
  let response: Response;
  try {
    response = await fetch(`${baseURL}/api/workspaces`);
  } catch (reason) {
    throw new Error(
      `forge e2e server at ${baseURL} is not reachable after Playwright reported it ready: ${reason instanceof Error ? reason.message : String(reason)}`,
    );
  }
  if (!response.ok) {
    throw new Error(`forge e2e server at ${baseURL} answered /api/workspaces with HTTP ${response.status}; refusing to run e2e tests against an unrecognized instance.`);
  }
  const payload = (await response.json()) as workspacesPayload;
  const paths = (payload.workspaces ?? []).map((workspace) => workspace.path ?? "");
  if (paths.some((path) => path.includes(runtimeDirMarker))) return;
  throw new Error([
    `Port ${port} is occupied by a forge instance that does not belong to this e2e run.`,
    `Expected a workspace path containing "${runtimeDirMarker}", but ${baseURL}/api/workspaces reports: ${paths.join(", ") || "(no workspaces)"}.`,
    `Playwright would reuse that unrelated instance (reuseExistingServer) and run tests against stale assets and state.`,
    `Pick a free port instead, for example:`,
    `  FORGE_E2E_PORT=<free-port> npm run test:e2e`,
  ].join("\n"));
}
