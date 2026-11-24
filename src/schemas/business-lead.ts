import { z } from "zod";

import { PROMOTION_TYPES } from "@/components/business/content";

export const businessLeadSchema = z.object({
  name: z.string().trim().min(1, "Enter your name").max(120),
  email: z.email("Enter a valid work email").trim(),
  company: z.string().trim().min(1, "Enter your company or agency").max(160),
  promotion: z.enum(PROMOTION_TYPES, { error: "Choose what you're promoting" }),
  details: z.string().trim().max(2000, "Please keep this under 2,000 characters").optional(),
});

export type BusinessLeadInput = z.input<typeof businessLeadSchema>;
export type BusinessLeadValues = z.output<typeof businessLeadSchema>;
