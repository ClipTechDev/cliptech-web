"use client";

import Link from "next/link";
import { ChevronRight, Clapperboard, FileText } from "lucide-react";

import {
  formatCompactNumber,
  formatCurrency,
  platformLabel,
} from "@/lib/format";
import { cn } from "@/lib/utils";
import { useCampaignClipsQuery } from "@/hooks/use-campaign-tracking";
import { useUiStore } from "@/stores/ui-store";
import { campaignFinished, type Campaign } from "@/schemas/campaign";
import { Button } from "@/components/ui/button";
import { CampaignStatusBadge } from "@/components/campaigns/campaign-status-badge";

function timeLeft(campaign: Campaign): { label: string; value: string } {
  const now = Date.now();
  const starts = new Date(campaign.starts_at).getTime();
  const ends = new Date(campaign.ends_at).getTime();

  if (starts > now) return { label: "Starts in", value: duration(starts - now) };
  if (ends <= now || campaignFinished(campaign)) return { label: "Left", value: "Ended" };
  return { label: "Left", value: duration(ends - now) };
}

function duration(ms: number): string {
  const hours = Math.floor(ms / 3_600_000);
  if (hours >= 24) return `${Math.floor(hours / 24)}d`;
  if (hours >= 1) return `${hours}h`;
  return `${Math.max(1, Math.floor(ms / 60_000))}m`;
}

export function MyCampaignCard({ campaign }: { campaign: Campaign }) {
  const openSubmit = useUiStore((state) => state.openSubmit);
  const clipsQuery = useCampaignClipsQuery(campaign.id);

  const clips = clipsQuery.data ?? [];
  const loading = clipsQuery.isPending;
  const earned = clips.reduce((total, clip) => total + clip.earnings, 0);
  const views = clips.reduce((total, clip) => total + clip.payable_views, 0);
  const budgetLeft = Math.round(
    100 - Math.min(Math.max(campaign.budget_used_percent, 0), 100)
  );
  const left = timeLeft(campaign);
  const href = `/dashboard/campaigns/${campaign.id}`;

  const limits = [
    campaign.minimum_views !== null &&
      `Min. views per post: ${formatCompactNumber(campaign.minimum_views)}`,
    campaign.max_payout_per_post !== null &&
      `Up to ${formatCurrency(campaign.max_payout_per_post)} per post`,
  ].filter(Boolean);

  return (
    <article className={cn("p-card space-y-block card-surface", campaignFinished(campaign) && "opacity-80")}>
      <div className="gap-inline flex items-center">
        {campaign.banner_url ? (
          // Plain img: banner_url host is whatever the API storage uses.
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={campaign.banner_url}
            alt=""
            className="size-12 shrink-0 rounded-xl object-cover"
            loading="lazy"
          />
        ) : (
          <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-primary/15 font-heading text-lg font-bold text-primary">
            {campaign.name.trim().charAt(0).toUpperCase() || "C"}
          </div>
        )}
        <div className="min-w-0 flex-1">
          <h3 className="font-heading truncate font-semibold">
            <Link href={href} className="hover:underline">
              {campaign.name}
            </Link>
          </h3>
          <div className="gap-tight flex items-center">
            {campaign.allowed_platforms.length > 0 && (
              <p className="truncate text-xs text-muted-foreground">
                {campaign.allowed_platforms.map(platformLabel).join(" · ")}
              </p>
            )}
            <CampaignStatusBadge campaign={campaign} />
          </div>
        </div>
      </div>

      <div className="space-y-0.5">
        <p className="font-medium">Earn {formatCurrency(campaign.cpm)} per 1,000 views</p>
        {limits.length > 0 && (
          <p className="text-xs text-muted-foreground">{limits.join(" · ")}</p>
        )}
      </div>

      <dl className="grid grid-cols-2 gap-2">
        <Stat label="Earned">{loading ? "…" : formatCurrency(earned)}</Stat>
        <Stat label="Views">{loading ? "…" : formatCompactNumber(views)}</Stat>
        <Stat label={left.label}>{left.value}</Stat>
        <Stat label="Budget left">{budgetLeft}%</Stat>
      </dl>

      <div className="space-y-2">
        <RowLink href={href} icon={FileText}>
          Rules and requirements
        </RowLink>
        <RowLink href={`${href}#your-clips`} icon={Clapperboard}>
          My clips{!loading && ` (${clips.length})`}
        </RowLink>
      </div>

      {campaign.accepts_submissions && (
        <Button size="xl" className="w-full" onClick={() => openSubmit(campaign.id)}>
          Submit a clip
        </Button>
      )}
    </article>
  );
}

function Stat({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border px-3 py-2.5">
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="font-heading mt-0.5 text-lg font-bold tabular-nums">{children}</dd>
    </div>
  );
}

function RowLink({
  href,
  icon: Icon,
  children,
}: {
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="gap-inline flex h-12 items-center rounded-xl bg-muted/60 px-4 text-sm font-medium transition-colors hover:bg-muted"
    >
      <Icon className="size-4 shrink-0 text-muted-foreground" />
      <span className="min-w-0 flex-1 truncate">{children}</span>
      <ChevronRight className="size-4 shrink-0 text-muted-foreground" />
    </Link>
  );
}
