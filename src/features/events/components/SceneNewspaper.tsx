import { Fragment, type ReactNode } from "react";
import { usePassiveEvents } from "@/features/events/hooks/useEvents";
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
 * Uma notícia do jornal: da cena (eventos passivos) ou da própria banda
 * (lançamentos, montados por quem chama).
 */
export interface NewspaperItem {
  id: string;
  /** Turno da notícia (ano do jogo, `.5` no segundo turno do ano). */
  year: number;
  /** Editoria (chapéu em vermelho). */
  section: string;
  description: string;
  /** Nomes a destacar em negrito. */
  artists: string[];
}

/**
 * Põe em negrito os nomes citados, como num jornal.
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
 * Uma notícia: editoria, data e o texto.
 *
 * @param props.item - A notícia.
 * @param props.lead - Se é a manchete do jornal.
 * @param props.bandId - A banda, que fixa a data de cada turno.
 */
function NewsItem({
  item,
  lead,
  bandId,
}: {
  item: NewspaperItem;
  lead: boolean;
  bandId: string;
}) {
  return (
    <article className={lead ? "rv-news-lead" : "rv-news-brief"}>
      <div className="rv-news-dateline">
        <span className="rv-red">{item.section}</span> · {formatPeriod(item.year, bandId, "short")}
      </div>
      <p>{withArtists(item.description, item.artists)}</p>
    </article>
  );
}

/**
 * "Gazeta do Groove": as notícias do ano como um jornal dentro da revista
 * (ADR-0002). Só entra o que é do ano corrente; o que é mais antigo fica no
 * Arquivo. As notícias da própria banda (`bandNews`, ex.: um disco lançado)
 * têm prioridade na manchete; depois vêm as da cena, da mais recente para a
 * mais antiga. Saídas de integrantes ficam de fora, porque têm encarte próprio.
 *
 * @param props.bandId - A banda.
 * @param props.currentYear - Período atual, para filtrar o ano e marcar o que é desta edição.
 * @param props.bandNews - Notícias da banda montadas por quem chama.
 * @param props.footer - Rodapé (ex.: link para o Arquivo).
 * @returns O jornal, ou nada enquanto não houver notícia no ano.
 */
export function SceneNewspaper({
  bandId,
  currentYear,
  bandNews = [],
  footer,
}: {
  bandId: string;
  currentYear: number;
  bandNews?: NewspaperItem[];
  footer?: ReactNode;
}) {
  const { data } = usePassiveEvents(bandId);
  const thisYear = Math.floor(currentYear);
  const inYear = (item: NewspaperItem) => Math.floor(item.year) === thisYear;
  const newestFirst = (a: NewspaperItem, b: NewspaperItem) => b.year - a.year;

  const ours = bandNews.filter(inYear).sort(newestFirst);
  const scene = (data ?? [])
    .filter((event) => event.type !== "saida_integrante")
    .map<NewspaperItem>((event) => ({
      id: event.id,
      year: event.year,
      section: SECTION_LABELS[event.type] ?? "Cena",
      description: event.description,
      artists: event.artists ?? [],
    }))
    .filter(inYear)
    .sort(newestFirst);

  const news = [...ours, ...scene];
  if (news.length === 0) return null;

  const [lead, ...rest] = news;
  const fresh = news.some((item) => item.year >= currentYear);

  return (
    <section className="rv-news" aria-label="Gazeta do Groove">
      <header className="rv-news-plate">
        <div className="rv-news-name">Gazeta do Groove</div>
        <div className="rv-news-meta">
          <span>{formatPeriod(currentYear, bandId)}</span>
          <span>Notícias do mundo da música</span>
          <span>{fresh ? "Última hora" : `Notícias de ${thisYear}`}</span>
        </div>
      </header>
      <NewsItem item={lead} lead bandId={bandId} />
      {rest.length > 0 && (
        <div className="rv-news-cols">
          {rest.slice(0, BRIEFS).map((item) => (
            <NewsItem key={item.id} item={item} lead={false} bandId={bandId} />
          ))}
        </div>
      )}
      {footer && <div className="rv-news-foot">{footer}</div>}
    </section>
  );
}
