import { SmartTooltip } from "@/components/SmartTooltip";
import type { Characteristic } from "@/features/bands/types";

/**
 * Traços que costumam dar problema no elenco. Vão em vermelho, como um aviso
 * de redação; os demais em tinta.
 */
const TROUBLE_TRAITS = new Set([
  "hothead",
  "erratic",
  "envious",
  "lazy",
  "greedy",
  "plagiarist",
  "manipulator",
  "jealous",
  "paranoid",
  "dazzled",
  "validation_seeker",
  "insecure",
  "individualist",
]);

/**
 * Traços como selos tipográficos (ADR-0002), com nome e descrição vindos do
 * catálogo do backend (usa o id enquanto o catálogo carrega).
 */
export function CharacteristicChips({
  ids,
  catalog,
}: {
  ids: string[];
  catalog: Map<string, Characteristic>;
}) {
  return (
    <div className="rv-traits">
      {ids.map((id) => {
        const trait = catalog.get(id);
        return (
          <SmartTooltip
            key={id}
            label={trait?.description ?? id}
            multiline
            w={240}
            withArrow
            events={{ hover: true, focus: true, touch: true }}
          >
            <span className={`rv-trait ${TROUBLE_TRAITS.has(id) ? "rv-bad" : ""}`} tabIndex={0}>
              {trait?.name ?? id}
            </span>
          </SmartTooltip>
        );
      })}
    </div>
  );
}
