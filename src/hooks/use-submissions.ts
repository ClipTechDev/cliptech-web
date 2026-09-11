"use client";

import {
  keepPreviousData,
  useInfiniteQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";

import { apiFetch } from "@/lib/api-client";
import { DEFAULT_PAGE_SIZE, listParamsToQuery, type ListParams } from "@/lib/list-params";
import { authKeys } from "@/hooks/use-auth";
import { campaignsKeys } from "@/hooks/use-campaigns";
import { dashboardKeys } from "@/hooks/use-dashboard";
import type {
  SubmissionFormValues,
  SubmissionResponse,
  SubmissionsListResponse,
} from "@/schemas/submission";

export const submissionsKeys = {
  all: ["submissions"] as const,
  lists: () => [...submissionsKeys.all, "list"] as const,
  list: (params: ListParams) =>
    [...submissionsKeys.lists(), listParamsToQuery(params)] as const,
  details: () => [...submissionsKeys.all, "detail"] as const,
  detail: (id: string) => [...submissionsKeys.details(), id] as const,
};

export function useSubmissionsInfiniteQuery(params: ListParams) {
  return useInfiniteQuery({
    queryKey: submissionsKeys.list(params),
    queryFn: ({ pageParam }) =>
      apiFetch<SubmissionsListResponse>("/submissions", {
        query: { ...listParamsToQuery(params), page: pageParam, limit: DEFAULT_PAGE_SIZE },
      }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) =>
      lastPage.pagination.has_next ? lastPage.pagination.page + 1 : undefined,
    placeholderData: keepPreviousData,
  });
}

/**
 * Submitting a clip is a slow, synchronous call: the service resolves the post
 * against the platform's API and verifies the post's owner matches a connected
 * account, with a 20s timeout of its own (submission/service.go). The client
 * timeout is set above that so the server's own error - which is specific and
 * worth showing - wins the race against ours.
 */
const SUBMIT_TIMEOUT_MS = 30_000;

export function useCreateSubmissionMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (values: SubmissionFormValues) =>
      apiFetch<SubmissionResponse>("/submissions", {
        method: "POST",
        body: values,
        timeoutMs: SUBMIT_TIMEOUT_MS,
      }),
    onSuccess: (response) => {
      queryClient.setQueryData(submissionsKeys.detail(response.submission.id), response);
      queryClient.invalidateQueries({ queryKey: submissionsKeys.lists() });
      // A new submission moves the counters and can consume the last of a
      // campaign's budget, so neither the rollup nor the campaign it targets
      // is still accurate.
      queryClient.invalidateQueries({ queryKey: dashboardKeys.all });
      queryClient.invalidateQueries({
        queryKey: campaignsKeys.detail(response.submission.campaign_id),
      });
    },
  });
}

/**
 * Retry a post that was invalidated for a recoverable reason - almost always
 * after the creator has reconnected the account it was posted from. The API
 * answers 409 for any other reason, so callers should gate on canRevalidate().
 */
export function useRevalidateSubmissionMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) =>
      apiFetch<SubmissionResponse>(`/submissions/${id}/revalidate`, { method: "POST" }),
    onSuccess: (response) => {
      queryClient.setQueryData(submissionsKeys.detail(response.submission.id), response);
      queryClient.invalidateQueries({ queryKey: submissionsKeys.lists() });
      queryClient.invalidateQueries({ queryKey: dashboardKeys.all });
      // Revalidating can restore earnings, which sit on the user record.
      queryClient.invalidateQueries({ queryKey: authKeys.me() });
    },
  });
}
