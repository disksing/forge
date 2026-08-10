import { describe, expect, it, vi } from "vitest";

import { ResourceScope } from "../../src/runtime/resource-scope";

describe("ResourceScope", () => {
  it("releases listeners, timers, animation frames, and custom resources once", () => {
    vi.useFakeTimers();
    const scope = new ResourceScope();
    const listener = vi.fn();
    const cleanup = vi.fn();
    scope.listen(window, "focus", listener);
    scope.interval(listener, 100);
    scope.animationFrame(listener);
    scope.add(cleanup);
    expect(scope.activeCount).toBe(4);

    scope.dispose();
    scope.dispose();
    window.dispatchEvent(new Event("focus"));
    vi.runAllTimers();

    expect(listener).not.toHaveBeenCalled();
    expect(cleanup).toHaveBeenCalledOnce();
    expect(scope.activeCount).toBe(0);
    vi.useRealTimers();
  });
});
