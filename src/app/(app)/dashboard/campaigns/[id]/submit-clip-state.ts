import type { SubmissionIssue } from "@/schemas/submission";

export type SubmitClipState =
  | { status: "idle" }
  | { status: "error"; message: string; field?: "campaign_id" | "post_url" }
  | { status: "issues"; submissionId: string; issues: SubmissionIssue[] }
  | { status: "success"; submissionId: string };

export const initialSubmitClipState: SubmitClipState = { status: "idle" };
