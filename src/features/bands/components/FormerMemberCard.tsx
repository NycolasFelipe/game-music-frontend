import { CharacteristicChips } from "@/features/bands/components/CharacteristicChips";
import { HappinessBadge } from "@/features/bands/components/HappinessBadge";
import { SkillBars } from "@/features/bands/components/SkillBars";
import { SKILL_LABELS } from "@/features/bands/labels";
import { MemberPortrait } from "@/features/bands/portrait/MemberPortrait";
import type { Characteristic, Skills } from "@/features/bands/types";
import type { FormerMember } from "@/types/former-member";
import { formatPeriod } from "@/utils/period";
import { formatMoney } from "@/utils/money";

const DEPARTURE_REASONS: Record<string, string> = {
  salario_atrasado: "salário atrasado",
  humor: "mau humor",
};

/**
 * Ficha de um ex-integrante no estilo da revista (ADR-0002): o retrato com a
 * expressão de quando saiu, quando e por que saiu, o humor na saída, os traços,
 * a biografia, as habilidades e como estavam as relações com quem ficou.
 *
 * @param props.member - O retrato congelado de quem saiu.
 * @param props.catalog - Catálogo de traços (nome e descrição).
 */
export function FormerMemberCard({
  member,
  catalog,
}: {
  member: FormerMember;
  catalog: Map<string, Characteristic>;
}) {
  const role = SKILL_LABELS[member.primarySkill as keyof Skills] ?? member.primarySkill;

  return (
    <article
      className="rv-profile"
      style={{
        display: "grid",
        gridTemplateColumns: "minmax(96px, 130px) 1fr",
        gap: 18,
        borderTop: "4px solid var(--rv-ink)",
        paddingTop: 14,
      }}
    >
      <div>
        <MemberPortrait subject={member} tag="Saiu" />
      </div>
      <div style={{ minWidth: 0 }}>
        <div className="rv-nm" style={{ marginTop: 0 }}>{member.name}</div>
        <div className="rv-role">
          {role} · {member.age} anos
        </div>
        <p className="rv-caption">
          Saiu em {formatPeriod(member.leftAtYear)} ·{" "}
          {DEPARTURE_REASONS[member.reason] ?? member.reason} ·{" "}
          {member.unpaidTurns} turno{member.unpaidTurns === 1 ? "" : "s"} sem receber ·
          último salário {formatMoney(member.salary)}
        </p>
        <div style={{ marginTop: 4 }}>
          <span className="rv-label" style={{ marginRight: 8 }}>Humor na saída</span>
          <HappinessBadge value={member.happiness} />
        </div>
        <CharacteristicChips ids={member.characteristics} catalog={catalog} />
        <p className="rv-caption" style={{ margin: "4px 0 10px" }}>
          {member.biography}
        </p>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(230px, 1fr))", gap: 18 }}>
          <SkillBars skills={member.skills} primarySkill={member.primarySkill} />
          {member.relationships.length > 0 && (
            <div className="rv-ledger" style={{ fontSize: 12 }}>
              <div>
                <b>Relações ao sair</b>
                <span />
              </div>
              {member.relationships.map((rel, index) => (
                <div key={index}>
                  <span>{rel.memberName}</span>
                  <span className={rel.level > 0 ? "rv-pos" : rel.level < 0 ? "rv-neg" : undefined}>
                    {rel.level > 0 ? `+${rel.level}` : rel.level}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </article>
  );
}
