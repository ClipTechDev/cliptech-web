import { humanise } from "@/lib/format";
import { Badge } from "@/components/ui/badge";
import type { Campaign } from "@/schemas/campaign";
import { campaignClosedReason } from "@/schemas/campaign";

/**
 * What a creator needs from a campaign's state is one question - can I still
 * submit to this? - so an open campaign gets a single "Open" badge rather than
 * its raw status, and a closed one shows the reason it is closed.
 */
export function CampaignStatusBadge({ campaign }: { campaign: Campaign }) {
  if (campaign.accepts_submissions) {
    return <Badge variant="success">Open</Badge>;
  }

  const reason = campaignClosedReason(campaign);
  return <Badge variant="secondary">{reason ?? humanise(campaign.status)}</Badge>;
}
