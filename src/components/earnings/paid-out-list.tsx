"use client";

import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import { formatCurrency, formatDate } from "@/lib/format";
import {
  useCancelWithdrawalMutation,
  useWithdrawalsInfiniteQuery,
} from "@/hooks/use-withdrawals";
import { payoutMethodLabel } from "@/schemas/payout-method";
import { Button } from "@/components/ui/button";
import { errorMessage } from "@/components/shared/query-state";
import { LedgerTable, type LedgerRow } from "@/components/earnings/ledger-table";
import { WithdrawalStatusBadge } from "@/components/earnings/withdrawal-status-badge";

const COLUMNS = ["Date", "Description", "Payment Method", "Status", "Amount"];

/**
 * Owns its query like the other two tabs rather than being handed rows. The
 * screen above reads the same list to know whether a withdrawal is already in
 * flight; react-query serves both from one cache entry, so this is one
 * request, not two.
 */
export function PaidOutList() {
  const {
    data,
    error,
    isPending,
    refetch,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
  } = useWithdrawalsInfiniteQuery();
  const cancel = useCancelWithdrawalMutation();

  const withdrawals = data?.pages.flatMap((page) => page.withdrawals) ?? [];

  function cancelRequest(id: string) {
    cancel.mutate(id, {
      onSuccess: () => toast.success("Withdrawal cancelled"),
      onError: (mutationError) => toast.error(errorMessage(mutationError)),
    });
  }

  const rows: LedgerRow[] = withdrawals.map((withdrawal) => {
    const amount = formatCurrency(withdrawal.amount);
    const date = formatDate(withdrawal.completed_at ?? withdrawal.requested_at);
    const method = payoutMethodLabel(withdrawal.method);
    const cancelling = cancel.isPending && cancel.variables === withdrawal.id;

    const description =
      withdrawal.status === "pending" ? (
        <span className="gap-tight flex items-center">
          Withdrawal
          <Button
            variant="ghost"
            size="sm"
            className="h-auto px-2 py-0.5 text-xs"
            disabled={cancelling}
            onClick={() => cancelRequest(withdrawal.id)}
          >
            {cancelling && <Loader2 className="animate-spin" />}
            Cancel
          </Button>
        </span>
      ) : (
        "Withdrawal"
      );

    return {
      id: withdrawal.id,
      cells: [
        date,
        description,
        method,
        <WithdrawalStatusBadge key="status" status={withdrawal.status} />,
        amount,
      ],
      mobile: {
        title: description,
        meta: (
          <>
            <span>{method}</span>
            <span>·</span>
            <span>{date}</span>
            <WithdrawalStatusBadge status={withdrawal.status} />
          </>
        ),
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
      emptyTitle="No payouts yet"
      emptyDescription="Submit clips to campaigns and start earning!"
      hasNextPage={hasNextPage}
      isFetchingNextPage={isFetchingNextPage}
      onLoadMore={() => void fetchNextPage()}
    />
  );
}
