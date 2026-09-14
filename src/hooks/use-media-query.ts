"use client";

import * as React from "react";

const mediaQueryLists = new Map<string, MediaQueryList>();

function getMediaQueryList(query: string): MediaQueryList | null {
  if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
    return null;
  }

  let list = mediaQueryLists.get(query);
  if (!list) {
    list = window.matchMedia(query);
    mediaQueryLists.set(query, list);
  }
  return list;
}

export function useMediaQuery(query: string): boolean {
  const subscribe = React.useCallback(
    (onStoreChange: () => void) => {
      const list = getMediaQueryList(query);
      if (!list) return () => {};

      list.addEventListener("change", onStoreChange);
      return () => list.removeEventListener("change", onStoreChange);
    },
    [query]
  );

  const getSnapshot = React.useCallback(
    () => getMediaQueryList(query)?.matches ?? false,
    [query]
  );

  return React.useSyncExternalStore(subscribe, getSnapshot, () => false);
}

/** Matches Tailwind's `sm` breakpoint - the point this app switches a filter's picker from a bottom sheet to a dropdown. */
export function useIsDesktop(): boolean {
  return useMediaQuery("(min-width: 640px)");
}
