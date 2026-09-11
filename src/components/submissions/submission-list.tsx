"use client";

import { Clapperboard } from "lucide-react";

import { isFiltered } from "@/lib/list-params";
import { useListParams } from "@/hooks/use-list-params";
import { useSubmissionsInfiniteQuery } from "@/hooks/use-submissions";
import { useUiStore } from "@/stores/ui-store";
import { SUBMISSION_FILTER_KEYS } from "@/schemas/submission";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/shared/empty-state";
import { LoadMore } from "@/components/shared/load-more";
import { QueryState } from "@/components/shared/query-state";
import { SubmissionCard } from "@/components/submissions/submission-card";
import { SubmissionFilters } from "@/components/submissions/submission-filters";

export function SubmissionList() {
  const { params, setParams, reset } = useListParams(SUBMISSION_FILTER_KEYS);
  const openSubmit = useUiStore((state) => state.openSubmit);
  const {
    data,
    error,
    isPending,
    refetch,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
  } = useSubmissionsInfiniteQuery(params);

  const submissions = data?.pages.flatMap((page) => page.submissions) ?? [];
  const filtered = isFiltered(params);

  return (
    <div className="space-y-4">
      <SubmissionFilters params={params} setParams={setParams} />

      <QueryState
        isLoading={isPending}
        loadingFallback={<SubmissionListSkeleton />}
        error={error}
        onRetry={() => void refetch()}
        isEmpty={submissions.length === 0}
        emptyState={
          filtered ? (
            <EmptyState
              icon={Clapperboard}
              title="No clips match"
              description="Try a different status or platform."
              action={
                <Button variant="outline" size="sm" onClick={reset}>
                  Clear filters
                </Button>
              }
            />
          ) : (
            <EmptyState
              icon={Clapperboard}
              title="No clips yet"
              description="Post a clip for a campaign, then paste the link here to start earning."
              action={<Button onClick={() => openSubmit()}>Submit a clip</Button>}
            />
          )
        }
      >
        <div className="space-y-3">
          {submissions.map((submission) => (
            <SubmissionCard key={submission.id} submission={submission} />
          ))}
        </div>

        <LoadMore
          hasNextPage={hasNextPage}
          isFetchingNextPage={isFetchingNextPage}
          onLoadMore={() => void fetchNextPage()}
        />
      </QueryState>
    </div>
  );
}

function SubmissionListSkeleton() {
  return (
    <div className="space-y-3">
      {[0, 1, 2].map((index) => (
        <Skeleton key={index} className="h-40 w-full rounded-xl" />
      ))}
    </div>
  );
}
