import { Modal, Stack, Text } from "@mantine/core";
import { FormerMemberCard } from "@/features/bands/components/FormerMemberCard";
import type { Characteristic } from "@/features/bands/types";
import type { FormerMember } from "@/types/former-member";

/**
 * Modal shown when members leave the band (over unpaid salary), with each
 * departed member's snapshot: data, mood, turns unpaid and relationships.
 */
export function DepartureModal({
  members,
  catalog,
  opened,
  onClose,
}: {
  members: FormerMember[];
  catalog: Map<string, Characteristic>;
  opened: boolean;
  onClose: () => void;
}) {
  const title =
    members.length > 1
      ? `${members.length} integrantes deixaram a banda`
      : "Um integrante deixou a banda";

  return (
    <Modal opened={opened} onClose={onClose} title={title} size="lg">
      <Stack gap="md">
        <Text size="sm" c="dimmed">
          O salário ficou atrasado por tempo demais. Veja quem saiu:
        </Text>
        {members.map((member) => (
          <FormerMemberCard key={member.id} member={member} catalog={catalog} />
        ))}
      </Stack>
    </Modal>
  );
}
