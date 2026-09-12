"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";

import {
  formatCompactNumber,
  formatCurrency,
  formatRelative,
  platformLabel,
} from "@/lib/format";
import {
  useCampaignClipsQuery,
  useCampaignResultQuery,
} from "@/hooks/use-campaign-tracking";
import { hasCampaignResult, type CampaignResult } from "@/schemas/campaign-result";
import { submissionDisplayStatus, type Submission } from "@/schemas/submission";
import { Badge } from "@/components/ui/badge";
import { StatCard } from "@/components/shared/stat-card";
import { RefreshButton } from "@/components/shared/refresh-button";
import { CampaignResultsBreakdown } from "@/components/campaigns/campaign-results-breakdown";
import { SubmissionStatusBadge } from "@/components/submissions/submission-status-badge";

export function CampaignTracking({
  campaignId,
  initialResult,
}: {
  campaignId: string;
  initialResult: CampaignResult | null;
}) {
  const resultQuery = useCampaignResultQuery(campaignId, initialResult);
  const clipsQuery = useCampaignClipsQuery(campaignId);

  const result =
    resultQuery.data && hasCampaignResult(resultQuery.data) ? resultQuery.data : null;
  const clips = clipsQuery.data ?? [];

  if (clips.length === 0 && !result) return null;

  const settled = resultQuery.data?.settled ?? false;
  const trackedViews = clips.reduce((total, clip) => total + clip.payable_views, 0);
  const earned = clips.reduce((total, clip) => total + clip.earnings, 0);
  const pending = clips.reduce((total, clip) => total + clip.pending_amount, 0);

  return (
    <section className="space-y-block">
      <div className="gap-inline flex flex-wrap items-center justify-between">
        <h2 className="font-heading font-semibold">Your results</h2>
        <div className="gap-inline flex items-center">
          <Badge variant={settled ? "success" : "secondary"}>
            {settled ? "Final" : "Still counting"}
          </Badge>
          <RefreshButton
            onRefresh={() => {
              void resultQuery.refetch();
              void clipsQuery.refetch();
            }}
            isRefreshing={resultQuery.isFetching || clipsQuery.isFetching}
            updatedAt={clipsQuery.dataUpdatedAt}
          />
        </div>
      </div>

      {clips.length > 0 && (
        <div className="space-y-inline">
          <div className="gap-inline grid grid-cols-2">
            <StatCard
              label="Views counted"
              value={formatCompactNumber(trackedViews)}
              hint={`across ${clips.length} ${clips.length === 1 ? "clip" : "clips"}`}
            />
            <StatCard
              label="Earned so far"
              value={formatCurrency(earned)}
              hint={
                pending > 0
                  ? `${formatCurrency(pending)} not yet credited`
                  : "all credited"
              }
              emphasis
            />
          </div>

          <ClipRows clips={clips} />
        </div>
      )}

      {result && <CampaignResultsBreakdown result={result} />}
    </section>
  );
}

function ClipRows({ clips }: { clips: Submission[] }) {
  return (
    <ul className="divide-y rounded-xl border">
      {clips.map((clip) => (
        <li key={clip.id}>
          <Link
            href={`/dashboard/submissions/${clip.id}`}
            className="px-card gap-inline flex items-center justify-between py-3 hover:bg-muted/50"
          >
            <div className="space-y-tight min-w-0">
              <div className="gap-tight flex items-center">
                <span className="text-sm font-medium">
                  {platformLabel(clip.platform)}
                </span>
                <SubmissionStatusBadge status={submissionDisplayStatus(clip)} />
              </div>
              <p className="text-xs text-muted-foreground">
                {clip.last_tracked_at
                  ? `Counted ${formatRelative(clip.last_tracked_at)}`
                  : "Not counted yet"}
              </p>
            </div>
            <div className="gap-tight flex shrink-0 items-center">
              <div className="text-right">
                <p className="text-sm font-medium tabular-nums">
                  {formatCompactNumber(clip.payable_views)}
                </p>
                <p className="text-xs tabular-nums text-muted-foreground">
                  {formatCurrency(clip.earnings)}
                </p>
              </div>
              <ChevronRight className="size-4 shrink-0 text-muted-foreground" />
            </div>
          </Link>
        </li>
      ))}
    </ul>
  );
}
