import type { Metadata } from "next";

import { CampaignBrowser } from "@/components/landing/campaign-browser";
import { CreatorHero } from "@/components/landing/creator-hero";
import { FAQ_QUESTIONS } from "@/components/landing/faq-data";
import { LandingNav } from "@/components/landing/landing-nav";
import { Reasons } from "@/components/landing/reasons";
import { Steps } from "@/components/landing/steps";
import { Updates } from "@/components/landing/updates";
import { Value } from "@/components/landing/value";
import { CtaBand } from "@/components/marketing/cta-band";
import { FaqSection } from "@/components/marketing/faq-section";
import { Proof } from "@/components/marketing/proof";
import { SiteFooter } from "@/components/marketing/site-footer";
import { serverFetch } from "@/lib/api-server";
import { OPEN_GRAPH, landingJsonLd } from "@/lib/site";

export const metadata: Metadata = {
  alternates: { canonical: "/" },
  openGraph: { ...OPEN_GRAPH, url: "/" },
};

const STATS = [
  { value: "100M+", label: "Combined followers across the network" },
  { value: "500+", label: "Active pages and creators" },
  { value: "250M+", label: "Campaign views delivered" },
  { value: "10+", label: "Major brands and platforms" },
] as const;

export default async function LandingPage() {
  const signedIn = await serverFetch("/users/me")
    .then(() => true)
    .catch(() => false);

  const cta = signedIn
    ? { ctaHref: "/dashboard", ctaLabel: "Go to dashboard" }
    : { ctaHref: "/login", ctaLabel: "Start earning" };

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
        <CreatorHero {...cta} />
        <Proof stats={STATS} label="Campaigns from brands and platforms like" />
        <Value />
        <Steps />
        <CampaignBrowser />
        <Reasons />
        <Updates />
        <CtaBand
          eyebrow="Start today"
          title="Your next post could be paid."
          description="Free to join. Connect your accounts and pick your first campaign in minutes."
          href={
            signedIn
              ? "/dashboard/campaigns"
              : "/login?next=%2Fdashboard%2Fcampaigns"
          }
          label={signedIn ? "Browse campaigns" : "Start earning"}
        />
        <FaqSection
          items={FAQ_QUESTIONS}
          description="Everything you need to know about joining ClipTech."
        />
      </main>
      <SiteFooter
        tagline="Get paid for the views your page already gets."
        crossLink={{ href: "/for-business", label: "For brands" }}
      />
    </>
  );
}
