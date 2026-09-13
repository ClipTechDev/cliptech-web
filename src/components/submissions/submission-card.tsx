"use client";

import * as React from "react";
import Link from "next/link";
import { ChevronRight, ExternalLink } from "lucide-react";

import {
  formatCompactNumber,
  formatCurrency,
  formatRelative,
  platformLabel,
} from "@/lib/format";
import { submissionDisplayStatus, type Submission } from "@/schemas/submission";
import { RecheckButton } from "@/components/submissions/recheck-button";
import { SubmissionIssues } from "@/components/submissions/submission-issues";
import { SubmissionStatusBadge } from "@/components/submissions/submission-status-badge";

export const SubmissionCard = React.memo(function SubmissionCard({
  submission,
}: {
  submission: Submission;
}) {
  const status = submissionDisplayStatus(submission);

  return (
    <article className="space-y-inline p-card rounded-xl border bg-card">
      <div className="gap-inline flex items-start justify-between">
        <div className="min-w-0 space-y-0.5">
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

      {submission.starting_views > 0 && (
        <p className="text-xs text-muted-foreground">
          Had {formatCompactNumber(submission.starting_views)} views when you
          submitted — only views after that count.
        </p>
      )}

      {submission.rejection_reason && (
        <p className="text-xs text-destructive">{submission.rejection_reason}</p>
      )}

      <SubmissionIssues
        issues={submission.issues}
        invalidReason={submission.invalid_reason}
      >
        {submission.can_recheck && (
          <RecheckButton submissionId={submission.id} size="sm" />
        )}
      </SubmissionIssues>

      <p className="text-xs text-muted-foreground">
        Posted {formatRelative(submission.submitted_at)}
        {submission.last_tracked_at &&
          ` · views checked ${formatRelative(submission.last_tracked_at)}`}
      </p>
    </article>
  );
});

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
