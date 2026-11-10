import { Button, Group } from "@mantine/core";
import { MemberMentions } from "@/features/bands";
import type { BandMember, Characteristic } from "@/features/bands";
import { formatChange, outcomeChanges } from "@/features/events/eventOutcome";
import type { BandSnapshot } from "@/features/events/eventOutcome";
import type { EventResolution } from "@/features/events/types";

/**
 * O desfecho de uma decisão da banda, no mesmo encarte em que ela foi feita:
 * a escolha, o que aconteceu, o que mudou (fãs, humor, relações) e, se a banda
 * subiu de nível, o marco alcançado. Substitui o aviso que sumia sozinho.
 *
 * @param props.resolution - A resposta do backend ao resolver o evento.
 * @param props.chosenLabel - O texto da alternativa escolhida.
 * @param props.before - A banda no momento da escolha, para calcular as mudanças.
 * @param props.members - Integrantes atuais (ficha ao passar o mouse nos nomes).
 * @param props.catalog - Catálogo de traços.
 * @param props.hasNext - Se ainda há decisões na fila.
 * @param props.onContinue - Fecha o desfecho e segue a fila.
 */
export function EventOutcome({
  resolution,
  chosenLabel,
  before,
  members,
  catalog,
  hasNext,
  onContinue,
}: {
  resolution: EventResolution;
  chosenLabel: string;
  before: BandSnapshot;
  members: BandMember[];
  catalog: Map<string, Characteristic>;
  hasNext: boolean;
  onContinue: () => void;
}) {
  const { outcome, fameChange } = resolution;
  const changes = outcomeChanges(before, resolution.applied);
  const milestone = fameChange.leveledUp ? fameChange.milestones[fameChange.milestones.length - 1] : undefined;

  return (
    <div>
      <div className="rv-label">Sua escolha · {chosenLabel}</div>
      {outcome.resultLabel && (
        <div className="rv-kicker" style={{ marginTop: 10 }}>
          {outcome.resultLabel}
        </div>
      )}
      <p className="rv-body rv-lede">
        <MemberMentions text={outcome.description} members={members} catalog={catalog} />
      </p>

      {changes.length > 0 && (
        <div style={{ marginTop: 14 }}>
          <div className="rv-kicker">O que mudou</div>
          <div className="rv-ledger">
            {changes.map((change) => (
              <div key={change.key}>
                <span>{change.label}</span>
                <span className={change.delta < 0 ? "rv-red" : undefined}>{formatChange(change)}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {milestone && (
        <p className="rv-pull">
          Nível {fameChange.newLevel} de fama · {milestone.title}
          <small>{milestone.subtitle}</small>
        </p>
      )}

      <Group justify="flex-end" mt="lg">
        <Button color="press" onClick={onContinue}>
          {hasNext ? "Próxima decisão" : "Fechar"}
        </Button>
      </Group>
    </div>
  );
}
