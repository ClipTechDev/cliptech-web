import type { CollectionResponse, Platform } from "@/schemas/common";

/**
 * Mirrors social.AccountResponse in internal/features/social/dto.go.
 *
 * This listing is unpaginated - it answers `{ success, accounts }` with no
 * pagination key, because a creator has at most one account per platform.
 */

/** Mirrors social.Status in internal/features/social/model.go. */
export const SOCIAL_ACCOUNT_STATUSES = ["connected", "disconnected", "auth_failed"] as const;
export type SocialAccountStatus = (typeof SOCIAL_ACCOUNT_STATUSES)[number];

export type SocialAccount = {
  id: string;
  platform: Platform;
  platform_account_id: string;
  platform_username: string | null;
  status: SocialAccountStatus;
  scopes: string[];
  /**
   * Computed server-side: true when the status is not connected, the access
   * token is missing, or it is past expiry. Drives the Reconnect CTA - a
   * status of `connected` alone is not enough.
   */
  needs_reconnect: boolean;
  token_expires_at: string | null;
  connected_at: string;
  last_connected_at: string | null;
  disconnected_at: string | null;
  last_error: string | null;
};

export type SocialAccountsResponse = CollectionResponse<"accounts", SocialAccount>;
export type SocialAccountResponse = { success: boolean; account: SocialAccount };

/**
 * GET /v1/social/{platform}/connect answers with JSON, it does not redirect -
 * the browser navigation is ours to perform.
 */
export type SocialConnectResponse = {
  success: boolean;
  platform: Platform;
  authorization_url: string;
  expires_in: number;
};

/**
 * Failure reasons the OAuth callback can hand back on the redirect, from
 * internal/features/social/redirect.go. Rendered as copy a creator can act on,
 * since the raw reason is a Go identifier.
 */
export const SOCIAL_CONNECT_ERRORS: Record<string, string> = {
  expired_state: "That connection link expired. Please try again.",
  missing_code: "The provider didn't send back an authorisation code.",
  not_configured: "That platform isn't set up on this server yet.",
  already_linked: "That account is already linked to another ClipTech profile.",
  provider_rejected: "The provider rejected the connection.",
  connection_failed: "We couldn't finish the connection. Please try again.",
};

export function socialConnectErrorMessage(reason: string | null): string {
  if (!reason) return "We couldn't finish the connection. Please try again.";
  return SOCIAL_CONNECT_ERRORS[reason] ?? "We couldn't finish the connection. Please try again.";
}
