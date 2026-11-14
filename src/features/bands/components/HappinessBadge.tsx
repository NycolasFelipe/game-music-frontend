import { SmartTooltip } from "@/components/SmartTooltip";
import { useHappinessLevels } from "@/features/bands/hooks/useBandOptions";

/**
 * O humor de um integrante como régua centrada no zero (tinta para cima,
 * vermelho para baixo) e o nome do nível, sem número (decisão do dono). A descrição do nível
 * aparece ao passar o mouse.
 */
export function HappinessBadge({
  value,
}: {
  value: number;
  size?: "xs" | "sm" | "md" | "lg";
}) {
  const { data: levels } = useHappinessLevels();
  const safe = Number.isFinite(value) ? value : 0;
  const bucket = Math.max(-5, Math.min(5, Math.round(safe)));
  const info = levels?.find((l) => l.level === bucket);
  const width = Math.min(50, Math.abs(safe) * 10);

  return (
    <SmartTooltip label={info?.description ?? ""} disabled={!info} multiline w={260} withArrow>
      <span className="rv-mono" style={{ fontSize: 12, cursor: "help", whiteSpace: "nowrap" }} tabIndex={0}>
        <span className="rv-mood" aria-hidden="true">
          <i
            style={
              safe >= 0
                ? { left: "50%", width: `${width}%`, background: "var(--rv-ink)" }
                : { right: "50%", width: `${width}%`, background: "var(--rv-red)" }
            }
          />
        </span>{" "}
        {info?.name ?? ""}
      </span>
    </SmartTooltip>
  );
}
