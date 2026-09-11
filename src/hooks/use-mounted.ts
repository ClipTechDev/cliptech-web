"use client";

import * as React from "react";

const subscribe = () => () => {};

/**
 * False during the server render and the hydration pass, true afterwards.
 *
 * For the handful of places whose correct output genuinely depends on the
 * browser - the resolved colour theme, say - where rendering the real value
 * on the server would guarantee a hydration mismatch.
 *
 * useSyncExternalStore rather than the usual useState + useEffect(setMounted):
 * it expresses the same thing as a server/client snapshot difference instead
 * of a state update in an effect, which is a cascading render the React
 * Compiler (rightly) rejects.
 */
export function useMounted(): boolean {
  return React.useSyncExternalStore(
    subscribe,
    () => true,
    () => false
  );
}
