"use client";

import type { ReactNode } from "react";

import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { QueryState } from "@/components/shared/query-state";
import { LoadMore } from "@/components/shared/load-more";

export type LedgerRow = {
  id: string;
  /** Desktop cells, one per column. */
  cells: ReactNode[];
  /** The same row rebuilt for a phone, where a five-column table cannot fit. */
  mobile: {
    title: ReactNode;
    meta: ReactNode;
    amount: ReactNode;
  };
};

/**
 * One table, three tabs. The desktop layout is a real `<table>` so the columns
 * line up down the page; below `sm` it becomes a stack of rows, because a
 * five-column money table on a 375px screen is either unreadable or a
 * horizontal scroll a creator will not discover.
 */
export function LedgerTable({
  columns,
  rows,
  isLoading,
  error,
  onRetry,
  emptyTitle,
  emptyDescription,
  hasNextPage,
  isFetchingNextPage,
  onLoadMore,
}: {
  columns: string[];
  rows: LedgerRow[];
  isLoading: boolean;
  error: unknown;
  onRetry: () => void;
  emptyTitle: string;
  emptyDescription: string;
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
  onLoadMore: () => void;
}) {
  // One template for the header and every row: identical for all of them, so
  // it is built once rather than per row.
  const template = gridColumns(columns);

  return (
    <div className="overflow-hidden rounded-2xl border bg-card">
      <div className="hidden sm:grid" style={{ gridTemplateColumns: template }}>
        {columns.map((column, index) => (
          <div
            key={column}
            className={cn(
              "px-4 py-3 text-xs font-medium text-muted-foreground",
              index === columns.length - 1 && "text-right"
            )}
          >
            {column}
          </div>
        ))}
      </div>

      <QueryState
        isLoading={isLoading}
        loadingFallback={
          <div className="space-y-2 p-4">
            {[0, 1, 2, 3].map((index) => (
              <Skeleton key={index} className="h-10 w-full rounded-lg" />
            ))}
          </div>
        }
        error={error}
        onRetry={onRetry}
        isEmpty={rows.length === 0}
        emptyState={
          <div className="gap-tight flex min-h-72 flex-col items-center justify-center p-8 text-center">
            <p className="font-heading font-semibold">{emptyTitle}</p>
            <p className="text-sm text-muted-foreground">{emptyDescription}</p>
          </div>
        }
      >
        <ul className="divide-y border-t">
          {rows.map((row) => (
            <li key={row.id}>
              <div
                className="hidden items-center sm:grid"
                style={{ gridTemplateColumns: template }}
              >
                {row.cells.map((cell, index) => (
                  <div
                    key={index}
                    className={cn(
                      "min-w-0 px-4 py-3 text-sm",
                      index === row.cells.length - 1 &&
                        "text-right font-medium tabular-nums"
                    )}
                  >
                    {cell}
                  </div>
                ))}
              </div>

              <div className="gap-inline flex items-center justify-between p-3 sm:hidden">
                <div className="min-w-0 space-y-0.5">
                  <div className="truncate text-sm font-medium">{row.mobile.title}</div>
                  <div className="gap-tight flex flex-wrap items-center text-xs text-muted-foreground">
                    {row.mobile.meta}
                  </div>
                </div>
                <div className="shrink-0 text-sm font-medium tabular-nums">
                  {row.mobile.amount}
                </div>
              </div>
            </li>
          ))}
        </ul>

        <LoadMore
          hasNextPage={hasNextPage}
          isFetchingNextPage={isFetchingNextPage}
          onLoadMore={onLoadMore}
        />
      </QueryState>
    </div>
  );
}

function gridColumns(columns: string[]) {
  const rest = columns.slice(1, -1).map(() => "minmax(0,1fr)");
  return ["10rem", ...rest, "minmax(0,8rem)"].join(" ");
}
