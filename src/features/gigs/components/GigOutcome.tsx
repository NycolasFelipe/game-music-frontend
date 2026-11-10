import { Button, Group } from "@mantine/core";
import { formatSkillLevel, SKILL_LABELS } from "@/features/bands";
import type { Skills } from "@/features/bands";
import { reactionNote, signedNumber, stageFit } from "@/features/gigs/format";
import type { Gig, GigSkillGain } from "@/features/gigs/types";
import { formatMoney } from "@/utils/money";

/**
 * O resultado de uma temporada: o dinheiro, os fãs, o humor, como a banda se
 * saiu diante do que a casa esperava (quando se sabe) e quem evoluiu na estrada.
 * Serve ao encarte logo depois do show e ao detalhe de uma temporada antiga.
 *
 * @param props.gig - A temporada tocada.
 * @param props.label - Nome do circuito.
 * @param props.expectedPerformance - O que a casa esperava (0 ou ausente: não mostra).
 * @param props.skillGains - Quem evoluiu na estrada (só no resultado imediato).
 * @param props.onClose - Fecha o encarte.
 */
export function GigOutcome({
  gig,
  label,
  expectedPerformance = 0,
  skillGains = [],
  onClose,
}: {
  gig: Gig;
  label: string;
  expectedPerformance?: number;
  skillGains?: GigSkillGain[];
  onClose: () => void;
}) {

  return (
    <div>
      <div className="rv-label">{label}</div>
      <div className="rv-ledger" style={{ marginTop: 10 }}>
        <div>
          <span>Cachê</span>
          <span className="rv-pos">{formatMoney(gig.fee, { signed: true })}</span>
        </div>
        <div>
          <span>Custos</span>
          <span className="rv-neg">{formatMoney(-gig.cost)}</span>
        </div>
        <div>
          <span>No caixa</span>
          <span className={gig.net < 0 ? "rv-neg" : "rv-pos"}>{formatMoney(gig.net, { signed: true })}</span>
        </div>
        <div>
          <span>Fãs</span>
          <span>+{Math.round(gig.fansGained).toLocaleString("pt-BR")}</span>
        </div>
        <div>
          <span>Humor da banda</span>
          <span className={gig.happinessDelta < 0 ? "rv-red" : undefined}>{signedNumber(gig.happinessDelta)}</span>
        </div>
        {expectedPerformance > 0 && (
          <div>
            <span>No palco</span>
            <span>{reactionNote(stageFit(gig.performance, expectedPerformance))}</span>
          </div>
        )}
      </div>

      {skillGains.length > 0 && (
        <div style={{ marginTop: 14 }}>
          <div className="rv-kicker">Na estrada</div>
          <div className="rv-ledger">
            {skillGains.map((gain) => (
              <div key={`${gain.memberId}-${gain.skill}`}>
                <span>
                  {gain.name} · {SKILL_LABELS[gain.skill as keyof Skills]?.toLowerCase() ?? gain.skill}
                </span>
                <span>
                  {formatSkillLevel(gain.from)} → {formatSkillLevel(gain.to)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      <Group justify="flex-end" mt="lg">
        <Button color="press" onClick={onClose}>
          Fechar
        </Button>
      </Group>
    </div>
  );
}
