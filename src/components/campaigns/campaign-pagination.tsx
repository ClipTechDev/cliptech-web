import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { listHref, type ListParams } from "@/lib/list-params";
import type { PageMeta } from "@/schemas/common";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";

/**
 * Numbered pages rather than the "Load more" button the client-rendered lists
 * use, because this list is server-rendered: each view has to be a URL the
 * server can answer on its own, and an accumulating list is a client-side
 * pile of state by definition.
 *
 * Both controls are always present - the unavailable one as a disabled span
 * rather than a removed element - so the row does not reflow between pages and
 * the Next target stays under the same thumb.
 */
export function CampaignPagination({
  meta,
  params,
  pathname,
}: {
  meta: PageMeta;
  params: ListParams;
  pathname: string;
}) {
  if (meta.total_pages <= 1) return null;

  return (
    <nav
      aria-label="Campaign pages"
      className="gap-inline flex items-center justify-between pt-block"
    >
      <PageLink
        href={listHref(pathname, params, meta.page - 1)}
        enabled={meta.has_prev}
        rel="prev"
      >
        <ChevronLeft />
        Previous
      </PageLink>

      <p aria-live="polite" className="text-sm text-muted-foreground tabular-nums">
        Page {meta.page} of {meta.total_pages}
      </p>

      <PageLink
        href={listHref(pathname, params, meta.page + 1)}
        enabled={meta.has_next}
        rel="next"
      >
        Next
        <ChevronRight />
      </PageLink>
    </nav>
  );
}

function PageLink({
  href,
  enabled,
  rel,
  children,
}: {
  href: string;
  enabled: boolean;
  rel: "prev" | "next";
  children: React.ReactNode;
}) {
  const className = cn(buttonVariants({ variant: "outline", size: "lg" }), "gap-tight");

  if (!enabled) {
    return (
      <span aria-disabled="true" className={cn(className, "pointer-events-none opacity-50")}>
        {children}
      </span>
    );
  }

  // `scroll` is left at its default: a new page of results should start at the
  // top, which is the one place a creator can orient from.
  return (
    <Link href={href} rel={rel} className={className}>
      {children}
    </Link>
  );
}
