import type { Metadata } from "next";

import { env } from "@/lib/env";
import { OPEN_GRAPH, SITE } from "@/lib/site";
import { BusinessHero } from "@/components/business/business-hero";
import { BusinessNav } from "@/components/business/business-nav";
import { Categories } from "@/components/business/categories";
import { BUSINESS_FAQ, BUSINESS_STATS } from "@/components/business/content";
import { CtaBand } from "@/components/marketing/cta-band";
import { FaqSection } from "@/components/marketing/faq-section";
import { SiteFooter } from "@/components/marketing/site-footer";
import { Integrity } from "@/components/business/integrity";
import { Process } from "@/components/business/process";
import { Proof } from "@/components/marketing/proof";
import { StickyCta } from "@/components/business/sticky-cta";
import { ProposalForm } from "@/components/business/proposal-form";
import { Targeting } from "@/components/business/targeting";
import { WhyUs } from "@/components/business/why-us";

const TITLE =
  "ClipTech for Brands & Agencies: Short-form video distribution at scale";
const DESCRIPTION =
  "Distribute brand content through 500+ social media pages and creators. Performance-based campaigns with niche, language and region targeting, and verified view delivery.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "/for-business" },
  openGraph: {
    ...OPEN_GRAPH,
    url: "/for-business",
    title: TITLE,
    description: DESCRIPTION,
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
  },
};

function jsonLd() {
  const url = `${env.siteUrl}/for-business`;
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Service",
        "@id": `${url}#service`,
        name: "Short-form video distribution",
        serviceType: "Influencer and social media content distribution",
        description: DESCRIPTION,
        url,
        provider: {
          "@type": "Organization",
          name: SITE.name,
          url: env.siteUrl,
        },
        audience: { "@type": "BusinessAudience", name: "Brands and agencies" },
      },
      {
        "@type": "FAQPage",
        "@id": `${url}#faq`,
        mainEntity: BUSINESS_FAQ.map(({ question, answer }) => ({
          "@type": "Question",
          name: question,
          acceptedAnswer: { "@type": "Answer", text: answer },
        })),
      },
    ],
  };
}

export default function ForBusinessPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd()).replace(/</g, "\\u003c"),
        }}
      />
      <BusinessNav />
      <main className="overflow-x-clip">
        <BusinessHero />
        <Proof stats={BUSINESS_STATS} />
        <Targeting />
        <Categories />
        <Process />
        <Integrity />
        <WhyUs />
        <CtaBand
          eyebrow="Let's work together"
          title="Ready to launch your next campaign?"
          description="Share a few details and we'll get back to you with a custom proposal within one business day."
          href="#proposal"
          label="Get a campaign proposal"
        />
        <FaqSection
          items={BUSINESS_FAQ}
          description="Everything you need to know about running campaigns with ClipTech."
        />
        <ProposalForm />
      </main>
      <SiteFooter
        tagline="Short-form content distribution for brands and agencies."
        crossLink={{ href: "/", label: "For creators" }}
      />
      <StickyCta />
    </>
  );
}
