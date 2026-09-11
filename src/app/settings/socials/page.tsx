import { Suspense } from "react";

import { SocialCallback } from "@/components/profile/social-callback";

/**
 * Where cliptech-api sends a creator back after an OAuth round trip.
 *
 * The path is server-configured (FRONTEND_URL + SOCIAL_CONNECT_REDIRECT_PATH,
 * defaulting to /settings/socials), so this route exists at that exact path
 * rather than under /dashboard - which means the app works against an
 * unmodified API .env. It reads the result off the query string, says what
 * happened, and forwards to the profile tab where the connections live.
 */
export default function SocialCallbackPage() {
  return (
    <main className="flex min-h-[100svh] items-center justify-center px-6">
      <Suspense fallback={<p className="text-sm text-muted-foreground">Finishing up…</p>}>
        <SocialCallback />
      </Suspense>
    </main>
  );
}
