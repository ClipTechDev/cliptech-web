"use client";

import { queryOptions, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { apiFetch } from "@/lib/api-client";
import type { MessageResponse } from "@/schemas/common";
import type {
  PayoutMethodFormValues,
  PayoutMethodResponse,
  PayoutMethodsResponse,
} from "@/schemas/payout-method";

export const payoutMethodsKeys = {
  all: ["payout-methods"] as const,
  list: () => [...payoutMethodsKeys.all, "list"] as const,
};

export function payoutMethodsOptions() {
  return queryOptions({
    queryKey: payoutMethodsKeys.list(),
    queryFn: () => apiFetch<PayoutMethodsResponse>("/payout-methods"),
    select: (response: PayoutMethodsResponse) => response.methods,
  });
}

export function usePayoutMethodsQuery() {
  return useQuery(payoutMethodsOptions());
}

export function useAddPayoutMethodMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (values: PayoutMethodFormValues) =>
      apiFetch<PayoutMethodResponse>("/payout-methods", {
        method: "POST",
        body: {
          method: values.method,
          details: { content: values.content },
          label: values.label === "" ? null : values.label,
        },
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: payoutMethodsKeys.all });
    },
  });
}

export function useSetDefaultPayoutMethodMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) =>
      apiFetch<PayoutMethodResponse>(`/payout-methods/${id}/default`, {
        method: "PATCH",
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: payoutMethodsKeys.all });
    },
  });
}

export function useDeletePayoutMethodMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) =>
      apiFetch<MessageResponse>(`/payout-methods/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: payoutMethodsKeys.all });
    },
  });
}
