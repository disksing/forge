export interface ModelChannel<T> {
  current(): T;
  publish(value: T): void;
  subscribe(listener: (value: T) => void): () => void;
}

export function createModelChannel<T>(initial: T): ModelChannel<T> {
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
