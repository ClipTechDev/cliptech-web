import { cache } from "react";
import type { Metadata } from "next";

import { handleApiFailure, serverFetch } from "@/lib/api-server";
import type { CampaignResponse } from "@/schemas/campaign";
import {
  hasCampaignResult,
  type CampaignResult,
  type CampaignResultResponse,
} from "@/schemas/campaign-result";
import type { Platform } from "@/schemas/common";
import type { SocialAccountsResponse } from "@/schemas/social-account";
import { CampaignDetail } from "@/components/campaigns/campaign-detail";


const getCampaign = cache((id: string) =>
  serverFetch<CampaignResponse>(`/campaigns/${id}`)
);

async function getConnectedPlatforms(): Promise<Platform[] | null> {
  try {
    const { accounts } = await serverFetch<SocialAccountsResponse>("/social/accounts");
    return accounts
      .filter((account) => !account.needs_reconnect)
      .map((account) => account.platform);
  } catch {
    return null;
  }
}

/**
 * This creator's outcome on this campaign (reqs #17 and #21).
 *
 * Null in three cases, all of which mean "there is no section to render": the
 * lookup failed, or the creator never entered this campaign - the endpoint
 * answers with zeroes and an empty list rather than a 404, so a successful
 * response is not by itself something worth showing.
 */
async function getCampaignResult(id: string): Promise<CampaignResult | null> {
  try {
    const { result } = await serverFetch<CampaignResultResponse>(
      `/campaigns/${id}/results`
    );
    return hasCampaignResult(result) ? result : null;
  } catch {
    return null;
  }
}

export async function generateMetadata(
  props: PageProps<"/dashboard/campaigns/[id]">
): Promise<Metadata> {
  const { id } = await props.params;

  try {
    const { campaign } = await getCampaign(id);
    return { title: `${campaign.name} · ClipTech` };
  } catch {
    // Metadata is not the place to redirect or 404 - the page below does that
    // with the same failure, and does it with the right `next` path.
    return { title: "Campaign · ClipTech" };
  }
}

export default async function CampaignDetailPage(
  props: PageProps<"/dashboard/campaigns/[id]">
) {
  const { id } = await props.params;

  // Started together: neither depends on the other, and the social lookup is
  // as slow as the campaign one.
  const [data, connectedPlatforms, result] = await Promise.all([
    // `.catch` rather than try/catch: handleApiFailure signals by throwing
    // redirect() and notFound(), which a surrounding catch would swallow.
    getCampaign(id).catch((error: unknown) =>
      handleApiFailure(error, `/dashboard/campaigns/${id}`)
    ),
    getConnectedPlatforms(),
    getCampaignResult(id),
  ]);

  return (
    <CampaignDetail
      campaign={data.campaign}
      connectedPlatforms={connectedPlatforms}
      result={result}
    />
  );
}
