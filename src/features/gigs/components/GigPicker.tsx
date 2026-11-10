import { Button } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { useState } from "react";
import type { BandDetail } from "@/features/bands";
import { expectationNote, signedNumber, stageFit } from "@/features/gigs/format";
import { useGigTypes, usePlayGig } from "@/features/gigs/hooks/useGigs";
import type { GigPreview, GigResult, GigType } from "@/features/gigs/types";
import { formatMoney } from "@/utils/money";

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
 * A escolha da temporada, dentro do encarte do Palco: os circuitos com o
 * resultado esperado agora (cachê líquido, fãs, efeito no humor e o que a casa
 * espera) e o botão de tocar. Uma temporada por turno (ADR-0016).
 *
 * @param props.band - A banda.
 * @param props.previews - Prévias do painel do turno; sem elas, usa o catálogo.
 * @param props.performance - Desempenho atual da banda, para comparar com cada casa.
 * @param props.onPlayed - Chamado com o resultado e a prévia do circuito tocado.
 */
export function GigPicker({
  band,
  previews,
  performance,
  onPlayed,
}: {
  band: BandDetail;
  previews?: GigPreview[];
  performance?: number;
  onPlayed: (result: GigResult, preview: GigPreview) => void;
}) {
  const { data: types } = useGigTypes();
  const play = usePlayGig(band.id);
  const [picked, setPicked] = useState<string | null>(null);

  const rows: GigPreview[] =
    previews && previews.length > 0
      ? previews
      : (types ?? []).map((type) => baseline(type, band.fame.level));
  const firstPlayable = rows.find((row) => row.available && band.balance >= row.cost);
  const selected = rows.find((row) => row.gigTypeId === (picked ?? firstPlayable?.gigTypeId));

  function handlePlay(preview: GigPreview) {
    play.mutate(preview.gigTypeId, {
      onSuccess: (result) => onPlayed(result, preview),
      onError: () =>
        notifications.show({ color: "red", message: "Não foi possível tocar esta temporada." }),
    });
  }

  return (
    <div>
      {rows.map((row) => {
        const affordable = band.balance >= row.cost;
        const isSelected = selected?.gigTypeId === row.gigTypeId;
        return (
          <button
            key={row.gigTypeId}
            type="button"
            className={`rv-listing ${isSelected ? "rv-sel" : ""}`}
            disabled={!row.available}
            onClick={() => setPicked(row.gigTypeId)}
            aria-pressed={isSelected}
          >
            <span className="rv-v">{row.label}</span>
            <span className={`rv-n ${row.net < 0 ? "rv-neg" : ""}`}>
              {row.available ? formatMoney(row.net) : `nível ${row.minFameLevel}`}
            </span>
            <span className="rv-d">
              {row.available
                ? `+${Math.round(row.fansGained).toLocaleString("pt-BR")} fãs · humor ${signedNumber(row.happinessDelta)}` +
                  (row.expectedPerformance > 0 && performance !== undefined
                    ? ` · ${expectationNote(stageFit(performance, row.expectedPerformance))}`
                    : "") +
                  (affordable ? "" : " · caixa insuficiente")
                : `Precisa de fama ${row.minFameLevel}`}
            </span>
          </button>
        );
      })}

      <p>
        <Button
          mt="sm"
          color="press"
          disabled={!selected || !selected.available || band.balance < selected.cost}
          loading={play.isPending}
          onClick={() => selected && handlePlay(selected)}
        >
          Tocar a temporada
        </Button>
      </p>
    </div>
  );
}
