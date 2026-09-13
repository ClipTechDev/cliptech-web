"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";

import { tabPillClassName } from "@/components/shared/tab-pill";

export const EARNINGS_VIEWS = ["available", "pending", "sent"] as const;
export type EarningsView = (typeof EARNINGS_VIEWS)[number];

const LABELS: Record<EarningsView, string> = {
  available: "Available",
  pending: "Pending",
  sent: "Paid out",
};

export function parseEarningsView(value: string | null): EarningsView {
  return EARNINGS_VIEWS.includes(value as EarningsView)
    ? (value as EarningsView)
    : "available";
}

export function useEarningsView(): EarningsView {
  return parseEarningsView(useSearchParams().get("view"));
}

/**
 * The view lives in `?view=`, so a creator can link someone to their payout
 * history and a refresh does not drop them back on the first tab.
 */
export function EarningsTabs({ active }: { active: EarningsView }) {
  const pathname = usePathname();

  return (
    <div role="tablist" aria-label="Earnings" className="gap-tight flex">
      {EARNINGS_VIEWS.map((view) => {
        const current = view === active;

        return (
          <Link
            key={view}
            role="tab"
            aria-selected={current}
            href={view === "available" ? pathname : `${pathname}?view=${view}`}
            scroll={false}
            className={tabPillClassName(current)}
          >
            {LABELS[view]}
          </Link>
        );
      })}
    </div>
  );
}
