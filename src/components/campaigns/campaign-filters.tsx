import Link from "next/link";
import { platformLabel } from "@/lib/format";
import { listHref, mergeListParams, type ListParams } from "@/lib/list-params";
import { cn } from "@/lib/utils";
import { PLATFORMS } from "@/schemas/common";

/**
 * Scope and platform filters - with no client JavaScript.
 *
 * Every href is built for page 1: a narrower filter makes the current page
 * number meaningless, and `listHref` drops it by default.
 */
export function CampaignFilters({
  params,
  pathname,
}: {
  params: ListParams;
  pathname: string;
}) {
  const platform = params.filters.platform ?? "";

  /** The current view with one filter changed, as an href. */
  const hrefWith = (filters: Record<string, string>) =>
    listHref(pathname, mergeListParams(params, { filters }));

  return (
    <div className="space-y-inline">
      {/* Horizontally scrollable rather than wrapping: five chips wrap to two
          rows at 375px and push the first card off the screen. */}
      <div className="-mx-card px-card sm:-mx-6 sm:px-6 overflow-x-auto">
        <ul className="gap-tight flex w-max pb-1">
          <FilterChip href={hrefWith({ platform: "" })} active={platform === ""}>
            All platforms
          </FilterChip>
          {PLATFORMS.map((option) => (
            <FilterChip
              key={option}
              href={hrefWith({ platform: platform === option ? "" : option })}
              active={platform === option}
            >
              {platformLabel(option)}
            </FilterChip>
          ))}
        </ul>
      </div>
    </div>
  );
}

function FilterChip({
  href,
  active,
  children,
}: {
  href: string;
  active: boolean;
  children: React.ReactNode;
}) {
  return (
    <li>
      <Link
        href={href}
        aria-current={active ? "true" : undefined}
        className={cn(
          "block rounded-full border px-inline py-1.5 text-sm whitespace-nowrap transition-colors",
          active
            ? "border-primary bg-primary text-primary-foreground"
            : "border-border text-muted-foreground hover:text-foreground"
        )}
      >
        {children}
      </Link>
    </li>
  );
}
