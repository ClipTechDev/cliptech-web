/**
 * The slice of cliptech-api's listing contract this app actually drives from
 * the URL: `?search` plus whatever filters a resource adds (`platform` and
 * `joinable` for campaigns, `status` for submissions).
 *
 * Deliberately narrower than cliptech-admin's version of this file:
 *
 * - No `page`/`limit`. These lists are infinite queries with a Load more
 *   button, so the page cursor belongs to useInfiniteQuery, not the address
 *   bar - a shared link should reopen the same *filter*, not "page 4 of what
 *   the list looked like an hour ago".
 * - No `from`/`to`. There is no date-range picker on a phone-first surface.
 */

/** Mirrors shared.DefaultPageSize in the Go code. */
export const DEFAULT_PAGE_SIZE = 20;

export type ListParams = {
  search: string;
  /** Resource-specific filters, e.g. `{ platform: "youtube" }`. */
  filters: Record<string, string>;
};

/** A plain object of search params, as a Server Component receives them. */
export type RawSearchParams = Record<string, string | string[] | undefined>;

function readOne(params: RawSearchParams | URLSearchParams, key: string): string {
  if (params instanceof URLSearchParams) {
    return params.get(key) ?? "";
  }
  const value = params[key];
  return (Array.isArray(value) ? value[0] : value) ?? "";
}

/**
 * Reads params off a URL. Unknown or empty values are simply dropped rather
 * than throwing: a hand-edited URL should show an unfiltered list, not an
 * error screen.
 */
export function parseListParams(
  params: RawSearchParams | URLSearchParams,
  filterKeys: readonly string[] = []
): ListParams {
  const filters: Record<string, string> = {};
  for (const key of filterKeys) {
    const value = readOne(params, key);
    if (value) filters[key] = value;
  }

  return { search: readOne(params, "search"), filters };
}

/** Flattens params into the query object `apiFetch` sends upstream. */
export function listParamsToQuery(params: ListParams) {
  return { search: params.search, ...params.filters };
}

/**
 * Back to a query string for the address bar. Empty values are omitted so the
 * untouched view has a clean URL, and key order is fixed so the same state
 * always produces the same string (and so React never sees a "new" URL for an
 * unchanged view).
 */
export function listParamsToSearchString(params: ListParams): string {
  const search = new URLSearchParams();

  if (params.search) search.set("search", params.search);
  for (const key of Object.keys(params.filters).sort()) {
    if (params.filters[key]) search.set(key, params.filters[key]);
  }

  return search.toString();
}

/** Applies a partial change, merging filters rather than replacing them. */
export function mergeListParams(
  current: ListParams,
  patch: Partial<Omit<ListParams, "filters">> & { filters?: Record<string, string> }
): ListParams {
  return {
    ...current,
    ...patch,
    filters: patch.filters ? { ...current.filters, ...patch.filters } : current.filters,
  };
}

export function isFiltered(params: ListParams): boolean {
  return Boolean(params.search || Object.values(params.filters).some(Boolean));
}

export function emptyListParams(): ListParams {
  return { search: "", filters: {} };
}

/**
 * Pagination lives in the URL on the campaigns surface, because that surface
 * is server-rendered: the page a creator lands on has to be reachable from the
 * request alone, and "which page" is part of the request.
 *
 * That is a narrower promise than the filters make. A shared link reopens the
 * same filters *and* the same page - which is the honest thing for a numbered
 * list, where page 2 is a place rather than a scroll position.
 */
export function parsePage(params: RawSearchParams | URLSearchParams): number {
  const parsed = Number.parseInt(readOne(params, "page"), 10);
  // A hand-edited `?page=abc` or `?page=0` shows the first page rather than
  // an error, matching how parseListParams treats a junk filter.
  return Number.isFinite(parsed) && parsed > 1 ? parsed : 1;
}

/**
 * The href for a given view of a list. Page 1 is expressed as the absence of
 * the param, so the default view has a clean, canonical URL - and so changing
 * a filter (which always returns to page 1) cannot leave a stale `?page=7`
 * behind pointing past the end of the new result set.
 */
export function listHref(pathname: string, params: ListParams, page = 1): string {
  const search = new URLSearchParams(listParamsToSearchString(params));
  if (page > 1) search.set("page", String(page));

  const query = search.toString();
  return query ? `${pathname}?${query}` : pathname;
}
