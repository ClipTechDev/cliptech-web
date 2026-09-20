"use client";

import { useMyMembershipsQuery } from "@/hooks/use-campaign-membership";
import { membershipBadge } from "@/schemas/membership";
import { Badge } from "@/components/ui/badge";

export function CampaignMembershipBadge({ campaignId }: { campaignId: string }) {
  const memberships = useMyMembershipsQuery();
  const label = membershipBadge(memberships.data ?? [], campaignId);

  if (!label) return null;
  return <Badge variant={label === "Joined" ? "success" : "secondary"}>{label}</Badge>;
}
