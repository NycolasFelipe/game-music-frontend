import { InsertOption, optionLetter } from "@/components/revista";
import { MemberMentions } from "@/features/bands";
import type { BandMember, Characteristic } from "@/features/bands";
import { VINYL_KEYFRAMES } from "@/features/releases/components/VinylRecord";
import type { CreationEvent, CreationEventKind } from "@/features/releases/types";

/** Nome de cada tipo de sessão de estúdio, como chapéu da matéria. */
const KIND_LABELS: Record<CreationEventKind, string> = {
  conflito_visao: "Conflito de visão",
  ideia_maluca: "Ideia maluca",
  perfeccionismo: "Perfeccionismo",
  preguica: "Preguiça",
};

/** Um vinil pequeno girando enquanto a sessão acontece. */
function SpinningDisc() {
  return (
    <div
      aria-hidden
      style={{
        width: 34,
        height: 34,
        borderRadius: "50%",
        background:
          "repeating-radial-gradient(circle at 50% 50%, rgba(0,0,0,0.6) 0 1.5px, rgba(255,255,255,0.05) 1.5px 3px), radial-gradient(circle at 36% 30%, #3a3a3a, #050505 62%)",
        animation: "vinylSpin 3s linear infinite",
        flexShrink: 0,
      }}
    >
      <div
        style={{
          width: 10,
          height: 10,
          borderRadius: "50%",
          background: "var(--rv-red)",
          margin: "12px auto",
        }}
      />
    </div>
  );
}

/**
 * Uma sessão de estúdio como encarte (ADR-0002): o tipo da sessão, a fita com
 * o andamento da gravação, a fala de quem puxou o assunto e as alternativas.
 * A escolha mexe na qualidade da obra sem mostrar as chances (o backend nunca
 * as envia).
 *
 * @param props.event - A sessão pendente.
 * @param props.index - Número da sessão (a partir de 1).
 * @param props.total - Total de sessões da obra.
 * @param props.members - Integrantes da banda, para a ficha ao passar o mouse
 *   sobre um nome na fala.
 * @param props.catalog - Catálogo de traços (ficha ao passar o mouse).
 * @param props.pending - Verdadeiro enquanto a escolha é aplicada.
 * @param props.onChoose - Chamado com a alternativa escolhida.
 */
export function CreationEventStage({
  event,
  index,
  total,
  members,
  catalog,
  pending,
  onChoose,
}: {
  event: CreationEvent;
  index: number;
  total: number;
  members: BandMember[];
  catalog: Map<string, Characteristic>;
  pending: boolean;
  onChoose: (optionId: string) => void;
}) {
  return (
    <div>
      <style>{VINYL_KEYFRAMES}</style>

      <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
        <SpinningDisc />
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", justifyContent: "space-between", gap: 8, flexWrap: "wrap" }}>
            <span className="rv-kicker">{KIND_LABELS[event.kind]}</span>
            <span className="rv-label">Sessão {index} de {total}</span>
          </div>
          <div className="rv-tape" style={{ margin: "6px 0 0" }} aria-hidden>
            {Array.from({ length: total }, (_, i) => (
              <i key={i} className={i < index - 1 ? "rv-done" : i === index - 1 ? "rv-now" : undefined} />
            ))}
          </div>
        </div>
      </div>

      <p className="rv-pull">
        “<MemberMentions text={event.prompt} members={members} catalog={catalog} />”
      </p>

      <div>
        {event.options.map((option, i) => (
          <InsertOption
            key={option.id}
            letter={optionLetter(i)}
            label={option.label}
            description={option.description}
            disabled={pending}
            onChoose={() => onChoose(option.id)}
          />
        ))}
      </div>
    </div>
  );
}
