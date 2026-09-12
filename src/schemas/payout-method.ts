import { z } from "zod";

import type { CollectionResponse } from "@/schemas/common";

export const PAYOUT_METHOD_TYPES = ["paypal", "crypto"] as const;
export type PayoutMethodType = (typeof PAYOUT_METHOD_TYPES)[number];

export const PAYOUT_METHOD_LABELS: Record<PayoutMethodType, string> = {
  paypal: "PayPal",
  crypto: "Crypto wallet",
};

export const PAYOUT_METHOD_CONTENT_LABELS: Record<PayoutMethodType, string> = {
  paypal: "PayPal email",
  crypto: "Wallet address",
};

export const PAYOUT_METHOD_PLACEHOLDERS: Record<PayoutMethodType, string> = {
  paypal: "you@example.com",
  crypto: "0x… or your wallet address",
};

export function payoutMethodLabel(method: string): string {
  return PAYOUT_METHOD_LABELS[method as PayoutMethodType] ?? method;
}

export function payoutMethodContentLabel(method: string): string {
  return PAYOUT_METHOD_CONTENT_LABELS[method as PayoutMethodType] ?? "Details";
}

export type PayoutMethod = {
  id: string;
  label: string | null;
  method: string;
  details: Record<string, unknown>;
  is_default: boolean;
  created_at: string;
};

export type PayoutMethodsResponse = CollectionResponse<"methods", PayoutMethod>;
export type PayoutMethodResponse = { success: boolean; method: PayoutMethod };

export function payoutMethodContent(method: PayoutMethod): string {
  const content = method.details?.content;
  if (typeof content === "string" && content.trim() !== "") return content;

  for (const value of Object.values(method.details ?? {})) {
    if (typeof value === "string" && value.trim() !== "") return value;
  }
  return "";
}

export const payoutMethodFormSchema = z.object({
  method: z.enum(PAYOUT_METHOD_TYPES, { message: "Choose how you want to be paid" }),
  content: z
    .string()
    .trim()
    .min(1, "Tell us where to send the money")
    .max(500, "That's too long to be a payout address"),
  label: z.string().trim().max(100, "Label must be at most 100 characters"),
});

export type PayoutMethodFormValues = z.infer<typeof payoutMethodFormSchema>;

export const payoutMethodFormDefaults: PayoutMethodFormValues = {
  method: "paypal",
  content: "",
  label: "",
};
