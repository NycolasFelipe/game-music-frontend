import { SmartTooltip } from "@/components/SmartTooltip";

/**
 * Shows a member's salary next to their target, in red when below target (mood
 * erodes) or in arrears (about to leave). The exact turns-to-departure are never shown (gamified);
 * the badge only warns that the member is at risk.
 */
export function SalaryBadge({
  salary,
  target,
  atRisk,
}: {
  salary: number;
  target: number;
  /** Whether the member is in arrears and at risk of leaving. */
  atRisk: boolean;
  size?: "xs" | "sm" | "md" | "lg";
}) {
  const belowTarget = salary < target;

  const tooltip = atRisk
    ? "Salário atrasado — o integrante pode deixar a banda se não for pago"
    : belowTarget
      ? `Abaixo do alvo (${target.toLocaleString("pt-BR")}) — o humor cai a cada turno`
      : `No alvo (${target.toLocaleString("pt-BR")}) — satisfeito`;

  return (
    <SmartTooltip label={tooltip} multiline w={240} withArrow>
      <span
        className="rv-mono"
        tabIndex={0}
        style={{ fontSize: 12, cursor: "help", whiteSpace: "nowrap" }}
      >
        Salário{" "}
        <span className={atRisk || belowTarget ? "rv-red" : undefined}>
          {atRisk ? "atrasado " : ""}
          {salary.toLocaleString("pt-BR")}
        </span>
        <span style={{ color: "var(--rv-soft)" }}> / alvo {target.toLocaleString("pt-BR")}</span>
      </span>
    </SmartTooltip>
  );
}
