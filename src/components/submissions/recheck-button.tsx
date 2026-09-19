"use client";

import { useRouter } from "next/navigation";
import { Loader2, RefreshCw } from "lucide-react";
import { toast } from "sonner";

import { useRecheckSubmissionMutation } from "@/hooks/use-submissions";
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
            } else if (
              response.submission.status === "pending" &&
              response.submission.issues.length === 0
            ) {
              toast.success("Looks good — it's now awaiting review");
            } else {
              toast.error("Still not tracking. Check the issues below.");
            }
            if (refreshOnSuccess) router.refresh();
          },
          onError: (error) => toast.error(errorMessage(error)),
        })
      }
    >
      {recheck.isPending ? <Loader2 className="animate-spin" /> : <RefreshCw />}
      {recheck.isPending ? "Checking…" : "Re-check post"}
    </Button>
  );
}
