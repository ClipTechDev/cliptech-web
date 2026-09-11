"use client";

import Link from "next/link";
import { ChevronRight, ExternalLink, Loader2, RefreshCw } from "lucide-react";
import { toast } from "sonner";

import {
  formatCompactNumber,
  formatCurrency,
  formatRelative,
  platformLabel,
} from "@/lib/format";
import { useRevalidateSubmissionMutation } from "@/hooks/use-submissions";
import {
  canRevalidate,
  submissionDisplayStatus,
  type Submission,
} from "@/schemas/submission";
import { Button } from "@/components/ui/button";
import { errorMessage } from "@/components/shared/query-state";
import { SubmissionStatusBadge } from "@/components/submissions/submission-status-badge";

/**
 * One posted clip. The three numbers that matter are payable views, what they
 * have earned, and how much of that is still pending - raw views are shown for
 * context but are not what pays.
 */
export function SubmissionCard({ submission }: { submission: Submission }) {
  const revalidate = useRevalidateSubmissionMutation();
  const recoverable = canRevalidate(submission);

  const status = submissionDisplayStatus(submission);

  return (
    <article className="space-y-inline p-card rounded-xl border bg-card">
      <div className="gap-inline flex items-start justify-between">
        <div className="min-w-0 space-y-0.5">
          {/* The campaign leads, because "which campaign was this for" is the
              first thing a creator scanning their clips is looking for - and
              it doubles as the way into the detail screen, where the tracking
              history lives. */}
          <Link
            href={`/dashboard/submissions/${submission.id}`}
            className="gap-tight flex items-center text-sm font-medium hover:underline"
          >
            <span className="truncate">
              {submission.campaign_name || "Unknown campaign"}
            </span>
            <ChevronRight className="size-3.5 shrink-0 text-muted-foreground" />
          </Link>
          <a
            href={submission.post_url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex max-w-full items-center gap-1 text-xs text-muted-foreground hover:text-foreground hover:underline"
          >
            <span className="shrink-0">{platformLabel(submission.platform)}</span>
            <span aria-hidden>·</span>
            <span className="truncate">{submission.post_url}</span>
            <ExternalLink className="size-3 shrink-0" />
          </a>
        </div>
        <SubmissionStatusBadge status={status} />
      </div>

      <div className="gap-tight grid grid-cols-3 text-sm">
        <Metric label="Payable views" value={formatCompactNumber(submission.payable_views)} />
        <Metric label="Earned" value={formatCurrency(submission.earnings)} />
        <Metric
          label="Pending"
          value={formatCurrency(submission.pending_amount)}
          muted={submission.pending_amount === 0}
        />
      </div>

      {/* The single most-asked question about this screen: why the payable
          count is lower than the number on the post itself. starting_views is
          the answer, and it is only worth saying when it is not zero - a post
          submitted at zero views has nothing to explain. */}
      {submission.starting_views > 0 && (
        <p className="text-xs text-muted-foreground">
          Had {formatCompactNumber(submission.starting_views)} views when you
          submitted — only views after that count.
        </p>
      )}

      {submission.rejection_reason && (
        <p className="text-xs text-destructive">{submission.rejection_reason}</p>
      )}

      {submission.invalid_reason && (
        <div className="space-y-2">
          <p className="text-xs text-destructive">
            Invalidated: {submission.invalid_reason.replace(/_/g, " ")}
          </p>
          {recoverable && (
            <Button
              variant="outline"
              size="sm"
              disabled={revalidate.isPending}
              onClick={() =>
                revalidate.mutate(submission.id, {
                  onSuccess: () => toast.success("Submission re-checked"),
                  onError: (error) => toast.error(errorMessage(error)),
                })
              }
            >
              {revalidate.isPending ? <Loader2 className="animate-spin" /> : <RefreshCw />}
              Try again
            </Button>
          )}
        </div>
      )}

      <p className="text-xs text-muted-foreground">
        Posted {formatRelative(submission.submitted_at)}
        {submission.last_tracked_at &&
          ` · views checked ${formatRelative(submission.last_tracked_at)}`}
      </p>
    </article>
  );
}

function Metric({
  label,
  value,
  muted = false,
}: {
  label: string;
  value: string;
  muted?: boolean;
}) {
  return (
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className={`font-medium tabular-nums ${muted ? "text-muted-foreground" : ""}`}>
        {value}
      </p>
    </div>
  );
}
