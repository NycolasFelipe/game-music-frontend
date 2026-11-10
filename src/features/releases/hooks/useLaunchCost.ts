import {
  useBudgetTiers,
  useReleaseFormats,
} from "@/features/releases/hooks/useReleaseCatalogs";
import { useRelease } from "@/features/releases/hooks/useReleases";

/**
 * What launching a draft costs: format base cost × budget multiplier, the same
 * rule the backend charges on finalize (`evaluateRelease`).
 *
 * @param bandId - The band.
 * @param releaseId - The draft, or `null` when there is none yet.
 * @returns The cost, or `null` while the draft or the catalogs load.
 */
export function useLaunchCost(bandId: string, releaseId: string | null): number | null {
  const { data: detail } = useRelease(bandId, releaseId);
  const { data: formats } = useReleaseFormats();
  const { data: tiers } = useBudgetTiers();
  const format = formats?.find((f) => f.id === detail?.format);
  const tier = tiers?.find((t) => t.id === detail?.budgetTier);
  return format && tier ? Math.round(format.baseCost * tier.costMultiplier * 100) / 100 : null;
}
