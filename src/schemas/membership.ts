import type { Platform } from "@/schemas/common";

export type JoinMethod = "open" | "criteria" | "manual";
export type MembershipStatus = "pending" | "approved" | "rejected" | "removed";

export type RuleView = {
  rule_type: string;
  label: string;
  operator: string;
  value: unknown;
  description: string;
};

export type RuleResult = {
  rule_type: string;
  label: string;
  description: string;
  outcome: "pass" | "fail" | "unknown" | "missing_input";
  reason?: string;
};

export type Membership = {
  id: string;
  campaign_id: string;
  social_account_id: string;
  status: MembershipStatus;
  decided_by: "system" | "admin";
  evaluation: { results?: RuleResult[]; decision?: string };
  rejection_reason: string | null;
  reviewed_at: string | null;
  created_at: string;
  updated_at: string;
};

export type MembershipPage = {
  social_account_id: string;
  platform: Platform;
  username: string;
  connected: boolean;
  membership: Membership | null;
  can_join: boolean;
  blocked_reason?: string;
  retry_at: string | null;
};

export type MembershipOverview = {
  campaign_id: string;
  join_method: JoinMethod;
  eligibility_match: "all" | "any";
  rules: RuleView[];
  joinable: boolean;
  joined: boolean;
  pages: MembershipPage[];
};

export type MembershipOverviewResponse = { success: boolean; membership: MembershipOverview };
export type MembershipResponse = { success: boolean; message?: string; membership: Membership };
export type MembershipsResponse = { success: boolean; memberships: Membership[] };

export const JOIN_METHOD_COPY: Record<JoinMethod, { title: string; body: string }> = {
  open: {
    title: "Open to everyone",
    body: "Join with one of your pages and you can submit clips straight away.",
  },
  criteria: {
    title: "Pages must meet the requirements",
    body: "We check your page when you join. If it qualifies, you can submit straight away.",
  },
  manual: {
    title: "Our team approves each page",
    body: "Ask to join with a page. You can submit clips once it's approved.",
  },
};

export function membershipBadge(memberships: Membership[], campaignId: string): string | null {
  const mine = memberships.filter((membership) => membership.campaign_id === campaignId);
  if (mine.some((membership) => membership.status === "approved")) return "Joined";
  if (mine.some((membership) => membership.status === "pending")) return "Request pending";
  return null;
}
