import { Button } from "@mantine/core";
import { useState } from "react";
import type { BandDetail } from "@/features/bands";
import { ReleaseCreationModal } from "@/features/releases/components/ReleaseCreationModal";
import { useReleaseFormats } from "@/features/releases/hooks/useReleaseCatalogs";
import { useReleases } from "@/features/releases/hooks/useReleases";
import { useReleaseRevealUi } from "@/features/releases/store/release-reveal.store";

/**
 * Coluna Estúdio da aba Turno (ADR-0002): a obra em produção (ou pronta), ou
 * os formatos para começar uma, com o aviso de saturação do mercado. A criação
 * e o lançamento continuam no encarte de criação de obra.
 *
 * @param props.band - A banda.
 * @param props.launchesThisYear - Obras já lançadas no ano (painel do turno).
 * @param props.nextMarketMultiplier - Quanto o mercado pagaria pela próxima obra.
 */
export function StudioColumn({
  band,
  launchesThisYear,
  nextMarketMultiplier,
}: {
  band: BandDetail;
  launchesThisYear?: number;
  nextMarketMultiplier?: number | null;
}) {
  const { data: releases } = useReleases(band.id);
  const { data: formats } = useReleaseFormats();
  const revealRelease = useReleaseRevealUi((state) => state.revealRelease);
  const [open, setOpen] = useState(false);

  const draft = releases?.find((r) => r.status === "em_criacao") ?? null;
  const formatLabel = (id: string) => formats?.find((f) => f.id === id)?.label ?? id;

  const market =
    nextMarketMultiplier === undefined || nextMarketMultiplier === null
      ? null
      : (launchesThisYear ?? 0) === 0
        ? "Primeira obra do ano: mercado cheio."
        : `Seria a ${(launchesThisYear ?? 0) + 1}ª obra do ano: o mercado paga ×${nextMarketMultiplier.toLocaleString("pt-BR")}.`;

  return (
    <div>
      <div className="rv-sub">Uma obra por vez · o custo sai no lançamento</div>

      {draft ? (
        <>
          <button type="button" className="rv-listing" onClick={() => setOpen(true)}>
            <span className="rv-v">{draft.title || "Obra sem título"}</span>
            <span className="rv-n">{formatLabel(draft.format)}</span>
            <span className="rv-d">
              {draft.productionTurnsLeft > 0
                ? `Em produção · falta${draft.productionTurnsLeft === 1 ? "" : "m"} ${draft.productionTurnsLeft} turno${draft.productionTurnsLeft === 1 ? "" : "s"}`
                : "Pronta para lançar"}
            </span>
          </button>
          <p className="rv-note">
            {draft.productionTurnsLeft > 0
              ? "As sessões de estúdio chegam como decisões a cada turno."
              : "A gravação terminou. Lance quando quiser."}
          </p>
          <Button variant={draft.productionTurnsLeft > 0 ? "default" : "filled"} color={draft.productionTurnsLeft > 0 ? undefined : "press"} onClick={() => setOpen(true)}>
            {draft.productionTurnsLeft > 0 ? "Ver estúdio" : `Lançar ${formatLabel(draft.format)}`}
          </Button>
        </>
      ) : (
        <>
          {(formats ?? []).slice(0, 4).map((format) => (
            <button key={format.id} type="button" className="rv-listing" onClick={() => setOpen(true)}>
              <span className="rv-v">{format.label}</span>
              <span className="rv-n">{format.baseCost.toLocaleString("pt-BR")}</span>
              <span className="rv-d">
                {format.productionTurns} turno{format.productionTurns === 1 ? "" : "s"} de estúdio
              </span>
            </button>
          ))}
          {market && <p className="rv-note">{market}</p>}
          <Button mt="xs" onClick={() => setOpen(true)}>
            Criar obra
          </Button>
        </>
      )}

      {open && (
        <ReleaseCreationModal
          band={band}
          resumeReleaseId={draft?.id ?? null}
          onClose={() => setOpen(false)}
          onFinalized={revealRelease}
        />
      )}
    </div>
  );
}
