import Link from "next/link";
import { ArrowLeft, ExternalLink } from "lucide-react";

import {
  formatCompactNumber,
  formatCurrency,
  formatDateTime,
  formatRelative,
  humanise,
  platformLabel,
} from "@/lib/format";
import {
  canRevalidate,
  submissionDisplayStatus,
  type Submission,
  type SubmissionLog,
} from "@/schemas/submission";
import { buttonVariants } from "@/components/ui/button";
import { StatCard } from "@/components/shared/stat-card";
import { RevalidateButton } from "@/components/submissions/revalidate-button";
import { SubmissionStatusBadge } from "@/components/submissions/submission-status-badge";
import { TrackingHistory } from "@/components/submissions/tracking-history";

/**
 * One clip, in full (req #22).
 *
 * The listing card answers "where did this land". This screen answers "how did
 * it get there", which is the tracking history.
 */
export function SubmissionDetail({
  submission,
  logs,
}: {
  submission: Submission;
  logs: SubmissionLog[];
}) {
  const status = submissionDisplayStatus(submission);

  return (
    <article className="space-y-section pb-card">
      <div className="space-y-block">
        <Link
          href="/dashboard/submissions"
          className={buttonVariants({ variant: "ghost", size: "lg" })}
        >
          <ArrowLeft />
          Your clips
        </Link>

        <div className="space-y-tight">
          <div className="gap-inline flex items-start justify-between">
            <h1 className="font-heading text-2xl font-semibold tracking-tight text-balance">
              {submission.campaign_name || "Unknown campaign"}
            </h1>
            <SubmissionStatusBadge status={status} />
          </div>

          <a
            href={submission.post_url}
            target="_blank"
            rel="noopener noreferrer"
            className="gap-tight inline-flex max-w-full items-center text-sm text-muted-foreground hover:text-foreground hover:underline"
          >
            <span className="shrink-0">{platformLabel(submission.platform)}</span>
            <span aria-hidden>·</span>
            <span className="truncate">{submission.post_url}</span>
            <ExternalLink className="size-3.5 shrink-0" />
          </a>
        </div>
      </div>

      <div className="space-y-block">
        <div className="gap-inline grid grid-cols-2">
          <StatCard
            label="Payable views"
            value={formatCompactNumber(submission.payable_views)}
          />
          <StatCard
            label="Earned"
            value={formatCurrency(submission.earnings)}
            emphasis
          />
          <StatCard
            label="Paid so far"
            value={formatCurrency(submission.credited_amount)}
          />
          <StatCard
            label="Pending"
            value={formatCurrency(submission.pending_amount)}
            hint={submission.pending_amount === 0 ? "all credited" : "not yet credited"}
          />
        </div>

        <dl className="space-y-tight p-card rounded-xl border text-sm">
          <DetailRow label="Views when submitted">
            {formatCompactNumber(submission.starting_views)}
          </DetailRow>
          <DetailRow label="Views now">
            {formatCompactNumber(submission.raw_views)}
          </DetailRow>
          <DetailRow label="Eligible views">
            {formatCompactNumber(submission.eligible_views)}
          </DetailRow>
          <DetailRow label="Submitted">
            {formatDateTime(submission.submitted_at)}
          </DetailRow>
          <DetailRow label="Last checked">
            {submission.last_tracked_at
              ? formatRelative(submission.last_tracked_at)
              : "Not yet"}
          </DetailRow>
          <DetailRow label="Next check">
            {status === "completed"
              ? "Finished"
              : submission.next_tracking_at
                ? formatRelative(submission.next_tracking_at)
                : "Not scheduled"}
          </DetailRow>
        </dl>

        {/* The gap between raw and payable is the question this screen exists
            to answer, so it is stated rather than left to be inferred from
            two numbers in a list. */}
        {submission.starting_views > 0 && (
          <p className="text-sm text-muted-foreground">
            This post already had {formatCompactNumber(submission.starting_views)} views
            when you submitted it. Only the views it gained afterwards count towards
            this campaign.
          </p>
        )}
      </div>

      {(submission.rejection_reason || submission.invalid_reason) && (
        <section className="space-y-inline">
          <h2 className="font-heading font-semibold">Why this isn&apos;t earning</h2>

          {submission.rejection_reason && (
            <p className="p-card rounded-xl border border-destructive/30 bg-destructive/5 text-sm">
              {submission.rejection_reason}
            </p>
          )}

          {submission.invalid_reason && (
            <div className="space-y-inline p-card rounded-xl border border-destructive/30 bg-destructive/5">
              <p className="text-sm">
                Invalidated: {humanise(submission.invalid_reason).toLowerCase()}
                {submission.invalidated_at &&
                  ` on ${formatDateTime(submission.invalidated_at)}`}
                .
              </p>
              {canRevalidate(submission) && (
                <>
                  <p className="text-sm text-muted-foreground">
                    Reconnect the account this was posted from on the Profile tab,
                    then re-check it.
                  </p>
                  <RevalidateButton submissionId={submission.id} />
                </>
              )}
            </div>
          )}
        </section>
      )}

      <section className="space-y-inline">
        <h2 className="font-heading font-semibold">Tracking history</h2>
        <TrackingHistory logs={logs} />
      </section>
    </article>
  );
}

function DetailRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="gap-inline flex items-center justify-between">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="text-right font-medium tabular-nums">{children}</dd>
    </div>
  );
}
