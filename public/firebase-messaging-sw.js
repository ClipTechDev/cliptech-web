/*
 * The service worker that receives web push for this app (req #32).
 *
 * It lives in `public/`, so it is served verbatim at the site root and is
 * never touched by the bundler. Two consequences shape everything below:
 *
 *   1. `process.env.NEXT_PUBLIC_*` would stay a literal string here, so the
 *      Firebase config arrives on the query string instead. `registerMessaging
 *      ServiceWorker` in src/lib/push.ts is what puts it there.
 *   2. There is no import graph, so the SDK is pulled from Google's CDN with
 *      importScripts. The version below is pinned deliberately: bump it and
 *      the `firebase` dependency in package.json together.
 */

importScripts("https://www.gstatic.com/firebasejs/12.18.0/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/12.18.0/firebase-messaging-compat.js");

const config = new URL(self.location).searchParams;

firebase.initializeApp({
  apiKey: config.get("apiKey"),
  projectId: config.get("projectId"),
  messagingSenderId: config.get("messagingSenderId"),
  appId: config.get("appId"),
});

/*
 * Initialising messaging is the whole job.
 *
 * Deliberately no `onBackgroundMessage` handler, and deliberately no
 * `notificationclick` handler. cliptech-api sends every push with a
 * `notification` block (internal/push/push.go, Message.toFCM), and for those
 * the SDK's own push listener calls showNotification itself and its own click
 * listener opens `fcmOptions.link`. Adding either handler here would put a
 * second notification on screen and open a second tab.
 *
 * The one gap that leaves is local development: the API only sets
 * FCMOptions.Link when the link is https, because FCM rejects anything else,
 * so a click on a dev push opens the app root rather than the deep link. In
 * production, where FRONTEND_URL is https, the link is carried and honoured.
 */
firebase.messaging();
