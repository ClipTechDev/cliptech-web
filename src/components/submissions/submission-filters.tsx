"use client";

import { humanise, platformLabel } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { useListParams } from "@/hooks/use-list-params";
import { PLATFORMS } from "@/schemas/common";
import { SUBMISSION_FILTER_STATUSES } from "@/schemas/submission";

/**
 * Status and platform, as two scrollable chip rows.
 *
 * `flagged` is missing from the status row on purpose: it is a real stored
 * state, but submission.Service.List rejects it as a filter value and answers
 * 404, so offering it would produce a "not found" screen for a legitimate tap.
 */
export function SubmissionFilters({
  params,
  setParams,
}: {
  params: ReturnType<typeof useListParams>["params"];
  setParams: ReturnType<typeof useListParams>["setParams"];
}) {
  const status = params.filters.status ?? "";
  const platform = params.filters.platform ?? "";

  return (
    <div className="-mx-4 space-y-2 overflow-x-hidden px-4 sm:-mx-6 sm:px-6">
      <ChipRow>
        <Chip active={status === ""} onClick={() => setParams({ filters: { status: "" } })}>
          All
        </Chip>
        {SUBMISSION_FILTER_STATUSES.map((option) => (
          <Chip
            key={option}
            active={status === option}
            onClick={() =>
              setParams({ filters: { status: status === option ? "" : option } })
            }
          >
            {humanise(option)}
          </Chip>
        ))}
      </ChipRow>

      <ChipRow>
        <Chip
          active={platform === ""}
          onClick={() => setParams({ filters: { platform: "" } })}
        >
          All platforms
        </Chip>
        {PLATFORMS.map((option) => (
          <Chip
            key={option}
            active={platform === option}
            onClick={() =>
              setParams({ filters: { platform: platform === option ? "" : option } })
            }
          >
            {platformLabel(option)}
          </Chip>
        ))}
      </ChipRow>
    </div>
  );
}

function ChipRow({ children }: { children: React.ReactNode }) {
  return (
    <div className="-mx-4 overflow-x-auto px-4 sm:-mx-6 sm:px-6">
      <div className="flex w-max gap-2 pb-1">{children}</div>
    </div>
  );
}

function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={cn(
        "rounded-full border px-3 py-1.5 text-sm whitespace-nowrap transition-colors",
        active
          ? "border-primary bg-primary text-primary-foreground"
          : "border-border text-muted-foreground hover:text-foreground"
      )}
    >
      {children}
    </button>
  );
}
