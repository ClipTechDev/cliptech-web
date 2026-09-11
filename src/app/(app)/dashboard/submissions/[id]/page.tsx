import { cache } from "react";
import type { Metadata } from "next";

import { handleApiFailure, serverFetch } from "@/lib/api-server";
import { DEFAULT_PAGE_SIZE } from "@/lib/list-params";
import type {
  SubmissionLog,
  SubmissionLogsResponse,
  SubmissionResponse,
} from "@/schemas/submission";
import { SubmissionDetail } from "@/components/submissions/submission-detail";

/**
 * Memoised for one request, so generateMetadata and the page body share a
 * single upstream call.
 */
const getSubmission = cache((id: string) =>
  serverFetch<SubmissionResponse>(`/submissions/${id}`)
);

/**
 * The tracking history. One page of readings is the screen - a post checked
 * every few hours for a month would otherwise render hundreds of rows nobody
 * scrolls to, and the recent ones are the ones that answer "is it still
 * growing".
 */
async function getLogs(id: string): Promise<SubmissionLog[]> {
  try {
    const { logs } = await serverFetch<SubmissionLogsResponse>(
      `/submissions/${id}/logs`,
      { query: { limit: DEFAULT_PAGE_SIZE } }
    );
    return logs;
  } catch {
    // The history is context, not the record itself. A submission that loads
    // without it is still worth showing.
    return [];
  }
}

export async function generateMetadata(
  props: PageProps<"/dashboard/submissions/[id]">
): Promise<Metadata> {
  const { id } = await props.params;

  try {
    const { submission } = await getSubmission(id);
    return {
      title: `${submission.campaign_name || "Your clip"} · ClipTech`,
    };
  } catch {
    // Metadata is not the place to redirect or 404 - the page below does that
    // with the same failure, and does it with the right `next` path.
    return { title: "Your clip · ClipTech" };
  }
}

export default async function SubmissionDetailPage(
  props: PageProps<"/dashboard/submissions/[id]">
) {
  const { id } = await props.params;

  // `.catch` rather than try/catch: handleApiFailure signals by throwing
  // redirect() and notFound(), which a surrounding catch would swallow.
  const { submission } = await getSubmission(id).catch((error: unknown) =>
    handleApiFailure(error, `/dashboard/submissions/${id}`)
  );

  // The submission already carries campaign_name and campaign_status, so the
  // history is the only thing still to fetch.
  const logs = await getLogs(id);

  return <SubmissionDetail submission={submission} logs={logs} />;
}
