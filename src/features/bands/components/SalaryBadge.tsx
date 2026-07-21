import { Badge } from "@mantine/core";
import { SmartTooltip } from "@/components/SmartTooltip";

/**
 * Shows a member's salary, colored by how it compares to their target: green at
 * or above target, yellow below target (mood erodes), red while in arrears
 * (unpaid — about to leave). When `turnsUntilDeparture` is set the member is in
 * arrears and the badge warns how many turns are left before they quit.
 */
export function SalaryBadge({
  salary,
  target,
  turnsUntilDeparture,
  size = "sm",
}: {
  salary: number;
  target: number;
  /** Turns left before leaving over unpaid salary; `null` when paid. */
  turnsUntilDeparture: number | null;
  size?: "xs" | "sm" | "md" | "lg";
}) {
  const inArrears = turnsUntilDeparture !== null;
  const belowTarget = salary < target;
  const color = inArrears ? "red" : belowTarget ? "yellow" : "teal";

  const tooltip = inArrears
    ? `Salário atrasado — sairá em ${turnsUntilDeparture} turno(s) se não for pago`
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
        {inArrears ? "⚠️" : "💵"} {salary.toLocaleString("pt-BR")}
      </Badge>
    </SmartTooltip>
  );
}
