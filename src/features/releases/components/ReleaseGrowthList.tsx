import { formatSkillLevel, SKILL_LABELS } from "@/features/bands";
import type {
  ReleaseMemberGrowth,
  ReleaseSkillGain,
} from "@/features/releases/types";

/** "Letras 4.2 → 4.6" para um instrumento que evoluiu. */
function gainLabel(gain: ReleaseSkillGain): string {
  return `${SKILL_LABELS[gain.skill]} ${formatSkillLevel(gain.from)} → ${formatSkillLevel(gain.to)}`;
}

/** Variação de humor com sinal, ex.: "+0,5". */
function happinessLabel(delta: number): string {
  if (delta === 0) return "—";
  const value = delta.toLocaleString("pt-BR", { maximumFractionDigits: 2 });
  return `${delta > 0 ? "+" : ""}${value}`;
}

/**
 * O que uma obra desenvolveu em quem gravou (ADR-0012), como tabela da
 * revista: integrante, instrumentos que evoluíram (subida de nível em
 * vermelho) e humor. Não renderiza nada quando a obra é anterior ao recurso ou
 * ninguém evoluiu.
 *
 * @param props.growth - Evolução por integrante.
 * @returns A tabela, ou `null` sem evolução.
 */
export function ReleaseGrowthList({
  growth,
}: {
  growth: ReleaseMemberGrowth[] | undefined;
}) {
  const entries = (growth ?? []).filter(
    (entry) => entry.gains.length > 0 || entry.happinessDelta !== 0,
  );
  if (entries.length === 0) {
    return null;
  }

  return (
    <table className="rv-box">
      <thead>
        <tr>
          <th>Integrante</th>
          <th className="rv-l">Evolução</th>
          <th>Humor</th>
        </tr>
      </thead>
      <tbody>
        {entries.map((entry) => (
          <tr key={entry.memberId}>
            <td>{entry.name}</td>
            <td className="rv-l">
              {entry.gains.length === 0
                ? "—"
                : entry.gains.map((gain, index) => (
                    <span key={gain.skill}>
                      {index > 0 && " · "}
                      {gainLabel(gain)}
                      {gain.leveledUp && (
                        <b className="rv-red"> nível {Math.floor(gain.to)}</b>
                      )}
                    </span>
                  ))}
            </td>
            <td className={entry.happinessDelta > 0 ? "rv-pos" : entry.happinessDelta < 0 ? "rv-neg" : undefined}>
              {happinessLabel(entry.happinessDelta)}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
