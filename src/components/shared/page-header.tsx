import type { ReactNode } from "react";

/**
 * The heading block at the top of each tab. Sticky, because these lists are
 * long and the title doubles as the answer to "which tab am I on" once the
 * bottom bar has scrolled out of a creator's attention.
 */
export function PageHeader({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="-mx-card px-card py-inline mb-2 sticky top-0 z-30 border-b bg-background/85 backdrop-blur-lg sm:-mx-6 sm:px-6">
      <div className="gap-inline flex items-start justify-between">
        <div className="min-w-0 space-y-0.5">
          <h1 className="font-heading truncate text-xl font-semibold tracking-tight sm:text-2xl">
            {title}
          </h1>
          {description && (
            <p className="text-sm text-pretty text-muted-foreground">{description}</p>
          )}
        </div>
        {action && <div className="shrink-0">{action}</div>}
      </div>
    </div>
  );
}
