import Link from "next/link";
import { Coins, Eye, Timer } from "lucide-react";

import {
  formatCompactNumber,
  formatCurrency,
  formatRelative,
  platformLabel,
} from "@/lib/format";
import { cn } from "@/lib/utils";
import type { Campaign } from "@/schemas/campaign";
import { CampaignStatusBadge } from "@/components/campaigns/campaign-status-badge";

/**
 * The unit of the campaigns tab. Answers, in order: what is it, what does it
 * pay, how long is left, is it still open.
 *
 * CPM is the headline because it is the number creators compare campaigns on;
 * remaining budget sits under it as a bar, since "how much is left" decides
 * whether the CPM is worth chasing.
 */
export function CampaignCard({ campaign }: { campaign: Campaign }) {
  const spent = Math.min(Math.max(campaign.budget_used_percent, 0), 100);

  return (
    <Link
      href={`/dashboard/campaigns/${campaign.id}`}
      className={cn(
        "block overflow-hidden rounded-xl border bg-card transition-colors",
        "hover:border-primary/40 focus-visible:border-primary focus-visible:outline-none",
        !campaign.accepts_submissions && "opacity-75"
      )}
    >
      {campaign.banner_url && (
        // Plain img, not next/image: banner_url points at whatever host the
        // API's storage is configured for (local ./media in dev, GCS or a CDN
        // in production), and next/image would need each one allow-listed.
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={campaign.banner_url}
          alt=""
          className="h-28 w-full object-cover sm:h-36"
          loading="lazy"
        />
      )}

      <div className="space-y-inline p-card">
        <div className="gap-inline flex items-start justify-between">
          <h3 className="font-heading line-clamp-2 font-semibold">{campaign.name}</h3>
          <CampaignStatusBadge campaign={campaign} />
        </div>

        <div className="gap-x-card gap-y-tight flex flex-wrap items-center text-sm">
          <span className="gap-tight flex items-center font-medium">
            <Coins className="size-4 text-primary" />
            {formatCurrency(campaign.cpm)}
            <span className="font-normal text-muted-foreground">/ 1k views</span>
          </span>

          {campaign.minimum_views !== null && (
            <span className="gap-tight flex items-center text-muted-foreground">
              <Eye className="size-4" />
              {formatCompactNumber(campaign.minimum_views)} min
            </span>
          )}

          <span className="gap-tight flex items-center text-muted-foreground">
            <Timer className="size-4" />
            Ends {formatRelative(campaign.ends_at)}
          </span>
        </div>

        <div className="space-y-tight">
          <div
            role="progressbar"
            aria-label="Budget used"
            aria-valuenow={Math.round(spent)}
            aria-valuemin={0}
            aria-valuemax={100}
            className="h-1.5 overflow-hidden rounded-full bg-muted"
          >
            <div className="h-full rounded-full bg-primary" style={{ width: `${spent}%` }} />
          </div>
          <p className="text-xs text-muted-foreground">
            {formatCurrency(campaign.remaining_budget)} of{" "}
            {formatCurrency(campaign.total_budget)} left
          </p>
        </div>

        {campaign.allowed_platforms.length > 0 && (
          <p className="text-xs text-muted-foreground">
            {campaign.allowed_platforms.map(platformLabel).join(" · ")}
          </p>
        )}
      </div>
    </Link>
  );
}
