import type { Metadata } from "next";

import { env } from "@/lib/env";
import { OPEN_GRAPH, SITE } from "@/lib/site";
import { BusinessFaq } from "@/components/business/business-faq";
import { BusinessFooter } from "@/components/business/business-footer";
import { BusinessHero } from "@/components/business/business-hero";
import { BusinessNav } from "@/components/business/business-nav";
import { Categories } from "@/components/business/categories";
import { BUSINESS_FAQ } from "@/components/business/content";
import { CtaBand } from "@/components/business/cta-band";
import { Integrity } from "@/components/business/integrity";
import { Process } from "@/components/business/process";
import { Proof } from "@/components/business/proof";
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
        <Proof />
        <Targeting />
        <Categories />
        <Process />
        <Integrity />
        <WhyUs />
        <CtaBand />
        <BusinessFaq />
        <ProposalForm />
      </main>
      <BusinessFooter />
      <StickyCta />
    </>
  );
}
