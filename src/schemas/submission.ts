import { z } from "zod";

import type { CampaignStatus } from "@/schemas/campaign";
import type { PaginatedResponse, Platform } from "@/schemas/common";

/**
 * Mirrors submission.Response and submission.CreateRequest in
 * internal/features/submission/dto.go.
 */

/** Mirrors submission.Status in internal/features/submission/model.go. */
export const SUBMISSION_STATUSES = [
  "approved",
  "rejected",
  "invalidated",
  "flagged",
] as const;
export type SubmissionStatus = (typeof SUBMISSION_STATUSES)[number];

/**
 * What the list endpoint will actually accept as `?status=`.
 *
 * `flagged` is a real stored state, but validStatus() in
 * submission/service.go omits it, so filtering by it answers 404. It stays in
 * SUBMISSION_STATUSES because a row can still come back flagged and the badge
 * has to render it.
 */
export const SUBMISSION_FILTER_STATUSES = SUBMISSION_STATUSES.filter(
  (status) => status !== "flagged"
);

export type Submission = {
  id: string;
  campaign_id: string;
  /** Resolved server-side; blank if the campaign could not be looked up. */
  campaign_name: string;
  /**
   * Resolved server-side alongside the name, so a row can tell a submission
   * still being tracked from one whose campaign has settled without fetching
   * the campaign itself. Empty string when it could not be resolved.
   */
  campaign_status: CampaignStatus | "";
  user_id: string;
  social_account_id: string | null;

  platform: Platform;
  post_url: string;
  platform_post_id: string;

  starting_views: number;
  raw_views: number;
  eligible_views: number;
  payable_views: number;

  earnings: number;
  credited_amount: number;
  /** Computed server-side as earnings - credited_amount, floored at 0. */
  pending_amount: number;

  status: SubmissionStatus;
  issues: SubmissionIssue[];
  can_recheck: boolean;
  invalid_reason: string | null;
  invalidated_at: string | null;
  rejection_reason: string | null;

  submitted_at: string;
  last_tracked_at: string | null;
  next_tracking_at: string | null;
};

export type SubmissionsListResponse = PaginatedResponse<"submissions", Submission>;
export type SubmissionResponse = { success: boolean; submission: Submission };

/**
 * Mirrors submission.LogResponse: one reading of the post, taken by the
 * tracker. The history of these is how a creator sees their view count move
 * rather than just where it landed.
 */
export type SubmissionLog = {
  id: string;
  raw_views: number;
  eligible_views: number;
  payable_views: number;
  earnings: number;
  /** The campaign's rate at the time of the reading, per 1,000 views. */
  cpm: number;
  /** Set when the platform could not be reached; views are unchanged. */
  fetch_error: string | null;
  tracked_at: string;
};

export type SubmissionLogsResponse = PaginatedResponse<"logs", SubmissionLog>;

/**
 * What a creator is shown, which is more than what the API stores.
 *
 * The requirement sheet names Tracking and Completed as states, and the API
 * has no column for either - so they are derived here rather than added to
 * submission.Status, which would mean a migration and two sources of truth for
 * the same fact.
 */
export type SubmissionDisplayStatus =
  | SubmissionStatus
  | "tracking"
  | "completed"
  | "needs_fixing";

export function submissionDisplayStatus(
  submission: Submission
): SubmissionDisplayStatus {
  if (submission.status === "rejected" && submission.issues.length > 0) {
    return "needs_fixing";
  }
  if (submission.status !== "approved") return submission.status;

  // A settled campaign is final: nothing about this submission changes again.
  // campaign.Repository sets status to completed and settled_at in one write,
  // so the campaign's own status is what answers this.
  if (submission.campaign_status === "completed") return "completed";

  // tracking.NextTrackingAt returns nil once the campaign window closes or the
  // campaign is terminal, so a future date is exactly "still being counted".
  if (
    submission.next_tracking_at !== null &&
    new Date(submission.next_tracking_at) > new Date()
  ) {
    return "tracking";
  }

  return "approved";
}

export const SUBMISSION_FILTER_KEYS = ["status", "platform"] as const;

export const SUBMISSION_ISSUE_CODES = [
  "account_disconnected",
  "tracking_unavailable",
  "post_unreadable",
  "not_post_owner",
  "missing_hashtags",
] as const;

export type SubmissionIssueCode = (typeof SUBMISSION_ISSUE_CODES)[number];

export type SubmissionIssue = {
  code: SubmissionIssueCode | string;
  detail?: string;
};

type IssueCopy = { title: string; fix: string };

export const SUBMISSION_ISSUE_COPY: Record<SubmissionIssueCode, IssueCopy> = {
  account_disconnected: {
    title: "That platform isn't connected",
    fix: "Connect the account you posted from on the Profile tab, then re-check.",
  },
  tracking_unavailable: {
    title: "We can't track that platform right now",
    fix: "This is on our side. Try re-checking in a little while.",
  },
  post_unreadable: {
    title: "We couldn't read that post",
    fix: "Make sure it's public and still online, then re-check.",
  },
  not_post_owner: {
    title: "That post isn't on your connected account",
    fix: "Submit a post from an account you've connected, or connect the account that published it.",
  },
  missing_hashtags: {
    title: "The caption is missing required hashtags",
    fix: "Add them to the post's caption, then re-check.",
  },
};

export function issueCopy(issue: SubmissionIssue): IssueCopy {
  const copy = SUBMISSION_ISSUE_COPY[issue.code as SubmissionIssueCode];
  if (!copy) {
    return { title: humaniseIssueCode(issue.code), fix: "Fix the post, then re-check." };
  }
  if (issue.code === "missing_hashtags" && issue.detail) {
    return { ...copy, fix: `Add ${issue.detail} to the post's caption, then re-check.` };
  }
  return copy;
}

function humaniseIssueCode(code: string): string {
  const spaced = code.replace(/_/g, " ");
  return spaced.charAt(0).toUpperCase() + spaced.slice(1);
}

/**
 * The post URL shapes submission/posturl.go accepts, checked here so an
 * obviously wrong paste fails instantly instead of after a 20-second round
 * trip to the provider. The server remains the authority - this only catches
 * the cases it would certainly reject.
 */
const POST_URL_PATTERNS: RegExp[] = [
  /instagram\.com\/(p|reel|reels|tv)\/[\w-]+/i,
  /(twitter|x)\.com\/[\w.]+\/status\/\d+/i,
  /tiktok\.com\/@[\w.-]+\/(video|photo)\/\d+/i,
  /youtube\.com\/watch\?.*\bv=[\w-]{11}/i,
  /youtu\.be\/[\w-]{11}/i,
  /youtube\.com\/(shorts|embed|live)\/[\w-]{11}/i,
];

/** Shortened TikTok links carry no post id, so the API rejects them outright. */
const SHORTENED_TIKTOK = /(vm\.tiktok\.com|vt\.tiktok\.com|tiktok\.com\/t\/)/i;

export const submissionFormSchema = z.object({
  campaign_id: z.string().min(1, "Pick a campaign"),
  post_url: z
    .string()
    .trim()
    .min(1, "Paste the link to your post")
    .refine((value) => !SHORTENED_TIKTOK.test(value), {
      message:
        "Shortened TikTok links don't include the post id. Open the post and copy the full URL.",
    })
    .refine((value) => POST_URL_PATTERNS.some((pattern) => pattern.test(value)), {
      message: "That doesn't look like an Instagram, X, TikTok or YouTube post link.",
    }),
});
export type SubmissionFormValues = z.infer<typeof submissionFormSchema>;

/** Best-effort platform guess, so the form can warn before the server does. */
export function platformFromPostUrl(url: string): Platform | null {
  if (/instagram\.com/i.test(url)) return "instagram";
  if (/(twitter|x)\.com/i.test(url)) return "twitter";
  if (/tiktok\.com/i.test(url)) return "tiktok";
  if (/(youtube\.com|youtu\.be)/i.test(url)) return "youtube";
  return null;
}
