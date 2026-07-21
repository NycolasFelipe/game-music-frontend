import {
  Button,
  Card,
  Group,
  SimpleGrid,
  Stack,
  Text,
  Title,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { IconDisc, IconPlus } from "@tabler/icons-react";
import { useMemo, useState } from "react";
import { useCharacteristics } from "@/features/bands";
import type { BandDetail, Characteristic } from "@/features/bands";
import { ReleaseCard } from "@/features/releases/components/ReleaseCard";
import { ReleaseCreationModal } from "@/features/releases/components/ReleaseCreationModal";
import { ReleaseRevealModal } from "@/features/releases/components/ReleaseRevealModal";
import type { Release } from "@/features/releases/types";
import {
  useQualityTiers,
  useReleaseFormats,
  useReviewTiers,
} from "@/features/releases/hooks/useReleaseCatalogs";
import {
  useCancelRelease,
  useReleases,
} from "@/features/releases/hooks/useReleases";

/** The band's discography: launched works plus the draft-creation flow. */
export function DiscographyTab({ band }: { band: BandDetail }) {
  const bandId = band.id;
  const { data: releases } = useReleases(bandId);
  const { data: formats } = useReleaseFormats();
  const { data: qualityTiers } = useQualityTiers();
  const { data: reviewTiers } = useReviewTiers();
  const { data: characteristics } = useCharacteristics();
  const cancel = useCancelRelease(bandId);
  const [modalOpen, modal] = useDisclosure(false);
  const [resumeId, setResumeId] = useState<string | null>(null);
  const [revealOpen, reveal] = useDisclosure(false);
  const [revealRelease, setRevealRelease] = useState<Release | null>(null);

  const catalog = useMemo(
    () =>
      new Map<string, Characteristic>(
        (characteristics ?? []).map((c) => [c.id, c]),
      ),
    [characteristics],
  );

  const draft = releases?.find((r) => r.status === "em_criacao") ?? null;
  const launched = (releases ?? []).filter((r) => r.status === "lancada");

  const formatLabel = (id: string) =>
    formats?.find((f) => f.id === id)?.label ?? id;
  const tierById = (id: string | null) =>
    qualityTiers?.find((t) => t.id === id);
  const reviewTierById = (id: string | null) =>
    reviewTiers?.find((t) => t.id === id);

  const openFresh = () => {
    setResumeId(null);
    modal.open();
  };
  const openResume = (id: string) => {
    setResumeId(id);
    modal.open();
  };

  return (
    <Stack gap="lg">
      <Group justify="space-between">
        <Title order={4}>Discografia</Title>
        {!draft && (
          <Button leftSection={<IconPlus size={16} />} onClick={openFresh}>
            Criar obra
          </Button>
        )}
      </Group>

      {draft && (
        <Card withBorder padding="md" bg="var(--mantine-color-blue-light)">
          <Group justify="space-between" wrap="nowrap">
            <div>
              <Text fw={600}>
                {draft.title || "Obra sem título"} · em criação
              </Text>
              <Text size="xs" c="dimmed">
                Termine a criação para lançar — enquanto isso, o tempo não avança.
              </Text>
            </div>
            <Group gap="xs" wrap="nowrap">
              <Button
                variant="subtle"
                color="red"
                onClick={() => cancel.mutate(draft.id)}
                loading={cancel.isPending}
              >
                Descartar
              </Button>
              <Button onClick={() => openResume(draft.id)}>Continuar</Button>
            </Group>
          </Group>
        </Card>
      )}

      {launched.length === 0 ? (
        <Card withBorder padding="xl">
          <Stack align="center" gap="xs">
            <IconDisc size={32} opacity={0.5} />
            <Text c="dimmed">Nenhuma obra lançada ainda.</Text>
          </Stack>
        </Card>
      ) : (
        <SimpleGrid cols={{ base: 1, sm: 2 }}>
          {launched.map((release) => (
            <ReleaseCard
              key={release.id}
              release={release}
              members={band.members}
              catalog={catalog}
              formatLabel={formatLabel(release.format)}
              qualityTier={tierById(release.qualityTier)}
              criticTier={reviewTierById(release.criticTier)}
              publicTier={reviewTierById(release.publicTier)}
            />
          ))}
        </SimpleGrid>
      )}

      {modalOpen && (
        <ReleaseCreationModal
          band={band}
          resumeReleaseId={resumeId}
          onClose={modal.close}
          onFinalized={(rel) => {
            setRevealRelease(rel);
            reveal.open();
          }}
        />
      )}

      <ReleaseRevealModal
        release={revealRelease}
        reviewTiers={reviewTiers}
        opened={revealOpen}
        onClose={reveal.close}
      />
    </Stack>
  );
}
