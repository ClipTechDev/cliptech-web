"use client";

import { Plus } from "lucide-react";

import { cn } from "@/lib/utils";
import { useUiStore } from "@/stores/ui-store";
import { Button } from "@/components/ui/button";

/**
 * Fixed above the bottom nav using `--app-nav-clearance`, the same clearance
 * the page content reserves, so it never sits over the tab bar at either
 * breakpoint.
 *
 * `right` tracks the edge of AppShell's own `max-w-4xl` column rather than the
 * viewport edge: below that width the two coincide, but on a wide monitor the
 * column stops at 56rem and centers, and the button has to stop with it or it
 * ends up stranded out past the content it belongs to.
 */
export function SubmitClipButton({ className }: { className?: string }) {
  const openSubmit = useUiStore((state) => state.openSubmit);

  return (
    <Button
      size="icon-lg"
      onClick={() => openSubmit()}
      aria-label="Submit a clip"
      className={cn(
        "fixed right-4 bottom-[calc(var(--app-nav-clearance)+1rem)] z-30 size-14 rounded-full shadow-lg shadow-black/20",
        "sm:right-[max(1.5rem,calc((100vw-56rem)/2+1.5rem))]",
        className
      )}
    >
      <Plus className="size-6" />
    </Button>
  );
}
