import { Loader } from "@mantine/core";
import type { BandDetail } from "@/features/bands";
import { useActiveEvents, usePassiveEvents } from "@/features/events";
import { formatPeriod } from "@/utils/period";

interface TimelineEntry {
  key: string;
  year: number;
  kind: "passive" | "active" | "departure";
  title?: string;
  description: string;
  resolved?: boolean;
  chosenLabel?: string;
  outcome?: string;
  /** Notícias da cena da mesma edição, juntas numa linha só. */
  items?: string[];
}

/**
 * Junta as notícias da cena que caem na mesma edição, em sequência, numa
 * linha só do Arquivo, para a página não virar uma coluna de notas soltas.
 *
 * @param entries - As entradas já ordenadas da mais nova para a mais antiga.
 * @returns As entradas com as notícias da mesma edição agrupadas.
 */
function groupScene(entries: TimelineEntry[]): TimelineEntry[] {
  const rows: TimelineEntry[] = [];
  for (const entry of entries) {
    const last = rows[rows.length - 1];
    if (entry.kind === "passive" && last?.kind === "passive" && last.year === entry.year) {
      last.items = [...(last.items ?? [last.description]), entry.description];
    } else {
      rows.push({ ...entry });
    }
  }
  return rows;
}

/**
 * Arquivo (ADR-0002): a história da banda, edição por edição. Eventos da cena,
 * decisões tomadas (com a escolha e o desfecho) e saídas de integrantes.
 */
export function BandTimelineTab({ band }: { band: BandDetail }) {
  const bandId = band.id;
  const { data: activeEvents, isLoading: loadingActive } = useActiveEvents(bandId);
  const { data: passiveEvents, isLoading: loadingPassive } = usePassiveEvents(bandId);

  const entries: TimelineEntry[] = [
    ...(passiveEvents ?? []).map((p) => ({
      key: `p-${p.id}`,
      year: p.year,
      kind:
        p.type === "saida_integrante"
          ? ("departure" as const)
          : ("passive" as const),
      description: p.description,
    })),
    ...(activeEvents ?? []).map((a) => ({
      key: `a-${a.id}`,
      year: a.year,
      kind: "active" as const,
      title: a.title,
      description: a.description,
      resolved: a.resolved,
      chosenLabel: a.options.find((o) => o.id === a.chosenOptionId)?.label,
      outcome: a.outcome?.description,
    })),
  ].sort((x, y) => y.year - x.year);
  const rows = groupScene(entries);

  const loading = loadingActive || loadingPassive;

  return (
    <>
      <div className="rv-kicker">Arquivo</div>
      <h2 className="rv-head rv-md">Edições anteriores</h2>

      {loading && <Loader color="ink" />}

      {!loading && entries.length === 0 && (
        <p className="rv-deck">Feche edições para a história da banda começar a acontecer.</p>
      )}

      {rows.map((entry) => (
        <article
          key={entry.key}
          style={{
            display: "grid",
            gridTemplateColumns: "150px 1fr",
            gap: 16,
            padding: "12px 0",
            borderBottom: "1px solid var(--rv-ink)",
          }}
        >
          <div className="rv-mono" style={{ fontSize: 12, textTransform: "uppercase" }}>
            {formatPeriod(entry.year, bandId, "short")}
          </div>
          <div>
            <div className={`rv-tierword ${entry.kind === "departure" || (entry.kind === "active" && !entry.resolved) ? "rv-red" : ""}`}>
              {entry.kind === "departure"
                ? "Saída de integrante"
                : entry.kind === "passive"
                  ? "Cena musical"
                  : entry.resolved
                    ? "Decisão"
                    : "Decisão pendente"}
            </div>
            {entry.title && <div style={{ font: "900 20px/1.2 var(--rv-serif)", margin: "2px 0" }}>{entry.title}</div>}
            {entry.items ? (
              entry.items.map((item, index) => (
                <p
                  key={item}
                  style={{
                    margin: "4px 0 0",
                    paddingTop: index === 0 ? 0 : 4,
                    borderTop: index === 0 ? undefined : "1px dotted var(--rv-soft)",
                  }}
                >
                  {item}
                </p>
              ))
            ) : (
              <p style={{ margin: "4px 0 0" }}>{entry.description}</p>
            )}
            {entry.kind === "active" && entry.resolved && (
              <p className="rv-caption">
                Você escolheu: <b>{entry.chosenLabel ?? "—"}</b>
                {entry.outcome ? `. ${entry.outcome}` : ""}
              </p>
            )}
          </div>
        </article>
      ))}
    </>
  );
}
