"use client";

import { keepPreviousData, useInfiniteQuery } from "@tanstack/react-query";

import { apiFetch } from "@/lib/api-client";
import { DEFAULT_PAGE_SIZE } from "@/lib/list-params";
import type { TransactionsResponse, TransactionType } from "@/schemas/transaction";

export const transactionsKeys = {
  all: ["transactions"] as const,
  lists: () => [...transactionsKeys.all, "list"] as const,
  list: (type?: TransactionType) => [...transactionsKeys.lists(), type ?? "all"] as const,
};

/**
 * The ledger, optionally narrowed to one kind of entry. `type` is a server
 * filter rather than something to apply to the page that comes back: these
 * pages are paginated, so filtering after the fact would leave "load more"
 * fetching pages that render nothing.
 */
export function useTransactionsInfiniteQuery(type?: TransactionType) {
  return useInfiniteQuery({
    queryKey: transactionsKeys.list(type),
    queryFn: ({ pageParam }) =>
      apiFetch<TransactionsResponse>("/transactions", {
        query: { type, page: pageParam, limit: DEFAULT_PAGE_SIZE },
      }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) =>
      lastPage.pagination.has_next ? lastPage.pagination.page + 1 : undefined,
    placeholderData: keepPreviousData,
  });
}
