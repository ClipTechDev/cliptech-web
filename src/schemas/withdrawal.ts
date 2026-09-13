import { z } from "zod";

import type { PaginatedResponse } from "@/schemas/common";

/**
 * Mirrors withdrawal.Response in internal/features/withdrawal/dto.go.
 */

/** Mirrors withdrawal.Status in internal/features/withdrawal/model.go. */
export const WITHDRAWAL_STATUSES = [
  "pending",
  "approved",
  "processing",
  "paid",
  "rejected",
  "failed",
  "cancelled",
] as const;
export type WithdrawalStatus = (typeof WITHDRAWAL_STATUSES)[number];

/**
 * The states that hold money in flight, mirroring `openStatuses` and the
 * withdrawal_requests_one_open_per_user index: while one of these exists the
 * API refuses a second request.
 */
export const OPEN_WITHDRAWAL_STATUSES: WithdrawalStatus[] = [
  "pending",
  "approved",
  "processing",
];

export const WITHDRAWAL_STATUS_LABELS: Record<WithdrawalStatus, string> = {
  pending: "Pending review",
  approved: "Approved",
  processing: "Processing",
  paid: "Paid",
  rejected: "Rejected",
  failed: "Failed",
  cancelled: "Cancelled",
};

export type Withdrawal = {
  id: string;
  amount: number;
  status: WithdrawalStatus;
  next_statuses: WithdrawalStatus[];
  method: string;
  payout_method_id: string | null;
  provider_reference: string | null;
  failure_reason: string | null;
  requested_at: string;
  completed_at: string | null;
};

export type WithdrawalsResponse = PaginatedResponse<"withdrawals", Withdrawal>;
export type WithdrawalResponse = { success: boolean; withdrawal: Withdrawal };

export function isOpenWithdrawal(withdrawal: Withdrawal): boolean {
  return OPEN_WITHDRAWAL_STATUSES.includes(withdrawal.status);
}

/** Mirrors `minimumWithdrawal` in internal/features/withdrawal/service.go. */
export const MINIMUM_WITHDRAWAL = 1;

export const withdrawalFormSchema = z.object({
  amount: z
    .number({ message: "Enter an amount" })
    .positive("Amount must be greater than 0")
    .min(MINIMUM_WITHDRAWAL, `The minimum withdrawal is $${MINIMUM_WITHDRAWAL}`)
    .refine(
      (value) => Number.isInteger(Number((value * 100).toFixed(6))),
      "Amount supports at most 2 decimal places"
    ),
  payout_method_id: z.string().min(1, "Choose where to send the money"),
});

export type WithdrawalFormValues = z.infer<typeof withdrawalFormSchema>;
