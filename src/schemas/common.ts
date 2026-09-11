/**
 * Shapes cliptech-api returns on every listing, mirrored from
 * internal/shared/pagination.go.
 */
export type PageMeta = {
  page: number;
  limit: number;
  total: number;
  total_pages: number;
  has_next: boolean;
  has_prev: boolean;
};

/**
 * Every paginated endpoint answers `{ success, <resource>: [...], pagination }`
 * - there is no uniform `data` key, so the resource key is part of the type.
 */
export type PaginatedResponse<TKey extends string, TItem> = {
  success: boolean;
  pagination: PageMeta;
} & { [K in TKey]: TItem[] };

/**
 * Some listings are deliberately unpaginated (`/social/accounts`,
 * `/payout-methods`) and carry no `pagination` key at all.
 */
export type CollectionResponse<TKey extends string, TItem> = {
  success: boolean;
} & { [K in TKey]: TItem[] };

/** Endpoints that answer with nothing but an acknowledgement. */
export type MessageResponse = {
  success: boolean;
  message: string;
};

export const EMPTY_PAGE_META: PageMeta = {
  page: 1,
  limit: 20,
  total: 0,
  total_pages: 0,
  has_next: false,
  has_prev: false,
};

/** Mirrors social.Platform in internal/features/social/model.go. */
export const PLATFORMS = ["instagram", "twitter", "youtube", "tiktok"] as const;
export type Platform = (typeof PLATFORMS)[number];
