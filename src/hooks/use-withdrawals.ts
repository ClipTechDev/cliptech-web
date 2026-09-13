"use client";

import {
  keepPreviousData,
  useInfiniteQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";

import { apiFetch } from "@/lib/api-client";
import { DEFAULT_PAGE_SIZE } from "@/lib/list-params";
import { dashboardKeys } from "@/hooks/use-dashboard";
import { transactionsKeys } from "@/hooks/use-transactions";
import type { WithdrawalFormValues, WithdrawalResponse, WithdrawalsResponse } from "@/schemas/withdrawal";

export const withdrawalsKeys = {
  all: ["withdrawals"] as const,
  lists: () => [...withdrawalsKeys.all, "list"] as const,
};

export function useWithdrawalsInfiniteQuery() {
  return useInfiniteQuery({
    queryKey: withdrawalsKeys.lists(),
    queryFn: ({ pageParam }) =>
      apiFetch<WithdrawalsResponse>("/withdrawals", {
        query: { page: pageParam, limit: DEFAULT_PAGE_SIZE },
      }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) =>
      lastPage.pagination.has_next ? lastPage.pagination.page + 1 : undefined,
    placeholderData: keepPreviousData,
  });
}

/**
 * Requesting and cancelling both move the available balance, so each one has
 * to invalidate the dashboard rollup and the ledger alongside the list.
 */
function useWithdrawalInvalidation() {
  const queryClient = useQueryClient();

  return () => {
    queryClient.invalidateQueries({ queryKey: withdrawalsKeys.all });
    queryClient.invalidateQueries({ queryKey: dashboardKeys.all });
    queryClient.invalidateQueries({ queryKey: transactionsKeys.all });
  };
}

export function useCreateWithdrawalMutation() {
  const invalidate = useWithdrawalInvalidation();

  return useMutation({
    mutationFn: (values: WithdrawalFormValues) =>
      apiFetch<WithdrawalResponse>("/withdrawals", {
        method: "POST",
        body: {
          amount: values.amount,
          payout_method_id: values.payout_method_id,
        },
      }),
    onSuccess: invalidate,
  });
}

export function useCancelWithdrawalMutation() {
  const invalidate = useWithdrawalInvalidation();

  return useMutation({
    mutationFn: (id: string) =>
      apiFetch<WithdrawalResponse>(`/withdrawals/${id}/cancel`, { method: "POST" }),
    onSuccess: invalidate,
  });
}
