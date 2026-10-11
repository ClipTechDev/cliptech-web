import { humanise } from "@/lib/format";
import { Badge } from "@/components/ui/badge";
import type { SubmissionDisplayStatus } from "@/schemas/submission";

const VARIANTS: Record<
  SubmissionDisplayStatus,
  "success" | "warning" | "destructive" | "secondary"
> = {
  pending: "secondary",
  approved: "success",
  tracking: "success",
  completed: "secondary",
  rejected: "destructive",
  invalidated: "destructive",
  flagged: "warning",
};

const LABELS: Partial<Record<SubmissionDisplayStatus, string>> = {
  pending: "Awaiting review",
};

export function SubmissionStatusBadge({ status }: { status: SubmissionDisplayStatus }) {
  return (
    <Badge variant={VARIANTS[status] ?? "secondary"}>
      {LABELS[status] ?? humanise(status)}
    </Badge>
  );
}
