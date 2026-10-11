"use client";

import * as React from "react";
import { ExternalLink, Settings } from "lucide-react";

import {
  formatCompactNumber,
  formatCurrency,
  formatDateTime,
  formatRelative,
  platformLabel,
} from "@/lib/format";
import { submissionDisplayStatus, type Submission } from "@/schemas/submission";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

export function SubmissionInfo({ submission }: { submission: Submission }) {
  const [open, setOpen] = React.useState(false);
  const status = submissionDisplayStatus(submission);

  return (
    <>
      <Button
        variant="secondary"
        size="icon"
        className="rounded-full border-border"
        aria-label="Clip details"
        onClick={() => setOpen(true)}
      >
        <Settings />
      </Button>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="bottom" className="max-h-[92svh] overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Clip details</SheetTitle>
            <SheetDescription>{submission.campaign_name || "Unknown campaign"}</SheetDescription>
          </SheetHeader>

          <div className="space-y-block px-4 pb-6">
            <a
              href={submission.post_url}
              target="_blank"
              rel="noopener noreferrer"
              className="gap-inline p-card card-surface flex items-center justify-between text-sm hover:bg-muted/50"
            >
              <span className="min-w-0">
                <span className="block font-medium">{platformLabel(submission.platform)} post</span>
                <span className="block truncate text-xs text-muted-foreground">
                  {submission.post_url.replace(/^https?:\/\/(www\.)?/, "")}
                </span>
              </span>
              <ExternalLink className="size-4 shrink-0 text-muted-foreground" />
            </a>

            <Group title="Views">
              <Row label="When submitted">
                {submission.starting_views === null
                  ? "Not checked"
                  : formatCompactNumber(submission.starting_views)}
              </Row>
              <Row label="Now">{formatCompactNumber(submission.raw_views)}</Row>
              <Row label="Eligible">{formatCompactNumber(submission.eligible_views)}</Row>
              <Row label="Counted for pay">{formatCompactNumber(submission.payable_views)}</Row>
            </Group>

            <Group title="Money">
              <Row label="Earned">{formatCurrency(submission.earnings)}</Row>
              <Row label="Paid so far">{formatCurrency(submission.credited_amount)}</Row>
              <Row label="Pending">{formatCurrency(submission.pending_amount)}</Row>
            </Group>

            <Group title="Timing">
              <Row label="Submitted">{formatDateTime(submission.submitted_at)}</Row>
              <Row label="Last checked">
                {submission.last_tracked_at ? formatRelative(submission.last_tracked_at) : "Not yet"}
              </Row>
              <Row label="Next check">
                {status === "completed"
                  ? "Finished"
                  : status === "tracking" && submission.next_tracking_at
                    ? formatRelative(submission.next_tracking_at)
                    : "Not scheduled"}
              </Row>
            </Group>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}

function Group({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-inline">
      <h3 className="text-sm font-medium">{title}</h3>
      <dl className="card-surface divide-y text-sm">{children}</dl>
    </section>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="gap-inline px-card flex items-center justify-between py-3">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="text-right font-medium tabular-nums">{children}</dd>
    </div>
  );
}
