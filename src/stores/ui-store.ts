import { create } from "zustand";

/**
 * Cross-component UI state. Deliberately small.
 *
 * Almost everything in this app is server state (TanStack Query) or URL state
 * (useListParams). The submit sheet is neither: it is opened from a campaign
 * card, from a campaign detail screen, and from the submissions tab's own
 * empty state - three places whose nearest common ancestor is the layout. A
 * lifted useState there would re-render every tab on each keystroke in the
 * sheet, and the URL would put a half-filled form into the back stack.
 */
type UiStore = {
  submitOpen: boolean;
  /** Preselects the campaign when opened from one; null means "let them pick". */
  submitCampaignId: string | null;
  openSubmit: (campaignId?: string) => void;
  closeSubmit: () => void;
};

export const useUiStore = create<UiStore>((set) => ({
  submitOpen: false,
  submitCampaignId: null,
  openSubmit: (campaignId) =>
    set({ submitOpen: true, submitCampaignId: campaignId ?? null }),
  // The campaign id is kept until the next open rather than cleared here: the
  // sheet animates out, and clearing it immediately re-renders the closing
  // sheet with an empty picker.
  closeSubmit: () => set({ submitOpen: false }),
}));
