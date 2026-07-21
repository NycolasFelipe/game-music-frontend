import {
  Button,
  Divider,
  Group,
  Loader,
  NumberInput,
  Popover,
  Stack,
  Text,
  UnstyledButton,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { useState } from "react";
import { SalaryBadge } from "@/features/bands/components/SalaryBadge";
import {
  useMemberSalaryHistory,
  useUpdateMemberSalary,
} from "@/features/bands/hooks/useMemberSalary";
import type { BandMember } from "@/features/bands/types";

const REASON_LABELS: Record<string, string> = {
  inicial: "Inicial",
  ajuste: "Ajuste",
};

/**
 * Salary badge that opens a popover to adjust a member's salary and review its
 * history. The badge color signals whether the member is paid at/above target,
 * below target, or in arrears.
 */
export function MemberSalaryControl({
  bandId,
  member,
}: {
  bandId: string;
  member: BandMember;
}) {
  const [opened, setOpened] = useState(false);
  const [amount, setAmount] = useState<number>(member.salary);
  const update = useUpdateMemberSalary(bandId);
  const history = useMemberSalaryHistory(bandId, member.id, opened);

  function open() {
    setAmount(member.salary);
    setOpened(true);
  }

  function save() {
    update.mutate(
      { memberId: member.id, amount },
      {
        onSuccess: () => {
          notifications.show({
            color: "teal",
            message: `Salário de ${member.name} ajustado para ${amount.toLocaleString("pt-BR")}.`,
          });
          setOpened(false);
        },
        onError: () =>
          notifications.show({
            color: "red",
            message: "Não foi possível ajustar o salário.",
          }),
      },
    );
  }

  return (
    <Popover
      opened={opened}
      onChange={setOpened}
      position="bottom-end"
      width={260}
      withArrow
      shadow="md"
    >
      <Popover.Target>
        <UnstyledButton
          onClick={(event) => {
            event.stopPropagation();
            if (opened) setOpened(false);
            else open();
          }}
        >
          <SalaryBadge
            salary={member.salary}
            target={member.salaryTarget}
            turnsUntilDeparture={member.salaryTurnsUntilDeparture}
          />
        </UnstyledButton>
      </Popover.Target>

      <Popover.Dropdown onClick={(event) => event.stopPropagation()}>
        <Stack gap="xs">
          <Text fw={600} size="sm">
            Salário — {member.name}
          </Text>
          <Text size="xs" c="dimmed">
            Alvo: {member.salaryTarget.toLocaleString("pt-BR")} por turno
          </Text>
          {member.salaryTurnsUntilDeparture !== null && (
            <Text size="xs" c="red" fw={600}>
              ⚠️ Salário atrasado — sairá em{" "}
              {member.salaryTurnsUntilDeparture} turno(s) se não for pago.
            </Text>
          )}

          <NumberInput
            aria-label="Novo salário"
            value={amount}
            onChange={(value) =>
              setAmount(typeof value === "number" ? value : 0)
            }
            min={0}
            step={50}
            thousandSeparator="."
            decimalSeparator=","
          />

          <Button
            size="xs"
            onClick={save}
            loading={update.isPending}
            disabled={amount === member.salary}
          >
            Salvar
          </Button>

          <Divider label="Histórico" labelPosition="center" />

          {history.isLoading ? (
            <Group justify="center" py="xs">
              <Loader size="xs" />
            </Group>
          ) : history.data && history.data.length > 0 ? (
            <Stack gap={4}>
              {history.data.map((entry, index) => (
                <Group key={index} justify="space-between" gap="xs">
                  <Text size="xs">
                    {entry.amount.toLocaleString("pt-BR")}
                  </Text>
                  <Text size="xs" c="dimmed">
                    {REASON_LABELS[entry.reason] ?? entry.reason} ·{" "}
                    {entry.effectiveYear}
                  </Text>
                </Group>
              ))}
            </Stack>
          ) : (
            <Text size="xs" c="dimmed" ta="center">
              Sem histórico.
            </Text>
          )}
        </Stack>
      </Popover.Dropdown>
    </Popover>
  );
}
