import { Fragment } from "react";
import { MemberHoverName, SKILL_LABELS, SKILL_ORDER } from "@/features/bands";
import type { BandMember, Characteristic } from "@/features/bands";
import { ReleaseGrowthList } from "@/features/releases/components/ReleaseGrowthList";
import { VinylDisc } from "@/features/releases/components/VinylRecord";
import type {
  QualityTier,
  Release,
  ReviewTier,
} from "@/features/releases/types";
import { formatMoney } from "@/utils/money";

/** Estrelas de 1 a 5, cheias e vazias. */
function stars(count: number): string {
  const filled = Math.max(0, Math.min(5, count));
  return "★".repeat(filled) + "☆".repeat(5 - filled);
}

/** Multiplicador com duas casas, ex.: "×1,10". */
function factor(value: number | undefined): string {
  return `×${(value ?? 1).toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

/**
 * Uma coluna de recepção da resenha: chapéu com estrelas e nota, e as frases.
 *
 * @param props.heading - "Crítica" ou "Público".
 * @param props.score - Nota 0..100.
 * @param props.tier - Faixa de recepção.
 * @param props.comments - Frases assinadas.
 */
function ReceptionColumn({
  heading,
  score,
  tier,
  comments,
}: {
  heading: string;
  score: number | null;
  tier?: ReviewTier;
  comments: Release["criticComments"];
}) {
  return (
    <div>
      <div className="rv-kicker">
        {heading}
        {tier ? ` · ${stars(tier.stars)}` : ""}
        {score !== null ? ` ${Math.round(score)}` : ""}
      </div>
      {tier && <div className="rv-tierword" style={{ marginTop: 4 }}>{tier.label}</div>}
      {comments.map((comment, index) => (
        <p key={index} className="rv-pull" style={{ fontSize: 17, margin: "10px 0" }}>
          “{comment.text}”<small>— {comment.author}</small>
        </p>
      ))}
    </div>
  );
}

/**
 * A resenha de uma obra lançada, como encarte da revista (ADR-0002): disco e
 * números, crítica e público, créditos, de onde veio a nota, o que se decidiu
 * no estúdio e o que a banda aprendeu.
 *
 * @param props.release - A obra lançada.
 * @param props.members - Integrantes atuais (quem já saiu aparece como ex-integrante).
 * @param props.catalog - Catálogo de traços (ficha ao passar o mouse).
 * @param props.qualityTier - Faixa de qualidade.
 * @param props.criticTier - Faixa da crítica.
 * @param props.publicTier - Faixa do público.
 */
export function ReleaseCard({
  release,
  members,
  catalog,
  qualityTier,
  criticTier,
  publicTier,
}: {
  release: Release;
  members: BandMember[];
  catalog: Map<string, Characteristic>;
  qualityTier?: QualityTier;
  criticTier?: ReviewTier;
  publicTier?: ReviewTier;
}) {
  const byId = new Map(members.map((m) => [m.id, m]));
  const revenue =
    (release.masterRevenueTotal ?? 0) + (release.publishingRevenueTotal ?? 0);
  const details = release.details;
  const credited = SKILL_ORDER.filter((a) => (release.credits[a]?.length ?? 0) > 0);

  return (
    <div>
      <div style={{ display: "grid", gridTemplateColumns: "minmax(80px, 110px) 1fr", gap: 20, alignItems: "center" }}>
        <div className="rv-disc-hover">
          <VinylDisc release={release} />
        </div>
        <div style={{ minWidth: 0 }}>
          {release.concept && (
            <p className="rv-deck" style={{ margin: 0 }}>
              {release.concept}
            </p>
          )}
          <div className="rv-facts" style={{ ["--rv-n" as string]: 4, marginBottom: 0 }}>
            <div>
              <span>Nota</span>
              <b>{release.quality !== null ? Math.round(release.quality) : "—"}</b>
            </div>
            <div>
              <span>Faixa</span>
              <b className={release.qualityTier === "fracasso" ? "rv-neg" : undefined}>
                {qualityTier?.label ?? release.qualityTier ?? "—"}
              </b>
            </div>
            <div>
              <span>Fãs</span>
              <b>+{(release.fansGained ?? 0).toLocaleString("pt-BR")}</b>
            </div>
            <div>
              <span>Receita</span>
              <b>{formatMoney(revenue)}</b>
            </div>
          </div>
        </div>
      </div>

      {release.criticScore !== null && (
        <div className="rv-cols2" style={{ marginTop: 18 }}>
          <ReceptionColumn
            heading="Crítica"
            score={release.criticScore}
            tier={criticTier}
            comments={release.criticComments}
          />
          <ReceptionColumn
            heading="Público"
            score={release.publicScore}
            tier={publicTier}
            comments={release.publicComments}
          />
        </div>
      )}

      <div className="rv-cols2" style={{ marginTop: 14 }}>
        <div>
          <div className="rv-kicker">Créditos</div>
          <div className="rv-ledger">
            {credited.map((aspect) => (
              <div key={aspect}>
                <span>{SKILL_LABELS[aspect]}</span>
                <span style={{ display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "flex-end" }}>
                  {(release.credits[aspect] ?? []).map((id, index) => {
                    const member = byId.get(id);
                    return (
                      <Fragment key={id}>
                        {index > 0 && <span>·</span>}
                        {member ? (
                          <MemberHoverName member={member} catalog={catalog} />
                        ) : (
                          <span className="rv-caption" style={{ margin: 0 }}>ex-integrante</span>
                        )}
                      </Fragment>
                    );
                  })}
                </span>
              </div>
            ))}
          </div>
        </div>
        {details && (
          <div>
            <div className="rv-kicker">Por que essa nota</div>
            <div className="rv-ledger">
              <div>
                <span>Habilidade creditada</span>
                <span>{details.skillScore.toLocaleString("pt-BR", { maximumFractionDigits: 2 })}</span>
              </div>
              <div>
                <span>Humor de quem gravou</span>
                <span>{factor(details.moodModifier)}</span>
              </div>
              <div>
                <span>Orçamento</span>
                <span>{factor(details.budgetBonus)}</span>
              </div>
              <div>
                <span>Sessões de estúdio</span>
                <span>{factor(details.eventModifier)}</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {release.creationLog.length > 0 && (
        <div style={{ marginTop: 14 }}>
          <div className="rv-kicker">No estúdio</div>
          <div className="rv-ledger">
            {release.creationLog.map((entry) => (
              <div key={entry.eventId}>
                <span>{entry.prompt}</span>
                <span style={{ textAlign: "right", flexShrink: 0 }}>
                  {entry.choiceLabel} ({factor(entry.qualityModifier)})
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {(release.details?.growth?.length ?? 0) > 0 && (
        <div style={{ marginTop: 14 }}>
          <div className="rv-kicker">A banda evoluiu</div>
          <ReleaseGrowthList growth={release.details?.growth} />
        </div>
      )}

      <p className="rv-caption" style={{ marginTop: 12 }}>
        {release.royaltyTurnsLeft > 0
          ? `Royalties: faltam ${formatMoney(release.royaltyRemaining)} em ${release.royaltyTurnsLeft} parcela${release.royaltyTurnsLeft === 1 ? "" : "s"}.`
          : "Royalties encerrados."}
      </p>
    </div>
  );
}
