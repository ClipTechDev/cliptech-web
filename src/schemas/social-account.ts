import type { CollectionResponse, Platform } from "@/schemas/common";

/**
 * Mirrors social.AccountResponse in internal/features/social/dto.go.
 *
 * This listing is unpaginated - it answers `{ success, accounts }` with no
 * pagination key. A creator can connect more than one account per platform;
 * the API tracks and refreshes each row independently.
 */

/** Mirrors social.Status in internal/features/social/model.go. */
export const SOCIAL_ACCOUNT_STATUSES = ["connected", "disconnected", "auth_failed"] as const;
export type SocialAccountStatus = (typeof SOCIAL_ACCOUNT_STATUSES)[number];

/**
 * Mirrors social.VerificationMethod. How the creator proved the account is
 * theirs: an OAuth grant, which leaves us a token, or a code placed in the
 * public bio, which does not.
 */
export const SOCIAL_VERIFICATION_METHODS = ["oauth", "code"] as const;
export type SocialVerificationMethod = (typeof SOCIAL_VERIFICATION_METHODS)[number];

/**
 * Platforms that can be connected with a bio code. The API is the authority -
 * GET /v1/social/claims returns the live list - but the flow needs to know
 * before the first request which route to offer.
 *
 * TikTok is absent because it publishes neither a bio nor a view count to
 * app-level credentials; it can only be read with the creator's own OAuth
 * token. Instagram is here, but through business_discovery, which reads only
 * public *professional* accounts - a creator on a personal account is told to
 * sign in instead.
 */
export const CODE_VERIFIABLE_PLATFORMS = ["instagram", "twitter", "youtube"] as const;
export type CodeVerifiablePlatform = (typeof CODE_VERIFIABLE_PLATFORMS)[number];

export function supportsCodeConnect(platform: Platform): platform is CodeVerifiablePlatform {
  return (CODE_VERIFIABLE_PLATFORMS as readonly string[]).includes(platform);
}

export type SocialAccount = {
  id: string;
  platform: Platform;
  platform_account_id: string;
  platform_username: string | null;
  status: SocialAccountStatus;
  scopes: string[];
  /**
   * Computed server-side: true when the status is not connected, the access
   * token is missing, or it is past expiry with no refresh token to renew it
   * with. Drives the Reconnect CTA - a status of `connected` alone is not
   * enough, and an expired token alone is not enough either, since every
   * platform but Instagram can renew one without the creator.
   */
  needs_reconnect: boolean;
  token_expires_at: string | null;
  connected_at: string;
  last_connected_at: string | null;
  disconnected_at: string | null;
  last_error: string | null;

  verification_method: SocialVerificationMethod;
  /** The handle the code was checked against; null for an OAuth account. */
  verification_handle: string | null;
  verified_at: string | null;
  /** Last time the handle was re-checked against its stable account id. */
  last_verified_at: string | null;
};

/** Mirrors social.ClaimResponse - a verification in progress. */
export type SocialClaim = {
  id: string;
  platform: Platform;
  handle: string;
  platform_account_id: string;
  platform_username: string | null;
  code: string;
  attempts_remaining: number;
  expires_at: string;
  created_at: string;
};

export type SocialClaimsResponse = {
  success: boolean;
  claims: SocialClaim[];
  platforms: Platform[];
};

export type SocialClaimResponse = { success: boolean; claim: SocialClaim };

export type StartClaimInput = { platform: Platform; profile_url: string };

/**
 * A failed check answers 400 with the reason and how many tries are left,
 * rather than a bare message - the count is the part a creator acts on.
 */
export type VerifyClaimFailure = {
  success: false;
  message: string;
  reason: string;
  attempts_remaining: number;
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
  wrong_account:
    "That's a different account from the one you were reconnecting. Sign in as that account, or add this one separately.",
  forbidden: "That connection doesn't belong to your profile.",
  provider_rejected: "The provider rejected the connection.",
  code_not_found: "We couldn't find the code in that bio yet.",
  handle_moved: "That handle now belongs to a different account.",
  profile_private: "That profile is private, so we can't read its bio.",
  claim_expired: "That code expired. Start again to get a new one.",
  too_many_attempts: "Too many checks against that code. Start again to get a new one.",
  connection_failed: "We couldn't finish the connection. Please try again.",
};

export function socialConnectErrorMessage(reason: string | null): string {
  if (!reason) return "We couldn't finish the connection. Please try again.";
  return SOCIAL_CONNECT_ERRORS[reason] ?? "We couldn't finish the connection. Please try again.";
}
