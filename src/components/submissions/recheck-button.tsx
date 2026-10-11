"use client";

import { useRouter } from "next/navigation";
import { Loader2, RefreshCw } from "lucide-react";
import { toast } from "sonner";

import { CHECKS_FAILED_CODE, apiErrorDetails } from "@/lib/api-client";
import { useRecheckSubmissionMutation } from "@/hooks/use-submissions";
import { issueCopy } from "@/schemas/submission";
import { Button } from "@/components/ui/button";
import { errorMessage } from "@/components/shared/query-state";

export function RecheckButton({
  submissionId,
  size = "lg",
  refreshOnSuccess = false,
}: {
  submissionId: string;
  size?: "sm" | "lg";
  refreshOnSuccess?: boolean;
}) {
  const router = useRouter();
  const recheck = useRecheckSubmissionMutation();

  return (
    <Button
      variant="outline"
      size={size}
      disabled={recheck.isPending}
      onClick={() =>
        recheck.mutate(submissionId, {
          onSuccess: (response) => {
            if (response.submission.status === "approved") {
              toast.success("Looks good — tracking has started");
            } else {
              toast.success("Looks good — it's now awaiting review");
            }
            if (refreshOnSuccess) router.refresh();
          },
          onError: (error) => {
            const details = apiErrorDetails(error);
            const issue = details.code === CHECKS_FAILED_CODE ? details.issues?.[0] : undefined;
            if (issue) {
              toast.error("Still not tracking", { description: issueCopy(issue).title });
              return;
            }
            toast.error(errorMessage(error));
          },
        })
      }
    >
      {recheck.isPending ? <Loader2 className="animate-spin" /> : <RefreshCw />}
      {recheck.isPending ? "Checking…" : "Re-check post"}
    </Button>
  );
}
