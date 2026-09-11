"use client";

import { useRouter } from "next/navigation";
import { Loader2, RefreshCw } from "lucide-react";
import { toast } from "sonner";

import { useRevalidateSubmissionMutation } from "@/hooks/use-submissions";
import { Button } from "@/components/ui/button";
import { errorMessage } from "@/components/shared/query-state";

/**
 * The one interactive island on the server-rendered detail screen.
 *
 * Reuses the mutation the listing card uses - one code path to the endpoint -
 * and follows it with router.refresh(), because the rest of this screen was
 * rendered on the server and would otherwise still show the invalidated state
 * the creator has just cleared.
 */
export function RevalidateButton({ submissionId }: { submissionId: string }) {
  const router = useRouter();
  const revalidate = useRevalidateSubmissionMutation();

  return (
    <Button
      variant="outline"
      size="lg"
      disabled={revalidate.isPending}
      onClick={() =>
        revalidate.mutate(submissionId, {
          onSuccess: () => {
            toast.success("Submission re-checked");
            router.refresh();
          },
          onError: (error) => toast.error(errorMessage(error)),
        })
      }
    >
      {revalidate.isPending ? <Loader2 className="animate-spin" /> : <RefreshCw />}
      Try again
    </Button>
  );
}
