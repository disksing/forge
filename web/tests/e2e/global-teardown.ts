import { rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

export default async function globalTeardown(): Promise<void> {
  const port = Number(process.env.PUA_E2E_PORT || "14936");
  const runtimeDir = join(tmpdir(), `pua-frontend-e2e-${port}`);
  await rm(runtimeDir, { recursive: true, force: true });
}
