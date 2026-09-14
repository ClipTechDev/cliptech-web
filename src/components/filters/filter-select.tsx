"use client";

import * as React from "react";
import { ChevronDownIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { useIsDesktop } from "@/hooks/use-media-query";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { FilterOptionList } from "@/components/filters/filter-option-list";
import type { FilterGroup } from "@/components/filters/types";

/**
 * One filter group as a chip: closed, it names the group ("Status"); with a
 * value picked, it shows that value instead. Opens a dropdown on desktop and
 * a bottom sheet on mobile, both driven by the same option list so the two
 * never drift out of sync.
 */
export function FilterSelect({
  group,
  value,
  onChange,
}: {
  group: FilterGroup;
  value: string;
  onChange: (value: string) => void;
}) {
  const [open, setOpen] = React.useState(false);
  const isDesktop = useIsDesktop();

  const selected = group.options.find((option) => option.value === value);
  const chipLabel = selected ? selected.label : group.label;

  function select(next: string) {
    onChange(next === value ? "" : next);
    setOpen(false);
  }

  const trigger = (
    <button
      type="button"
      className={cn(
        "flex items-center gap-1 rounded-full border px-3 py-1.5 text-sm whitespace-nowrap transition-colors",
        selected
          ? "border-primary bg-primary text-primary-foreground"
          : "border-border text-muted-foreground hover:text-foreground"
      )}
    >
      {chipLabel}
      <ChevronDownIcon className="size-3.5 shrink-0" />
    </button>
  );

  const list = <FilterOptionList group={group} value={value} onSelect={select} />;

  if (isDesktop) {
    return (
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger render={trigger} />
        <PopoverContent align="start" className="w-48">
          {list}
        </PopoverContent>
      </Popover>
    );
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger render={trigger} />
      <SheetContent side="bottom" className="max-h-[70svh]">
        <SheetHeader>
          <SheetTitle>{group.label}</SheetTitle>
        </SheetHeader>
        <div className="px-4 pb-6">{list}</div>
      </SheetContent>
    </Sheet>
  );
}
