import { Suspense } from "react";
import Link from "next/link";

import { OtpForm } from "@/components/auth/otp-form";
import { Skeleton } from "@/components/ui/skeleton";

/**
 * Outside the (app) group, so no bottom nav: there is nowhere to navigate to
 * until there is a session.
 *
 * The Suspense boundary is required, not decorative - OtpForm reads `?next=`
 * with useSearchParams, and a static page that does so without one fails the
 * production build.
 */
export default function LoginPage() {
  return (
    <main className="flex min-h-[100svh] flex-col justify-center px-6 py-12">
      <div className="mx-auto w-full max-w-sm">
        <Link
          href="/"
          className="font-heading mb-10 block text-center text-2xl font-extrabold tracking-tight"
        >
          Clip<span className="text-primary">Tech</span>
        </Link>

        <Suspense fallback={<LoginSkeleton />}>
          <OtpForm />
        </Suspense>
      </div>
    </main>
  );
}

function LoginSkeleton() {
  return (
    <div className="space-y-6" aria-busy="true">
      <div className="space-y-2">
        <Skeleton className="h-7 w-48" />
        <Skeleton className="h-4 w-64" />
      </div>
      <Skeleton className="h-11 w-full" />
      <Skeleton className="h-11 w-full" />
    </div>
  );
}
