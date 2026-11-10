import { SmartTooltip } from "@/components/SmartTooltip";
import { useSkillDescriptions } from "@/features/bands/hooks/useBandOptions";
import {
  formatSkillLevel,
  SKILL_LABELS,
  SKILL_ORDER,
  skillLevelDescription,
} from "@/features/bands/labels";
import type { Skills } from "@/features/bands/types";

/**
 * As seis habilidades como réguas tipográficas de 0 a 10 (ADR-0002). A
 * principal leva estrela e régua vermelha; cada linha mostra, ao passar o
 * mouse, a descrição do nível.
 */
export function SkillBars({
  skills,
  primarySkill,
}: {
  skills: Skills;
  primarySkill?: string;
}) {
  const { data: descriptions } = useSkillDescriptions();

  return (
    <div>
      {SKILL_ORDER.map((key) => {
        const primary = key === primarySkill;
        return (
          <SmartTooltip
            key={key}
            label={skillLevelDescription(descriptions?.[key], skills[key])}
            disabled={!descriptions}
            multiline
            w={260}
            withArrow
            events={{ hover: true, focus: true, touch: true }}
          >
            <div
              className="rv-mono"
              style={{
                display: "grid",
                gridTemplateColumns: "92px 1fr 34px",
                gap: 8,
                alignItems: "center",
                fontSize: 12,
                padding: "2px 0",
              }}
            >
              <span>
                {SKILL_LABELS[key].toLowerCase()}
                {primary && <span aria-label="Habilidade principal"> ★</span>}
              </span>
              <span
                style={{
                  height: 9,
                  border: "1px solid var(--rv-ink)",
                  position: "relative",
                  background:
                    "repeating-linear-gradient(90deg, transparent 0 calc(10% - 1px), rgba(0,0,0,.25) calc(10% - 1px) 10%)",
                }}
              >
                <i
                  style={{
                    position: "absolute",
                    left: 0,
                    top: 0,
                    bottom: 0,
                    width: `${(skills[key] / 10) * 100}%`,
                    background: primary ? "var(--rv-red)" : "var(--rv-ink)",
                  }}
                />
              </span>
              <span style={{ textAlign: "right", fontVariantNumeric: "tabular-nums" }}>
                {formatSkillLevel(skills[key])}
              </span>
            </div>
          </SmartTooltip>
        );
      })}
    </div>
  );
}
