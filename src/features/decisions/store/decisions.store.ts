import { create } from "zustand";

/**
 * Whether the decisions modal is on screen. It lives in a store because the
 * modal is mounted by the dashboard while the things that need to summon it
 * (the turn control, a draft's studio session) sit in other tabs entirely.
 *
 * `deferred` holds the modal back while another insert is on screen (a night
 * out that went wrong raises a decision while its own result is still being
 * read); the decision shows up as soon as that insert closes.
 */
interface DecisionsUiState {
  open: boolean;
  deferred: boolean;
  openDecisions: () => void;
  closeDecisions: () => void;
  setDeferred: (deferred: boolean) => void;
}

export const useDecisionsUi = create<DecisionsUiState>((set) => ({
  open: false,
  deferred: false,
  openDecisions: () => set({ open: true }),
  closeDecisions: () => set({ open: false }),
  setDeferred: (deferred) => set({ deferred }),
}));
