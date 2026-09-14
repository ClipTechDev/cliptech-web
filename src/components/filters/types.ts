export type FilterOption = {
  value: string;
  label: string;
};

export type FilterGroup = {
  key: string;
  label: string;
  /** Defaults to "All {label}" (lowercased). */
  allLabel?: string;
  options: FilterOption[];
};
