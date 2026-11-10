import { Button, Group } from "@mantine/core";
import type { ActivityResult } from "@/features/activities/types";
import type { BandDetail } from "@/features/bands";
import { formatMoney } from "@/utils/money";

/** Humor com uma casa decimal, no formato brasileiro. */
function humor(value: number): string {
  return value.toLocaleString("pt-BR", { minimumFractionDigits: 1, maximumFractionDigits: 1 });
}

/**
 * O resultado de uma confraternização, no mesmo encarte em que ela foi marcada:
 * quanto custou, o humor de quem foi e as relações que mudaram. Quando a noite
 * dá errado, avisa que há uma decisão esperando; ela abre assim que o encarte
 * fecha. Substitui o aviso que sumia sozinho.
 *
 * @param props.result - A resposta do backend ao marcar a saída.
 * @param props.band - A banda (nomes das relações).
 * @param props.onClose - Fecha o encarte.
 */
export function ActivityOutcome({
  result,
  band,
  onClose,
}: {
  result: ActivityResult;
  band: BandDetail;
  onClose: () => void;
}) {
  const nameOf = (id: string) => band.members.find((member) => member.id === id)?.name ?? "alguém";
  const relationships = result.relationshipChanges.filter((change) => change.to !== change.from);

  return (
    <div>
      {result.trouble && (
        <p className="rv-body rv-lede">
          A noite saiu do controle. Tem uma decisão esperando por você assim que fechar este encarte.
        </p>
      )}

      <div className="rv-ledger">
        <div>
          <span>Custo</span>
          <span className="rv-neg">{formatMoney(-result.activity.cost)}</span>
        </div>
        {result.participants.map((participant) => (
          <div key={participant.memberId}>
            <span>Humor de {participant.name}</span>
            <span>
              {humor(participant.from)} → {humor(participant.to)}
            </span>
          </div>
        ))}
      </div>

      {relationships.length > 0 && (
        <div style={{ marginTop: 14 }}>
          <div className="rv-kicker">Relações</div>
          <div className="rv-ledger">
            {relationships.map((change) => (
              <div key={`${change.memberAId}-${change.memberBId}`}>
                <span>
                  {nameOf(change.memberAId)} e {nameOf(change.memberBId)}
                </span>
                <span className={change.to < change.from ? "rv-red" : undefined}>
                  {change.from} → {change.to}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      <Group justify="flex-end" mt="lg">
        <Button color="press" onClick={onClose}>
          {result.trouble ? "Resolver a treta" : "Fechar"}
        </Button>
      </Group>
    </div>
  );
}
