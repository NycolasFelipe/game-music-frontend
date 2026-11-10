import { Button } from "@mantine/core";
import { useState } from "react";
import { InsertModal } from "@/components/revista";
import type { BandDetail } from "@/features/bands";
import { EmptyStage } from "@/features/gigs/components/EmptyStage";
import { GigOutcome } from "@/features/gigs/components/GigOutcome";
import { gigOutcomeTitle } from "@/features/gigs/format";
import { GigPicker } from "@/features/gigs/components/GigPicker";
import { useGigs, useGigTypes } from "@/features/gigs/hooks/useGigs";
import type { Gig, GigPreview, GigResult } from "@/features/gigs/types";
import { formatMoney } from "@/utils/money";
import { formatPeriod } from "@/utils/period";

/** Quantas temporadas passadas a coluna mostra. */
const HISTORY_SIZE = 4;

/**
 * Coluna Palco da aba Turno (ADR-0002): o desempenho da banda, se já houve
 * show no semestre, as últimas temporadas (ou uma ilustração de palco vazio,
 * antes da primeira) e, no rodapé, o botão que abre o encarte da temporada. A escolha do
 * circuito e o resultado acontecem dentro do encarte. Uma temporada por turno
 * (ADR-0016).
 *
 * @param props.band - A banda.
 * @param props.previews - Prévias do painel do turno; sem elas, usa o catálogo.
 * @param props.performance - Desempenho de palco atual (0..1), para comparar com cada casa.
 */
export function GigsColumn({
  band,
  previews,
  performance,
}: {
  band: BandDetail;
  previews?: GigPreview[];
  performance?: number;
}) {
  const { data: types } = useGigTypes();
  const { data: gigs } = useGigs(band.id);
  const [opened, setOpened] = useState(false);
  const [played, setPlayed] = useState<{ result: GigResult; preview: GigPreview } | null>(null);
  const [detail, setDetail] = useState<Gig | null>(null);

  const playedNow = (gigs ?? []).find((gig) => gig.playedAtYear === band.currentYear);
  const past = (gigs ?? []).filter((gig) => gig.id !== playedNow?.id).slice(0, HISTORY_SIZE);
  const labelOf = (id: string) =>
    previews?.find((row) => row.gigTypeId === id)?.label ?? types?.find((type) => type.id === id)?.label ?? id;

  function openPicker() {
    setPlayed(null);
    setOpened(true);
  }

  return (
    <div className="rv-col-body">
      <div className="rv-sub">Um show por semestre</div>

      {playedNow && (
        <>
          <p>
            <span className="rv-done-stamp">Feito</span>
          </p>
          <p className="rv-mono" style={{ fontSize: 13 }}>
            A banda já cumpriu a temporada deste turno: {labelOf(playedNow.gigTypeId)},{" "}
            {playedNow.net >= 0 ? "+" : ""}
            {formatMoney(playedNow.net)} no caixa, +{Math.round(playedNow.fansGained).toLocaleString("pt-BR")} fãs.
          </p>
        </>
      )}

      {past.length > 0 ? (
        <div className="rv-col-history">
          <div className="rv-kicker">Últimas temporadas</div>
          {past.map((gig) => (
            <button key={gig.id} type="button" className="rv-listing" onClick={() => setDetail(gig)}>
              <span className="rv-v">{labelOf(gig.gigTypeId)}</span>
              <span className={`rv-n ${gig.net < 0 ? "rv-neg" : "rv-pos"}`}>
                {formatMoney(gig.net, { signed: true })}
              </span>
              <span className="rv-d">
                {formatPeriod(gig.playedAtYear)} · +{Math.round(gig.fansGained).toLocaleString("pt-BR")} fãs
              </span>
            </button>
          ))}
        </div>
      ) : (
        !playedNow && gigs && <EmptyStage />
      )}

      {!playedNow && (
        <div className="rv-col-foot">
          <Button onClick={openPicker}>Escolher o show</Button>
        </div>
      )}

      <InsertModal
        opened={opened}
        onClose={() => setOpened(false)}
        label="Palco · um show por semestre"
        title={played ? gigOutcomeTitle(played.result) : "Onde a banda toca"}
        size="lg"
      >
        {played ? (
          <GigOutcome
            gig={played.result.gig}
            label={played.preview.label}
            expectedPerformance={played.preview.expectedPerformance}
            skillGains={played.result.skillGains}
            onClose={() => setOpened(false)}
          />
        ) : (
          <GigPicker band={band} previews={previews} performance={performance} onPlayed={(result, preview) => setPlayed({ result, preview })} />
        )}
      </InsertModal>

      <InsertModal
        opened={detail !== null}
        onClose={() => setDetail(null)}
        label={detail ? `Palco · ${formatPeriod(detail.playedAtYear)}` : ""}
        title={detail ? labelOf(detail.gigTypeId) : ""}
        size="lg"
      >
        {detail && (
          <GigOutcome
            gig={detail}
            label="Temporada encerrada"
            expectedPerformance={previews?.find((row) => row.gigTypeId === detail.gigTypeId)?.expectedPerformance}
            onClose={() => setDetail(null)}
          />
        )}
      </InsertModal>
    </div>
  );
}
