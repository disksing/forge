export type ComponentCleanup = () => void | Promise<void>;
export type ComponentMount = (target: HTMLElement) => ComponentCleanup;

const mounted = new Map<string, ComponentCleanup>();

export async function replaceComponent(name: string, target: HTMLElement, mount: ComponentMount): Promise<void> {
  await unmountComponent(name);
  target.replaceChildren();
  mounted.set(name, mount(target));
}

export async function unmountComponent(name: string): Promise<void> {
  const cleanup = mounted.get(name);
  if (!cleanup) return;
  mounted.delete(name);
  await cleanup();
}

export async function unmountAllComponents(): Promise<void> {
  const names = [...mounted.keys()].reverse();
  for (const name of names) await unmountComponent(name);
}

export function mountedComponentCount(): number {
  return mounted.size;
}
