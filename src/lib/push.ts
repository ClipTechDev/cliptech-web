/**
 * The browser half of web push (req #32).
 *
 * Everything here touches `navigator`, `window` or `Notification`, so every
 * export is browser-only and every one of them is written to be safe to call
 * when the surrounding API does not exist - Firefox with push disabled, an
 * iOS home-screen app that has not been installed, a page served over plain
 * http. Push is an enhancement; nothing in this file may throw its way into
 * the render path.
 *
 * The division of labour with cliptech-api: this file produces an FCM
 * registration token, `PUT /v1/users/me/push-token` stores it against the
 * account, and notification/dispatcher.go sends to it. The API's own Firebase
 * credentials are a service account and stay on the server - what ships here
 * is only ever public config.
 */

import { firebaseConfig, pushConfigured, vapidKey } from "@/lib/env";

/** Served from `public/`, so it is at the site root and can claim scope "/". */
const SW_PATH = "/firebase-messaging-sw.js";

/**
 * Whether this browser can do web push at all.
 *
 * Checked before Firebase's own `isSupported()` because it is synchronous and
 * catches the two cases that matter most: a non-secure origin (where
 * `serviceWorker` is simply absent) and a browser with no Notification API.
 */
export function pushSupportedInThisBrowser(): boolean {
  return (
    typeof window !== "undefined" &&
    "Notification" in window &&
    "serviceWorker" in navigator &&
    "PushManager" in window
  );
}

/**
 * Registers the messaging service worker, handing it the Firebase config in
 * its query string.
 *
 * A service worker in `public/` is a static file: it is never processed by
 * Turbopack, so `process.env.NEXT_PUBLIC_*` inside it would stay a literal.
 * Passing the config on the URL is the way around that, and it has a useful
 * side effect - changing projects changes the worker's URL, which is what
 * makes the browser fetch and install the new one instead of keeping the
 * worker it registered against the old project.
 */
export async function registerMessagingServiceWorker(): Promise<ServiceWorkerRegistration> {
  const params = new URLSearchParams(firebaseConfig);
  return navigator.serviceWorker.register(`${SW_PATH}?${params.toString()}`, {
    scope: "/",
  });
}

/**
 * Loads Firebase Messaging, or null if this browser cannot run it.
 *
 * Imported dynamically so the SDK is fetched only by a browser that is
 * actually going to register for push - it is a large dependency, and every
 * server-rendered route in this app would otherwise carry it for nothing.
 */
async function loadMessaging() {
  if (!pushConfigured || !pushSupportedInThisBrowser()) return null;

  const [{ initializeApp, getApp, getApps }, { getMessaging, isSupported }] =
    await Promise.all([import("firebase/app"), import("firebase/messaging")]);

  // Firebase's own check is the stricter one: it also rules out browsers whose
  // service worker exists but cannot receive push (Safari before 16.4, a
  // private window in several browsers).
  if (!(await isSupported())) return null;

  // getApps() rather than a module-level flag: a fast-refresh cycle in dev
  // re-runs this module but not the SDK's internal registry, and a second
  // initializeApp with the same name throws.
  const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
  return getMessaging(app);
}

/**
 * Mints (or returns from cache) this browser's FCM registration token.
 *
 * Assumes permission has already been granted - `getToken` will prompt on its
 * own otherwise, and a prompt that appears without the creator asking for it
 * is exactly what `requestNotificationPermission` exists to avoid.
 *
 * Returns null rather than throwing on the ordinary failures: a token request
 * fails when the browser is offline, when the VAPID key does not match the
 * project, and when the user has revoked permission since. None of those are
 * worth an error boundary.
 */
export async function fetchRegistrationToken(): Promise<string | null> {
  const messaging = await loadMessaging();
  if (!messaging) return null;

  try {
    const { getToken } = await import("firebase/messaging");
    const registration = await registerMessagingServiceWorker();

    // The registration is passed explicitly: without it the SDK registers its
    // own `/firebase-messaging-sw.js` with no query string, and that worker
    // would initialise with an empty config.
    const token = await getToken(messaging, {
      vapidKey,
      serviceWorkerRegistration: registration,
    });

    return token || null;
  } catch {
    return null;
  }
}

/**
 * Drops this browser's token at Firebase. The API side is cleared separately -
 * both have to happen, and neither is allowed to block the other, so the
 * caller does them in sequence and tolerates this one failing.
 */
export async function clearRegistrationToken(): Promise<void> {
  const messaging = await loadMessaging();
  if (!messaging) return;

  try {
    const { deleteToken } = await import("firebase/messaging");
    await deleteToken(messaging);
  } catch {
    // Already gone, or the worker is unreachable. Either way there is nothing
    // left for a creator to act on.
  }
}

/**
 * Subscribes to messages that arrive while the app is in the foreground.
 *
 * FCM only displays a notification itself when the page is in the background.
 * With the tab focused the push is handed to the app instead and nothing is
 * shown, which is why this exists - without it, a creator reading the app is
 * the one person who never hears about anything.
 *
 * Returns a no-op unsubscribe when messaging is unavailable, so callers can
 * treat it as an ordinary effect cleanup.
 */
export async function onForegroundMessage(
  handler: (payload: ForegroundMessage) => void
): Promise<() => void> {
  const messaging = await loadMessaging();
  if (!messaging) return () => {};

  const { onMessage } = await import("firebase/messaging");
  return onMessage(messaging, (payload) => {
    handler({
      title: payload.notification?.title ?? null,
      body: payload.notification?.body ?? null,
      link: payload.data?.link ?? null,
      notificationId: payload.data?.notification_id ?? null,
      type: payload.data?.type ?? null,
    });
  });
}

/**
 * A push as the app receives it, flattened.
 *
 * The keys mirror what notification/dispatcher.go puts on the wire: `title`
 * and `body` from the notification block, and `link`, `notification_id` and
 * `type` from the data map.
 */
export type ForegroundMessage = {
  title: string | null;
  body: string | null;
  link: string | null;
  notificationId: string | null;
  type: string | null;
};

/**
 * Asks the browser for permission.
 *
 * Must be called from a user gesture. Chrome and Firefox both penalise a
 * prompt that appears on load - Chrome will quietly deny it outright under its
 * abusive-notification heuristics - and a denial is permanent from the app's
 * side: only the creator can undo it, in browser settings. That is the whole
 * reason the UI explains itself before this is ever reached.
 */
export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (!pushSupportedInThisBrowser()) return "denied";
  return Notification.requestPermission();
}
