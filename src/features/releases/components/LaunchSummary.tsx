import { Loader } from "@mantine/core";
import { useBandOptions } from "@/features/bands";
import { VinylDisc } from "@/features/releases/components/VinylRecord";
import { CREATION_KIND_LABELS } from "@/features/releases/creationKinds";
import {
  useBudgetTiers,
  useReleaseFormats,
} from "@/features/releases/hooks/useReleaseCatalogs";
import { useRelease } from "@/features/releases/hooks/useReleases";
import { formatMoney } from "@/utils/money";

/**
 * A ficha de uma obra pronta para prensar, como no encarte de lançamento do
 * protótipo: disco ainda sem faixa, formato, orçamento e estilo, o que se
 * decidiu no estúdio e quanto o lançamento custa. É a mesma ficha no encarte de
 * criação e na central de decisões. O lançamento não adianta receita: o custo
 * sai na hora e os royalties chegam a partir do turno seguinte.
 *
 * @param props.bandId - A banda.
 * @param props.releaseId - O rascunho pronto.
 * @param props.balance - Caixa atual da banda.
 * @returns A ficha, ou um carregando enquanto o rascunho chega.
 */
export function LaunchSummary({
  bandId,
  releaseId,
  balance,
}: {
  bandId: string;
  releaseId: string;
  balance: number;
}) {
  const { data: detail, isLoading } = useRelease(bandId, releaseId);
  const { data: formats } = useReleaseFormats();
  const { data: tiers } = useBudgetTiers();
  const { data: options } = useBandOptions();

  if (isLoading || !detail) {
    return <Loader size="sm" />;
  }

  const format = formats?.find((f) => f.id === detail.format);
  const tier = tiers?.find((t) => t.id === detail.budgetTier);
  const style = options?.themes.find((t) => t.id === detail.style)?.label ?? detail.style;
  const cost =
    format && tier ? Math.round(format.baseCost * tier.costMultiplier * 100) / 100 : null;
  const short = cost !== null && balance < cost;
  // O registro (`creationLog`) só é gravado no lançamento; no rascunho, o que
  // se decidiu vem das sessões já resolvidas.
  const decided = (detail.creationEvents ?? [])
    .filter((event) => event.resolved)
    .sort((a, b) => a.sequence - b.sequence)
    .map((event, index) => ({
      id: event.id,
      session: index + 1,
      kind: CREATION_KIND_LABELS[event.kind] ?? "Sessão",
      prompt: event.prompt,
      choice: event.options.find((option) => option.id === event.chosenOptionId)?.label ?? "",
    }));

  return (
    <div>
      <div style={{ display: "grid", gridTemplateColumns: "96px 1fr", gap: 18, alignItems: "center" }}>
        <VinylDisc release={{ id: detail.id, title: detail.title, qualityTier: null }} />
        <div>
          <p className="rv-deck" style={{ margin: 0 }}>
            {format?.label ?? detail.format} · orçamento {tier?.label ?? detail.budgetTier} · {style}
          </p>
          {detail.concept && (
            <p className="rv-caption" style={{ fontStyle: "italic" }}>
              {detail.concept}
            </p>
          )}
        </div>
      </div>

      <div className="rv-session-log">
        <div className="rv-kicker">No estúdio</div>
        {decided.length > 0 ? (
          <ol>
            {decided.map((entry) => (
              <li key={entry.id}>
                <div className="rv-label">
                  Sessão {entry.session} · {entry.kind}
                </div>
                <p className="rv-session-prompt">“{entry.prompt}”</p>
                <p className="rv-session-choice">
                  <span>Você escolheu</span>
                  {entry.choice}
                </p>
              </li>
            ))}
          </ol>
        ) : (
          <p className="rv-caption">Nenhuma sessão difícil. A gravação correu sem drama, o que é quase suspeito.</p>
        )}
      </div>

      <div className="rv-facts">
        <div>
          <span>Custo no lançamento</span>
          <b>{cost !== null ? formatMoney(cost) : "—"}</b>
        </div>
        <div>
          <span>Caixa depois</span>
          <b className={short ? "rv-neg" : undefined}>
            {cost !== null ? formatMoney(balance - cost) : "—"}
          </b>
        </div>
        <div>
          <span>Receita</span>
          <b style={{ fontSize: 16 }}>a partir do próximo turno</b>
        </div>
      </div>
      {short && (
        <p className="rv-note">
          O caixa não cobre o lançamento. Faça shows e volte quando tiver{" "}
          {cost !== null ? formatMoney(cost) : ""}.
        </p>
      )}
    </div>
  );
}
