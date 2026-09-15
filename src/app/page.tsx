import { Hero } from "@/components/landing/hero";
import { serverFetch } from "@/lib/api-server";

/**
 * The CTA's destination depends on whether the visitor already has a session:
 * checked here, server-side, so the click goes straight to the right place
 * instead of landing on /dashboard and bouncing to /login once its own
 * session check fails.
 */
export default async function LandingPage() {
  const signedIn = await serverFetch("/users/me")
    .then(() => true)
    .catch(() => false);

  return <Hero ctaHref={signedIn ? "/dashboard" : "/login"} />;
}
