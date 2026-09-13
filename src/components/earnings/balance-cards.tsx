"use client";

import Link from "next/link";
import { Info } from "lucide-react";

import { formatCurrency } from "@/lib/format";
import type { CreatorDashboard } from "@/schemas/dashboard";
import { Button, buttonVariants } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Skeleton } from "@/components/ui/skeleton";

const HINTS = {
  available:
    "Money in your ClipTech balance, ready to withdraw to your payout method. We'll let you know once a withdrawal has been sent.",
  pending:
    "Earnings move from pending to available when the campaign credits them, after final view tallying and fraud checks.",
  lifetime: "The total you've earned on ClipTech, all-time.",
};

export function BalanceCards({
  dashboard,
  hasPayoutMethod,
  hasOpenWithdrawal,
  onWithdraw,
}: {
  dashboard: CreatorDashboard;
  hasPayoutMethod: boolean;
  hasOpenWithdrawal: boolean;
  onWithdraw: () => void;
}) {
  const canWithdraw =
    dashboard.available_balance > 0 && hasPayoutMethod && !hasOpenWithdrawal;

  return (
    <div className="gap-inline grid sm:grid-cols-3">
      <BalanceCard
        label="Available balance"
        hint={HINTS.available}
        value={dashboard.available_balance}
        action={
          hasPayoutMethod ? (
            <Button
              variant="secondary"
              size="sm"
              className="rounded-full"
              disabled={!canWithdraw}
              onClick={onWithdraw}
            >
              {hasOpenWithdrawal ? "In progress" : "Withdraw"}
            </Button>
          ) : (
            <Link
              href="/dashboard/profile#payout-methods"
              className={buttonVariants({ variant: "secondary", size: "sm" }) + " rounded-full"}
            >
              Add account
            </Link>
          )
        }
      />
      <BalanceCard
        label="Pending balance"
        hint={HINTS.pending}
        value={dashboard.pending_earnings}
      />
      <BalanceCard
        label="Lifetime earnings"
        hint={HINTS.lifetime}
        value={dashboard.lifetime_earnings}
      />
    </div>
  );
}

function BalanceCard({
  label,
  hint,
  value,
  action,
}: {
  label: string;
  hint: string;
  value: number;
  action?: React.ReactNode;
}) {
  return (
    <div className="p-card space-y-block rounded-2xl border bg-card sm:p-5">
      <div className="gap-tight flex items-center">
        <p className="text-sm font-medium text-muted-foreground">{label}</p>
        <Popover>
          <PopoverTrigger
            aria-label={`About ${label.toLowerCase()}`}
            className="rounded-full text-muted-foreground transition-colors hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
          >
            <Info className="size-3.5" />
          </PopoverTrigger>
          <PopoverContent className="max-w-64 px-3 py-2 text-sm text-pretty">{hint}</PopoverContent>
        </Popover>
      </div>

      <div className="gap-inline flex flex-wrap items-center justify-between">
        <p className="font-heading text-3xl font-semibold tracking-tight tabular-nums">
          {formatCurrency(value)}
        </p>
        {action}
      </div>
    </div>
  );
}

export function BalanceCardsSkeleton() {
  return (
    <div className="gap-inline grid sm:grid-cols-3">
      {[0, 1, 2].map((index) => (
        <Skeleton key={index} className="h-28 rounded-2xl" />
      ))}
    </div>
  );
}
