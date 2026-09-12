import { formatCompactNumber, formatCurrency, formatDate } from "@/lib/format";
import type { CampaignResult } from "@/schemas/campaign-result";
import { StatCard } from "@/components/shared/stat-card";

export function CampaignResultsBreakdown({ result }: { result: CampaignResult }) {
  return (
    <div className="space-y-inline">
      <div className="gap-inline grid grid-cols-2">
        <StatCard
          label="Credited views"
          value={formatCompactNumber(result.my_payable_views)}
          hint="cleared a payout threshold"
        />
        <StatCard
          label="Credited to you"
          value={formatCurrency(result.my_earnings)}
          emphasis
        />
      </div>

      {result.my_entries.length > 0 && <EntryBreakdown entries={result.my_entries} />}

      <ClosingLine result={result} />
    </div>
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
