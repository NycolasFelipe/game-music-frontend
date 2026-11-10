import { InsertOption, optionLetter } from "@/components/revista";
import { MemberHoverName, MemberMentions } from "@/features/bands";
import type { BandMember, Characteristic } from "@/features/bands";
import type { ActiveEvent } from "@/features/events/types";

/**
 * O corpo de uma decisão da banda, como matéria de encarte (ADR-0002): o texto
 * com capitular, quem está envolvido e as alternativas A, B, C. O título fica
 * na manchete do encarte, que é de quem chama. Apresentacional: quem chama é
 * dono da mutação.
 *
 * @param props.event - O evento pendente.
 * @param props.members - Integrantes da banda, para nomear os envolvidos.
 * @param props.catalog - Catálogo de traços (ficha ao passar o mouse).
 * @param props.pending - Verdadeiro enquanto a escolha é aplicada.
 * @param props.onChoose - Chamado com a alternativa escolhida.
 */
export function ActiveEventDecision({
  event,
  members,
  catalog,
  pending,
  onChoose,
}: {
  event: ActiveEvent;
  members: BandMember[];
  catalog: Map<string, Characteristic>;
  pending: boolean;
  onChoose: (optionId: string) => void;
}) {
  const memberById = new Map(members.map((member) => [member.id, member]));
  const involved = event.involvedCharacterIds
    .map((id) => memberById.get(id))
    .filter((member): member is BandMember => Boolean(member));

  return (
    <div>
      <p className="rv-body rv-lede">
        <MemberMentions text={event.description} members={members} catalog={catalog} />
      </p>

      {involved.length > 0 && (
        <p className="rv-caption" style={{ display: "flex", flexWrap: "wrap", gap: "4px 14px", alignItems: "center" }}>
          <span>Envolvidos:</span>
          {involved.map((member) => (
            <MemberHoverName key={member.id} member={member} catalog={catalog} />
          ))}
        </p>
      )}

      <div style={{ marginTop: 14 }}>
        {event.options.map((option, index) => (
          <InsertOption
            key={option.id}
            letter={optionLetter(index)}
            label={option.label}
            description={option.description}
            disabled={pending}
            onChoose={() => onChoose(option.id)}
          />
        ))}
      </div>

      {pending && <p className="rv-caption">Aplicando as consequências…</p>}
    </div>
  );
}
