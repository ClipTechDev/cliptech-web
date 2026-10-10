import type { Metadata } from "next";

import { Calculator } from "@/components/landing/calculator";
import { CampaignsCta } from "@/components/landing/campaigns-cta";
import { Faq } from "@/components/landing/faq";
import { Features } from "@/components/landing/features";
import { Hero } from "@/components/landing/hero";
import { HowItWorks } from "@/components/landing/how-it-works";
import { LandingFooter } from "@/components/landing/landing-footer";
import { LandingNav } from "@/components/landing/landing-nav";
import { Updates } from "@/components/landing/updates";
import { serverFetch } from "@/lib/api-server";
import { OPEN_GRAPH, landingJsonLd } from "@/lib/site";

export const metadata: Metadata = {
  alternates: { canonical: "/" },
  openGraph: { ...OPEN_GRAPH, url: "/" },
};

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

  const cta = signedIn
    ? { ctaHref: "/dashboard", ctaLabel: "Go to dashboard" }
    : { ctaHref: "/login", ctaLabel: "Get Started" };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(landingJsonLd()).replace(/</g, "\\u003c"),
        }}
      />
      <LandingNav {...cta} />
      <main className="overflow-x-clip">
        <Hero {...cta} />
        <HowItWorks />
        <Features />
        <Calculator />
        <CampaignsCta
          href={signedIn ? "/dashboard/campaigns" : "/login?next=%2Fdashboard%2Fcampaigns"}
        />
        <Updates />
        <Faq />
      </main>
      <LandingFooter {...cta} />
    </>
  );
}
