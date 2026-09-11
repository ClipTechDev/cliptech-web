"use client";

import { queryOptions, useQuery } from "@tanstack/react-query";

import { apiFetch } from "@/lib/api-client";
import type { DashboardResponse } from "@/schemas/dashboard";

export const dashboardKeys = {
  all: ["dashboard"] as const,
  creator: () => [...dashboardKeys.all, "creator"] as const,
};

export function dashboardOptions() {
  return queryOptions({
    queryKey: dashboardKeys.creator(),
    queryFn: () => apiFetch<DashboardResponse>("/dashboard"),
    select: (response: DashboardResponse) => response.dashboard,
  });
}

export function useDashboardQuery() {
  return useQuery(dashboardOptions());
}
