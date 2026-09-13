import type { PaginatedResponse } from "@/schemas/common";

/**
 * Mirrors payout.TransactionResponse in internal/features/payout/dto.go.
 *
 * The ledger is append-only and every row carries the balance it produced, so
 * `balance_after` is the running total a creator can reconcile against.
 */

/** Mirrors payout.TransactionType in internal/features/payout/model.go. */
export const TRANSACTION_TYPES = ["earning", "withdrawal"] as const;
export type TransactionType = (typeof TRANSACTION_TYPES)[number];

export type Transaction = {
  id: string;
  type: TransactionType;
  amount: number;
  balance_after: number;
  reference_type: string | null;
  reference_id: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
};

export type TransactionsResponse = PaginatedResponse<"transactions", Transaction>;

export function metadataString(transaction: Transaction, key: string): string | null {
  const value = transaction.metadata?.[key];
  return typeof value === "string" && value.trim() !== "" ? value : null;
}

/**
 * What the row is for, in a creator's words. An earning names the campaign it
 * came from; a withdrawal is either money leaving or a refused request handing
 * it back, which the sign tells us.
 */
export function transactionTitle(transaction: Transaction): string {
  if (transaction.type === "earning") {
    const campaign = metadataString(transaction, "campaign_name");
    return campaign ? `Earned from ${campaign}` : "Campaign earnings";
  }
  return transaction.amount < 0 ? "Withdrawal" : "Withdrawal returned";
}
