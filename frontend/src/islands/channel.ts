export interface IslandChannel<T> {
  current(): T;
  publish(value: T): void;
  subscribe(listener: (value: T) => void): () => void;
}

export function createIslandChannel<T>(initial: T): IslandChannel<T> {
  let value = initial;
  const listeners = new Set<(value: T) => void>();
  return {
    current: () => value,
    publish(next) {
      value = next;
      for (const listener of listeners) listener(next);
    },
    subscribe(listener) {
      listeners.add(listener);
      listener(value);
      return () => listeners.delete(listener);
    },
  };
}
