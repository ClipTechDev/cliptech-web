"use client";

import { useQuery } from "@tanstack/react-query";

import { apiFetch } from "@/lib/api-client";
import type { CampaignResult, CampaignResultResponse } from "@/schemas/campaign-result";
import type { SubmissionsListResponse } from "@/schemas/submission";

const POLL_MS = 60 * 1000;

export const campaignTrackingKeys = {
  all: ["campaign-tracking"] as const,
  result: (campaignId: string) =>
    [...campaignTrackingKeys.all, "result", campaignId] as const,
  clips: (campaignId: string) =>
    [...campaignTrackingKeys.all, "clips", campaignId] as const,
};

export function useCampaignResultQuery(
  campaignId: string,
  initialResult: CampaignResult | null
) {
  return useQuery({
    queryKey: campaignTrackingKeys.result(campaignId),
    queryFn: () =>
      apiFetch<CampaignResultResponse>(`/campaigns/${campaignId}/results`),
    select: (response: CampaignResultResponse) => response.result,
    initialData: initialResult
      ? ({ success: true, result: initialResult } satisfies CampaignResultResponse)
      : undefined,
    refetchInterval: (query) =>
      query.state.data?.result.settled ? false : POLL_MS,
    staleTime: 0,
  });
}

export function useCampaignClipsQuery(campaignId: string) {
  return useQuery({
    queryKey: campaignTrackingKeys.clips(campaignId),
    queryFn: () =>
      apiFetch<SubmissionsListResponse>("/submissions", {
        query: { campaign_id: campaignId, limit: 100 },
      }),
    select: (response: SubmissionsListResponse) => response.submissions,
    refetchInterval: POLL_MS,
    staleTime: 0,
  });
}
