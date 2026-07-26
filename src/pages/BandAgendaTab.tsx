import { SegmentedControl, Stack } from "@mantine/core";
import { useState } from "react";
import { ActivitiesPanel } from "@/features/activities";
import type { BandDetail } from "@/features/bands";
import { GigsTab } from "@/features/gigs";

/** The two things a band can do with a turn that is not the studio. */
type AgendaSection = "estrada" | "convivencia";

/**
 * What the band does with a turn that is not the studio: playing live and
 * looking after whoever plays. They sit behind one toggle because they pull the
 * band's mood in opposite directions — the road wears it down (ADR-0016), a
 * night out lifts it (ADR-0017) — and that trade-off reads best side by side.
 */
export function BandAgendaTab({ band }: { band: BandDetail }) {
  const [section, setSection] = useState<AgendaSection>("estrada");

  return (
    <Stack gap="lg">
      <SegmentedControl
        value={section}
        onChange={(value) => setSection(value as AgendaSection)}
        data={[
          { value: "estrada", label: "🎤 A estrada" },
          { value: "convivencia", label: "🎉 Confraternizações" },
        ]}
        w="fit-content"
      />

      {section === "estrada" ? (
        <GigsTab band={band} />
      ) : (
        <ActivitiesPanel band={band} />
      )}
    </Stack>
  );
}
