import { formatCompactNumber, formatCurrency, formatDate } from "@/lib/format";
import type { CampaignResult } from "@/schemas/campaign-result";
import { Badge } from "@/components/ui/badge";
import { StatCard } from "@/components/shared/stat-card";

/**
 * How this campaign actually settled for this creator (reqs #17 and #21).
 *
 * The endpoint answers for any live campaign too, so the heading and the
 * closing line both change on `settled`: while a campaign is running these are
 * running totals, and presenting them as final is how a creator concludes they
 * have been underpaid on a campaign that has not finished counting.
 *
 * Server-rendered like the rest of this screen - it is handed the result the
 * route already fetched.
 */
export function CampaignResultsSummary({ result }: { result: CampaignResult }) {
  return (
    <section className="space-y-inline">
      <div className="gap-inline flex items-center justify-between">
        <h2 className="font-heading font-semibold">Your results</h2>
        <Badge variant={result.settled ? "success" : "secondary"}>
          {result.settled ? "Final" : "Still counting"}
        </Badge>
      </div>

      <div className="gap-inline grid grid-cols-2">
        <StatCard
          label="Your payable views"
          value={formatCompactNumber(result.my_payable_views)}
        />
        <StatCard
          label="You earned"
          value={formatCurrency(result.my_earnings)}
          emphasis
        />
      </div>

      {result.my_entries.length > 0 && <EntryBreakdown entries={result.my_entries} />}

      <ClosingLine result={result} />
    </section>
  );
}

/**
 * The per-entry breakdown: one row per snapshot record, newest first.
 *
 * Three view counts rather than one, because the gap between them is the whole
 * explanation of a payout - raw is what the platform reported, eligible is
 * what cleared the campaign's minimum, payable is what survived its caps.
 */
function EntryBreakdown({ entries }: { entries: CampaignResult["my_entries"] }) {
  return (
    // The table is wider than a 375px screen and must scroll inside its own
    // box rather than making the page scroll sideways.
    <div className="overflow-x-auto rounded-xl border">
      <table className="w-full min-w-[30rem] text-sm">
        <thead>
          <tr className="border-b text-muted-foreground">
            <Th className="text-left">Counted</Th>
            <Th>Raw</Th>
            <Th>Eligible</Th>
            <Th>Payable</Th>
            <Th>Credited</Th>
          </tr>
        </thead>
        <tbody>
          {entries.map((entry) => (
            <tr key={entry.id} className="border-b last:border-0">
              <Td className="text-left whitespace-nowrap">{formatDate(entry.created_at)}</Td>
              <Td muted>{formatCompactNumber(entry.raw_views)}</Td>
              <Td muted>{formatCompactNumber(entry.eligible_views)}</Td>
              <Td>{formatCompactNumber(entry.payable_views)}</Td>
              <Td>
                {formatCurrency(entry.amount_credited)}
                {/* Earned but not yet credited. Saying so beats a row that
                    looks like it paid less than it did. */}
                {entry.earnings_total > entry.amount_credited && (
                  <span className="block text-xs text-muted-foreground">
                    {formatCurrency(entry.earnings_total - entry.amount_credited)} pending
                  </span>
                )}
              </Td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/** What state the campaign's books are in, in one sentence. */
function ClosingLine({ result }: { result: CampaignResult }) {
  if (result.settled) {
    return (
      <p className="text-sm text-muted-foreground">
        Settled {formatDate(result.settled_at)}. The campaign spent{" "}
        {formatCurrency(result.final_spend)} of its{" "}
        {formatCurrency(result.total_budget)} budget
        {result.closed_at && `, with figures frozen ${formatDate(result.closed_at)}`}.
      </p>
    );
  }

  return (
    <p className="text-sm text-muted-foreground">
      These are running totals — they can still change while the campaign is
      tracking views.
    </p>
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
