import { create } from "zustand";
import type { Release } from "@/features/releases/types";

/**
 * The work whose reception is being revealed. In a store because a launch can
 * start from the discography or from the decisions modal, and the reveal is the
 * same ceremony either way — it is mounted once, by the dashboard.
 */
interface ReleaseRevealState {
  release: Release | null;
  revealRelease: (release: Release) => void;
  closeReveal: () => void;
}

export const useReleaseRevealUi = create<ReleaseRevealState>((set) => ({
  release: null,
  revealRelease: (release) => set({ release }),
  closeReveal: () => set({ release: null }),
}));
