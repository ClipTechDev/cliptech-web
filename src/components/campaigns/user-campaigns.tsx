"use client";

import { useQuery } from "@tanstack/react-query";
import { Megaphone } from "lucide-react";

import { ApiError, apiFetch } from "@/lib/api-client";
import type { Campaign, CampaignResponse } from "@/schemas/campaign";
import type { SubmissionsListResponse } from "@/schemas/submission";
import { EmptyState } from "@/components/shared/empty-state";
import { QueryState } from "@/components/shared/query-state";
import { Skeleton } from "@/components/ui/skeleton";
import { CampaignCard } from "@/components/campaigns/campaign-card";

async function fetchUserCampaigns(): Promise<Campaign[]> {
  const response = await apiFetch<SubmissionsListResponse>("/submissions", {
    query: { limit: 100 },
  });
  const ids = [...new Set(response.submissions.map((submission) => submission.campaign_id))];
  const results = await Promise.all(
    ids.map(async (id) => {
      try {
        return (await apiFetch<CampaignResponse>(`/campaigns/${id}`)).campaign;
      } catch (error) {
        // Archived campaigns can disappear from the creator-facing endpoint.
        if (error instanceof ApiError && error.status === 404) return null;
        throw error;
      }
    })
  );

  return results.filter((campaign): campaign is Campaign => campaign !== null);
}

export function UserCampaigns() {
  const { data, error, isPending, refetch } = useQuery({
    queryKey: ["campaigns", "mine"],
    queryFn: fetchUserCampaigns,
  });

  return (
    <QueryState
      isLoading={isPending}
      loadingFallback={
        <div className="space-y-3">
          {[0, 1, 2].map((index) => (
            <Skeleton key={index} className="h-40 w-full rounded-xl" />
          ))}
        </div>
      }
      error={error}
      onRetry={() => void refetch()}
      isEmpty={data?.length === 0}
      emptyState={
        <EmptyState
          icon={Megaphone}
          title="No campaigns yet"
          description="Join a campaign from Home and submit your first clip to see it here."
        />
      }
    >
      <ul className="space-y-inline">
        {data?.map((campaign) => (
          <li key={campaign.id}>
            <CampaignCard campaign={campaign} />
          </li>
        ))}
      </ul>
    </QueryState>
  );
}
