import type { PaginatedResponse, Platform } from "@/schemas/common";

/**
 * Mirrors campaign.PublicResponse in internal/features/campaign/dto.go - the
 * creator-facing projection, which deliberately omits spent_amount,
 * accrued_amount and next_statuses (those are on the admin-only Response).
 */

/** Mirrors campaign.Status in internal/features/campaign/model.go. */
export const CAMPAIGN_STATUSES = [
  "draft",
  "active",
  "submissions_closed",
  "paused",
  "ended",
  "completed",
  "archived",
] as const;
export type CampaignStatus = (typeof CAMPAIGN_STATUSES)[number];

/**
 * What a creator can ever see. Browse forces PublicOnly, so `draft` and
 * `archived` never come back and a detail request for one 404s.
 */
export const PUBLIC_CAMPAIGN_STATUSES = CAMPAIGN_STATUSES.filter(
  (status) => status !== "draft" && status !== "archived"
);

export type Campaign = {
  id: string;
  name: string;
  banner_url: string | null;
  description: string | null;
  rules: string | null;

  content_links: string[];
  allowed_platforms: Platform[];
  /** Tags a post has to carry, stored without the leading '#'. */
  hashtags: string[];

  cpm: number;
  total_budget: number;
  remaining_budget: number;
  budget_used_percent: number;

  minimum_views: number | null;
  max_payout_per_post: number | null;

  starts_at: string;
  ends_at: string;

  status: CampaignStatus;
  /** The exact flag the Submit button keys off. */
  accepts_submissions: boolean;
  /** Why accepts_submissions is false, when it is false for budget reasons. */
  cutoff_reached: boolean;

  ended_at: string | null;
  created_at: string;
};

export type CampaignsListResponse = PaginatedResponse<"campaigns", Campaign>;
export type CampaignResponse = { success: boolean; campaign: Campaign };

/**
 * The filters `/v1/campaigns` accepts, as they appear in the URL.
 *
 * `status` is deliberately absent even though the endpoint accepts it: passing
 * any non-empty status silently disables the `joinable` filter server-side
 * (campaign.Handler.Browse), so offering both as independent controls produces
 * results nobody can explain. The Joinable/All segmented control is the single
 * knob over that dimension.
 */
export const CAMPAIGN_FILTER_KEYS = ["platform", "joinable"] as const;

/**
 * `joinable` defaults to true server-side, so the *absence* of the param means
 * "joinable only". "all" is expressed as an explicit `joinable=false`.
 */
export const CAMPAIGN_SCOPES = ["joinable", "all"] as const;
export type CampaignScope = (typeof CAMPAIGN_SCOPES)[number];

export const CAMPAIGN_SCOPE_LABELS: Record<CampaignScope, string> = {
  joinable: "Open to join",
  all: "All campaigns",
};

export function campaignScopeFromFilters(filters: Record<string, string>): CampaignScope {
  return filters.joinable === "false" ? "all" : "joinable";
}

/**
 * Explains a closed campaign in the creator's terms. The API sends the two
 * facts separately and the reason changes what the creator should do next -
 * a budget cutoff is permanent, a paused campaign may reopen.
 */
export function campaignClosedReason(campaign: Campaign): string | null {
  if (campaign.accepts_submissions) return null;

  // Status is checked before cutoff_reached, not after. A campaign that has
  // ended having spent its whole budget reports cutoff_reached as well, and
  // "Ended" is the truer answer for it - the budget is a consequence, not the
  // reason submissions are closed.
  if (campaign.status === "ended" || campaign.status === "completed") return "Ended";
  if (campaign.status === "submissions_closed") return "Submissions closed";
  if (campaign.status === "paused") return "Paused";
  if (new Date(campaign.starts_at) > new Date()) return "Not started yet";
  if (campaign.cutoff_reached) return "Budget spent";
  return "Closed";
}
