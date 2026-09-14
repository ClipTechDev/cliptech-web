"use client";

import * as React from "react";
import { useRouter } from "next/navigation";

import { platformLabel } from "@/lib/format";
import { listHref, mergeListParams, type ListParams } from "@/lib/list-params";
import { PLATFORMS } from "@/schemas/common";
import { FilterBar } from "@/components/filters/filter-bar";
import type { FilterGroup } from "@/components/filters/types";

const GROUPS: FilterGroup[] = [
  {
    key: "platform",
    label: "Platform",
    options: PLATFORMS.map((option) => ({
      value: option,
      label: platformLabel(option),
    })),
  },
];

export function CampaignFilters({
  params,
  pathname,
}: {
  params: ListParams;
  pathname: string;
}) {
  const router = useRouter();
  const [isPending, startTransition] = React.useTransition();

  return (
    <FilterBar
      className={isPending ? "opacity-60 transition-opacity" : undefined}
      groups={GROUPS}
      values={params.filters}
      onChange={(key, value) => {
        const next = mergeListParams(params, { filters: { [key]: value } });
        startTransition(() => {
          router.replace(listHref(pathname, next), { scroll: false });
        });
      }}
    />
  );
}
