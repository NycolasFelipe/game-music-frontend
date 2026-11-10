import type { BudgetTier, ReleaseFormat } from "@/features/releases/types";
import { formatMoney } from "@/utils/money";

/** Uma razão 0..1 como cinco pontos tipográficos (●●●○○). */
function pips(value: number): string {
  const filled = Math.max(1, Math.min(5, Math.round(value * 5)));
  return "●".repeat(filled) + "○".repeat(5 - filled);
}

/**
 * Escolha do formato como lista de classificados (ADR-0002): faixas, alcance,
 * quanto ensina a quem grava (ADR-0012), turnos de estúdio e custo-base.
 *
 * @param props.formats - Catálogo de formatos.
 * @param props.value - Formato escolhido.
 * @param props.onChange - Troca o formato.
 */
export function FormatPicker({
  formats,
  value,
  onChange,
}: {
  formats: ReleaseFormat[];
  value: string;
  onChange: (id: string) => void;
}) {
  const maxReach = Math.max(...formats.map((f) => f.baseReach), 1);
  const maxGain = Math.max(...formats.map((f) => f.skillGain), 1);

  return (
    <div role="radiogroup" aria-label="Formato">
      {formats.map((format) => {
        const selected = format.id === value;
        return (
          <button
            key={format.id}
            type="button"
            role="radio"
            aria-checked={selected}
            className={`rv-listing ${selected ? "rv-sel" : ""}`}
            onClick={() => onChange(format.id)}
          >
            <span className="rv-v" style={selected ? { color: "var(--rv-red)" } : undefined}>
              {format.label}
            </span>
            <span className="rv-n">{formatMoney(format.baseCost)}</span>
            <span className="rv-d">
              <span>{format.minTracks}–{format.maxTracks} faixas</span>
              {" · "}alcance {pips(format.baseReach / maxReach)}
              {" · "}ensina {pips(format.skillGain / maxGain)}
              {" · "}
              {format.productionTurns} turno{format.productionTurns === 1 ? "" : "s"} de estúdio
            </span>
          </button>
        );
      })}
    </div>
  );
}

/**
 * Escolha do orçamento como anúncios classificados: o que o dinheiro compra
 * (nota) e quanto custa no formato escolhido, marcando o que não cabe no caixa.
 *
 * @param props.tiers - Faixas de orçamento.
 * @param props.value - Faixa escolhida.
 * @param props.onChange - Troca a faixa.
 * @param props.baseCost - Custo-base do formato escolhido, para o preço de cada faixa.
 * @param props.balance - Caixa da banda.
 */
export function BudgetPicker({
  tiers,
  value,
  onChange,
  baseCost,
  balance,
}: {
  tiers: BudgetTier[];
  value: string;
  onChange: (id: string) => void;
  baseCost: number | null;
  balance: number;
}) {
  return (
    <div role="radiogroup" aria-label="Orçamento">
      {tiers.map((tier) => {
        const cost =
          baseCost === null
            ? null
            : Math.round(baseCost * tier.costMultiplier * 100) / 100;
        const affordable = cost === null || cost <= balance;
        const bonus = Math.round((tier.qualityMultiplier - 1) * 100);
        const selected = tier.id === value;

        return (
          <button
            key={tier.id}
            type="button"
            role="radio"
            aria-checked={selected}
            className={`rv-classified ${selected ? "rv-sel" : ""}`}
            onClick={() => onChange(tier.id)}
          >
            <b>
              {tier.label}
              {cost !== null && ` — ${formatMoney(cost)}`}
            </b>
            <p>
              {tier.description} Nota {bonus >= 0 ? "+" : "−"}
              {Math.abs(bonus)}%.
              {!affordable && <span className="rv-red"> Não cabe no caixa.</span>}
            </p>
          </button>
        );
      })}
    </div>
  );
}
