import { Button, Group } from "@mantine/core";
import { InsertModal } from "@/components/revista";
import { FormerMemberCard } from "@/features/bands/components/FormerMemberCard";
import type { Characteristic } from "@/features/bands/types";
import type { FormerMember } from "@/types/former-member";

/**
 * Encarte de saída (ADR-0002): quem deixou a banda por salário atrasado, com a
 * ficha de cada um como estava no dia em que saiu.
 *
 * @param props.members - Quem saiu neste fechamento.
 * @param props.catalog - Catálogo de traços.
 * @param props.opened - Se o encarte está aberto.
 * @param props.onClose - Fecha o encarte.
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
    members.length === 1
      ? `${members[0].name} deixou a banda.`
      : `${members.length} integrantes deixaram a banda.`;

  return (
    <InsertModal opened={opened} onClose={onClose} label="Saída · convívio" title={title} size="xl">
      <p className="rv-deck">
        O salário ficou atrasado por tempo demais. A ficha abaixo é de como
        {members.length === 1 ? " estava" : " estavam"} no dia da saída.
      </p>
      <div style={{ display: "grid", gap: 22 }}>
        {members.map((member) => (
          <FormerMemberCard key={member.id} member={member} catalog={catalog} />
        ))}
      </div>
      <p className="rv-caption" style={{ marginTop: 14 }}>
        A ficha fica guardada na seção Ex-integrantes.
      </p>
      <Group justify="flex-end" mt="md">
        <Button onClick={onClose}>Voltar à edição</Button>
      </Group>
    </InsertModal>
  );
}
