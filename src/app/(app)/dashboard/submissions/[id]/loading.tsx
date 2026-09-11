import { Skeleton } from "@/components/ui/skeleton";

export default function SubmissionDetailLoading() {
  return (
    <div className="space-y-section pb-card" aria-busy="true">
      <div className="space-y-block">
        <Skeleton className="h-9 w-28" />
        <Skeleton className="h-7 w-3/4" />
        <Skeleton className="h-4 w-2/3" />
      </div>

      <div className="gap-inline grid grid-cols-2">
        {[0, 1, 2, 3].map((index) => (
          <Skeleton key={index} className="h-20 rounded-xl" />
        ))}
      </div>

      <Skeleton className="h-48 w-full rounded-xl" />
    </div>
  );
}
