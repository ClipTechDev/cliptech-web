/**
 * Base URL of cliptech-api, as reached from the browser.
 *
 * NEXT_PUBLIC_, unlike cliptech-admin's server-only API_URL, because this app
 * has no proxy hop: the browser is the client. That also means the value must
 * appear verbatim in the API's ALLOWED_ORIGINS - credentialed requests cannot
 * use a "*" origin, so a mismatch fails the preflight outright.
 */
const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

export const env = {
  /** No trailing slash, so `${env.apiUrl}/v1${path}` is always well formed. */
  apiUrl: apiUrl.replace(/\/+$/, ""),
};

/**
 * The session cookie cliptech-api issues on verify-otp. Mirrors
 * shared.AuthCookieName in the Go code - if that constant changes, this must
 * change with it.
 *
 * Nothing in this app reads it: it is HttpOnly, so it is invisible to JS by
 * design. It is named here only so the auth code can point at the thing it is
 * relying on.
 */
export const AUTH_COOKIE_NAME = "cliptech_token";

/**
 * The Firebase web app this browser registers against for push (req #32).
 *
 * Every value is NEXT_PUBLIC_ because every value is public by design: a web
 * app's Firebase config and its VAPID *public* key ship inside the bundle on
 * every Firebase site there is. What actually authorises a send is the service
 * account on the API side (FIREBASE_CREDENTIALS_JSON), which never leaves the
 * server.
 *
 * Only the four keys FCM itself needs are read. `authDomain` and
 * `storageBucket` appear in the snippet the Firebase console hands you, but
 * they belong to Auth and Storage - messaging works without them, and asking
 * for env vars nothing reads is how they end up wrong.
 */
const firebase = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY ?? "",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ?? "",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ?? "",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID ?? "",
};

/**
 * The public half of the Web Push key pair, from Project settings > Cloud
 * Messaging > Web configuration. `getToken` will not mint a registration token
 * without it.
 */
const firebaseVapidKey = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY ?? "";

export const firebaseConfig = firebase;

/**
 * Whether push is set up at all on this deployment.
 *
 * Push is optional: the app is fully usable without a Firebase project, so
 * every push surface checks this and stays hidden rather than rendering a
 * control that can only fail. The API takes the same position - push.New()
 * returns ErrNotConfigured and the dispatcher simply skips.
 */
export const pushConfigured =
  Object.values(firebase).every((value) => value !== "") && firebaseVapidKey !== "";

export const vapidKey = firebaseVapidKey;
