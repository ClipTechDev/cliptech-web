import Link from "next/link";
import { Megaphone } from "lucide-react";

import { isFiltered, type ListParams } from "@/lib/list-params";
import type { Campaign } from "@/schemas/campaign";
import type { PageMeta } from "@/schemas/common";
import { buttonVariants } from "@/components/ui/button";
import { EmptyState } from "@/components/shared/empty-state";
import { CampaignCard } from "@/components/campaigns/campaign-card";
import { CampaignPagination } from "@/components/campaigns/campaign-pagination";

/**
 * The result set for one request: cards, or the reason there are none.
 *
 * Purely presentational and server-rendered - it is handed the page the route
 * already fetched, so it never decides what to load. That split is what keeps
 * the page component to "fetch, then compose".
 */
export function CampaignResults({
  campaigns,
  meta,
  params,
  pathname,
}: {
  campaigns: Campaign[];
  meta: PageMeta;
  params: ListParams;
  pathname: string;
}) {
  if (campaigns.length === 0) {
    return isFiltered(params) ? (
      <EmptyState
        icon={Megaphone}
        title="No campaigns match"
        description="Try a different platform, or widen the scope to all campaigns."
        action={
          <Link href={pathname} className={buttonVariants({ variant: "outline", size: "lg" })}>
            Clear filters
          </Link>
        }
      />
    ) : (
      <EmptyState
        icon={Megaphone}
        title="No campaigns yet"
        description="New campaigns show up here as soon as they open. Check back soon."
      />
    );
  }

  return (
    <div>
      <ul className="space-y-inline">
        {campaigns.map((campaign) => (
          <li key={campaign.id}>
            <CampaignCard campaign={campaign} />
          </li>
        ))}
      </ul>

      <CampaignPagination meta={meta} params={params} pathname={pathname} />
    </div>
  );
}
