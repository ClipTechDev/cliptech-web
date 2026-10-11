import type { ReactNode } from "react";

/**
 * The title block at the top of each tab. Plain content, not a second sticky
 * bar: the TopBar above is the one persistent header.
 */
export function PageHeader({
  title,
  description,
  action,
}: {
  title: ReactNode;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="gap-inline pt-6 pb-4 flex items-start justify-between">
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
  );
}
