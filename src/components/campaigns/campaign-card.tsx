"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";

import { formatCurrency, formatRelative, humanise, platformLabel } from "@/lib/format";
import { cn } from "@/lib/utils";
import { useMyMembershipsQuery } from "@/hooks/use-campaign-membership";
import { membershipBadge } from "@/schemas/membership";
import { campaignClosedReason, campaignFinished, type Campaign } from "@/schemas/campaign";
import { cardHeroValue, cardInteractive, cardSurface } from "@/components/shared/card-surface";
import { Badge } from "@/components/ui/badge";

export function CampaignCard({ campaign }: { campaign: Campaign }) {
  const memberships = useMyMembershipsQuery();
  const membership = membershipBadge(memberships.data ?? [], campaign.id);

  const open = campaign.accepts_submissions;
  const upcoming = !open && new Date(campaign.starts_at) > new Date();
  const left = Math.round(100 - Math.min(Math.max(campaign.budget_used_percent, 0), 100));
  const closedReason = campaignClosedReason(campaign) ?? humanise(campaign.status);

  const chip = membership ? (
    <Badge variant={membership === "Joined" ? "success" : "secondary"}>{membership}</Badge>
  ) : open ? (
    <Badge variant="success">Open</Badge>
  ) : (
    <Badge variant="secondary">{closedReason}</Badge>
  );

  return (
    <Link
      href={`/dashboard/campaigns/${campaign.id}`}
      className={cn(
        "group block overflow-hidden",
        cardSurface,
        cardInteractive,
        campaignFinished(campaign) && "opacity-70"
      )}
    >
      {campaign.banner_url ? (
        <div className="relative">
          {/* Plain img: banner_url host is whatever the API storage uses. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={campaign.banner_url}
            alt=""
            className="h-32 w-full object-cover sm:h-40"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-card/90 via-transparent to-transparent" />
          <div className="absolute top-3 left-3">{chip}</div>
        </div>
      ) : (
        <div className="px-4 pt-4">{chip}</div>
      )}

      <div className="space-y-3 p-4">
        <div className="space-y-0.5">
          <h3 className="font-heading line-clamp-2 text-base leading-snug font-semibold">
            {campaign.name}
          </h3>
          {campaign.allowed_platforms.length > 0 && (
            <p className="text-xs text-muted-foreground">
              {campaign.allowed_platforms.map(platformLabel).join(" · ")}
            </p>
          )}
        </div>

        <div className="flex items-end justify-between gap-3">
          <p className="leading-none">
            <span className={cardHeroValue}>
              {formatCurrency(campaign.cpm)}
            </span>
            <span className="ml-1.5 text-xs text-muted-foreground">per 1k views</span>
          </p>
          <ChevronRight className="size-5 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
        </div>

        {upcoming && (
          <p className="text-xs text-muted-foreground">
            Starts {formatRelative(campaign.starts_at)}
          </p>
        )}

        {open && (
          <div className="flex items-center justify-between gap-3 text-xs text-muted-foreground">
            <span>Ends {formatRelative(campaign.ends_at)}</span>
            <span className={cn(left <= 20 && "font-medium text-amber-500")}>
              {left <= 20 ? `Only ${left}% budget left` : `${left}% budget left`}
            </span>
          </div>
        )}
      </div>
    </Link>
  );
}
