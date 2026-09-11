"use client";

import * as React from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { ApiError } from "@/lib/api-client";
import { useMeQuery } from "@/hooks/use-auth";
import { Skeleton } from "@/components/ui/skeleton";
import { ErrorPanel } from "@/components/shared/error-panel";
import { Button } from "@/components/ui/button";

/**
 * Route protection, client side.
 *
 * cliptech-admin does this in middleware, but it cannot work here: the session
 * cookie is scoped to the API's host, so this app's server never sees it. (In
 * local dev it would appear to work, because cookies ignore port and both apps
 * are on `localhost` - which is exactly the trap.) So the API is asked
 * directly, and its 401 is the signal.
 *
 * The account can also be suspended or banned while a cookie is still valid;
 * user.CanLogin gates sign-in but not an existing session, so that is checked
 * here rather than left to fail confusingly on the next write.
 *
 * Server-rendered routes do their own check with `handleApiFailure`, which
 * redirects before any HTML is sent. This guard is what covers the tabs that
 * still fetch in the browser.
 */
export function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { data: user, error } = useMeQuery();

  const unauthorised = error instanceof ApiError && error.status === 401;

  React.useEffect(() => {
    if (!unauthorised) return;
    const query = searchParams.toString();
    const next = query ? `${pathname}?${query}` : pathname;
    router.replace(`/login?next=${encodeURIComponent(next)}`);
  }, [unauthorised, router, pathname, searchParams]);

  // Only the redirect blocks. While the session query is still in flight the
  // children render, because holding them back would put every
  // server-rendered route behind a client fetch and undo the point of
  // rendering them on the server - the campaigns screens already proved the
  // session by fetching their data with it. The client-fetched tabs show
  // their own shaped skeletons through QueryState in the meantime.
  if (unauthorised) {
    return <SessionSkeleton />;
  }

  // Anything else - the API is down, CORS is misconfigured - is a real error
  // and must not be silently redirected to a login page that will fail the
  // same way.
  if (error) {
    return (
      <div className="p-4">
        <ErrorPanel
          title="Can't reach ClipTech"
          description="We couldn't load your account. Check your connection and try again."
        >
          <Button variant="outline" size="sm" onClick={() => router.refresh()}>
            Try again
          </Button>
        </ErrorPanel>
      </div>
    );
  }

  if (user && user.status !== "active") {
    return (
      <div className="p-4">
        <ErrorPanel
          title="This account isn't active"
          description={`Your account is ${user.status}. Contact support if you think that's a mistake.`}
        />
      </div>
    );
  }

  return <>{children}</>;
}

/**
 * Shaped like the screen behind it rather than a spinner, so the first paint
 * after sign-in does not visibly jump when the real content lands.
 */
function SessionSkeleton() {
  return (
    <div className="space-y-4 p-4" aria-busy="true">
      <Skeleton className="h-8 w-40" />
      <Skeleton className="h-28 w-full rounded-xl" />
      <Skeleton className="h-28 w-full rounded-xl" />
      <Skeleton className="h-28 w-full rounded-xl" />
    </div>
  );
}
