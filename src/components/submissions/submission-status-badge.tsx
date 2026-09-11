import { humanise } from "@/lib/format";
import { Badge } from "@/components/ui/badge";
import type { SubmissionDisplayStatus } from "@/schemas/submission";

/**
 * Takes the *display* status, not the stored one - see
 * submissionDisplayStatus(). Tracking and Completed are both approved
 * underneath; the distinction is whether views are still being counted.
 */
const VARIANTS: Record<
  SubmissionDisplayStatus,
  "success" | "warning" | "destructive" | "secondary"
> = {
  approved: "success",
  // Still earning, so it keeps the positive tint rather than reading as a
  // pending state a creator has to do something about.
  tracking: "success",
  // Finished and paid up. Muted on purpose: there is nothing left to watch.
  completed: "secondary",
  pending: "warning",
  rejected: "destructive",
  invalidated: "destructive",
  // Flagged is under review rather than refused, so it reads as a warning even
  // though the list filter will not accept it as a query value.
  flagged: "warning",
};

export function SubmissionStatusBadge({ status }: { status: SubmissionDisplayStatus }) {
  return <Badge variant={VARIANTS[status] ?? "secondary"}>{humanise(status)}</Badge>;
}
