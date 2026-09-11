"use client";

import { useMutation } from "@tanstack/react-query";

import { apiFetch } from "@/lib/api-client";
import type { FeedbackResponse } from "@/schemas/feedback";

/**
 * POST /v1/feedback. Multipart, because the endpoint reads a MultipartForm and
 * answers 400 to anything else - `description` as a field, `screenshot` as an
 * optional file, per feedback.Handler.Create.
 *
 * FormData is handed to apiFetch untouched: it must not be JSON-serialised,
 * and the browser has to set its own Content-Type so the multipart boundary
 * is right.
 */
export function useSubmitFeedbackMutation() {
  return useMutation({
    mutationFn: ({
      description,
      screenshot,
    }: {
      description: string;
      screenshot: File | null;
    }) => {
      const body = new FormData();
      body.append("description", description);
      if (screenshot) body.append("screenshot", screenshot);

      return apiFetch<FeedbackResponse>("/feedback", { method: "POST", body });
    },
  });
}
