import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

/**
 * One number and its label. Deliberately not the shadcn Card: these sit in a
 * two-up grid on a 375px screen, where Card's padding leaves no room for the
 * number itself.
 */
export function StatCard({
  label,
  value,
  hint,
  emphasis = false,
}: {
  label: string;
  value: ReactNode;
  hint?: string;
  emphasis?: boolean;
}) {
  return (
    <div
      className={cn(
        "p-card rounded-xl border",
        emphasis && "border-primary/30 bg-primary/5"
      )}
    >
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      <p
        className={cn(
          "font-heading mt-1 text-xl font-semibold tabular-nums",
          emphasis && "text-primary"
        )}
      >
        {value}
      </p>
      {hint && <p className="mt-0.5 text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}
