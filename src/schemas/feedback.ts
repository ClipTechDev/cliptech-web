import { z } from "zod";

/**
 * Mirrors feedback.Service.Create in internal/features/feedback/service.go.
 *
 * The endpoint takes multipart/form-data, not JSON: `description` as a field
 * and an optional `screenshot` file, which is why there is no request type
 * here - only the rules the form has to satisfy before it builds a FormData.
 */

/** maxDescriptionLength in feedback/service.go. */
export const MAX_FEEDBACK_LENGTH = 5000;

export type FeedbackResponse = {
  success: boolean;
  message: string;
  feedback: {
    id: string;
    user_id: string;
    description: string;
    screenshot_url: string | null;
    created_at: string;
  };
};

export const feedbackFormSchema = z.object({
  description: z
    .string()
    .trim()
    .min(1, "Tell us what happened")
    .max(
      MAX_FEEDBACK_LENGTH,
      `Please keep this under ${MAX_FEEDBACK_LENGTH.toLocaleString()} characters.`
    ),
});

export type FeedbackFormValues = z.infer<typeof feedbackFormSchema>;
