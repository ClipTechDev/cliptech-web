"use client";

import * as React from "react";

import { useDashboardQuery } from "@/hooks/use-dashboard";
import { usePayoutMethodsQuery } from "@/hooks/use-payout-methods";
import { useWithdrawalsInfiniteQuery } from "@/hooks/use-withdrawals";
import { isOpenWithdrawal } from "@/schemas/withdrawal";
import { QueryState } from "@/components/shared/query-state";
import { AvailableEarnings } from "@/components/earnings/available-earnings";
import {
  BalanceCards,
  BalanceCardsSkeleton,
} from "@/components/earnings/balance-cards";
import { EarningsTabs, useEarningsView } from "@/components/earnings/earnings-tabs";
import { PaidOutList } from "@/components/earnings/paid-out-list";
import { PendingEarnings } from "@/components/earnings/pending-earnings";
import { WithdrawSheet } from "@/components/earnings/withdraw-sheet";

export function EarningsScreen() {
  const view = useEarningsView();
  const dashboard = useDashboardQuery();
  const methods = usePayoutMethodsQuery();
  const withdrawals = useWithdrawalsInfiniteQuery();
  const [withdrawOpen, setWithdrawOpen] = React.useState(false);

  const requests = withdrawals.data?.pages.flatMap((page) => page.withdrawals) ?? [];
  const hasOpenWithdrawal = requests.some(isOpenWithdrawal);

  return (
    <div className="space-y-block mt-2">
      <QueryState
        isLoading={dashboard.isPending}
        loadingFallback={<BalanceCardsSkeleton />}
        error={dashboard.error}
        onRetry={() => void dashboard.refetch()}
      >
        {dashboard.data && (
          <>
            <BalanceCards
              dashboard={dashboard.data}
              hasPayoutMethod={(methods.data?.length ?? 0) > 0}
              hasOpenWithdrawal={hasOpenWithdrawal}
              onWithdraw={() => setWithdrawOpen(true)}
            />
            <WithdrawSheet
              open={withdrawOpen}
              onOpenChange={setWithdrawOpen}
              available={dashboard.data.available_balance}
            />
          </>
        )}
      </QueryState>

      <div className="space-y-inline">
        <EarningsTabs active={view} />

        {view === "available" && <AvailableEarnings />}
        {view === "pending" && <PendingEarnings />}
        {view === "sent" && <PaidOutList />}
      </div>
    </div>
  );
}
