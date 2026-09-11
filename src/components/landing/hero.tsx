import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { Button } from "@/components/ui/button";

/**
 * The landing page is one screen: wordmark, one line of copy, one action.
 *
 * `100svh` rather than `100vh` - on mobile Safari `vh` is the *largest*
 * viewport, so a full-height hero sits partly under the browser chrome until
 * the user scrolls. `svh` is the smallest, which is the one that always fits.
 */
export function Hero() {
  return (
    <main className="relative flex min-h-[100svh] flex-col items-center justify-center overflow-hidden px-6 text-center">
      {/* Decorative only, and behind everything: a soft brand wash so the
          screen isn't a flat slab of background. */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-1/3 left-1/2 -z-10 h-[60rem] w-[60rem] -translate-x-1/2 rounded-full bg-primary/15 blur-3xl"
      />

      <h1 className="font-heading text-6xl font-extrabold tracking-tight text-balance sm:text-8xl lg:text-9xl">
        Clip<span className="text-primary">Tech</span>
      </h1>

      <p className="mt-6 max-w-md text-lg text-pretty text-muted-foreground sm:text-xl">
        Post clips for the campaigns you like. Get paid for the views they earn.
      </p>

      <Button
        size="xl"
        className="mt-10 rounded-full px-8"
        nativeButton={false}
        render={<Link href="/dashboard" />}
      >
        Get Started
        <ArrowRight />
      </Button>
    </main>
  );
}
