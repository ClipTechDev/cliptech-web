/**
 * Mirrors dashboard.UserResponse in internal/features/dashboard/dto.go.
 */
export type CreatorDashboard = {
  active_campaigns: number;
  open_campaigns: number;

  submissions: {
    total: number;
    pending: number;
    approved: number;
    rejected: number;
    invalidated: number;
  };

  /**
   * Note the tag mismatch on the Go side: the field is RawViews but it
   * serialises as `total_views`.
   */
  total_views: number;
  eligible_views: number;

  estimated_earnings: number;
  pending_earnings: number;

  available_balance: number;
  lifetime_earnings: number;
  paid_out: number;
  withdrawal_in_flight: number;
};

export type DashboardResponse = { success: boolean; dashboard: CreatorDashboard };
