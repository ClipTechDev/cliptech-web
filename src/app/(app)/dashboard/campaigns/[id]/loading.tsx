import { Skeleton } from "@/components/ui/skeleton";

export default function CampaignDetailLoading() {
  return (
    <div className="space-y-section pb-card pt-6" aria-busy="true">
      <div className="space-y-block">
        <Skeleton className="h-9 w-28" />
        <Skeleton className="h-40 w-full rounded-xl sm:h-52" />
        <Skeleton className="h-7 w-3/4" />
      </div>

      <div className="gap-inline grid grid-cols-2">
        {[0, 1, 2, 3].map((index) => (
          <Skeleton key={index} className="h-20 rounded-xl" />
        ))}
      </div>

      <Skeleton className="h-32 w-full rounded-xl" />
    </div>
  );
}
