import type { ApiErrorResponse } from "./types";

export class ApiError extends Error {
  readonly status: number;
  readonly code?: string;
  readonly body?: ApiErrorResponse;

  constructor(status: number, message: string, body?: ApiErrorResponse) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = body?.code;
    this.body = body;
  }
}

export class StaleResponseError extends Error {
  readonly scope: string;

  constructor(scope: string) {
    super(`Ignored a stale response for ${scope}`);
    this.name = "StaleResponseError";
    this.scope = scope;
  }
}

interface RequestTicket {
  scope: string;
  generation: number;
  controller: AbortController;
}

export class RequestCoordinator {
  private generation = 0;
  private readonly active = new Map<string, RequestTicket>();

  begin(scope: string): RequestTicket {
    this.abort(scope);
    const ticket = {
      scope,
      generation: ++this.generation,
      controller: new AbortController(),
    };
    this.active.set(scope, ticket);
    return ticket;
  }

  assertCurrent(ticket: RequestTicket): void {
    const current = this.active.get(ticket.scope);
    if (current?.generation !== ticket.generation) {
      throw new StaleResponseError(ticket.scope);
    }
  }

  finish(ticket: RequestTicket): void {
    const current = this.active.get(ticket.scope);
    if (current?.generation === ticket.generation) {
      this.active.delete(ticket.scope);
    }
  }

  abort(scope: string): void {
    const current = this.active.get(scope);
    if (!current) return;
    this.active.delete(scope);
    current.controller.abort(new StaleResponseError(scope));
  }

  dispose(): void {
    for (const ticket of this.active.values()) {
      ticket.controller.abort(new StaleResponseError(ticket.scope));
    }
    this.active.clear();
  }
}

export interface LatestRequestOptions extends RequestInit {
  scope: string;
}

export class ApiClient {
  readonly requests = new RequestCoordinator();
  private readonly fetchImpl: typeof fetch;
  private readonly baseURL: string;

  constructor(fetchImpl?: typeof fetch, baseURL = "") {
    this.fetchImpl = fetchImpl ?? globalThis.fetch.bind(globalThis);
    this.baseURL = baseURL;
  }

  async request<T>(path: string, init: RequestInit = {}): Promise<T> {
    const response = await this.fetchImpl(this.resolve(path), {
      ...init,
      headers: apiHeaders(init.headers),
    });
    return this.decode<T>(response);
  }

  async latest<T>(path: string, options: LatestRequestOptions): Promise<T> {
    const { scope, ...init } = options;
    const ticket = this.requests.begin(scope);
    try {
      const response = await this.fetchImpl(this.resolve(path), {
        ...init,
        headers: apiHeaders(init.headers),
        signal: ticket.controller.signal,
      });
      const value = await this.decode<T>(response);
      this.requests.assertCurrent(ticket);
      return value;
    } catch (error) {
      if (ticket.controller.signal.aborted && !(error instanceof StaleResponseError)) {
        throw new StaleResponseError(scope);
      }
      throw error;
    } finally {
      this.requests.finish(ticket);
    }
  }

  dispose(): void {
    this.requests.dispose();
  }

  private resolve(path: string): string {
    if (!this.baseURL || /^https?:\/\//.test(path)) return path;
    return new URL(path, this.baseURL).toString();
  }

  private async decode<T>(response: Response): Promise<T> {
    if (response.status === 204) return null as T;
    const contentType = response.headers.get("content-type") ?? "";
    const body = contentType.includes("application/json")
      ? ((await response.json()) as unknown)
      : await response.text();
    if (!response.ok) {
      const errorBody = isApiErrorResponse(body) ? body : undefined;
      const message = errorBody?.error || (typeof body === "string" && body) || response.statusText || `HTTP ${response.status}`;
      throw new ApiError(response.status, message, errorBody);
    }
    return body as T;
  }
}

function isApiErrorResponse(value: unknown): value is ApiErrorResponse {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function apiHeaders(init?: HeadersInit): Headers {
  const headers = new Headers(init);
  if (!headers.has("Accept")) headers.set("Accept", "application/json");
  return headers;
}
