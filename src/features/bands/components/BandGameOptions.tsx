import { Stack, Switch, Text, Title } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { useUpdateBandSettings } from "@/features/bands/hooks/useBandSettings";
import type { BandDetail } from "@/features/bands/types";

/**
 * Gameplay options of the save (ADR-0013). Today: the automatic salary
 * adjustment, which raises salaries to their target every turn whenever the
 * cash covers the new payroll.
 */
export function BandGameOptions({ band }: { band: BandDetail }) {
  const update = useUpdateBandSettings(band.id);

  function toggleAutoSalary(checked: boolean) {
    update.mutate(
      { autoSalaryAdjust: checked },
      {
        onSuccess: () =>
          notifications.show({
            color: "teal",
            message: checked
              ? "Salários passarão a ser ajustados automaticamente a cada turno."
              : "Ajuste automático de salários desligado.",
          }),
        onError: () =>
          notifications.show({
            color: "red",
            message: "Não foi possível salvar a opção.",
          }),
      },
    );
  }

  return (
    <Stack gap="md" maw={520}>
      <div>
        <Title order={5}>Jogabilidade</Title>
        <Text size="sm" c="dimmed">
          Opções que mudam como o jogo conduz a banda.
        </Text>
      </div>

      <Switch
        checked={band.autoSalaryAdjust}
        onChange={(event) => toggleAutoSalary(event.currentTarget.checked)}
        disabled={update.isPending}
        label="Ajustar salários automaticamente"
        description="A cada turno, os salários sobem para o alvo de cada integrante — nunca são cortados, e o reajuste só acontece se o caixa cobrir a nova folha."
      />
    </Stack>
  );
}
