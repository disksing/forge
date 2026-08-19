import { cp, mkdir, readdir, rm } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";

const frontendDir = fileURLToPath(new URL("..", import.meta.url));
const sourceDir = path.join(frontendDir, "dist", "client");
const targetDir = path.join(frontendDir, "..", "web", "static");

await mkdir(targetDir, { recursive: true });
for (const entry of await readdir(targetDir)) {
  if (entry !== "placeholder.txt") {
    await rm(path.join(targetDir, entry), { recursive: true, force: true });
  }
}
await cp(sourceDir, targetDir, { recursive: true });
