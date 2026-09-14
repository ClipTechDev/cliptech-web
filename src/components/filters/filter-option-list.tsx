import { CheckIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import type { FilterGroup } from "@/components/filters/types";

export function FilterOptionList({
  group,
  value,
  onSelect,
}: {
  group: FilterGroup;
  value: string;
  onSelect: (value: string) => void;
}) {
  return (
    <div className="flex flex-col gap-0.5">
      <FilterOptionRow
        label={group.allLabel ?? `All ${group.label.toLowerCase()}`}
        active={value === ""}
        onClick={() => onSelect("")}
      />
      {group.options.map((option) => (
        <FilterOptionRow
          key={option.value}
          label={option.label}
          active={value === option.value}
          onClick={() => onSelect(option.value)}
        />
      ))}
    </div>
  );
}

function FilterOptionRow({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={cn(
        "flex w-full items-center justify-between gap-2 rounded-md px-3 py-2 text-left text-sm transition-colors hover:bg-accent",
        active ? "font-medium text-foreground" : "text-muted-foreground"
      )}
    >
      {label}
      {active && <CheckIcon className="size-4 shrink-0 text-primary" />}
    </button>
  );
}
