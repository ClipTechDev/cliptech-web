import type { MetadataRoute } from "next";

import { env } from "@/lib/env";
import { LEGAL_DOCUMENTS } from "@/lib/legal";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: env.siteUrl, changeFrequency: "weekly", priority: 1 },
    ...LEGAL_DOCUMENTS.map((document) => ({
      url: `${env.siteUrl}${document.href}`,
      changeFrequency: "yearly" as const,
      priority: 0.3,
    })),
  ];
}
