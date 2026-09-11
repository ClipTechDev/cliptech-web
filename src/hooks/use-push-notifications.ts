"use client";

import * as React from "react";
import { useMutation } from "@tanstack/react-query";

import { apiFetch } from "@/lib/api-client";
import { pushConfigured } from "@/lib/env";
import {
  clearRegistrationToken,
  fetchRegistrationToken,
  pushSupportedInThisBrowser,
  requestNotificationPermission,
} from "@/lib/push";
import type { MessageResponse } from "@/schemas/common";

/**
 * The last token this browser successfully handed to the API.
 *
 * Kept locally because the API does not report it back: user.Response
 * (internal/features/user/dto.go) deliberately omits fcm_token, and the token
 * is a property of *this browser* rather than of the account - a creator can
 * be signed in on a phone and a laptop and want push on only one. localStorage
 * is therefore the honest source for "is this browser registered", and it also
 * lets the load-time sync skip a PUT when nothing has changed.
 */
const STORED_TOKEN_KEY = "cliptech:push-token";

function readStoredToken(): string | null {
  try {
    return localStorage.getItem(STORED_TOKEN_KEY);
  } catch {
    // Storage can be unavailable outright (Safari private browsing, a browser
    // set to block site data). Push still works; it just re-PUTs each load.
    return null;
  }
}

function writeStoredToken(token: string | null): void {
  try {
    if (token === null) localStorage.removeItem(STORED_TOKEN_KEY);
    else localStorage.setItem(STORED_TOKEN_KEY, token);
  } catch {
    // See readStoredToken.
  }
}

const registerToken = (token: string) =>
  apiFetch<MessageResponse>("/users/me/push-token", {
    method: "PUT",
    body: { fcm_token: token },
  });

const unregisterToken = () =>
  apiFetch<MessageResponse>("/users/me/push-token", { method: "DELETE" });

export type PushPermission = "unsupported" | "default" | "granted" | "denied";

type PushSnapshot = {
  /** null on the server and during hydration, where there is no Notification. */
  permission: PushPermission | null;
  registered: boolean;
};

/* --------------------------------------------------------------------------
 * Browser permission is external state, not React state.
 *
 * It is owned by the browser, it can change from outside the app entirely (the
 * site settings panel), and it does not exist during the server render. So it
 * is read through useSyncExternalStore rather than copied into useState from
 * an effect - the same reasoning as use-mounted.ts, and the same reason the
 * React Compiler rejects the effect-and-setState version.
 * ----------------------------------------------------------------------- */

const SERVER_SNAPSHOT: PushSnapshot = { permission: null, registered: false };

const listeners = new Set<() => void>();

let snapshot: PushSnapshot = SERVER_SNAPSHOT;
let snapshotRead = false;

function readBrowser(): PushSnapshot {
  if (!pushConfigured || !pushSupportedInThisBrowser()) {
    return { permission: "unsupported", registered: false };
  }

  const permission = Notification.permission;
  return {
    permission,
    // Permission alone is not "on": a creator can allow notifications and
    // still have no token registered from this browser, which is exactly the
    // state a failed sync or an explicit turn-off leaves behind.
    registered: permission === "granted" && readStoredToken() !== null,
  };
}

/**
 * Re-reads the browser and notifies subscribers if anything moved.
 *
 * The identity check matters: useSyncExternalStore compares snapshots by
 * reference, so handing back a fresh object on every read would re-render
 * forever.
 */
function refresh(): void {
  const next = readBrowser();
  if (
    next.permission === snapshot.permission &&
    next.registered === snapshot.registered
  ) {
    return;
  }

  snapshot = next;
  for (const listener of listeners) listener();
}

function getSnapshot(): PushSnapshot {
  // Lazily on the first client read, so the store is populated without an
  // effect. Idempotent, and every later call returns the cached object.
  if (!snapshotRead) {
    snapshotRead = true;
    snapshot = readBrowser();
  }
  return snapshot;
}

const getServerSnapshot = (): PushSnapshot => SERVER_SNAPSHOT;

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  void watchPermissionChanges();

  return () => {
    listeners.delete(listener);
  };
}

let watching = false;

/**
 * Follows permission changes made outside the app - the padlock menu, site
 * settings - so a creator who unblocks notifications there does not have to
 * reload to see the control come back.
 *
 * The Permissions API is not universal; where it is missing this is simply a
 * no-op and the state is read fresh on the next load.
 */
async function watchPermissionChanges(): Promise<void> {
  if (watching || typeof navigator === "undefined" || !navigator.permissions) return;
  watching = true;

  try {
    const status = await navigator.permissions.query({ name: "notifications" });
    status.addEventListener("change", refresh);
  } catch {
    // Firefox has historically rejected this descriptor. Nothing to do.
  }
}

/* ----------------------------------------------------------------------- */

let syncStarted = false;

/**
 * Re-registers this browser's token if it has moved.
 *
 * FCM rotates registration tokens, and the API drops one the moment FCM
 * reports it unregistered (notification/dispatcher.go), so a browser that was
 * registered last week is not necessarily registered now. Load time is the
 * cheap place to notice: getToken answers from its own cache, and the PUT only
 * goes out when the token has actually changed.
 *
 * Guarded to once per page load - every mounted consumer of the hook would
 * otherwise start its own.
 */
async function syncRegistrationToken(): Promise<void> {
  if (syncStarted) return;
  syncStarted = true;

  if (getSnapshot().permission !== "granted") return;

  const stored = readStoredToken();
  const token = await fetchRegistrationToken();
  if (token === null || token === stored) return;

  try {
    await registerToken(token);
    writeStoredToken(token);
    refresh();
  } catch {
    // Silent on purpose: the creator did not ask for anything just now, and
    // the next load tries again. A failed background sync is not something to
    // interrupt them over.
  }
}

export type PushNotifications = {
  /** null until the browser state has been read on the client. */
  permission: PushPermission | null;
  /** Permission granted *and* a token registered from this browser. */
  enabled: boolean;
  isBusy: boolean;
  /** Set when a request the creator made failed, cleared when they retry. */
  error: string | null;
  enable: () => void;
  disable: () => void;
};

/**
 * Web push, from this browser's point of view (req #32).
 *
 * Three states matter and they are not the same thing: the browser's
 * permission (which only the creator can grant, and only once), whether a
 * token from this browser is registered with the API, and whether push is
 * configured on this deployment at all. Conflating the first two is what
 * produces a UI that says notifications are on while the API has no token to
 * send to.
 */
export function usePushNotifications(): PushNotifications {
  const { permission, registered } = React.useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot
  );

  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    void syncRegistrationToken();
  }, []);

  const enable = useMutation({
    mutationFn: async () => {
      // Asked first, and only from the click that called this: the prompt has
      // to be tied to a gesture or Chrome suppresses it.
      const result = await requestNotificationPermission();

      if (result !== "granted") {
        // A denial is final from here - only the creator can undo it, in
        // browser settings - so it is reported as state, not as a failure.
        refresh();
        return;
      }

      const token = await fetchRegistrationToken();
      if (token === null) {
        refresh();
        throw new Error(
          "Your browser allowed notifications, but we couldn't finish setting them up. Try again in a moment."
        );
      }

      await registerToken(token);
      writeStoredToken(token);
      refresh();
    },
    onMutate: () => setError(null),
    onError: (cause: unknown) =>
      setError(
        cause instanceof Error ? cause.message : "Couldn't turn on notifications."
      ),
  });

  const disable = useMutation({
    mutationFn: async () => {
      // The API first: clearing the stored token is what actually stops sends,
      // and it is the half that must not be skipped. Firebase is told after,
      // and is allowed to fail - a token nothing sends to is harmless.
      await unregisterToken();
      writeStoredToken(null);
      refresh();
      await clearRegistrationToken();
    },
    onMutate: () => setError(null),
    onError: (cause: unknown) =>
      setError(
        cause instanceof Error ? cause.message : "Couldn't turn off notifications."
      ),
  });

  return {
    permission,
    enabled: permission === "granted" && registered,
    isBusy: enable.isPending || disable.isPending,
    error,
    enable: () => enable.mutate(),
    disable: () => disable.mutate(),
  };
}

/**
 * Unregisters this browser on sign-out.
 *
 * Necessary, not tidiness: the token is stored against the *account*, and the
 * browser keeps it across a sign-out. Leave it and the next creator to sign in
 * here registers the same token against their own row - at which point one
 * device is registered to two accounts and both sets of notifications land on
 * it, including the previous creator's.
 *
 * Must be called while the session is still valid, since the DELETE sits
 * behind the auth middleware. Best-effort throughout: signing out is not
 * allowed to fail because push cleanup did.
 */
export async function releasePushToken(): Promise<void> {
  try {
    await unregisterToken();
  } catch {
    // An expired session (401) lands here. The token stays on the row until
    // FCM reports it unregistered, which is the best we can do from here.
  }

  writeStoredToken(null);
  refresh();
  await clearRegistrationToken();
}
