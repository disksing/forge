export type IslandCleanup = () => void | Promise<void>;
export type IslandMount = (target: HTMLElement) => IslandCleanup;

const mounted = new Map<string, IslandCleanup>();

export async function replaceIsland(name: string, target: HTMLElement, mount: IslandMount): Promise<void> {
  await unmountIsland(name);
  target.replaceChildren();
  mounted.set(name, mount(target));
}

export async function unmountIsland(name: string): Promise<void> {
  const cleanup = mounted.get(name);
  if (!cleanup) return;
  mounted.delete(name);
  await cleanup();
}

export async function unmountAllIslands(): Promise<void> {
  const names = [...mounted.keys()].reverse();
  for (const name of names) await unmountIsland(name);
}

export function mountedIslandCount(): number {
  return mounted.size;
}
