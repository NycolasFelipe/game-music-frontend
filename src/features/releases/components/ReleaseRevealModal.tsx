import { Button, Group } from "@mantine/core";
import { useEffect, useState, type ReactNode } from "react";
import { InsertModal } from "@/components/revista";
import { ReleaseGrowthList } from "@/features/releases/components/ReleaseGrowthList";
import { VINYL_KEYFRAMES, VinylDisc } from "@/features/releases/components/VinylRecord";
import type { QualityTier, Release, ReviewTier } from "@/features/releases/types";
import { formatPeriod } from "@/utils/period";

/** Fases da revelação: 0 nota da crítica · 1 frases da crítica · 2 nota do público · 3 frases do público · 4 veredito. */
const FINAL_PHASE = 4;

interface RevealState {
  /** Valor animado das estrelas (0..5). */
  value: number;
  /** Intensidade da animação (1 no começo → 0 ao assentar), para o pulso. */
  intensity: number;
  /** Se a animação já parou no valor final. */
  settled: boolean;
}

/**
 * Estrelas em caça-níquel: o medidor varre 0↔5 várias vezes enquanto a
 * amplitude decai e o centro anda até o alvo, onde trava. A primeira
 * atualização acontece dentro do quadro de animação (assíncrona), então nada é
 * setado de forma síncrona no corpo do efeito.
 *
 * @param target - Estrelas finais (0..5).
 * @param instant - Pula a animação (o jogador pediu para ver tudo).
 * @returns O estado atual do medidor.
 */
function useStarReveal(target: number, instant: boolean): RevealState {
  const [state, setState] = useState<RevealState>({
    value: 0,
    intensity: 1,
    settled: false,
  });

  useEffect(() => {
    if (instant) return undefined;
    let raf = 0;
    const start = performance.now();
    const duration = 2600;
    const spinFreq = 30; // ~5 varridas pela escala inteira
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      const env = Math.exp(-3.2 * t); // 1 → ~0,04
      const center = 2.5 * env + target * (1 - env); // 2,5 → alvo
      const raw = center - 2.5 * env * Math.cos(spinFreq * t);
      if (t < 1) {
        setState({
          value: Math.max(0, Math.min(5, raw)),
          intensity: env,
          settled: false,
        });
        raf = requestAnimationFrame(tick);
      } else {
        setState({ value: target, intensity: 0, settled: true });
      }
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, instant]);

  return instant ? { value: target, intensity: 0, settled: true } : state;
}

/**
 * Faz o conteúdo surgir (e subir um pouco) ao montar, depois de um atraso.
 *
 * @param props.delay - Atraso em ms.
 * @param props.children - O conteúdo.
 */
function Reveal({
  delay = 0,
  children,
}: {
  delay?: number;
  children: ReactNode;
}) {
  const [shown, setShown] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setShown(true), 20);
    return () => clearTimeout(t);
  }, []);
  return (
    <div
      style={{
        opacity: shown ? 1 : 0,
        transform: shown ? "none" : "translateY(6px)",
        transition: "opacity 500ms ease, transform 500ms ease",
        transitionDelay: `${delay}ms`,
      }}
    >
      {children}
    </div>
  );
}

/**
 * Uma coluna de recepção (crítica ou público): estrelas que giram, a nota, o
 * selo da faixa e, depois, as frases assinadas.
 *
 * @param props.heading - Chapéu da coluna.
 * @param props.score - Nota 0..100.
 * @param props.tier - Faixa de recepção (estrelas e rótulo).
 * @param props.showComments - Se as frases já podem aparecer.
 * @param props.comments - Frases assinadas.
 * @param props.instant - Pula a animação.
 */
function ReviewColumn({
  heading,
  score,
  tier,
  showComments,
  comments,
  instant,
}: {
  heading: string;
  score: number;
  tier: ReviewTier | undefined;
  showComments: boolean;
  comments: Release["criticComments"];
  instant: boolean;
}) {
  const stars = tier?.stars ?? 0;
  const { value, intensity, settled } = useStarReveal(stars, instant);
  const displayScore = settled ? Math.round(score) : Math.round(value * 20);
  const masterpiece = tier?.id === "obra-prima";

  return (
    <div>
      <div className="rv-kicker">{heading}</div>
      <div style={{ display: "flex", alignItems: "baseline", gap: 14, margin: "8px 0 4px", flexWrap: "wrap" }}>
        <span
          className="rv-stars"
          aria-label={settled ? `${stars} de 5 estrelas` : undefined}
          style={{ transform: `scale(${1 + intensity * 0.15})`, transformOrigin: "left center" }}
        >
          ★★★★★
          <span style={{ width: `${(value / 5) * 100}%` }}>★★★★★</span>
        </span>
        <b style={{ font: "900 44px/1 var(--rv-serif)", fontVariantNumeric: "tabular-nums" }}>
          {displayScore}
        </b>
        <span className="rv-label">de 100</span>
      </div>
      <div style={{ minHeight: 26 }}>
        {settled &&
          (masterpiece ? (
            <span className="rv-stamp">Obra-prima</span>
          ) : (
            <span className="rv-tierword">{tier?.label ?? ""}</span>
          ))}
      </div>

      {showComments &&
        comments.map((comment, index) => (
          <Reveal key={index} delay={instant ? 0 : index * 250}>
            <p className="rv-pull" style={{ fontSize: 18, margin: "10px 0" }}>
              “{comment.text}”<small>— {comment.author}</small>
            </p>
          </Reveal>
        ))}
    </div>
  );
}

/**
 * O corpo em sequência: a crítica gira e fala, depois o público gira e fala,
 * e por fim o veredito (nota, faixa, fãs) e a evolução da banda. O disco gira
 * sem acabamento até o veredito, para não anunciar a faixa antes da hora.
 * Remontado por obra, então a fase recomeça sozinha.
 *
 * @param props.release - A obra lançada.
 * @param props.reviewTiers - Faixas de recepção.
 * @param props.qualityTiers - Faixas de qualidade.
 * @param props.onClose - Fecha o encarte.
 */
function RevealBody({
  release,
  reviewTiers,
  qualityTiers,
  onClose,
}: {
  release: Release;
  reviewTiers: ReviewTier[] | undefined;
  qualityTiers: QualityTier[] | undefined;
  onClose: () => void;
}) {
  const [phase, setPhase] = useState(0);
  const [skipped, setSkipped] = useState(false);
  const done = phase >= FINAL_PHASE;

  useEffect(() => {
    if (phase >= FINAL_PHASE) return undefined;
    const nextAfter = phase === 0 || phase === 2 ? 2900 : 2000;
    const t = setTimeout(() => setPhase((p) => p + 1), nextAfter);
    return () => clearTimeout(t);
  }, [phase]);

  const tierOf = (id: string | null) => reviewTiers?.find((t) => t.id === id);
  const quality = qualityTiers?.find((t) => t.id === release.qualityTier);

  return (
    <div>
      <style>{VINYL_KEYFRAMES}</style>
      <div style={{ display: "grid", gridTemplateColumns: "minmax(80px, 110px) 1fr", gap: 20, alignItems: "center" }}>
        <div style={{ animation: done ? undefined : "vinylSpin 2.4s linear infinite" }}>
          <VinylDisc
            release={{ id: release.id, title: release.title, qualityTier: done ? release.qualityTier : null }}
          />
        </div>
        <div>
          {release.concept && (
            <p className="rv-deck" style={{ margin: 0 }}>
              {release.concept}
            </p>
          )}
          {!done && (
            <button
              type="button"
              className="rv-link"
              style={{ marginTop: 8 }}
              onClick={() => {
                setSkipped(true);
                setPhase(FINAL_PHASE);
              }}
            >
              Mostrar tudo
            </button>
          )}
        </div>
      </div>

      {done && (
        <Reveal>
          <div className="rv-facts" style={{ ["--rv-n" as string]: 4 }}>
            <div>
              <span>Nota</span>
              <b>{release.quality !== null ? Math.round(release.quality) : "—"}</b>
            </div>
            <div>
              <span>Faixa</span>
              <b className={release.qualityTier === "fracasso" ? "rv-neg" : undefined}>
                {quality?.label ?? release.qualityTier ?? "—"}
              </b>
            </div>
            <div>
              <span>Fãs</span>
              <b>+{(release.fansGained ?? 0).toLocaleString("pt-BR")}</b>
            </div>
            <div>
              <span>Royalties</span>
              <b>
                {release.royaltyTurnsLeft} parcela{release.royaltyTurnsLeft === 1 ? "" : "s"}
              </b>
            </div>
          </div>
        </Reveal>
      )}

      <div className="rv-cols2" style={{ marginTop: 18 }}>
        <ReviewColumn
          heading="Crítica especializada"
          score={release.criticScore ?? 0}
          tier={tierOf(release.criticTier)}
          showComments={phase >= 1}
          comments={release.criticComments}
          instant={skipped}
        />
        {phase >= 2 ? (
          <Reveal>
            <ReviewColumn
              heading="Público"
              score={release.publicScore ?? 0}
              tier={tierOf(release.publicTier)}
              showComments={phase >= 3}
              comments={release.publicComments}
              instant={skipped}
            />
          </Reveal>
        ) : (
          <div>
            <div className="rv-kicker" style={{ color: "var(--rv-faint)" }}>Público</div>
            <p className="rv-caption">O público ainda está ouvindo…</p>
          </div>
        )}
      </div>

      {done && (release.details?.growth?.length ?? 0) > 0 && (
        <Reveal>
          <div className="rv-sectionhead" style={{ marginTop: 18 }}>
            <h3 style={{ fontSize: 22 }}>A banda evoluiu</h3>
            <span>habilidades e humor de quem gravou</span>
          </div>
          <ReleaseGrowthList growth={release.details?.growth} />
        </Reveal>
      )}

      {done && (
        <Group justify="flex-end" mt="lg">
          <Button onClick={onClose}>Voltar à edição</Button>
        </Group>
      )}
    </div>
  );
}

/**
 * Encarte de revelação do lançamento (ADR-0011, ADR-0002): a crítica e o
 * público entram em sequência e o veredito vem no fim.
 *
 * @param props.release - A obra recém-lançada (ou `null`).
 * @param props.reviewTiers - Faixas de recepção.
 * @param props.qualityTiers - Faixas de qualidade.
 * @param props.formatLabel - Formato por extenso.
 * @param props.opened - Se o encarte está aberto.
 * @param props.onClose - Fecha o encarte.
 */
export function ReleaseRevealModal({
  release,
  reviewTiers,
  qualityTiers,
  formatLabel,
  opened,
  onClose,
}: {
  release: Release | null;
  reviewTiers: ReviewTier[] | undefined;
  qualityTiers?: QualityTier[];
  formatLabel?: string;
  opened: boolean;
  onClose: () => void;
}) {
  const hasReviews =
    release && release.criticScore !== null && release.publicScore !== null;

  return (
    <InsertModal
      opened={opened && Boolean(hasReviews)}
      onClose={onClose}
      label={
        release
          ? [
              "A crítica",
              formatLabel,
              release.releasedAtYear !== null ? `lançamento de ${formatPeriod(release.releasedAtYear)}` : null,
            ]
              .filter(Boolean)
              .join(" · ")
          : ""
      }
      title={release ? `“${release.title}”` : ""}
      titleSize="lg"
      size="xl"
    >
      {hasReviews && release && (
        <RevealBody
          key={release.id}
          release={release}
          reviewTiers={reviewTiers}
          qualityTiers={qualityTiers}
          onClose={onClose}
        />
      )}
    </InsertModal>
  );
}
