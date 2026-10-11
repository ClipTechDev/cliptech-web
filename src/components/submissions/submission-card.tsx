"use client";

import * as React from "react";
import Link from "next/link";
import { AlertTriangle, ChevronRight } from "lucide-react";

import {
  formatCompactNumber,
  formatCurrency,
  formatRelative,
  humanise,
  platformLabel,
} from "@/lib/format";
import {
  issueCopy,
  submissionDisplayStatus,
  type Submission,
} from "@/schemas/submission";
import { cn } from "@/lib/utils";
import { cardHeroValue, cardInteractive, cardSurface } from "@/components/shared/card-surface";
import { RecheckButton } from "@/components/submissions/recheck-button";
import { SubmissionStatusBadge } from "@/components/submissions/submission-status-badge";

function problemText(submission: Submission): string | null {
  if (submission.rejection_reason) return submission.rejection_reason;
  const issue = (submission.issues ?? [])[0];
  if (issue) return issueCopy(issue).title;
  if (submission.invalid_reason) {
    return `Stopped earning: ${humanise(submission.invalid_reason).toLowerCase()}`;
  }
  return null;
}

export const SubmissionCard = React.memo(function SubmissionCard({
  submission,
}: {
  submission: Submission;
}) {
  const status = submissionDisplayStatus(submission);
  const problem = problemText(submission);

  return (
    <article className={cn("relative space-y-3 p-4", cardSurface, cardInteractive)}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs text-muted-foreground">{platformLabel(submission.platform)}</p>
          <h3 className="font-heading truncate font-semibold">
            <Link
              href={`/dashboard/submissions/${submission.id}`}
              className="after:absolute after:inset-0 after:rounded-2xl focus-visible:outline-none"
            >
              {submission.campaign_name || "Unknown campaign"}
            </Link>
          </h3>
        </div>
        <SubmissionStatusBadge status={status} />
      </div>

      <div className="flex items-end justify-between gap-3">
        <div className="leading-none">
          <span className={cardHeroValue}>
            {formatCurrency(submission.earnings)}
          </span>
          <span className="ml-1.5 text-xs text-muted-foreground">earned</span>
        </div>
        <ChevronRight className="size-5 shrink-0 text-muted-foreground" />
      </div>

      <p className="text-xs text-muted-foreground">
        {formatCompactNumber(submission.payable_views)} views
        {submission.pending_amount > 0 &&
          ` · ${formatCurrency(submission.pending_amount)} pending`}
        {` · Posted ${formatRelative(submission.submitted_at)}`}
      </p>

      {problem && (
        <div className="flex items-center justify-between gap-3 rounded-lg bg-destructive/10 px-3 py-2">
          <p
            className="flex min-w-0 items-center gap-2 text-xs text-destructive"
          >
            <AlertTriangle className="size-3.5 shrink-0" />
            <span className="line-clamp-2">{problem}</span>
          </p>
          {submission.can_recheck && (
            <span className="relative z-10 shrink-0">
              <RecheckButton submissionId={submission.id} size="sm" />
            </span>
          )}
        </div>
      )}
    </article>
  );
});
