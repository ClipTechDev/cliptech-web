import type { ReactNode } from "react";
import { AlertTriangle } from "lucide-react";

export function ErrorPanel({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children?: ReactNode;
}) {
  return (
    <div
      role="alert"
      className="gap-inline p-section flex flex-col items-center rounded-xl border border-dashed text-center"
    >
      <AlertTriangle className="size-5 text-muted-foreground" />
      <div className="space-y-1">
        <p className="text-sm font-medium">{title}</p>
        {description && (
          <p className="text-sm text-muted-foreground text-pretty">{description}</p>
        )}
      </div>
      {children}
    </div>
  );
}
