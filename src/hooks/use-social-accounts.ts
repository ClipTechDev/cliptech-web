"use client";

import { queryOptions, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { apiFetch } from "@/lib/api-client";
import type { Platform } from "@/schemas/common";
import type {
  SocialAccountResponse,
  SocialAccountsResponse,
  SocialClaimResponse,
  SocialClaimsResponse,
  SocialConnectResponse,
  StartClaimInput,
} from "@/schemas/social-account";

export const socialAccountsKeys = {
  all: ["social-accounts"] as const,
  list: () => [...socialAccountsKeys.all, "list"] as const,
};

export const socialClaimsKeys = {
  all: ["social-claims"] as const,
  list: () => [...socialClaimsKeys.all, "list"] as const,
};

export type ConnectSocialInput = { platform: Platform; accountId?: string };

export function socialAccountsOptions() {
  return queryOptions({
    queryKey: socialAccountsKeys.list(),
    queryFn: () => apiFetch<SocialAccountsResponse>("/social/accounts"),
    // Unpaginated: a creator can connect several accounts per platform, but
    // never enough of them for pagination to matter, so this response
    // carries no `pagination` key to read.
    select: (response: SocialAccountsResponse) => response.accounts,
  });
}

export function useSocialAccountsQuery() {
  return useQuery(socialAccountsOptions());
}

/**
 * Starts an OAuth connect.
 *
 * The endpoint answers with JSON containing `authorization_url` rather than
 * redirecting, so the navigation is ours to perform - and it must be a full
 * page navigation, not a router push, because the destination is the
 * provider's domain.
 *
 * The creator comes back to SOCIAL_CONNECT_REDIRECT_PATH (default
 * /settings/socials), which this app serves; see src/app/settings/socials.
 *
 * Pass `accountId` to reconnect one existing connection rather than add a new
 * one: the API seals it into the OAuth state and refuses the callback if the
 * creator picks a different handle at the consent screen, which would
 * otherwise file a second account instead of repairing this one.
 */
export function useConnectSocialMutation() {
  return useMutation({
    mutationFn: ({ platform, accountId }: ConnectSocialInput) =>
      apiFetch<SocialConnectResponse>(`/social/${platform}/connect`, {
        query: { account_id: accountId },
      }),
    onSuccess: (response) => {
      window.location.href = response.authorization_url;
    },
  });
}

export function socialClaimsOptions() {
  return queryOptions({
    queryKey: socialClaimsKeys.list(),
    queryFn: () => apiFetch<SocialClaimsResponse>("/social/claims"),
  });
}

/**
 * Open verifications, so a creator who closes the sheet or reloads mid-flow is
 * shown the code they were already given rather than being issued a new one.
 *
 * The response also carries `platforms`, the list the server will actually
 * accept a claim for. It is narrower than CODE_VERIFIABLE_PLATFORMS whenever a
 * platform's app credential is missing, so the flow offers the code route only
 * once this has confirmed it.
 */
export function useSocialClaimsQuery(enabled = true) {
  return useQuery({ ...socialClaimsOptions(), enabled });
}

/**
 * Starts a bio-code verification.
 *
 * The API resolves the profile before answering, so a failure here is usually
 * the creator's link rather than our request: a private profile, a handle that
 * does not exist, or an account somebody else already holds.
 */
export function useStartClaimMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ platform, profile_url }: StartClaimInput) =>
      apiFetch<SocialClaimResponse>(`/social/${platform}/claim`, {
        method: "POST",
        body: { profile_url },
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: socialClaimsKeys.all });
    },
  });
}

export function useVerifyClaimMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (platform: Platform) =>
      apiFetch<SocialAccountResponse>(`/social/${platform}/claim/verify`, {
        method: "POST",
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: socialAccountsKeys.all });
      queryClient.invalidateQueries({ queryKey: socialClaimsKeys.all });
    },
  });
}

export function useCancelClaimMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (platform: Platform) =>
      apiFetch<{ success: boolean }>(`/social/${platform}/claim`, {
        method: "DELETE",
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: socialClaimsKeys.all });
    },
  });
}

export function useDisconnectSocialMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) =>
      apiFetch<SocialAccountResponse>(`/social/accounts/${id}/disconnect`, {
        method: "POST",
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: socialAccountsKeys.all });
    },
  });
}
