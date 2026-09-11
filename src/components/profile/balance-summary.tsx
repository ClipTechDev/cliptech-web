"use client";

import { formatCompactNumber, formatCurrency } from "@/lib/format";
import { useDashboardQuery } from "@/hooks/use-dashboard";
import { Skeleton } from "@/components/ui/skeleton";
import { StatCard } from "@/components/shared/stat-card";
import { QueryState } from "@/components/shared/query-state";

/**
 * The rollup from GET /v1/dashboard.
 *
 * Available balance leads because it is the only number a creator can act on;
 * pending and lifetime give it context. Withdrawals are not built yet, so this
 * reports rather than offers a cash-out.
 */
export function BalanceSummary() {
  const { data, error, isPending, refetch } = useDashboardQuery();

  return (
    <QueryState
      isLoading={isPending}
      loadingFallback={
        <div className="grid grid-cols-2 gap-3">
          {[0, 1, 2, 3].map((index) => (
            <Skeleton key={index} className="h-20 rounded-xl" />
          ))}
        </div>
      }
      error={error}
      onRetry={() => void refetch()}
    >
      {data && (
        <div className="grid grid-cols-2 gap-3">
          <StatCard
            label="Available"
            value={formatCurrency(data.available_balance)}
            emphasis
          />
          <StatCard
            label="Pending"
            value={formatCurrency(data.pending_earnings)}
            hint="not yet credited"
          />
          <StatCard
            label="Lifetime earnings"
            value={formatCurrency(data.lifetime_earnings)}
          />
          <StatCard
            label="Payable views"
            value={formatCompactNumber(data.eligible_views)}
            hint={`${formatCompactNumber(data.total_views)} total`}
          />
        </div>
      )}
    </QueryState>
  );
}
