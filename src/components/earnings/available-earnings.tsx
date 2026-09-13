"use client";

import Link from "next/link";

import { formatCurrency, formatDate } from "@/lib/format";
import { useTransactionsInfiniteQuery } from "@/hooks/use-transactions";
import { metadataString, transactionTitle, type Transaction } from "@/schemas/transaction";
import { LedgerTable, type LedgerRow } from "@/components/earnings/ledger-table";

const COLUMNS = ["Date", "Post", "Campaign/Description", "Amount"];

function PostLink({ transaction }: { transaction: Transaction }) {
  const submissionId = metadataString(transaction, "submission_id");
  if (!submissionId) return <span className="text-muted-foreground">—</span>;

  return (
    <Link
      href={`/dashboard/submissions/${submissionId}`}
      className="text-primary underline-offset-4 hover:underline"
    >
      View clip
    </Link>
  );
}

export function AvailableEarnings() {
  const {
    data,
    error,
    isPending,
    refetch,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
  } = useTransactionsInfiniteQuery("earning");

  const earnings = data?.pages.flatMap((page) => page.transactions) ?? [];

  const rows: LedgerRow[] = earnings.map((transaction) => {
    const amount = `+${formatCurrency(transaction.amount)}`;
    const campaign = metadataString(transaction, "campaign_name") ?? "Campaign earnings";

    return {
      id: transaction.id,
      cells: [
        formatDate(transaction.created_at),
        <PostLink key="post" transaction={transaction} />,
        <span key="campaign" className="truncate">
          {campaign}
        </span>,
        <span key="amount" className="text-success">
          {amount}
        </span>,
      ],
      mobile: {
        title: transactionTitle(transaction),
        meta: formatDate(transaction.created_at),
        amount: <span className="text-success">{amount}</span>,
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
      emptyTitle="No available earnings"
      emptyDescription="Submit clips to campaigns and start earning!"
      hasNextPage={hasNextPage}
      isFetchingNextPage={isFetchingNextPage}
      onLoadMore={() => void fetchNextPage()}
    />
  );
}
