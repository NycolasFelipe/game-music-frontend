import { Fragment, type ReactNode } from "react";
import { usePassiveEvents } from "@/features/events/hooks/useEvents";
import type { PassiveEvent } from "@/features/events/types";
import { formatPeriod } from "@/utils/period";

/** Editoria do jornal por tipo de notícia da cena. */
const SECTION_LABELS: Record<string, string> = {
  colaboracao_musical: "Parceria",
  evento_social: "Sociedade",
  turne_conjunta: "Turnê",
  cancelamento_show: "Cancelamento",
  lancamento_album: "Lançamento",
  polemica: "Polêmica",
  aposentadoria: "Despedida",
  retorno_hiato: "Retorno",
};

/** Quantas notas cabem no jornal, além da manchete: uma linha de três colunas. */
const BRIEFS = 3;

/**
 * Põe em negrito os nomes de artistas citados, como num jornal.
 *
 * @param text - O texto da notícia.
 * @param artists - Nomes a destacar.
 * @returns O texto com os nomes em `<b>`.
 */
function withArtists(text: string, artists: string[]): ReactNode {
  const names = [...new Set(artists)].filter(Boolean).sort((a, b) => b.length - a.length);
  if (names.length === 0) return text;
  const escaped = names.map((name) => name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
  const parts = text.split(new RegExp(`(${escaped.join("|")})`, "g"));
  return parts.map((part, index) =>
    names.includes(part) ? <b key={index}>{part}</b> : <Fragment key={index}>{part}</Fragment>,
  );
}

/**
 * Uma notícia da cena: editoria, data e o texto.
 *
 * @param props.event - A notícia.
 * @param props.lead - Se é a manchete do jornal.
 */
function NewsItem({ event, lead }: { event: PassiveEvent; lead: boolean }) {
  return (
    <article className={lead ? "rv-news-lead" : "rv-news-brief"}>
      <div className="rv-news-dateline">
        <span className="rv-red">{SECTION_LABELS[event.type] ?? "Cena"}</span> · {formatPeriod(event.year)}
      </div>
      <p>{withArtists(event.description, event.artists ?? [])}</p>
    </article>
  );
}

/**
 * "Gazeta do Groove": as notícias do mundo da música como um jornal dentro da
 * revista (ADR-0002). A mais recente é a manchete; as anteriores viram notas em
 * colunas. Saídas de integrantes ficam de fora, porque têm encarte próprio e
 * ficam no Arquivo.
 *
 * @param props.bandId - A banda.
 * @param props.currentYear - Período atual, para marcar o que é desta edição.
 * @param props.footer - Rodapé (ex.: link para o Arquivo).
 * @returns O jornal, ou nada enquanto não houver notícia.
 */
export function SceneNewspaper({
  bandId,
  currentYear,
  footer,
}: {
  bandId: string;
  currentYear: number;
  footer?: ReactNode;
}) {
  const { data } = usePassiveEvents(bandId);
  const news = (data ?? [])
    .filter((event) => event.type !== "saida_integrante")
    .sort((a, b) => b.year - a.year);

  if (news.length === 0) return null;

  const [lead, ...rest] = news;
  const fresh = lead.year >= currentYear;

  return (
    <section className="rv-news" aria-label="Gazeta do Groove">
      <header className="rv-news-plate">
        <div className="rv-news-name">Gazeta do Groove</div>
        <div className="rv-news-meta">
          <span>{formatPeriod(currentYear)}</span>
          <span>Notícias do mundo da música</span>
          <span>{fresh ? "Última hora" : "Sem novidade nesta edição"}</span>
        </div>
      </header>
      <NewsItem event={lead} lead />
      {rest.length > 0 && (
        <div className="rv-news-cols">
          {rest.slice(0, BRIEFS).map((event) => (
            <NewsItem key={event.id} event={event} lead={false} />
          ))}
        </div>
      )}
      {footer && <div className="rv-news-foot">{footer}</div>}
    </section>
  );
}
