import { z } from "zod";

import type { CreatorUser } from "@/schemas/user";

/**
 * Mirrors user.SendOTPRequest / user.VerifyOTPRequest in
 * internal/features/user/dto.go.
 *
 * There is no signup request because there is no signup: VerifyOTP calls
 * repo.GetOrCreateByEmail, so the first successful verification creates the
 * account. One form covers both.
 */

export const sendOtpSchema = z.object({
  email: z.email("Enter a valid email address"),
});
export type SendOtpValues = z.infer<typeof sendOtpSchema>;

/**
 * What the first step of the form collects, which is more than what it sends.
 *
 * Consent is gathered here rather than at the code step because this is the
 * request that creates the account: user.Service.SendOTP calls
 * GetOrCreateByEmail before it issues a code, so by the time a creator is
 * typing the code, the row already exists. Agreement has to come first.
 *
 * `acceptedTerms` never reaches the API - SendOTPRequest has no field for it,
 * and the record that matters is the account's creation date against the
 * effective date of the published terms.
 */
export const emailStepSchema = sendOtpSchema.extend({
  acceptedTerms: z.boolean().refine((accepted) => accepted, {
    message: "Please accept the Terms of Service and Privacy Policy to continue.",
  }),
});
export type EmailStepValues = z.infer<typeof emailStepSchema>;

/** The API's OTPs are six digits; anything else is a wasted round trip. */
export const verifyOtpSchema = z.object({
  otp: z
    .string()
    .trim()
    .regex(/^\d{6}$/, "Enter the 6-digit code"),
});
export type VerifyOtpValues = z.infer<typeof verifyOtpSchema>;

export type VerifyOtpResponse = {
  success: boolean;
  message: string;
  user: CreatorUser;
  /** RFC3339. When the session cookie stops being accepted. */
  expires_at: string;
};
