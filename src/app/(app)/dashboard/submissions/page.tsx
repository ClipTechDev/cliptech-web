import { Suspense } from "react";

import { PageHeader } from "@/components/shared/page-header";
import { Skeleton } from "@/components/ui/skeleton";
import { SubmissionList } from "@/components/submissions/submission-list";
import { SubmitClipButton } from "@/components/submissions/submit-clip-button";

export const metadata = { title: "Your clips · ClipTech" };

export default function SubmissionsPage() {
  return (
    <>
      <PageHeader
        title="Your clips"
        description="Everything you've submitted, and what it's earned."
      />
      <Suspense fallback={<Skeleton className="h-40 w-full rounded-xl" />}>
        <SubmissionList />
      </Suspense>
      <SubmitClipButton />
    </>
  );
}
