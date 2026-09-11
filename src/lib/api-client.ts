/**
 * Transport shared by every resource in this app.
 *
 * cliptech-api sets its session as an HttpOnly cookie scoped to its own host,
 * and lists this app's origin in ALLOWED_ORIGINS with AllowCredentials on. So
 * unlike cliptech-admin - which proxies through its own origin to keep the API
 * host private - the browser here talks to the API directly and lets the
 * cookie ride along on `credentials: "include"`.
 *
 * The consequence worth knowing: a cookie scoped to the API's host is
 * unreadable from this app's Server Components, so there is no server-side
 * fetcher and no SSR prefetch. Every query runs in the browser. (In dev the
 * two share `localhost` because cookies ignore port, which makes SSR *look*
 * viable right up until the API moves to its own host.)
 *
 * Paths are written the way the API groups them, minus the version prefix:
 * `"/campaigns"`, not `"/v1/campaigns"`.
 */

import { env } from "@/lib/env";

export class ApiError extends Error {
  status: number;
  payload: unknown;

  constructor(message: string, status: number, payload: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.payload = payload;
  }
}

/** Raised when the request never reached the API at all. */
export class NetworkError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "NetworkError";
  }
}

/** Values that survive a round trip through a query string. */
export type QueryValue = string | number | boolean | null | undefined;

export type ApiRequestOptions = Omit<RequestInit, "body"> & {
  body?: unknown;
  /** Appended as a query string; empty, null and undefined values are dropped. */
  query?: Record<string, QueryValue>;
  /**
   * Abort after this many milliseconds. Defaults to none, which is right for
   * ordinary reads; POST /v1/submissions needs a generous one because it calls
   * the social provider inline.
   */
  timeoutMs?: number;
};

/**
 * Serialises a query object, skipping anything the API would read as "no
 * filter" anyway. Dropping empties rather than sending `?search=` keeps query
 * keys stable, which matters because they're also cache identity.
 */
export function buildQuery(query?: Record<string, QueryValue>): string {
  if (!query) return "";

  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) {
    if (value === undefined || value === null || value === "") continue;
    params.set(key, String(value));
  }

  const serialised = params.toString();
  return serialised ? `?${serialised}` : "";
}

/**
 * Turns a Response into either the decoded payload or an ApiError carrying the
 * API's own `message`, which every failure envelope in cliptech-api sets.
 */
export async function parseResponse<T>(response: Response, path: string): Promise<T> {
  if (response.status === 204) {
    return undefined as T;
  }

  const contentType = response.headers.get("content-type") ?? "";
  const payload = contentType.includes("application/json")
    ? await response.json().catch(() => null)
    : await response.text().catch(() => null);

  if (!response.ok) {
    const message =
      (payload && typeof payload === "object" && "message" in payload
        ? String((payload as { message?: unknown }).message)
        : null) ?? `Request to ${path} failed with status ${response.status}`;
    throw new ApiError(message, response.status, payload);
  }

  return payload as T;
}

export async function apiFetch<T>(
  path: string,
  { body, query, headers, timeoutMs, ...init }: ApiRequestOptions = {}
): Promise<T> {
  // A FormData body is passed through untouched: the browser sets its own
  // multipart Content-Type with the boundary, which we must not override, and
  // it must not be JSON-serialised.
  const isMultipart = typeof FormData !== "undefined" && body instanceof FormData;

  let response: Response;
  try {
    response = await fetch(`${env.apiUrl}/v1${path}${buildQuery(query)}`, {
      ...init,
      credentials: "include",
      signal: init.signal ?? (timeoutMs ? AbortSignal.timeout(timeoutMs) : undefined),
      headers: {
        ...(body !== undefined && !isMultipart
          ? { "Content-Type": "application/json" }
          : {}),
        ...headers,
      },
      body:
        body === undefined
          ? undefined
          : isMultipart
            ? (body as FormData)
            : JSON.stringify(body),
    });
  } catch (error) {
    // A cross-origin failure reaches JS as an opaque TypeError with no status
    // - the same shape whether the API is down or ALLOWED_ORIGINS is missing
    // this origin. Name both, because in dev it is nearly always the second.
    if (error instanceof DOMException && error.name === "TimeoutError") {
      throw new NetworkError("The server took too long to respond.");
    }
    throw new NetworkError(
      "Couldn't reach the server. Check that cliptech-api is running and that this origin is listed in its ALLOWED_ORIGINS."
    );
  }

  return parseResponse<T>(response, path);
}
