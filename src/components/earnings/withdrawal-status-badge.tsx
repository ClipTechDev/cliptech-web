import { Badge } from "@/components/ui/badge";
import {
  WITHDRAWAL_STATUS_LABELS,
  type WithdrawalStatus,
} from "@/schemas/withdrawal";

const VARIANTS: Record<
  WithdrawalStatus,
  "default" | "secondary" | "success" | "warning" | "destructive"
> = {
  pending: "warning",
  approved: "secondary",
  processing: "secondary",
  paid: "success",
  rejected: "destructive",
  failed: "destructive",
  cancelled: "secondary",
};

export function WithdrawalStatusBadge({ status }: { status: WithdrawalStatus }) {
  return (
    <Badge variant={VARIANTS[status] ?? "secondary"}>
      {WITHDRAWAL_STATUS_LABELS[status] ?? status}
    </Badge>
  );
}
