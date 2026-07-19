/**
 * Base HTTP client. The ONLY place that talks to the network directly.
 *
 * Auth token and 401 handling are injected from the composition root
 * (`main.tsx`) so this layer stays independent of any feature.
 */

const BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3000";

/** Normalized API error carrying the HTTP status and a readable message. */
export class ApiError extends Error {
  readonly status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

let getToken: () => string | null = () => null;
let onUnauthorized: () => void = () => {};

/** Registers how the client reads the current auth token (called at startup). */
export function setAuthTokenGetter(fn: () => string | null): void {
  getToken = fn;
}

/** Registers the 401 handler (e.g. clear the session), called at startup. */
export function setUnauthorizedHandler(fn: () => void): void {
  onUnauthorized = fn;
}

async function request<T>(
  method: string,
  path: string,
  body?: unknown,
): Promise<T> {
  const token = getToken();
  const response = await fetch(`${BASE_URL}${path}`, {
    method,
    headers: {
      ...(body !== undefined ? { "Content-Type": "application/json" } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  if (response.status === 401) {
    onUnauthorized();
  }

  if (!response.ok) {
    throw new ApiError(response.status, await extractMessage(response));
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
}

/** Extracts a human-readable message from an error response body. */
async function extractMessage(response: Response): Promise<string> {
  try {
    const data: unknown = await response.json();
    if (data && typeof data === "object" && "message" in data) {
      const message = (data as { message: unknown }).message;
      return Array.isArray(message) ? message.join(", ") : String(message);
    }
  } catch {
    // Non-JSON body; fall through to the status text.
  }
  return response.statusText || "Request failed";
}

/** Thin verb helpers over {@link request}. */
export const http = {
  get: <T>(path: string) => request<T>("GET", path),
  post: <T>(path: string, body?: unknown) => request<T>("POST", path, body),
  patch: <T>(path: string, body?: unknown) => request<T>("PATCH", path, body),
  del: <T>(path: string) => request<T>("DELETE", path),
};
