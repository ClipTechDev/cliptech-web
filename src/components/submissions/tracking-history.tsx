import { AlertTriangle, LineChart } from "lucide-react";

import { formatCompactNumber, formatCurrency, formatDateTime } from "@/lib/format";
import type { SubmissionLog } from "@/schemas/submission";
import { EmptyState } from "@/components/shared/empty-state";

/**
 * Every reading the tracker has taken of this post (req #22).
 *
 * The point of the screen: a single current view count says nothing about
 * whether a post is still growing, and "why did my earnings stop moving" is
 * only answerable from the history. So each row carries the delta against the
 * reading before it - that column is the whole reason to render a table rather
 * than repeat the numbers already on the card.
 *
 * Readings arrive newest first, which is the right order to read them in and
 * the wrong one to compute deltas from, hence the lookahead.
 */
export function TrackingHistory({ logs }: { logs: SubmissionLog[] }) {
  if (logs.length === 0) {
    return (
      <EmptyState
        icon={LineChart}
        title="No readings yet"
        description="Once this post is approved we check its views on a schedule, and every check shows up here."
      />
    );
  }

  return (
    // Wider than a 375px screen: it scrolls in its own box so the page never
    // scrolls sideways.
    <div className="overflow-x-auto rounded-xl border">
      <table className="w-full min-w-[34rem] text-sm">
        <thead>
          <tr className="border-b text-muted-foreground">
            <Th className="text-left">Checked</Th>
            <Th>Raw views</Th>
            <Th>Payable</Th>
            <Th>Change</Th>
            <Th>Earnings</Th>
          </tr>
        </thead>
        <tbody>
          {logs.map((log, index) => {
            // The next element is the *older* reading, since these are newest
            // first. The oldest row has nothing to compare against.
            const previous = logs[index + 1];
            const delta = previous ? log.payable_views - previous.payable_views : null;

            return (
              <tr key={log.id} className="border-b last:border-0">
                <Td className="text-left whitespace-nowrap">
                  {formatDateTime(log.tracked_at)}
                  {log.fetch_error && (
                    <span className="gap-tight mt-0.5 flex items-center text-xs text-warning">
                      <AlertTriangle className="size-3 shrink-0" />
                      Couldn&apos;t reach the platform
                    </span>
                  )}
                </Td>
                <Td muted>{formatCompactNumber(log.raw_views)}</Td>
                <Td>{formatCompactNumber(log.payable_views)}</Td>
                <Td muted>
                  {delta === null ? (
                    "—"
                  ) : delta > 0 ? (
                    <span className="text-success">
                      +{formatCompactNumber(delta)}
                    </span>
                  ) : (
                    // Zero is the informative case: the post stopped growing.
                    formatCompactNumber(delta)
                  )}
                </Td>
                <Td>{formatCurrency(log.earnings)}</Td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function Th({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <th
      scope="col"
      className={`px-inline py-tight text-right text-xs font-medium ${className ?? ""}`}
    >
      {children}
    </th>
  );
}

function Td({
  className,
  muted = false,
  children,
}: {
  className?: string;
  muted?: boolean;
  children: React.ReactNode;
}) {
  return (
    <td
      className={`px-inline py-tight text-right tabular-nums ${
        muted ? "text-muted-foreground" : "font-medium"
      } ${className ?? ""}`}
    >
      {children}
    </td>
  );
}
