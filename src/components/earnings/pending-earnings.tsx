"use client";

import Link from "next/link";

import { formatCurrency, formatDate, platformLabel } from "@/lib/format";
import type { ListParams } from "@/lib/list-params";
import { useSubmissionsInfiniteQuery } from "@/hooks/use-submissions";
import { LedgerTable, type LedgerRow } from "@/components/earnings/ledger-table";

const COLUMNS = ["Date", "Post", "Campaign", "Amount"];

/**
 * Pending is not a ledger: nothing has been credited yet, so the rows come
 * from the submissions still owed money, not from /transactions.
 *
 * `payment_status=pending` is the server's own `earnings > credited_amount`,
 * which is exactly `pending_amount > 0` - so the filtering happens in SQL and
 * every page that comes back is full of rows worth showing. Filtering here
 * instead would leave "load more" paging through mostly-empty results.
 */
const OWED: ListParams = { search: "", filters: { payment_status: "pending" } };

export function PendingEarnings() {
  const {
    data,
    error,
    isPending,
    refetch,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
  } = useSubmissionsInfiniteQuery(OWED);

  const owed = data?.pages.flatMap((page) => page.submissions) ?? [];

  const rows: LedgerRow[] = owed.map((submission) => {
    const amount = formatCurrency(submission.pending_amount);
    const campaign = submission.campaign_name || "Campaign";

    return {
      id: submission.id,
      cells: [
        formatDate(submission.submitted_at),
        <Link
          key="post"
          href={`/dashboard/submissions/${submission.id}`}
          className="text-primary underline-offset-4 hover:underline"
        >
          {platformLabel(submission.platform)}
        </Link>,
        <span key="campaign" className="truncate">
          {campaign}
        </span>,
        amount,
      ],
      mobile: {
        title: campaign,
        meta: `${platformLabel(submission.platform)} · ${formatDate(submission.submitted_at)}`,
        amount,
      },
    };
  });

  return (
    <LedgerTable
      columns={COLUMNS}
      rows={rows}
      isLoading={isPending}
      error={error}
      onRetry={() => void refetch()}
      emptyTitle="No pending earnings"
      emptyDescription="Submit clips to campaigns and start earning!"
      hasNextPage={hasNextPage}
      isFetchingNextPage={isFetchingNextPage}
      onLoadMore={() => void fetchNextPage()}
    />
  );
}
