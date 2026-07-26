import { create } from "zustand";

/**
 * Whether the decisions modal is on screen. It lives in a store because the
 * modal is mounted by the dashboard while the things that need to summon it
 * (the turn control, a draft's studio session) sit in other tabs entirely.
 */
interface DecisionsUiState {
  open: boolean;
  openDecisions: () => void;
  closeDecisions: () => void;
}

export const useDecisionsUi = create<DecisionsUiState>((set) => ({
  open: false,
  openDecisions: () => set({ open: true }),
  closeDecisions: () => set({ open: false }),
}));
