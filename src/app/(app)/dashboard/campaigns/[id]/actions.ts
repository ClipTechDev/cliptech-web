"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import {
  ApiError,
  CHECKS_FAILED_CODE,
  DUPLICATE_POST_CODE,
  NetworkError,
  apiErrorDetails,
} from "@/lib/api-client";
import { serverFetch } from "@/lib/api-server";
import { submissionFormSchema } from "@/schemas/submission-form";
import type { SubmissionResponse } from "@/schemas/submission";
import type { SubmitClipState } from "./submit-clip-state";

const SUBMIT_TIMEOUT_MS = 30_000;

export async function submitClipAction(
  _prevState: SubmitClipState,
  formData: FormData
): Promise<SubmitClipState> {
  const parsed = submissionFormSchema.safeParse({
    campaign_id: String(formData.get("campaign_id") ?? ""),
    post_url: String(formData.get("post_url") ?? ""),
  });

  if (!parsed.success) {
    const issue = parsed.error.issues[0];
    const field = issue.path[0];

    return {
      status: "error",
      message: issue.message,
      field: field === "campaign_id" || field === "post_url" ? field : undefined,
    };
  }

  let created: SubmissionResponse;
  try {
    created = await serverFetch<SubmissionResponse>("/submissions", {
      method: "POST",
      body: parsed.data,
      timeoutMs: SUBMIT_TIMEOUT_MS,
    });
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) {
      redirect(
        `/login?next=${encodeURIComponent(`/dashboard/campaigns/${parsed.data.campaign_id}`)}`
      );
    }

    const details = apiErrorDetails(error);
    if (error instanceof ApiError && details.code === CHECKS_FAILED_CODE && details.issues) {
      return { status: "issues", message: error.message, issues: details.issues };
    }
    if (error instanceof ApiError && details.code === DUPLICATE_POST_CODE) {
      return {
        status: "duplicate",
        message: error.message,
        submissionId: details.submissionId,
      };
    }

    if (error instanceof ApiError || error instanceof NetworkError) {
      return { status: "error", message: error.message };
    }

    throw error;
  }

  revalidatePath(`/dashboard/campaigns/${parsed.data.campaign_id}`);
  revalidatePath("/dashboard/campaigns");

  return { status: "success", submissionId: created.submission.id };
}
