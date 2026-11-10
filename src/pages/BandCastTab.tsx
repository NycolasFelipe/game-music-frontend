import { useMemo } from "react";
import {
  MemberCard,
  MemberSalaryControl,
  RelationshipsView,
  useCharacteristics,
  useRelationshipLevels,
} from "@/features/bands";
import type { BandDetail, Characteristic } from "@/features/bands";

/**
 * Elenco (ADR-0002): a ficha de cada integrante, com retrato, humor, salário,
 * traços e habilidades, e depois as relações entre eles.
 */
export function BandCastTab({ band }: { band: BandDetail }) {
  const { data: characteristics } = useCharacteristics();
  const { data: relationshipLevels } = useRelationshipLevels();

  const catalog = useMemo(
    () => new Map<string, Characteristic>((characteristics ?? []).map((c) => [c.id, c])),
    [characteristics],
  );

  return (
    <>
      <div className="rv-kicker">Perfis</div>
      <h2 className="rv-head rv-md">Quem faz a {band.name}</h2>
      <div className="rv-roster">
        {band.members.map((member) => (
          <MemberCard
            key={member.id}
            member={member}
            catalog={catalog}
            tag={member.happiness < -1 ? "Em crise" : member.salaryAtRisk ? "Salário atrasado" : undefined}
            actions={<MemberSalaryControl bandId={band.id} member={member} />}
          />
        ))}
      </div>

      <div className="rv-sectionhead">
        <h3>Relações</h3>
        <span>quem se dá com quem</span>
      </div>
      <div style={{ marginTop: 12 }}>
        <RelationshipsView
          members={band.members}
          relationships={band.relationships}
          levels={relationshipLevels ?? []}
        />
      </div>
    </>
  );
}
