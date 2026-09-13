"use client";

import { useInfiniteQuery, useQuery } from "@tanstack/react-query";

import { apiFetch } from "@/lib/api-client";
import {
  DEFAULT_PAGE_SIZE,
  listParamsToQuery,
  type ListParams,
} from "@/lib/list-params";
import type { CampaignsListResponse } from "@/schemas/campaign";

/**
 * Browse and campaign detail are server-rendered, so the only campaign query
 * left in the browser is the submit sheet's picker. The key factory stays
 * whole because use-submissions invalidates against it after a submission.
 */
export const campaignsKeys = {
  all: ["campaigns"] as const,
  lists: () => [...campaignsKeys.all, "list"] as const,
  list: (params: ListParams) =>
    [...campaignsKeys.lists(), listParamsToQuery(params)] as const,
  details: () => [...campaignsKeys.all, "detail"] as const,
  detail: (id: string) => [...campaignsKeys.details(), id] as const,
  mine: () => [...campaignsKeys.all, "mine"] as const,
};

export function useMyCampaignsInfiniteQuery() {
  return useInfiniteQuery({
    queryKey: campaignsKeys.mine(),
    queryFn: ({ pageParam }) =>
      apiFetch<CampaignsListResponse>("/campaigns/mine", {
        query: { page: pageParam, limit: DEFAULT_PAGE_SIZE },
      }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) =>
      lastPage.pagination.has_next ? lastPage.pagination.page + 1 : undefined,
  });
}

/**
 * The campaign list the submit sheet's picker needs: joinable only, one page,
 * unfiltered by whatever the browse screen happens to be showing.
 *
 * Separate from the browse query on purpose - sharing it would make the
 * picker's contents depend on the URL of the screen behind the sheet.
 */
export function useJoinableCampaignsQuery(enabled = true) {
  return useQuery({
    queryKey: [...campaignsKeys.lists(), "joinable"] as const,
    queryFn: () =>
      apiFetch<CampaignsListResponse>("/campaigns", { query: { limit: 100 } }),
    select: (response: CampaignsListResponse) =>
      response.campaigns.filter((campaign) => campaign.accepts_submissions),
    enabled,
  });
}
