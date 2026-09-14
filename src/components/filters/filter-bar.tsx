import { cn } from "@/lib/utils";
import { FilterSelect } from "@/components/filters/filter-select";
import type { FilterGroup } from "@/components/filters/types";

/**
 * A row of filter chips, one per group - the generic replacement for the
 * scrollable "one chip per option" rows this app used to hand-roll on every
 * listing screen. Each chip opens its own dropdown (desktop) or bottom sheet
 * (mobile); callers just say what the groups are and where a change should go.
 */
export function FilterBar({
  groups,
  values,
  onChange,
  className,
}: {
  groups: FilterGroup[];
  values: Record<string, string>;
  onChange: (key: string, value: string) => void;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-wrap gap-2", className)}>
      {groups.map((group) => (
        <FilterSelect
          key={group.key}
          group={group}
          value={values[group.key] ?? ""}
          onChange={(value) => onChange(group.key, value)}
        />
      ))}
    </div>
  );
}
