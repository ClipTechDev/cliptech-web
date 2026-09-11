"use client";

import * as React from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import {
  emptyListParams,
  listParamsToSearchString,
  mergeListParams,
  parseListParams,
  type ListParams,
} from "@/lib/list-params";

/**
 * URL-as-list-state: filters live in the address bar rather than React state,
 * so a filtered view is shareable and survives a refresh.
 *
 * Navigation is `replace`, not `push`: typing eight characters into a search
 * box should not put eight entries in the back stack.
 */
export function useListParams(filterKeys: readonly string[] = []) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // filterKeys is nearly always an inline literal, so a fresh array arrives on
  // every parent render. Keying the memo on its contents instead of its
  // identity stops that from re-parsing the params (and re-rendering) endlessly.
  const keySignature = filterKeys.join(",");
  const keys = React.useMemo(
    () => keySignature.split(",").filter(Boolean),
    [keySignature]
  );

  const params = React.useMemo(
    () => parseListParams(searchParams, keys),
    [searchParams, keys]
  );

  const navigate = React.useCallback(
    (next: ListParams) => {
      const query = listParamsToSearchString(next);
      router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
    },
    [router, pathname]
  );

  const setParams = React.useCallback(
    (patch: Parameters<typeof mergeListParams>[1]) =>
      navigate(mergeListParams(params, patch)),
    [navigate, params]
  );

  const reset = React.useCallback(() => navigate(emptyListParams()), [navigate]);

  return { params, setParams, reset };
}
