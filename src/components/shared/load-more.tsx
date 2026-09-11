"use client";

import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";

/**
 * Explicit pagination rather than an intersection-observer infinite scroll.
 *
 * The bottom bar is fixed over the end of the list, so a scroll-triggered
 * fetch fires while the sentinel is behind the bar and the creator never sees
 * why the page grew. A button they press is legible, and it also gives the
 * "you have reached the end" state somewhere to live.
 */
export function LoadMore({
  hasNextPage,
  isFetchingNextPage,
  onLoadMore,
  endMessage,
}: {
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
  onLoadMore: () => void;
  endMessage?: string;
}) {
  if (!hasNextPage) {
    return endMessage ? (
      <p className="py-4 text-center text-xs text-muted-foreground">{endMessage}</p>
    ) : null;
  }

  return (
    <div className="flex justify-center py-4">
      <Button variant="outline" onClick={onLoadMore} disabled={isFetchingNextPage}>
        {isFetchingNextPage && <Loader2 className="animate-spin" />}
        {isFetchingNextPage ? "Loading…" : "Load more"}
      </Button>
    </div>
  );
}
