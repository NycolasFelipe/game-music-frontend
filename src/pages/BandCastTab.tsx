import { useMemo, useState } from "react";
import {
  MemberCard,
  MemberInterviewModal,
  SalaryBadge,
  RelationshipsView,
  useCharacteristics,
  useRelationshipLevels,
} from "@/features/bands";
import type { BandDetail, BandMember, Characteristic } from "@/features/bands";

/**
 * Elenco (ADR-0002): a ficha de cada integrante, com retrato, humor, salário,
 * traços e habilidades, e depois as relações entre eles. Clicar numa ficha abre
 * a entrevista, onde também se ajusta o salário.
 */
export function BandCastTab({ band }: { band: BandDetail }) {
  const { data: characteristics } = useCharacteristics();
  const { data: relationshipLevels } = useRelationshipLevels();
  const [interviewId, setInterviewId] = useState<string | null>(null);
  // Looked up by id so the interview follows the band after a salary change.
  const interviewed: BandMember | null =
    band.members.find((member) => member.id === interviewId) ?? null;

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
            actions={
              <SalaryBadge
                salary={member.salary}
                target={member.salaryTarget}
                atRisk={member.salaryAtRisk}
              />
            }
            onToggle={() => setInterviewId(member.id)}
          />
        ))}
      </div>

      <p className="rv-footnote">Clique num perfil para ler a entrevista completa e ajustar o salário.</p>

      <MemberInterviewModal
        bandId={band.id}
        member={interviewed}
        members={band.members}
        relationships={band.relationships}
        catalog={catalog}
        onClose={() => setInterviewId(null)}
      />

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
