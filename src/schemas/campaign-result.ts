/**
 * Mirrors payout.CampaignResultResponse and payout.EntryResponse in
 * internal/features/payout/dto.go - the creator-facing "how did I do on this
 * campaign" view behind GET /v1/campaigns/:id/results.
 *
 * Worth knowing before rendering it: the endpoint answers for any campaign
 * that is not a draft, not only finished ones. `settled` is what says whether
 * the numbers are final; while it is false everything below can still move.
 */

/** One row of the frozen snapshot: a submission's state at a tracking point. */
export type CampaignResultEntry = {
  id: string;
  snapshot_id: string;
  submission_id: string;
  user_id: string;

  raw_views: number;
  eligible_views: number;
  payable_views: number;

  earnings_total: number;
  /** What actually reached the balance. Trails earnings_total until credited. */
  amount_credited: number;
  transaction_id: string | null;

  created_at: string;
};

export type CampaignResult = {
  campaign_id: string;
  campaign_name: string;
  status: string;

  total_budget: number;
  final_spend: number;

  ended_at: string | null;
  settled_at: string | null;
  /** True once settled_at is set: the figures below are final. */
  settled: boolean;

  /** The frozen record the payable figures came from; null until anything credited. */
  closed_at: string | null;
  closing_snapshot_id: string | null;

  my_payable_views: number;
  my_earnings: number;
  my_entries: CampaignResultEntry[];
};

export type CampaignResultResponse = { success: boolean; result: CampaignResult };

/**
 * Whether this creator has anything to be shown.
 *
 * A campaign they never entered answers with zeroes and an empty list rather
 * than a 404, so "did the request succeed" is not the same question as "is
 * there a result worth rendering".
 */
export function hasCampaignResult(result: CampaignResult): boolean {
  return result.my_entries.length > 0 || result.my_payable_views > 0;
}
