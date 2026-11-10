import { Button, Group } from "@mantine/core";
import { InsertModal } from "@/components/revista";
import { FormerMemberCard } from "@/features/bands/components/FormerMemberCard";
import type { Characteristic } from "@/features/bands/types";
import type { FormerMember } from "@/types/former-member";

/**
 * Explica por que saíram, conforme os motivos de quem deixou a banda.
 *
 * @param members - Quem saiu neste fechamento.
 * @returns A frase do motivo.
 */
function departureReason(members: FormerMember[]): string {
  const reasons = new Set(members.map((member) => member.reason));
  if (reasons.size > 1) {
    return "Uns cansaram de esperar o salário, outros cansaram da própria banda.";
  }
  if (reasons.has("humor")) {
    return "Foram dois semestres seguidos sem achar graça em nada.";
  }
  return "O salário ficou atrasado por tempo demais.";
}

/**
 * Encarte de saída (ADR-0002): quem deixou a banda, por salário atrasado ou
 * mau humor, com a ficha de cada um como estava no dia em que saiu e os fãs
 * que foram junto (ADR-0032 do backend).
 *
 * @param props.members - Quem saiu neste fechamento.
 * @param props.fansLost - Fãs que a banda perdeu com as saídas.
 * @param props.catalog - Catálogo de traços.
 * @param props.opened - Se o encarte está aberto.
 * @param props.onClose - Fecha o encarte.
 */
export function DepartureModal({
  members,
  fansLost = 0,
  catalog,
  opened,
  onClose,
}: {
  members: FormerMember[];
  fansLost?: number;
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
        {departureReason(members)} A ficha abaixo é de como
        {members.length === 1 ? " estava" : " estavam"} no dia da saída.
        {fansLost > 0 && ` ${fansLost.toLocaleString("pt-BR")} fãs foram junto.`}
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
