"use client";

import { Megaphone } from "lucide-react";

import { useMyCampaignsInfiniteQuery } from "@/hooks/use-campaigns";
import { EmptyState } from "@/components/shared/empty-state";
import { LoadMore } from "@/components/shared/load-more";
import { QueryState } from "@/components/shared/query-state";
import { Skeleton } from "@/components/ui/skeleton";
import { MyCampaignCard } from "@/components/campaigns/my-campaign-card";

export function UserCampaigns() {
  const {
    data,
    error,
    isPending,
    refetch,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
  } = useMyCampaignsInfiniteQuery();

  const campaigns = data?.pages.flatMap((page) => page.campaigns) ?? [];

  return (
    <QueryState
      isLoading={isPending}
      loadingFallback={
        <div className="space-y-3">
          {[0, 1, 2].map((index) => (
            <Skeleton key={index} className="h-80 w-full rounded-2xl" />
          ))}
        </div>
      }
      error={error}
      onRetry={() => void refetch()}
      isEmpty={campaigns.length === 0}
      emptyState={
        <EmptyState
          icon={Megaphone}
          title="No campaigns yet"
          description="Join a campaign from Home and submit your first clip to see it here."
        />
      }
    >
      <ul className="grid gap-3 md:grid-cols-2 md:items-start">
        {campaigns.map((campaign) => (
          <li key={campaign.id}>
            <MyCampaignCard campaign={campaign} />
          </li>
        ))}
      </ul>

      <LoadMore
        hasNextPage={hasNextPage}
        isFetchingNextPage={isFetchingNextPage}
        onLoadMore={() => void fetchNextPage()}
      />
    </QueryState>
  );
}
