import { cn } from "@/lib/utils";

/**
 * The pill used by the in-page tab rows - the profile section nav and the
 * earnings tabs. They render different elements (one is an anchor that
 * intercepts its own click to scroll, the other a real route link), so what
 * they share is the styling rather than a component.
 */
export function tabPillClassName(active: boolean, className?: string): string {
  return cn(
    "rounded-lg px-3 py-2 text-sm whitespace-nowrap transition-colors",
    "focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none",
    active
      ? "bg-muted font-medium text-foreground"
      : "text-muted-foreground hover:bg-muted/60 hover:text-foreground",
    className
  );
}
