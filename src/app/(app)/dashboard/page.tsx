import { handleApiFailure, serverFetch } from "@/lib/api-server";
import { listParamsToQuery, type ListParams } from "@/lib/list-params";
import { PLATFORMS } from "@/schemas/common";
import type { CampaignsListResponse } from "@/schemas/campaign";
import type { DashboardResponse } from "@/schemas/dashboard";
import type { UserResponse } from "@/schemas/user";
import { formatCompactNumber, formatCurrency } from "@/lib/format";
import { PageHeader } from "@/components/shared/page-header";
import { StatCard } from "@/components/shared/stat-card";
import { CampaignFilters } from "@/components/campaigns/campaign-filters";
import { CampaignResults } from "@/components/campaigns/campaign-results";

export const metadata = { title: "Home · ClipTech" };

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const resolvedSearchParams = await searchParams;
  const rawPlatform =
    typeof resolvedSearchParams.platform === "string" ? resolvedSearchParams.platform : "";
  const platform = PLATFORMS.includes(rawPlatform as (typeof PLATFORMS)[number])
    ? rawPlatform
    : "";
  const params: ListParams = { search: "", filters: platform ? { platform } : {} };

  const [user, dashboard, campaigns] = await Promise.all([
    serverFetch<UserResponse>("/users/me"),
    serverFetch<DashboardResponse>("/dashboard"),
    serverFetch<CampaignsListResponse>("/campaigns", {
      query: listParamsToQuery(params),
    }),
  ]).catch((error: unknown) => handleApiFailure(error, "/dashboard"));

  return (
    <>
      <PageHeader
        title={`Welcome back, ${user.user.name.split(" ")[0] || "creator"}`}
        description="Find your next campaign and keep track of your progress."
      />

      <div className="space-y-section">
        <section className="space-y-block">
          <div>
            <h2 className="font-heading text-lg font-semibold">Your progress</h2>
            <p className="text-sm text-muted-foreground">A quick look at your ClipTech activity.</p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <StatCard label="Active campaigns" value={dashboard.dashboard.active_campaigns} emphasis />
            <StatCard label="Clips submitted" value={dashboard.dashboard.submissions.total} />
            <StatCard label="Total views" value={formatCompactNumber(dashboard.dashboard.total_views)} />
            <StatCard label="Lifetime earnings" value={formatCurrency(dashboard.dashboard.lifetime_earnings)} />
          </div>
        </section>

        <section className="space-y-block">
          <div>
            <h2 className="font-heading text-lg font-semibold">Campaigns you can join</h2>
            <p className="text-sm text-muted-foreground">Pick a platform and start creating.</p>
          </div>
          <CampaignFilters params={params} pathname="/dashboard" />
          <CampaignResults
            campaigns={campaigns.campaigns}
            meta={campaigns.pagination}
            params={params}
            pathname="/dashboard"
          />
        </section>
      </div>
    </>
  );
}
