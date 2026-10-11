import { AlertTriangle } from "lucide-react";

import { formatCompactNumber, formatCurrency, formatDateTime } from "@/lib/format";
import type { SubmissionLog } from "@/schemas/submission";

/**
 * Every reading the tracker has taken of this post (req #22).
 *
 * A single current view count says nothing about whether a post is still
 * growing, so each row leads with the change against the reading before it.
 *
 * Readings arrive newest first, which is the right order to read them in and
 * the wrong one to compute deltas from, hence the lookahead.
 */
export function TrackingHistory({ logs }: { logs: SubmissionLog[] }) {
  return (
    <ul className="card-surface divide-y">
      {logs.map((log, index) => {
        // The next element is the *older* reading, since these are newest
        // first. The oldest row has nothing to compare against.
        const previous = logs[index + 1];
        const delta = previous ? log.payable_views - previous.payable_views : null;

        return (
          <li key={log.id} className="gap-inline px-card flex items-center justify-between py-3">
            <div className="min-w-0 space-y-0.5">
              <p className="text-sm font-medium tabular-nums">
                {formatCompactNumber(log.payable_views)} views
                {delta !== null && delta > 0 && (
                  <span className="ml-1.5 text-success">+{formatCompactNumber(delta)}</span>
                )}
                {delta === 0 && (
                  <span className="ml-1.5 font-normal text-muted-foreground">no change</span>
                )}
              </p>
              <p className="text-xs text-muted-foreground">{formatDateTime(log.tracked_at)}</p>
              {log.fetch_error && (
                <p className="gap-tight flex items-center text-xs text-warning">
                  <AlertTriangle className="size-3 shrink-0" />
                  Couldn&apos;t reach the platform
                </p>
              )}
            </div>
            <p className="shrink-0 text-sm font-medium tabular-nums">
              {formatCurrency(log.earnings)}
            </p>
          </li>
        );
      })}
    </ul>
  );
}
