/** Fame standing derived from a band's fan count (mirrors the backend). */
export interface Fame {
  level: number;
  title: string;
  subtitle: string;
  isMaxLevel: boolean;
  currentLevelMinFans: number;
  currentLevelMaxFans: number | null;
  nextLevelAtFans: number | null;
}

/** A band as returned by the backend (`BandView`). */
export interface Band {
  id: string;
  name: string;
  theme: string;
  origin: string;
  foundationYear: number;
  fanCount: number;
  fame: Fame;
  currentYear: number;
  createdAt: string;
  updatedAt: string;
}
