import { z } from "zod";

import type { CollectionResponse } from "@/schemas/common";

export const PAYOUT_METHOD_TYPES = ["paypal", "crypto"] as const;
export type PayoutMethodType = (typeof PAYOUT_METHOD_TYPES)[number];

export const PAYOUT_METHOD_LABELS: Record<PayoutMethodType, string> = {
  paypal: "PayPal",
  crypto: "USDT (Ethereum / ERC-20)",
};

export const CRYPTO_PAYOUT_CURRENCY = "USDT";
export const CRYPTO_PAYOUT_NETWORK = "Ethereum (ERC-20)";

export const PAYOUT_METHOD_CONTENT_LABELS: Record<PayoutMethodType, string> = {
  paypal: "PayPal email",
  crypto: "USDT wallet address (Ethereum / ERC-20)",
};

export const PAYOUT_METHOD_PLACEHOLDERS: Record<PayoutMethodType, string> = {
  paypal: "you@example.com",
  crypto: "0x followed by 40 characters",
};

export function payoutMethodLabel(method: string): string {
  return PAYOUT_METHOD_LABELS[method as PayoutMethodType] ?? method;
}

export function payoutMethodContentLabel(method: string): string {
  return PAYOUT_METHOD_CONTENT_LABELS[method as PayoutMethodType] ?? "Details";
}

const PAYOUT_METHOD_CONFIRM_LABELS: Record<PayoutMethodType, string> = {
  paypal: "Confirm PayPal email",
  crypto: "Confirm wallet address",
};

export function payoutMethodConfirmLabel(method: string): string {
  return PAYOUT_METHOD_CONFIRM_LABELS[method as PayoutMethodType] ?? "Confirm details";
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

export const payoutMethodFormSchema = z
  .object({
    method: z.enum(PAYOUT_METHOD_TYPES, { message: "Choose how you want to be paid" }),
    content: z
      .string()
      .trim()
      .min(1, "Tell us where to send the money")
      .max(500, "That's too long to be a payout address"),
    confirm_content: z.string().trim(),
    label: z.string().trim().max(100, "Label must be at most 100 characters"),
    agreedToPaymentDisclaimer: z.boolean(),
  })
  .refine(
    (values) => values.method !== "paypal" || z.email().safeParse(values.content).success,
    {
      message: "Enter the email address of your PayPal account",
      path: ["content"],
    }
  )
  .refine(
    (values) => values.method !== "crypto" || /^0x[0-9a-fA-F]{40}$/.test(values.content),
    {
      message:
        "Enter a USDT wallet address on the Ethereum network (ERC-20). It starts with 0x and is 42 characters long.",
      path: ["content"],
    }
  )
  .refine(
    (values) =>
      values.method === "paypal"
        ? values.confirm_content.toLowerCase() === values.content.toLowerCase()
        : values.confirm_content === values.content,
    {
      message: "This doesn't match what you entered above",
      path: ["confirm_content"],
    }
  )
  .refine((values) => values.method !== "crypto" || values.agreedToPaymentDisclaimer, {
    message: "You need to agree to the payment disclaimer",
    path: ["agreedToPaymentDisclaimer"],
  });

export type PayoutMethodFormValues = z.infer<typeof payoutMethodFormSchema>;

export const payoutMethodFormDefaults: PayoutMethodFormValues = {
  method: "paypal",
  content: "",
  confirm_content: "",
  label: "",
  agreedToPaymentDisclaimer: false,
};
