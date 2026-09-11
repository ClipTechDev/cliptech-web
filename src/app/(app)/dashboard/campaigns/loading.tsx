import { PageHeader } from "@/components/shared/page-header";
import { Skeleton } from "@/components/ui/skeleton";

/**
 * Shown while the server is still waiting on the API.
 *
 * Because the route is request-time, the shell here is what a creator sees
 * first on a slow connection - so it is shaped like the list rather than being
 * a spinner, and the header is real, not a placeholder.
 */
export default function CampaignsLoading() {
  return (
    <>
      <PageHeader title="Campaigns" description="Pick one, post a clip, get paid per view." />

      <div className="space-y-block" aria-busy="true">
        <div className="space-y-inline">
          <Skeleton className="h-11 w-full rounded-lg" />
          <Skeleton className="h-11 w-full rounded-full" />
          <Skeleton className="h-9 w-3/4 rounded-full" />
        </div>

        <div className="space-y-inline">
          {[0, 1, 2].map((index) => (
            <Skeleton key={index} className="h-48 w-full rounded-xl" />
          ))}
        </div>
      </div>
    </>
  );
}
