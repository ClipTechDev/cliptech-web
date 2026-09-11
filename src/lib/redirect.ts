/**
 * Guards the `?next=` parameter.
 *
 * Without this, `/login?next=https://evil.example` would turn the sign-in
 * screen into an open redirect. Only a single-slash absolute path is accepted:
 * "//host" is a protocol-relative URL to another origin, which is exactly what
 * a naive `startsWith("/")` lets through.
 */
export function safeNextPath(next: string | null | undefined, fallback = "/dashboard"): string {
  if (!next) return fallback;
  if (!next.startsWith("/") || next.startsWith("//")) return fallback;
  return next;
}
