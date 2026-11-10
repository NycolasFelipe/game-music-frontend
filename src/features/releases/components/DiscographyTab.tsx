import { Button, Stack } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { useMemo, useState } from "react";
import { InsertModal } from "@/components/revista";
import { useCharacteristics } from "@/features/bands";
import type { BandDetail, Characteristic } from "@/features/bands";
import { ReleaseCard } from "@/features/releases/components/ReleaseCard";
import { ReleaseCreationModal } from "@/features/releases/components/ReleaseCreationModal";
import { useReleaseRevealUi } from "@/features/releases/store/release-reveal.store";
import { VinylRecord } from "@/features/releases/components/VinylRecord";
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
import { formatPeriod } from "@/utils/period";

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
  const revealing = useReleaseRevealUi((state) => state.release);
  const revealRelease = useReleaseRevealUi((state) => state.revealRelease);
  const [detailOpen, detail] = useDisclosure(false);
  const [detailRelease, setDetailRelease] = useState<Release | null>(null);

  const catalog = useMemo(
    () =>
      new Map<string, Characteristic>(
        (characteristics ?? []).map((c) => [c.id, c]),
      ),
    [characteristics],
  );

  const draft = releases?.find((r) => r.status === "em_criacao") ?? null;
  // The record only reaches the shelf after its reveal: with its stars already
  // printed behind the modal, the ceremony would be announcing a known score.
  const launched = (releases ?? []).filter(
    (r) => r.status === "lancada" && r.id !== revealing?.id,
  );

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
    <Stack gap="md">
      <div>
        <div className="rv-kicker">Resenhas</div>
        <h2 className="rv-head rv-md">Tudo o que a banda lançou</h2>
      </div>

      {draft ? (
        <button type="button" className="rv-listing" onClick={() => openResume(draft.id)}>
          <span className="rv-v">
            {draft.productionTurnsLeft > 0 ? "Em produção" : "Pronta para lançar"}: "
            {draft.title || "Obra sem título"}"
          </span>
          <span className="rv-n">
            <span className="rv-link">
              {draft.productionTurnsLeft > 0 ? "Ver estúdio" : `Lançar ${formatLabel(draft.format)}`}
            </span>
          </span>
          <span className="rv-d">
            {formatLabel(draft.format)} ·{" "}
            {draft.productionTurnsLeft > 0
              ? `faltam ${draft.productionTurnsLeft} turno${draft.productionTurnsLeft === 1 ? "" : "s"} de estúdio`
              : "a gravação terminou"}
            {" · "}
            <span
              role="button"
              tabIndex={0}
              className="rv-link"
              style={{ color: "var(--rv-soft)" }}
              onClick={(event) => {
                event.stopPropagation();
                cancel.mutate(draft.id);
              }}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.stopPropagation();
                  cancel.mutate(draft.id);
                }
              }}
            >
              descartar
            </span>
          </span>
        </button>
      ) : (
        <div>
          <Button color="press" onClick={openFresh}>
            Criar obra
          </Button>
        </div>
      )}

      {launched.length === 0 ? (
        <div className="rv-empty">
          <p className="rv-deck">Nenhuma obra lançada ainda.</p>
        </div>
      ) : (
        <div>
          {launched.map((release) => (
            <VinylRecord
              key={release.id}
              release={release}
              formatLabel={formatLabel(release.format)}
              qualityTier={tierById(release.qualityTier)}
              criticTier={reviewTierById(release.criticTier)}
              publicTier={reviewTierById(release.publicTier)}
              onClick={() => {
                setDetailRelease(release);
                detail.open();
              }}
            />
          ))}
        </div>
      )}

      {modalOpen && (
        <ReleaseCreationModal
          band={band}
          resumeReleaseId={resumeId}
          onClose={modal.close}
          onFinalized={revealRelease}
        />
      )}

      <InsertModal
        opened={detailOpen}
        onClose={detail.close}
        label={
          detailRelease
            ? [
                "Resenha",
                formatLabel(detailRelease.format),
                detailRelease.releasedAtYear !== null ? formatPeriod(detailRelease.releasedAtYear) : null,
              ]
                .filter(Boolean)
                .join(" · ")
            : ""
        }
        title={detailRelease ? `“${detailRelease.title}”` : ""}
        titleSize="lg"
        size="xl"
      >
        {detailRelease && (
          <ReleaseCard
            release={detailRelease}
            members={band.members}
            catalog={catalog}
            qualityTier={tierById(detailRelease.qualityTier)}
            criticTier={reviewTierById(detailRelease.criticTier)}
            publicTier={reviewTierById(detailRelease.publicTier)}
          />
        )}
      </InsertModal>
    </Stack>
  );
}
