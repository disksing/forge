import { describe, expect, it, vi } from "vitest";

import { ApiClient, StaleResponseError } from "../../src/api/client";

interface DeferredResponse {
  promise: Promise<Response>;
  resolve: (response: Response) => void;
}

function deferredResponse(): DeferredResponse {
  let resolve!: (response: Response) => void;
  const promise = new Promise<Response>((done) => {
    resolve = done;
  });
  return { promise, resolve };
}

function jsonResponse(value: unknown, status = 200): Response {
  return new Response(JSON.stringify(value), {
    status,
    headers: { "content-type": "application/json" },
  });
}

describe("ApiClient", () => {
  it.each(["workspace:alpha", "resource:project1.task1", "session:run-1"])(
    "rejects a late response for %s",
    async (scope) => {
      const first = deferredResponse();
      const second = deferredResponse();
      const fetchImpl = vi.fn<typeof fetch>()
        .mockReturnValueOnce(first.promise)
        .mockReturnValueOnce(second.promise);
      const client = new ApiClient(fetchImpl);

      const stale = client.latest<{ id: string }>("/first", { scope });
      const current = client.latest<{ id: string }>("/second", { scope });
      second.resolve(jsonResponse({ id: "current" }));
      await expect(current).resolves.toEqual({ id: "current" });
      first.resolve(jsonResponse({ id: "stale" }));
      await expect(stale).rejects.toBeInstanceOf(StaleResponseError);
    },
  );

  it("normalizes structured API failures", async () => {
    const client = new ApiClient(vi.fn<typeof fetch>().mockResolvedValue(jsonResponse({
      error: "resource is locked",
      code: "resource_locked",
    }, 409)));

    const result = client.request("/resource");
    await expect(result).rejects.toMatchObject({
      name: "ApiError",
      message: "resource is locked",
      status: 409,
      code: "resource_locked",
    });
  });

  it("preserves Headers values while adding the JSON accept default", async () => {
    const fetchImpl = vi.fn<typeof fetch>().mockResolvedValue(jsonResponse({ ok: true }));
    const client = new ApiClient(fetchImpl);

    await client.request("/headers", { headers: new Headers({ "x-request-id": "request-1" }) });

    const headers = fetchImpl.mock.calls[0]?.[1]?.headers;
    expect(new Headers(headers).get("accept")).toBe("application/json");
    expect(new Headers(headers).get("x-request-id")).toBe("request-1");
  });

  it("returns null for an empty successful response", async () => {
    const client = new ApiClient(vi.fn<typeof fetch>().mockResolvedValue(new Response(null, { status: 204 })));

    await expect(client.request<null>("/empty")).resolves.toBeNull();
  });
});
