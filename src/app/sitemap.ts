import type { MetadataRoute } from "next";

import { env } from "@/lib/env";
import { LEGAL, LEGAL_DOCUMENTS } from "@/lib/legal";

export default function sitemap(): MetadataRoute.Sitemap {
  const legalUpdated = new Date(`${LEGAL.effectiveDate} UTC`);

  return [
    { url: env.siteUrl, changeFrequency: "weekly", priority: 1 },
    { url: `${env.siteUrl}/for-business`, changeFrequency: "monthly", priority: 0.9 },
    ...LEGAL_DOCUMENTS.map((document) => ({
      url: `${env.siteUrl}${document.href}`,
      lastModified: legalUpdated,
      changeFrequency: "yearly" as const,
      priority: 0.3,
    })),
  ];
}
