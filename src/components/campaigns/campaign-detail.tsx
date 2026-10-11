import Link from "next/link";
import { ArrowLeft, ChevronDown, ExternalLink } from "lucide-react";

import {
  formatCompactNumber,
  formatCurrency,
  formatDate,
  formatRelative,
  platformLabel,
} from "@/lib/format";
import { campaignFinished, mentionEntries, type Campaign } from "@/schemas/campaign";
import type { CampaignResult } from "@/schemas/campaign-result";
import type { Platform } from "@/schemas/common";
import { buttonVariants } from "@/components/ui/button";
import { cardHeroValue } from "@/components/shared/card-surface";
import { CampaignStatusBadge } from "@/components/campaigns/campaign-status-badge";
import { CampaignHashtags } from "@/components/campaigns/campaign-hashtags";
import { CampaignTracking } from "@/components/campaigns/campaign-tracking";
import {
  CampaignJoin,
  CampaignManage,
  CampaignSubmit,
} from "@/components/campaigns/campaign-join";

/**
 * One campaign.
 *
 * A Server Component: it is handed the campaign the route already fetched.
 * The page shows one thing to do at a time - join, or submit - and keeps
 * everything about managing a membership behind the settings button.
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
  const finished = campaignFinished(campaign);
  const now = new Date();
  const upcoming = new Date(campaign.starts_at) > now;
  const over = new Date(campaign.ends_at) < now;
  const left = Math.round(100 - Math.min(Math.max(campaign.budget_used_percent, 0), 100));
  const mentions = mentionEntries(campaign);
  const phrases = campaign.caption_phrases ?? [];
  const hasRequirements =
    campaign.hashtags.length > 0 || mentions.length > 0 || phrases.length > 0;

  const limits = [
    campaign.minimum_views !== null &&
      `Pays after ${formatCompactNumber(campaign.minimum_views)} views`,
    campaign.max_payout_per_post !== null &&
      `Up to ${formatCurrency(campaign.max_payout_per_post)} per post`,
  ].filter(Boolean);

  return (
    <article className="space-y-section pb-card pt-4">
      <div className="space-y-block">
        <div className="flex items-center justify-between">
          <Link
            href="/dashboard/campaigns"
            className={buttonVariants({ variant: "ghost", size: "lg", className: "-ml-2.5" })}
          >
            <ArrowLeft />
            Campaigns
          </Link>
          <CampaignManage campaign={campaign} />
        </div>

        {campaign.banner_url && (
          // Plain img, not next/image: banner_url points at whatever host the
          // API's storage is configured for (local ./media in dev, GCS or a
          // CDN in production), and next/image would need each allow-listed.
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={campaign.banner_url}
            alt=""
            className="h-40 w-full rounded-2xl object-cover sm:h-56"
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

        <div className="p-card space-y-inline card-surface">
          <p className="leading-none">
            <span className={cardHeroValue}>{formatCurrency(campaign.cpm)}</span>
            <span className="ml-1.5 text-sm text-muted-foreground">per 1k views</span>
          </p>

          {campaign.allowed_platforms.length > 0 && (
            <p className="text-sm text-muted-foreground">
              {campaign.allowed_platforms.map(platformLabel).join(" · ")}
            </p>
          )}

          <dl className="grid grid-cols-2 gap-3 border-t pt-3 text-sm">
            {upcoming ? (
              <Fact label="Starts">{formatRelative(campaign.starts_at)}</Fact>
            ) : over ? (
              <Fact label="Ended">{formatDate(campaign.ends_at)}</Fact>
            ) : (
              <Fact label="Ends">{formatRelative(campaign.ends_at)}</Fact>
            )}
            <Fact label="Budget left">
              <span className={left <= 20 && !finished ? "text-amber-500" : undefined}>{left}%</span>
            </Fact>
          </dl>

          {limits.length > 0 && (
            <p className="text-xs text-muted-foreground">{limits.join(" · ")}</p>
          )}
        </div>

        <CampaignJoin campaign={campaign} />
      </div>

      <CampaignSubmit campaign={campaign} connectedPlatforms={connectedPlatforms} />

      <CampaignTracking campaignId={campaign.id} initialResult={result} />

      {!finished && hasRequirements && (
        <section className="space-y-inline">
          <h2 className="font-heading font-semibold">What your post needs</h2>
          <div className="card-surface divide-y">
            {campaign.hashtags.length > 0 && (
              <div className="p-card">
                <CampaignHashtags tags={campaign.hashtags} />
              </div>
            )}
            {mentions.length > 0 && (
              <Requirement title="Mention in your caption">
                {mentions.map(([platform, handle]) => (
                  <Chip key={platform}>
                    <span className="font-mono">@{handle}</span> on {platformLabel(platform)}
                  </Chip>
                ))}
              </Requirement>
            )}
            {phrases.length > 0 && (
              <Requirement title="Text in your caption">
                {phrases.map((phrase) => (
                  <Chip key={phrase}>&ldquo;{phrase}&rdquo;</Chip>
                ))}
              </Requirement>
            )}
          </div>
        </section>
      )}

      {!finished && campaign.content_links.length > 0 && (
        <section className="space-y-inline">
          <h2 className="font-heading font-semibold">Assets</h2>
          <ul className="card-surface divide-y">
            {campaign.content_links.map((link) => (
              <li key={link}>
                <a
                  href={link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="gap-inline px-card flex items-center justify-between py-3 text-sm hover:bg-muted/50"
                >
                  <span className="truncate">{link.replace(/^https?:\/\/(www\.)?/, "")}</span>
                  <ExternalLink className="size-4 shrink-0 text-muted-foreground" />
                </a>
              </li>
            ))}
          </ul>
        </section>
      )}

      {campaign.rules && (
        <details className="group card-surface">
          <summary className="p-card flex cursor-pointer list-none items-center justify-between font-heading font-semibold [&::-webkit-details-marker]:hidden">
            Rules
            <ChevronDown className="size-4 text-muted-foreground transition-transform group-open:rotate-180" />
          </summary>
          {/* whitespace-pre-line, not a markdown renderer: the admin writes
              these as plain text in a textarea. */}
          <p className="px-card pb-card text-sm whitespace-pre-line text-muted-foreground">
            {campaign.rules}
          </p>
        </details>
      )}

    </article>
  );
}

function Fact({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="min-w-0">
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="truncate font-medium">{children}</dd>
    </div>
  );
}

function Requirement({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="p-card space-y-tight">
      <p className="text-sm font-medium">{title}</p>
      <ul className="gap-tight flex flex-wrap">{children}</ul>
    </div>
  );
}

function Chip({ children }: { children: React.ReactNode }) {
  return (
    <li className="px-tight rounded-md bg-muted py-1 text-xs text-muted-foreground">
      {children}
    </li>
  );
}
