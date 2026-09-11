import { PageHeader } from "@/components/shared/page-header";
import { UserCampaigns } from "@/components/campaigns/user-campaigns";

export const metadata = { title: "Campaigns · ClipTech" };

export default function CampaignsPage() {
  return (
    <>
      <PageHeader title="Campaigns" description="Campaigns you are participating in." />

      <UserCampaigns />
    </>
  );
}
