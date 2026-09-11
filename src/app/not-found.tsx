import Link from "next/link";

import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <main className="flex min-h-[100svh] flex-col items-center justify-center gap-4 px-6 text-center">
      <p className="font-heading text-5xl font-bold tracking-tight">404</p>
      <p className="text-muted-foreground">We couldn&apos;t find that page.</p>
      <Button nativeButton={false} render={<Link href="/dashboard" />}>
        Go to dashboard
      </Button>
    </main>
  );
}
