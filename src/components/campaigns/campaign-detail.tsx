import Link from "next/link";
import { ArrowLeft, Coins, ExternalLink, Eye, Timer, Wallet } from "lucide-react";

import {
  formatCompactNumber,
  formatCurrency,
  formatDate,
  formatRelative,
  platformLabel,
} from "@/lib/format";
import type { Campaign } from "@/schemas/campaign";
import type { CampaignResult } from "@/schemas/campaign-result";
import type { Platform } from "@/schemas/common";
import { buttonVariants } from "@/components/ui/button";
import { StatCard } from "@/components/shared/stat-card";
import { CampaignStatusBadge } from "@/components/campaigns/campaign-status-badge";
import { CampaignHashtags } from "@/components/campaigns/campaign-hashtags";
import { CampaignResultsSummary } from "@/components/campaigns/campaign-results-summary";
import { SubmitClipForm } from "@/components/campaigns/submit-clip-form";

/**
 * One campaign, in full.
 *
 * A Server Component: it is handed the campaign the route already fetched and
 * renders it, so everything below except the copy button and the submit form's
 * live URL check is plain HTML in the first response.
 *
 * The order answers a creator's questions as they ask them - what it pays,
 * when it ends, what the rules are, then the form to act on all of it.
 */
export function CampaignDetail({
  campaign,
  connectedPlatforms,
  result,
}: {
  campaign: Campaign;
  connectedPlatforms: Platform[] | null;
  /** Null when this creator has not entered the campaign. */
  result: CampaignResult | null;
}) {
  return (
    <article className="space-y-section pb-card pt-6">
      <div className="space-y-block">
        <Link
          href="/dashboard/campaigns"
          className={buttonVariants({ variant: "ghost", size: "lg" })}
        >
          <ArrowLeft />
          Campaigns
        </Link>

        {campaign.banner_url && (
          // Plain img, not next/image: banner_url points at whatever host the
          // API's storage is configured for (local ./media in dev, GCS or a
          // CDN in production), and next/image would need each allow-listed.
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={campaign.banner_url}
            alt=""
            className="h-40 w-full rounded-xl object-cover sm:h-52"
          />
        )}

        <div className="space-y-tight">
          <div className="gap-inline flex items-start justify-between">
            <h1 className="font-heading text-2xl font-semibold tracking-tight text-balance">
              {campaign.name}
            </h1>
            <CampaignStatusBadge campaign={campaign} />
          </div>
          {campaign.description && (
            <p className="text-sm text-pretty text-muted-foreground">
              {campaign.description}
            </p>
          )}
        </div>
      </div>

      <div className="space-y-block">
        <div className="gap-inline grid grid-cols-2">
          <StatCard
            label="Pays"
            value={formatCurrency(campaign.cpm)}
            hint="per 1,000 views"
            emphasis
          />
          <StatCard
            label="Budget left"
            value={formatCurrency(campaign.remaining_budget)}
            hint={`of ${formatCurrency(campaign.total_budget)}`}
          />
          <StatCard
            label="Minimum views"
            value={
              campaign.minimum_views === null
                ? "None"
                : formatCompactNumber(campaign.minimum_views)
            }
          />
          <StatCard
            label="Max per post"
            value={
              campaign.max_payout_per_post === null
                ? "No cap"
                : formatCurrency(campaign.max_payout_per_post)
            }
          />
        </div>

        <dl className="space-y-tight p-card rounded-xl border text-sm">
          <DetailRow icon={Timer} label="Ends">
            {formatDate(campaign.ends_at)}{" "}
            <span className="text-muted-foreground">
              ({formatRelative(campaign.ends_at)})
            </span>
          </DetailRow>
          <DetailRow icon={Coins} label="Started">
            {formatDate(campaign.starts_at)}
          </DetailRow>
          <DetailRow icon={Eye} label="Platforms">
            {campaign.allowed_platforms.length > 0
              ? campaign.allowed_platforms.map(platformLabel).join(", ")
              : "Any"}
          </DetailRow>
          <DetailRow icon={Wallet} label="Budget used">
            {campaign.budget_used_percent.toFixed(0)}%
          </DetailRow>
        </dl>
      </div>

      {result && <CampaignResultsSummary result={result} />}

      {campaign.hashtags.length > 0 && (
        <section className="space-y-inline">
          <CampaignHashtags tags={campaign.hashtags} />
          <ul className="gap-tight flex flex-wrap">
            {campaign.hashtags.map((tag) => (
              <li
                key={tag}
                className="px-tight rounded-md bg-muted py-1 font-mono text-xs text-muted-foreground"
              >
                #{tag}
              </li>
            ))}
          </ul>
          <p className="text-sm text-muted-foreground">
            Include these in your caption for the post to count.
          </p>
        </section>
      )}

      {campaign.rules && (
        <section className="space-y-inline">
          <h2 className="font-heading font-semibold">Rules</h2>
          {/* whitespace-pre-line, not a markdown renderer: the admin writes
              these as plain text in a textarea. */}
          <p className="text-sm whitespace-pre-line text-muted-foreground">
            {campaign.rules}
          </p>
        </section>
      )}

      {campaign.content_links.length > 0 && (
        <section className="space-y-inline">
          <h2 className="font-heading font-semibold">Assets</h2>
          <ul className="space-y-tight">
            {campaign.content_links.map((link) => (
              <li key={link}>
                <a
                  href={link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="gap-tight inline-flex items-center text-sm text-primary hover:underline"
                >
                  <ExternalLink className="size-3.5 shrink-0" />
                  <span className="truncate">{link}</span>
                </a>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="space-y-inline">
        <h2 className="font-heading font-semibold">Submit a clip</h2>
        <SubmitClipForm campaign={campaign} connectedPlatforms={connectedPlatforms} />
      </section>
    </article>
  );
}

function DetailRow({
  icon: Icon,
  label,
  children,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="gap-inline flex items-center justify-between">
      <dt className="gap-tight flex items-center text-muted-foreground">
        <Icon className="size-4" />
        {label}
      </dt>
      <dd className="text-right font-medium">{children}</dd>
    </div>
  );
}
