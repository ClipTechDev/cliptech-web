import Link from "next/link";
import { ArrowLeft, ExternalLink } from "lucide-react";

import {
  formatCompactNumber,
  formatCurrency,
  formatRelative,
  platformLabel,
} from "@/lib/format";
import {
  submissionDisplayStatus,
  type Submission,
  type SubmissionDisplayStatus,
  type SubmissionLog,
} from "@/schemas/submission";
import { buttonVariants } from "@/components/ui/button";
import { cardHeroValue } from "@/components/shared/card-surface";
import { RecheckButton } from "@/components/submissions/recheck-button";
import { SubmissionInfo } from "@/components/submissions/submission-info";
import { SubmissionIssues } from "@/components/submissions/submission-issues";
import { SubmissionStatusBadge } from "@/components/submissions/submission-status-badge";
import { TrackingHistory } from "@/components/submissions/tracking-history";

/**
 * One clip. The page answers three things - what state it is in, what it has
 * earned, and what (if anything) needs fixing. The full set of counters and
 * timestamps lives behind the details button.
 */
export function SubmissionDetail({
  submission,
  logs,
}: {
  submission: Submission;
  logs: SubmissionLog[];
}) {
  const status = submissionDisplayStatus(submission);
  const issues = submission.issues ?? [];
  const stopped = status === "rejected" || status === "invalidated";
  const hasProblem =
    Boolean(submission.rejection_reason) || Boolean(submission.invalid_reason) || issues.length > 0;

  return (
    <article className="space-y-section pb-card pt-4">
      <div className="space-y-block">
        <div className="flex items-center justify-between">
          <Link
            href="/dashboard/submissions"
            className={buttonVariants({ variant: "ghost", size: "lg", className: "-ml-2.5" })}
          >
            <ArrowLeft />
            Your clips
          </Link>
          <SubmissionInfo submission={submission} />
        </div>

        <div className="space-y-tight">
          <div className="gap-inline flex items-start justify-between">
            <h1 className="font-heading text-2xl font-semibold tracking-tight text-balance">
              {submission.campaign_name || "Unknown campaign"}
            </h1>
            <SubmissionStatusBadge status={status} />
          </div>

          <p className="gap-inline flex flex-wrap items-center text-sm text-muted-foreground">
            <a
              href={submission.post_url}
              target="_blank"
              rel="noopener noreferrer"
              className="gap-tight inline-flex items-center hover:text-foreground hover:underline"
            >
              View {platformLabel(submission.platform)} post
              <ExternalLink className="size-3.5 shrink-0" />
            </a>
            <Link
              href={`/dashboard/campaigns/${submission.campaign_id}`}
              className="hover:text-foreground hover:underline"
            >
              View campaign
            </Link>
          </p>
        </div>

        <div className="p-card space-y-inline card-surface">
          <p className="leading-none">
            <span className={cardHeroValue}>{formatCurrency(submission.earnings)}</span>
            <span className="ml-1.5 text-sm text-muted-foreground">earned</span>
          </p>

          <dl className="grid grid-cols-2 gap-3 border-t pt-3 text-sm">
            <Fact label="Views counted">{formatCompactNumber(submission.payable_views)}</Fact>
            <Fact label="Paid out">{formatCurrency(submission.credited_amount)}</Fact>
          </dl>

          {submission.pending_amount > 0 && (
            <p className="text-xs text-muted-foreground">
              {formatCurrency(submission.pending_amount)} pending · released after the
              campaign ends
            </p>
          )}
        </div>

        {!stopped && (
          <p className="text-sm text-muted-foreground">{statusLine(status, submission)}</p>
        )}

        {!stopped && submission.starting_views !== null && submission.starting_views > 0 && (
          <p className="text-xs text-muted-foreground">
            This post had {formatCompactNumber(submission.starting_views)} views when you
            submitted it. Only views after that count.
          </p>
        )}
      </div>

      {hasProblem && (
        <section className="space-y-inline">
          <h2 className="font-heading font-semibold">
            {stopped ? "Why this isn't earning" : "Needs your attention"}
          </h2>

          {submission.rejection_reason && (
            <p className="p-card rounded-2xl border border-destructive/30 bg-destructive/5 text-sm">
              {submission.rejection_reason}
            </p>
          )}

          <SubmissionIssues
            issues={issues}
            invalidReason={
              issues.some((issue) => issue.code === submission.invalid_reason)
                ? null
                : submission.invalid_reason
            }
            heading={
              submission.can_recheck ? "Fix this, then re-check the post" : "What went wrong"
            }
          >
            {submission.can_recheck && (
              <RecheckButton submissionId={submission.id} refreshOnSuccess />
            )}
          </SubmissionIssues>
        </section>
      )}

      {logs.length > 0 && (
        <section className="space-y-inline">
          <h2 className="font-heading font-semibold">View checks</h2>
          <TrackingHistory logs={logs} />
        </section>
      )}
    </article>
  );
}

function statusLine(status: SubmissionDisplayStatus, submission: Submission): string {
  switch (status) {
    case "pending":
      return "We're reviewing this clip. It starts earning once it's approved.";
    case "flagged":
      return "Our team is taking a closer look at this clip. You don't need to do anything.";
    case "tracking":
      return submission.next_tracking_at
        ? `We're counting views. Next check ${formatRelative(submission.next_tracking_at)}.`
        : "We're counting views.";
    case "completed":
      return "This campaign has been settled. These numbers are final.";
    default:
      return "Approved. No more view checks are scheduled for this clip.";
  }
}

function Fact({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="min-w-0">
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="truncate font-medium tabular-nums">{children}</dd>
    </div>
  );
}
