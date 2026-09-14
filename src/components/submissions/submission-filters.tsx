"use client";

import { humanise, platformLabel } from "@/lib/format";
import type { useListParams } from "@/hooks/use-list-params";
import { PLATFORMS } from "@/schemas/common";
import { SUBMISSION_FILTER_STATUSES } from "@/schemas/submission";
import { FilterBar } from "@/components/filters/filter-bar";
import type { FilterGroup } from "@/components/filters/types";

/**
 * Status and platform, as filter chips.
 *
 * `flagged` is missing from the status group on purpose: it is a real stored
 * state, but submission.Service.List rejects it as a filter value and answers
 * 404, so offering it would produce a "not found" screen for a legitimate tap.
 */
const GROUPS: FilterGroup[] = [
  {
    key: "status",
    label: "Status",
    options: SUBMISSION_FILTER_STATUSES.map((option) => ({
      value: option,
      label: humanise(option),
    })),
  },
  {
    key: "platform",
    label: "Platform",
    options: PLATFORMS.map((option) => ({
      value: option,
      label: platformLabel(option),
    })),
  },
];

export function SubmissionFilters({
  params,
  setParams,
}: {
  params: ReturnType<typeof useListParams>["params"];
  setParams: ReturnType<typeof useListParams>["setParams"];
}) {
  return (
    <FilterBar
      groups={GROUPS}
      values={params.filters}
      onChange={(key, value) => setParams({ filters: { [key]: value } })}
    />
  );
}
