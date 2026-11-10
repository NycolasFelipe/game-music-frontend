import { Button, Group } from "@mantine/core";
import type { BandActivity } from "@/features/activities/types";
import { MemberHoverName, MemberMentions } from "@/features/bands";
import type { BandDetail, Characteristic } from "@/features/bands";
import type { ActiveEvent } from "@/features/events";
import { formatMoney } from "@/utils/money";

/** Variação com sinal e uma casa decimal, no formato brasileiro. */
function signed(value: number): string {
  const text = Math.abs(value).toLocaleString("pt-BR", { maximumFractionDigits: 1 });
  return value > 0 ? `+${text}` : value < 0 ? `−${text}` : text;
}

/**
 * Uma saída antiga da banda em detalhe: quem foi, quanto custou, o efeito em
 * cada um e nas relações e, se a noite deu errado, a treta que ela rendeu, com
 * a escolha feita e o desfecho.
 *
 * @param props.held - A saída registrada.
 * @param props.band - A banda (nomes e fichas de quem ainda está nela).
 * @param props.catalog - Catálogo de traços (ficha ao passar o mouse).
 * @param props.troubleEvent - O evento que a treta gerou, se houver.
 * @param props.onClose - Fecha o encarte.
 */
export function ActivityDetail({
  held,
  band,
  catalog,
  troubleEvent,
  onClose,
}: {
  held: BandActivity;
  band: BandDetail;
  catalog: Map<string, Characteristic>;
  troubleEvent?: ActiveEvent | null;
  onClose: () => void;
}) {
  const guests = held.participantIds.map((id) => ({
    id,
    member: band.members.find((member) => member.id === id),
  }));
  const chosen = troubleEvent?.options.find((option) => option.id === troubleEvent.chosenOptionId);

  return (
    <div>
      <p className="rv-caption" style={{ display: "flex", flexWrap: "wrap", gap: "4px 14px", alignItems: "center" }}>
        <span>Quem foi:</span>
        {guests.map(({ id, member }) =>
          member ? (
            <MemberHoverName key={id} member={member} catalog={catalog} />
          ) : (
            <span key={id}>ex-integrante</span>
          ),
        )}
      </p>

      <div className="rv-ledger">
        <div>
          <span>Custo</span>
          <span className="rv-neg">{formatMoney(-held.cost)}</span>
        </div>
        <div>
          <span>Humor de cada um que foi</span>
          <span className={held.happinessDelta < 0 ? "rv-red" : undefined}>{signed(held.happinessDelta)}</span>
        </div>
        {held.participantIds.length > 1 && (
          <div>
            <span>Relação entre quem foi</span>
            <span className={held.relationshipDelta < 0 ? "rv-red" : undefined}>{signed(held.relationshipDelta)}</span>
          </div>
        )}
      </div>

      {held.trouble && (
        <div style={{ marginTop: 16 }}>
          <div className="rv-kicker">A noite virou</div>
          {troubleEvent ? (
            <>
              <h4 className="rv-detail-head">{troubleEvent.title}</h4>
              <p className="rv-body">
                <MemberMentions text={troubleEvent.description} members={band.members} catalog={catalog} />
              </p>
              {chosen && <div className="rv-label">Sua escolha · {chosen.label}</div>}
              {troubleEvent.outcome && (
                <p className="rv-body">
                  <MemberMentions text={troubleEvent.outcome.description} members={band.members} catalog={catalog} />
                </p>
              )}
              {!troubleEvent.resolved && <p className="rv-note">Essa treta ainda espera uma decisão.</p>}
            </>
          ) : (
            <p className="rv-caption">A confusão rendeu uma decisão, que já saiu dos arquivos.</p>
          )}
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
