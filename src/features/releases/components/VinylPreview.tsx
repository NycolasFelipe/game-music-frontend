import { Group, Stack, Switch, Text } from "@mantine/core";
import { useState } from "react";
import {
  useQualityTiers,
  useReviewTiers,
} from "@/features/releases/hooks/useReleaseCatalogs";
import {
  VINYL_KEYFRAMES,
  VinylRecord,
} from "@/features/releases/components/VinylRecord";
import type { Release } from "@/features/releases/types";

/** One sample per quality tier, to preview the disc/frame variations. */
const SAMPLES: Array<{ quality: string; review: string; score: number }> = [
  { quality: "fracasso", review: "massacrado", score: 22 },
  { quality: "mediocre", review: "misto", score: 46 },
  { quality: "solido", review: "favoravel", score: 62 },
  { quality: "grande", review: "aclamado", score: 78 },
  { quality: "obra-prima", review: "obra-prima", score: 96 },
];

/** Builds a fake launched release for the preview shelf. */
function mockRelease(
  sample: { quality: string; review: string; score: number },
  title: string,
): Release {
  return {
    id: `mock-${sample.quality}`,
    bandId: "mock",
    title,
    concept: "Exemplo para pré-visualização.",
    format: "album",
    style: "rock-indie",
    budgetTier: "estudio",
    status: "lancada",
    credits: {},
    quality: sample.score,
    qualityTier: sample.quality,
    criticScore: sample.score,
    publicScore: sample.score,
    criticTier: sample.review,
    publicTier: sample.review,
    criticComments: [],
    publicComments: [],
    formatComment: null,
    fansGained: 0,
    cost: 0,
    masterRevenueTotal: 0,
    publishingRevenueTotal: 0,
    royaltyRemaining: 0,
    royaltyTurnsLeft: 0,
    releasedAtYear: 2000,
    creationLog: [],
    details: null,
    createdAt: new Date(0).toISOString(),
  };
}

/**
 * Dev/preview aid: a toggle that shows one vinyl per quality tier, so the frame
 * variations (bronze → silver → gold → double platinum) can be inspected.
 */
export function VinylPreview() {
  const [on, setOn] = useState(false);
  const { data: qualityTiers } = useQualityTiers();
  const { data: reviewTiers } = useReviewTiers();

  const qualityById = (id: string) => qualityTiers?.find((t) => t.id === id);
  const reviewById = (id: string) => reviewTiers?.find((t) => t.id === id);

  return (
    <Stack gap="sm">
      <div>
        <Text fw={600}>Pré-visualização de discos (mock)</Text>
        <Text size="sm" c="dimmed">
          Mostra um disco de cada nível de qualidade para conferir as variações
          de moldura.
        </Text>
      </div>

      <Switch
        checked={on}
        onChange={(e) => setOn(e.currentTarget.checked)}
        label="Mostrar variações de disco"
      />

      {on && (
        <div
          style={{
            padding: "28px 20px 18px",
            borderRadius: 10,
            background:
              "linear-gradient(180deg, rgba(0,0,0,0.04), rgba(0,0,0,0.10))",
            borderBottom: "12px solid #6b4a2f",
            boxShadow:
              "inset 0 -3px 8px rgba(0,0,0,0.25), 0 8px 14px rgba(0,0,0,0.18)",
          }}
        >
          <style>{VINYL_KEYFRAMES}</style>
          <Group gap="xl" wrap="wrap" align="flex-start">
            {SAMPLES.map((sample) => (
              <VinylRecord
                key={sample.quality}
                release={mockRelease(
                  sample,
                  qualityById(sample.quality)?.label ?? sample.quality,
                )}
                formatLabel="Álbum"
                qualityTier={qualityById(sample.quality)}
                criticTier={reviewById(sample.review)}
                publicTier={reviewById(sample.review)}
                onClick={() => {}}
              />
            ))}
          </Group>
        </div>
      )}
    </Stack>
  );
}
