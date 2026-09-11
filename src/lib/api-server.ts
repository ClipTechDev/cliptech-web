/**
 * The server-side half of the transport in `api-client.ts`.
 *
 * Server Components cannot use that one: it relies on the browser attaching
 * the session cookie via `credentials: "include"`, and there is no browser
 * here. So this reads `cliptech_token` off the incoming request with
 * `cookies()` and forwards it upstream by hand.
 *
 * That only works while this app's server can *see* the cookie, which is a
 * deployment fact rather than a code one: the API stamps it with
 * COOKIE_DOMAIN (shared/cookie.go). In dev both apps are on `localhost` and
 * cookies ignore port, so it already works. In production COOKIE_DOMAIN has to
 * be the parent domain of both hosts - `.cliptech.app` for `app.cliptech.app`
 * and `api.cliptech.app` - or the cookie never reaches this server and every
 * render below 401s into the sign-in redirect.
 *
 * Error shapes are deliberately identical to the client's: the same ApiError
 * and NetworkError, so `errorMessage()` and the status checks in QueryState
 * read a server failure exactly as they read a browser one.
 */

import { cookies } from "next/headers";
import { notFound, redirect } from "next/navigation";

import {
  ApiError,
  NetworkError,
  buildQuery,
  parseResponse,
  type ApiRequestOptions,
} from "@/lib/api-client";
import { AUTH_COOKIE_NAME, env } from "@/lib/env";

export async function serverFetch<T>(
  path: string,
  { body, query, headers, timeoutMs, ...init }: ApiRequestOptions = {}
): Promise<T> {
  const token = (await cookies()).get(AUTH_COOKIE_NAME)?.value;

  // No cookie means no session, and every endpoint this app reaches is behind
  // the API's auth middleware. Answering here saves a round trip that could
  // only ever come back 401, and hands callers the same error either way.
  if (!token) {
    throw new ApiError("No session cookie was sent with this request.", 401, null);
  }

  let response: Response;
  try {
    response = await fetch(`${env.apiUrl}/v1${path}${buildQuery(query)}`, {
      ...init,
      headers: {
        ...(body !== undefined ? { "Content-Type": "application/json" } : {}),
        Cookie: `${AUTH_COOKIE_NAME}=${token}`,
        ...headers,
      },
      body: body === undefined ? undefined : JSON.stringify(body),
      signal: init.signal ?? (timeoutMs ? AbortSignal.timeout(timeoutMs) : undefined),
      // Nothing here is cacheable: every response is scoped to one creator's
      // session. Next 16 makes caching opt-in, so this is belt and braces -
      // but it also documents that the omission is deliberate.
      cache: "no-store",
    });
  } catch (error) {
    if (error instanceof DOMException && error.name === "TimeoutError") {
      throw new NetworkError("The server took too long to respond.");
    }
    throw new NetworkError(
      "Couldn't reach the server. Check that cliptech-api is running and that NEXT_PUBLIC_API_URL resolves from this machine."
    );
  }

  return parseResponse<T>(response, path);
}

/**
 * Turns a failed `serverFetch` into the navigation it deserves, so every
 * server-rendered screen answers the two recoverable failures the same way.
 *
 * - 401: the cookie is missing or no longer accepted. There is no refresh
 *   endpoint, so signing in again is the only fix. `next` brings the creator
 *   back to the page they asked for.
 * - 404: a campaign that was archived, or a hand-typed id.
 *
 * Anything else - the API is down, a 500 - is rethrown for the route's error
 * boundary, because it is a real fault and retrying is the right offer.
 *
 * Never call this inside a `try`: `redirect()` and `notFound()` signal by
 * throwing, and a surrounding `catch` would swallow the navigation.
 */
export function handleApiFailure(error: unknown, next: string): never {
  if (error instanceof ApiError) {
    if (error.status === 401) redirect(`/login?next=${encodeURIComponent(next)}`);
    if (error.status === 404) notFound();
  }
  throw error;
}
