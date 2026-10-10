import { env } from "@/lib/env";
import { LEGAL } from "@/lib/legal";
import { FAQ_QUESTIONS } from "@/components/landing/faq-data";

export const SITE = {
  name: LEGAL.product,
  title: `${LEGAL.product}: Get paid per view for the clips you post`,
  description:
    "ClipTech is a clipping platform for creators. Join campaigns, post clips on Instagram, TikTok, YouTube or X, and get paid for the views they gain.",
} as const;

export const OPEN_GRAPH = {
  type: "website",
  siteName: SITE.name,
  title: SITE.title,
  description: SITE.description,
  locale: "en_US",
} as const;

export function landingJsonLd() {
  const organizationId = `${env.siteUrl}/#organization`;
  const websiteId = `${env.siteUrl}/#website`;

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": organizationId,
        name: SITE.name,
        url: env.siteUrl,
        logo: `${env.siteUrl}/icon.svg`,
        email: LEGAL.contactEmail,
      },
      {
        "@type": "WebSite",
        "@id": websiteId,
        name: SITE.name,
        url: env.siteUrl,
        description: SITE.description,
        inLanguage: "en",
        publisher: { "@id": organizationId },
      },
      {
        "@type": "WebPage",
        "@id": `${env.siteUrl}/#webpage`,
        url: env.siteUrl,
        name: SITE.title,
        description: SITE.description,
        inLanguage: "en",
        isPartOf: { "@id": websiteId },
        about: { "@id": organizationId },
      },
      {
        "@type": "FAQPage",
        "@id": `${env.siteUrl}/#faq`,
        mainEntity: FAQ_QUESTIONS.map(({ question, answer }) => ({
          "@type": "Question",
          name: question,
          acceptedAnswer: { "@type": "Answer", text: answer },
        })),
      },
    ],
  };
}
