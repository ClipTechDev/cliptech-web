"use client";

import { queryOptions, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { apiFetch } from "@/lib/api-client";
import type { Platform } from "@/schemas/common";
import type {
  SocialAccountResponse,
  SocialAccountsResponse,
  SocialConnectResponse,
} from "@/schemas/social-account";

export const socialAccountsKeys = {
  all: ["social-accounts"] as const,
  list: () => [...socialAccountsKeys.all, "list"] as const,
};

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
 */
export function useConnectSocialMutation() {
  return useMutation({
    mutationFn: (platform: Platform) =>
      apiFetch<SocialConnectResponse>(`/social/${platform}/connect`),
    onSuccess: (response) => {
      window.location.href = response.authorization_url;
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
