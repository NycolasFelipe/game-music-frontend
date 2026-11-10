import { Button } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { useState } from "react";
import { formatSkillLevel } from "@/features/bands";
import type { BandDetail } from "@/features/bands";
import { useGigs, useGigTypes, usePlayGig } from "@/features/gigs/hooks/useGigs";
import type { GigPreview, GigType } from "@/features/gigs/types";

/** Número com sinal no formato brasileiro. */
function signed(value: number, digits = 2): string {
  const abs = Math.abs(value).toLocaleString("pt-BR", {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  });
  return value > 0 ? `+${abs}` : value < 0 ? `−${abs}` : `±${abs}`;
}

/** Prévia a partir do catálogo, quando o painel do turno não trouxer a dele. */
function baseline(type: GigType, fameLevel: number): GigPreview {
  return {
    gigTypeId: type.id,
    label: type.label,
    minFameLevel: type.minFameLevel,
    available: fameLevel >= type.minFameLevel,
    expectedPerformance: 0,
    fee: type.baseFee,
    cost: type.cost,
    net: type.baseFee - type.cost,
    fansGained: type.baseFans,
    happinessDelta: -type.wear,
  };
}

/**
 * Coluna Palco da aba Turno (ADR-0002): os circuitos com o resultado esperado
 * agora (cachê líquido, fãs, efeito no humor e o que a casa espera) e o botão
 * de tocar. Uma temporada por turno (ADR-0016).
 *
 * @param props.band - A banda.
 * @param props.previews - Prévias do painel do turno; sem elas, usa o catálogo.
 * @param props.performance - Desempenho de palco atual (0..1), se conhecido.
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
  const play = usePlayGig(band.id);

  const rows: GigPreview[] =
    previews && previews.length > 0
      ? previews
      : (types ?? []).map((type) => baseline(type, band.fame.level));
  const playedNow = (gigs ?? []).find((gig) => gig.playedAtYear === band.currentYear);
  const firstPlayable = rows.find((row) => row.available && band.balance >= row.cost);
  const [picked, setPicked] = useState<string | null>(null);
  const selected = rows.find((row) => row.gigTypeId === (picked ?? firstPlayable?.gigTypeId));
  const labelOf = (id: string) => rows.find((row) => row.gigTypeId === id)?.label ?? id;

  function handlePlay(preview: GigPreview) {
    play.mutate(preview.gigTypeId, {
      onSuccess: (result) => {
        const gains = result.skillGains
          .map((gain) => `${gain.name} ${formatSkillLevel(gain.from)} → ${formatSkillLevel(gain.to)}`)
          .join(", ");
        notifications.show({
          title: preview.label,
          message:
            `Cachê ${result.gig.fee.toLocaleString("pt-BR")} − custos ${result.gig.cost.toLocaleString("pt-BR")} = ` +
            `${result.gig.net.toLocaleString("pt-BR")} · +${result.gig.fansGained.toLocaleString("pt-BR")} fãs · ` +
            `humor ${signed(result.gig.happinessDelta)}` +
            (gains ? ` · Na estrada: ${gains}` : ""),
          color: result.gig.happinessDelta >= 0 ? "teal" : "red",
        });
      },
      onError: () =>
        notifications.show({ color: "red", message: "Não foi possível tocar esta temporada." }),
    });
  }

  return (
    <div>
      <div className="rv-sub">
        Um show por semestre
        {performance !== undefined ? ` · desempenho da banda ${performance.toLocaleString("pt-BR", { maximumFractionDigits: 2 })}` : ""}
      </div>

      {playedNow && (
        <>
          <p>
            <span className="rv-done-stamp">Feito</span>
          </p>
          <p className="rv-mono" style={{ fontSize: 13 }}>
            A banda já cumpriu a temporada deste turno: {labelOf(playedNow.gigTypeId)},{" "}
            {playedNow.net >= 0 ? "+" : ""}
            {Math.round(playedNow.net).toLocaleString("pt-BR")} no caixa, +{Math.round(playedNow.fansGained).toLocaleString("pt-BR")} fãs.
          </p>
        </>
      )}

      {rows.map((row) => {
        const affordable = band.balance >= row.cost;
        const isSelected = selected?.gigTypeId === row.gigTypeId && !playedNow;
        return (
          <button
            key={row.gigTypeId}
            type="button"
            className={`rv-listing ${isSelected ? "rv-sel" : ""}`}
            disabled={!row.available || Boolean(playedNow)}
            onClick={() => setPicked(row.gigTypeId)}
            aria-pressed={isSelected}
          >
            <span className="rv-v">{row.label}</span>
            <span className={`rv-n ${row.net < 0 ? "rv-neg" : ""}`}>
              {row.available ? Math.round(row.net).toLocaleString("pt-BR") : `nível ${row.minFameLevel}`}
            </span>
            <span className="rv-d">
              {row.available
                ? `+${Math.round(row.fansGained).toLocaleString("pt-BR")} fãs · humor ${signed(row.happinessDelta)}` +
                  (row.expectedPerformance > 0
                    ? ` · a casa espera ${row.expectedPerformance.toLocaleString("pt-BR", { maximumFractionDigits: 2 })}`
                    : "") +
                  (affordable ? "" : " · caixa insuficiente")
                : `Precisa de fama ${row.minFameLevel}`}
            </span>
          </button>
        );
      })}

      {!playedNow && (
        <p>
          <Button
            mt="sm"
            disabled={!selected || !selected.available || band.balance < selected.cost}
            loading={play.isPending}
            onClick={() => selected && handlePlay(selected)}
          >
            Tocar a temporada
          </Button>
        </p>
      )}
    </div>
  );
}
