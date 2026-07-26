import { useEffect } from "react";
import { ReleaseRevealModal } from "@/features/releases/components/ReleaseRevealModal";
import { useReviewTiers } from "@/features/releases/hooks/useReleaseCatalogs";
import { useReleaseRevealUi } from "@/features/releases/store/release-reveal.store";

/**
 * Mounts the reception reveal once, wherever the launch came from. Keeping a
 * single instance means the ceremony is identical for a work launched from the
 * discography and for one launched from the decisions modal.
 */
export function ReleaseRevealHost() {
  const { release, closeReveal } = useReleaseRevealUi();
  const { data: reviewTiers } = useReviewTiers();

  // Leaving the save drops the pending ceremony — the store outlives the page.
  useEffect(() => closeReveal, [closeReveal]);

  return (
    <ReleaseRevealModal
      release={release}
      reviewTiers={reviewTiers}
      opened={Boolean(release)}
      onClose={closeReveal}
    />
  );
}
