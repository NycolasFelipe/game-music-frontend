import { Badge } from "@mantine/core";
import { SmartTooltip } from "@/components/SmartTooltip";

/**
 * Shows a member's salary, colored by how it compares to their target: green at
 * or above target, yellow below target (mood erodes), red while at risk (unpaid
 * — about to leave). The exact turns-to-departure are never shown (gamified);
 * the badge only warns that the member is at risk.
 */
export function SalaryBadge({
  salary,
  target,
  atRisk,
  size = "sm",
}: {
  salary: number;
  target: number;
  /** Whether the member is in arrears and at risk of leaving. */
  atRisk: boolean;
  size?: "xs" | "sm" | "md" | "lg";
}) {
  const belowTarget = salary < target;
  const color = atRisk ? "red" : belowTarget ? "yellow" : "teal";

  const tooltip = atRisk
    ? "Salário atrasado — o integrante pode deixar a banda se não for pago"
    : belowTarget
      ? `Abaixo do alvo (${target.toLocaleString("pt-BR")}) — o humor cai a cada turno`
      : `No alvo (${target.toLocaleString("pt-BR")}) — satisfeito`;

  return (
    <SmartTooltip label={tooltip} multiline w={240} withArrow>
      <Badge
        variant="light"
        color={color}
        size={size}
        style={{ cursor: "help", flexShrink: 0 }}
      >
        {atRisk ? "⚠️" : "💵"} {salary.toLocaleString("pt-BR")}
      </Badge>
    </SmartTooltip>
  );
}
