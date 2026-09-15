# ClipTech Web

The creator-facing app. A landing page at `/`, and a mobile-first dashboard at
`/dashboard` where creators browse campaigns, submit clips and manage their
profile.

Sibling to `cliptech-api` (the Go backend) and `cliptech-admin` (the operator
panel, port 3001). This app runs on **port 3000**.

Next.js 16 · React 19 · Tailwind v4 · shadcn (`base-nova`, on Base UI) ·
TanStack Query v5 · zustand · react-hook-form + zod.

## Getting started

```bash
cp .env.local.example .env.local
pnpm install
pnpm dev            # http://localhost:3000
```

`cliptech-api` must be running on `:8000`, and its `ALLOWED_ORIGINS` must list
`http://localhost:3000` — it does by default.

Sign-in codes are real: the API generates a random six-digit code and emails it
over SMTP. Configure `SMTP_*` in the API's `.env` (see its
`docs/integrations-setup.md`). With `SMTP_HOST` blank the API logs the code to
its own console instead, so a local checkout works without a mail server — that
fallback is refused when `APP_ENV=production`.

Requesting a code for an unknown address opens the account, so there is no
separate sign-up. Codes last 10 minutes, are single use, allow 5 wrong guesses,
and one address can ask for a new one every 60 seconds
(`OTP_TTL_MINUTES`, `OTP_MAX_ATTEMPTS`, `OTP_RESEND_INTERVAL_SECONDS`).

## How this app talks to cliptech-api

The browser calls the API **directly**, with `credentials: "include"` so the
`cliptech_token` cookie rides along. `cliptech-admin` does the opposite — it
proxies every call through its own origin — because it wants the API host kept
private. Here the API is a public dependency, it already allows this origin
with `AllowCredentials`, and the extra hop buys nothing.

One consequence drives a lot of the structure: **the session cookie is scoped
to the API's host, so this app's server cannot read it.** That rules out

- server-side prefetching (`serverFetch` + `HydrationBoundary`), so there is
  one fetcher, not the admin's two, and every query runs in the browser;
- a `middleware.ts` cookie-presence check, so route protection is
  `<AuthGuard>` in `app/(app)/layout.tsx`, keying off the API's own 401.

In local dev the two apps share `localhost` and cookies ignore port, so both of
those would *appear* to work — right up until the API moves to its own host.
They are deliberately not built on.

If `COOKIE_DOMAIN` is ever set to a shared parent (`.cliptech.io`), SSR
prefetch becomes possible and the admin's two-fetcher `ApiFetcher` pattern can
be retrofitted additively.

There is no refresh token and no refresh endpoint: the cookie lasts 7 days,
then the creator signs in again. Every 401 is handled the same way — clear the
session, redirect to `/login?next=…`.

## Data fetching

Same shape as the admin, minus the fetcher argument:

- `src/hooks/use-<resource>.ts` owns that resource's query keys
  (`campaignsKeys.list(params)`), its options factories, and its mutations.
- Response envelopes are unwrapped per-query with `select`, because the API has
  no uniform `data` key — it answers `{ success, campaigns, pagination }`,
  `{ success, user }`, `{ success, accounts }`, and so on.
- Mutations `setQueryData` the detail then `invalidateQueries` the list. Toasts
  and redirects are passed at the **call site**, never baked into the hook.
- Lists are `useInfiniteQuery` with a Load more button, paging off
  `pagination.has_next`. Filters live in the URL (`useListParams`); the page
  cursor does not — a shared link should reopen a filter, not a page number.

## Layout

`src/components/layout/bottom-nav.tsx` is the whole navigation model. Below
`sm` it is a full-width bar pinned to the bottom edge; at `sm` and up the same
element becomes a floating pill centred above it. There is no sidebar at any
width — the desktop view is the same three surfaces, and a sidebar would make
it read as an operator tool.

`--app-nav-clearance` (in `globals.css`) is the height every scrollable surface
reserves for that bar. `app-shell.tsx` applies it, and the campaign detail
screen's sticky Submit CTA anchors to it.

## Things the API dictates

- **Campaign filters are one control, not two.** `/v1/campaigns` defaults
  `joinable=true`, and passing any non-empty `status` silently switches that
  off. So the UI never sends `status` — the Open/All segmented control is
  purely the presence or absence of `joinable=false`.
- **`accepts_submissions` is the Submit button's only gate.** `cutoff_reached`
  and `status` explain *why* it is closed; `campaignClosedReason()` prefers a
  terminal status over the budget, because an ended campaign that spent its
  budget reports both and "Ended" is the truer answer.
- **`POST /v1/submissions` takes up to 20 seconds.** It resolves the post
  against the platform's API and verifies its owner, inline. The client
  timeout is 30s so the server's own error — which is specific and worth
  showing — wins the race. Its failure messages are surfaced verbatim.
- **`PATCH /v1/users/me` rejects an empty patch** with 400, so the profile form
  sends only changed fields (`profileFormDiff`) and blocks a no-op save.
- **`?status=flagged` answers 404** on submissions: it is a real stored state
  that the list filter's allow-list omits. It is in the badge, not the filter.
- **OAuth callbacks land on a server-configured path**, `FRONTEND_URL +
  SOCIAL_CONNECT_REDIRECT_PATH` (default `/settings/socials`). That route
  exists here at exactly that path and forwards to the profile tab, so the app
  works against an unmodified API `.env`.
- **Avatar upload is multipart on field `picture`**, max 5 MB, jpeg/png/webp.
- **Every sign-in failure has its own copy** — wrong code, expired, attempts
  spent, asked again too soon (429), relay down (503). Each implies a different
  next step, so `message` is shown verbatim rather than flattened. The Resend
  button counts down to match the server's cooldown instead of offering an
  action that would 429.

## Conventions

Files kebab-case. Named exports only — default exports are for Next route
files. No barrel files; imports always use the `@/` alias. API field names stay
snake_case all the way into form values. Enums are `as const` tuples with a
derived type, mirroring the Go constant they duplicate.

`src/schemas/*.ts` holds hand-written types mirroring the Go DTOs (responses
are cast, not runtime-parsed) plus zod schemas for **forms only**.

`src/components/ui/form.tsx` is copied from cliptech-admin, where it is
hand-authored — the `base-nova` registry ships no form component. Two other
registry files carry local additions, each commented: `button.tsx` gains an
`xl` size (base-nova tops out at 36px, under the 44px touch target) and
`badge.tsx` gains tinted `success`/`warning` variants for status.

Base UI composes with `render={<Link />}`, not Radix's `asChild` — and a Button
rendered as an anchor needs `nativeButton={false}` or it warns about losing
button semantics.

## Not built yet

Withdrawals and payout methods, the transactions ledger, notifications and FCM
web push, and the feedback form. All are endpoints the API already exposes;
each slots in as a profile sub-page without changing the shell.
