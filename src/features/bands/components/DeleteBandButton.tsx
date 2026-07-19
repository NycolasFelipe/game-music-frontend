import { ActionIcon, Button, Group, Modal, Text } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { notifications } from "@mantine/notifications";
import { IconTrash } from "@tabler/icons-react";
import { useDeleteBand } from "@/features/bands/hooks/useDeleteBand";

/**
 * Delete a band (save) with a confirmation modal. Renders as a small icon by
 * default, or a full button when `mode="button"`.
 */
export function DeleteBandButton({
  bandId,
  bandName,
  onDeleted,
  mode = "icon",
}: {
  bandId: string;
  bandName: string;
  onDeleted?: () => void;
  mode?: "icon" | "button";
}) {
  const [opened, { open, close }] = useDisclosure(false);
  const del = useDeleteBand();

  function confirm() {
    del.mutate(bandId, {
      onSuccess: () => {
        notifications.show({
          message: `Save "${bandName}" excluído.`,
          color: "green",
        });
        close();
        onDeleted?.();
      },
      onError: () =>
        notifications.show({
          message: "Falha ao excluir o save.",
          color: "red",
        }),
    });
  }

  return (
    <>
      {mode === "icon" ? (
        <ActionIcon
          variant="subtle"
          color="red"
          aria-label={`Excluir ${bandName}`}
          onClick={open}
        >
          <IconTrash size={18} />
        </ActionIcon>
      ) : (
        <Button
          variant="light"
          color="red"
          leftSection={<IconTrash size={16} />}
          onClick={open}
        >
          Excluir save
        </Button>
      )}

      <Modal opened={opened} onClose={close} title="Excluir save" centered>
        <Text size="sm">
          Tem certeza que deseja excluir <strong>{bandName}</strong>? Esta ação
          não pode ser desfeita.
        </Text>
        <Group justify="flex-end" mt="lg">
          <Button variant="default" onClick={close}>
            Cancelar
          </Button>
          <Button color="red" loading={del.isPending} onClick={confirm}>
            Excluir
          </Button>
        </Group>
      </Modal>
    </>
  );
}
