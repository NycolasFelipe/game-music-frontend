import type { ReactNode } from "react";
import { CharacteristicChips } from "@/features/bands/components/CharacteristicChips";
import { HappinessBadge } from "@/features/bands/components/HappinessBadge";
import { SkillBars } from "@/features/bands/components/SkillBars";
import { SKILL_LABELS } from "@/features/bands/labels";
import { MemberPortrait } from "@/features/bands/portrait/MemberPortrait";
import type { Characteristic, Skills } from "@/features/bands/types";
import type { MemberAppearance } from "@/types/appearance";

/** The shape shared by generated candidates and persisted members. */
export interface MemberCardData {
  id: string;
  name: string;
  age: number;
  gender: string;
  avatar: string;
  appearance?: MemberAppearance | null;
  happiness?: number;
  primarySkill: string;
  skills: Skills;
  characteristics: string[];
  biography: string;
}

/**
 * Ficha de um integrante ou candidato no estilo da revista (ADR-0002): retrato
 * em retícula, nome, função, humor, traços, biografia e habilidades.
 *
 * @param props.member - Integrante ou candidato.
 * @param props.catalog - Catálogo de traços (nome e descrição).
 * @param props.selected - Marcado nas audições (contorno e etiqueta "Aprovado").
 * @param props.onToggle - Clique na ficha (seleção nas audições).
 * @param props.actions - Ações extras abaixo do humor (ex.: salário).
 * @param props.onRegenerateAvatar - Oferece "novo visual" sobre o retrato.
 * @param props.avatarRegenerating - Se o novo visual está sendo gerado.
 * @param props.crop - Recorte do retrato: 3:4 (`portrait`) ou 4:3 (`wide`).
 * @param props.tag - Etiqueta vermelha sobre o retrato (ex.: "Em crise").
 */
export function MemberCard({
  member,
  catalog,
  selected,
  onToggle,
  actions,
  onRegenerateAvatar,
  avatarRegenerating,
  crop = "portrait",
  tag,
}: {
  member: MemberCardData;
  catalog: Map<string, Characteristic>;
  selected?: boolean;
  onToggle?: () => void;
  actions?: ReactNode;
  onRegenerateAvatar?: () => void;
  avatarRegenerating?: boolean;
  crop?: "portrait" | "wide";
  tag?: ReactNode;
}) {
  const role = SKILL_LABELS[member.primarySkill as keyof Skills] ?? member.primarySkill;

  return (
    <article
      className="rv-profile"
      onClick={onToggle}
      style={{
        cursor: onToggle ? "pointer" : undefined,
        padding: selected !== undefined ? 8 : 0,
        outline: selected ? "2px solid var(--rv-ink)" : undefined,
        boxShadow: selected ? "6px 6px 0 var(--rv-red)" : undefined,
      }}
    >
      <div style={{ position: "relative" }}>
        <MemberPortrait
          subject={{ ...member, happiness: member.happiness ?? 0 }}
          crop={crop}
          tag={selected ? "Aprovado" : tag}
        />
        {onRegenerateAvatar && (
          <button
            type="button"
            className="rv-link"
            disabled={avatarRegenerating}
            onClick={(event) => {
              event.stopPropagation();
              onRegenerateAvatar();
            }}
            style={{
              position: "absolute",
              top: 6,
              right: 6,
              background: "var(--rv-paper)",
              padding: "3px 6px",
              textDecoration: "none",
              color: "var(--rv-ink)",
              border: "1px solid var(--rv-ink)",
            }}
          >
            {avatarRegenerating ? "Gerando…" : "Novo visual"}
          </button>
        )}
      </div>
      <div className="rv-nm">{member.name}</div>
      <div className="rv-role">
        {role} · {member.age} anos
      </div>
      {member.happiness !== undefined && (
        <div style={{ marginTop: 4 }}>
          <HappinessBadge value={member.happiness} />
        </div>
      )}
      {actions && (
        <div style={{ marginTop: 4 }} onClick={(event) => event.stopPropagation()}>
          {actions}
        </div>
      )}
      <CharacteristicChips ids={member.characteristics} catalog={catalog} />
      <p className="rv-caption" style={{ margin: "4px 0 8px" }}>
        {member.biography}
      </p>
      <SkillBars skills={member.skills} primarySkill={member.primarySkill} />
    </article>
  );
}
