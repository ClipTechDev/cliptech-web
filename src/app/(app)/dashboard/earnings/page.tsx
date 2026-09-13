import { Suspense } from "react";

import { PageHeader } from "@/components/shared/page-header";
import { Skeleton } from "@/components/ui/skeleton";
import { EarningsScreen } from "@/components/earnings/earnings-screen";

export const metadata = { title: "Earnings · ClipTech" };

export default function EarningsPage() {
  return (
    <>
      <PageHeader
        title="Earnings"
        description="What you've made, what's on its way, and where it went."
      />
      <Suspense fallback={<Skeleton className="mt-2 h-28 w-full rounded-2xl" />}>
        <EarningsScreen />
      </Suspense>
    </>
  );
}
