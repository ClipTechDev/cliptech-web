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
            toast[response.submission.status === "approved" ? "success" : "error"](
              response.submission.status === "approved"
                ? "Looks good — tracking has started"
                : "Still not tracking. Check the issues below."
            );
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
