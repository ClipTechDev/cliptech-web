"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { ApiError, NetworkError } from "@/lib/api-client";
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

    if (error instanceof ApiError || error instanceof NetworkError) {
      return { status: "error", message: error.message };
    }

    throw error;
  }

  revalidatePath(`/dashboard/campaigns/${parsed.data.campaign_id}`);
  revalidatePath("/dashboard/campaigns");

  if (created.submission.issues.length > 0) {
    return {
      status: "issues",
      submissionId: created.submission.id,
      issues: created.submission.issues,
    };
  }

  return { status: "success", submissionId: created.submission.id };
}
