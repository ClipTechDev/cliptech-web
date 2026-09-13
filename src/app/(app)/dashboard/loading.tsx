import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardLoading() {
  return (
    <div aria-busy="true">
      <div className="-mx-card px-card py-inline mb-2 border-b sm:-mx-6 sm:px-6">
        <Skeleton className="h-7 w-56" />
        <Skeleton className="mt-1.5 h-4 w-72 max-w-full" />
      </div>

      <div className="space-y-section">
        <section className="space-y-block">
          <div className="space-y-1">
            <Skeleton className="h-6 w-40" />
            <Skeleton className="h-4 w-64 max-w-full" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            {[0, 1, 2, 3].map((index) => (
              <Skeleton key={index} className="h-20 w-full rounded-xl" />
            ))}
          </div>
        </section>

        <section className="space-y-block">
          <div className="space-y-1">
            <Skeleton className="h-6 w-52" />
            <Skeleton className="h-4 w-56 max-w-full" />
          </div>
          <Skeleton className="h-9 w-28 rounded-full" />
          <div className="space-y-inline">
            {[0, 1, 2].map((index) => (
              <Skeleton key={index} className="h-48 w-full rounded-xl" />
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
