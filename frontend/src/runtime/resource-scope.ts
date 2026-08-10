export type Cleanup = () => void;

export class ResourceScope {
  private cleanups = new Set<Cleanup>();
  private disposed = false;

  get activeCount(): number {
    return this.cleanups.size;
  }

  add(cleanup: Cleanup): Cleanup {
    if (this.disposed) {
      cleanup();
      return cleanup;
    }
    this.cleanups.add(cleanup);
    return () => {
      if (!this.cleanups.delete(cleanup)) return;
      cleanup();
    };
  }

  listen<K extends keyof WindowEventMap>(target: Window, type: K, listener: (event: WindowEventMap[K]) => void, options?: AddEventListenerOptions | boolean): Cleanup;
  listen<K extends keyof DocumentEventMap>(target: Document, type: K, listener: (event: DocumentEventMap[K]) => void, options?: AddEventListenerOptions | boolean): Cleanup;
  listen(target: Window | Document, type: string, listener: EventListener, options?: AddEventListenerOptions | boolean): Cleanup {
    target.addEventListener(type, listener, options);
    return this.add(() => target.removeEventListener(type, listener, options));
  }

  interval(callback: () => void, delay: number): number {
    const id = window.setInterval(callback, delay);
    this.add(() => window.clearInterval(id));
    return id;
  }

  animationFrame(callback: FrameRequestCallback): number {
    let release: Cleanup = () => undefined;
    const id = window.requestAnimationFrame((time) => {
      release();
      callback(time);
    });
    release = this.add(() => window.cancelAnimationFrame(id));
    return id;
  }

  dispose(): void {
    if (this.disposed) return;
    this.disposed = true;
    for (const cleanup of [...this.cleanups].reverse()) cleanup();
    this.cleanups.clear();
  }
}
