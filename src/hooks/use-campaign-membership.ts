"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { apiFetch } from "@/lib/api-client";
import type { CampaignsListResponse } from "@/schemas/campaign";
import type {
  MembershipOverviewResponse,
  MembershipResponse,
  MembershipsResponse,
} from "@/schemas/membership";

export const membershipKeys = {
  all: ["campaign-membership"] as const,
  overview: (campaignId: string) => [...membershipKeys.all, "overview", campaignId] as const,
  mine: () => [...membershipKeys.all, "mine"] as const,
  joinedCampaigns: () => [...membershipKeys.all, "joined-campaigns"] as const,
};

export function useMembershipOverviewQuery(campaignId: string) {
  return useQuery({
    queryKey: membershipKeys.overview(campaignId),
    queryFn: () =>
      apiFetch<MembershipOverviewResponse>(`/campaigns/${campaignId}/membership`),
    select: (response: MembershipOverviewResponse) => response.membership,
  });
}

export function useMyMembershipsQuery() {
  return useQuery({
    queryKey: membershipKeys.mine(),
    queryFn: () => apiFetch<MembershipsResponse>("/campaign-memberships"),
    select: (response: MembershipsResponse) => response.memberships,
    staleTime: 30_000,
  });
}

export function useJoinedCampaignsQuery(enabled = true) {
  return useQuery({
    queryKey: membershipKeys.joinedCampaigns(),
    queryFn: () => apiFetch<Pick<CampaignsListResponse, "campaigns">>("/campaign-memberships/campaigns"),
    select: (response: Pick<CampaignsListResponse, "campaigns">) =>
      response.campaigns.filter((campaign) => campaign.accepts_submissions),
    enabled,
  });
}

export function useJoinCampaignMutation(campaignId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (socialAccountId: string) =>
      apiFetch<MembershipResponse>(`/campaigns/${campaignId}/join`, {
        method: "POST",
        body: { social_account_id: socialAccountId },
      }),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: membershipKeys.all });
    },
  });
}

export function useJoinAllPagesMutation(campaignId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () =>
      apiFetch<MembershipsResponse>(`/campaigns/${campaignId}/join`, {
        method: "POST",
        body: {},
      }),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: membershipKeys.all });
    },
  });
}

export function useRefreshMembershipMutation(campaignId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () =>
      apiFetch<MembershipOverviewResponse>(`/campaigns/${campaignId}/membership/refresh`, {
        method: "POST",
        timeoutMs: 30_000,
      }),
    onSuccess: (response) => {
      queryClient.setQueryData(membershipKeys.overview(campaignId), response);
    },
  });
}

export function useLeaveCampaignMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (membershipId: string) =>
      apiFetch<MembershipResponse>(`/campaign-memberships/${membershipId}`, { method: "DELETE" }),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: membershipKeys.all });
    },
  });
}
