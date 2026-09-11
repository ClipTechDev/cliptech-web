/**
 * Display helpers shared across cards and detail screens, so a date or a
 * balance reads the same everywhere.
 *
 * All of these take the API's raw shape - including the nulls its pointer
 * fields serialise to - and return something safe to drop straight into JSX.
 */

const EM_DASH = "—";

export function formatDate(value: string | null | undefined): string {
  if (!value) return EM_DASH;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function formatDateTime(value: string | null | undefined): string {
  if (!value) return EM_DASH;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return date.toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatCurrency(value: number | null | undefined): string {
  if (value === null || value === undefined) return EM_DASH;

  return new Intl.NumberFormat(undefined, {
    style: "currency",
    currency: "USD",
  }).format(value);
}

export function formatNumber(value: number | null | undefined): string {
  if (value === null || value === undefined) return EM_DASH;
  return new Intl.NumberFormat().format(value);
}

/**
 * View counts, compacted. A card is a narrow column on a 375px screen and
 * "1,284,003" does not fit next to a label; "1.3M" does.
 */
export function formatCompactNumber(value: number | null | undefined): string {
  if (value === null || value === undefined) return EM_DASH;
  if (Math.abs(value) < 1000) return new Intl.NumberFormat().format(value);

  return new Intl.NumberFormat(undefined, {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value);
}

/** Falls back to an em dash so an empty field still occupies its line. */
export function orDash(value: string | null | undefined): string {
  return value && value.trim() ? value : EM_DASH;
}

/** "auth_failed" -> "Auth failed". For the API's snake_case enums. */
export function humanise(value: string): string {
  const spaced = value.replace(/[_-]/g, " ");
  return spaced.charAt(0).toUpperCase() + spaced.slice(1);
}

/**
 * Platform names as the platforms spell them - humanise() would render the
 * API's lowercase enum as "Tiktok" and "Youtube", which are simply wrong.
 * "twitter" shows as X, matching what the API's own error messages call it.
 */
const platformLabels: Record<string, string> = {
  instagram: "Instagram",
  tiktok: "TikTok",
  youtube: "YouTube",
  twitter: "X",
};

export function platformLabel(platform: string): string {
  return platformLabels[platform] ?? humanise(platform);
}

/**
 * "in 3 days" / "2 hours ago", for campaign deadlines and tracking times.
 *
 * A creator reading a campaign card cares how long is left, not the calendar
 * date it lands on; the exact timestamp stays available on the detail screen.
 */
export function formatRelative(value: string | null | undefined): string {
  if (!value) return EM_DASH;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  const deltaSeconds = Math.round((date.getTime() - Date.now()) / 1000);
  const absolute = Math.abs(deltaSeconds);

  const units: [Intl.RelativeTimeFormatUnit, number][] = [
    ["year", 31_536_000],
    ["month", 2_592_000],
    ["day", 86_400],
    ["hour", 3_600],
    ["minute", 60],
  ];

  const formatter = new Intl.RelativeTimeFormat(undefined, { numeric: "auto" });
  for (const [unit, seconds] of units) {
    if (absolute >= seconds) {
      return formatter.format(Math.round(deltaSeconds / seconds), unit);
    }
  }
  return formatter.format(deltaSeconds, "second");
}
