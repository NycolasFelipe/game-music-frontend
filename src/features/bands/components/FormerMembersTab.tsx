import { Loader } from "@mantine/core";
import { useMemo } from "react";
import { FormerMemberCard } from "@/features/bands/components/FormerMemberCard";
import { useCharacteristics } from "@/features/bands/hooks/useBandOptions";
import { useFormerMembers } from "@/features/bands/hooks/useFormerMembers";
import type { Characteristic } from "@/features/bands/types";

/**
 * Seção Ex-integrantes ("Onde estão agora"): a ficha de cada um que saiu, do
 * mais recente ao mais antigo, como ficou no dia da saída.
 *
 * @param props.bandId - A banda.
 */
export function FormerMembersTab({ bandId }: { bandId: string }) {
  const { data: formers, isLoading } = useFormerMembers(bandId);
  const { data: characteristics } = useCharacteristics();

  const catalog = useMemo(
    () =>
      new Map<string, Characteristic>(
        (characteristics ?? []).map((c) => [c.id, c]),
      ),
    [characteristics],
  );

  const ordered = useMemo(
    () => [...(formers ?? [])].sort((a, b) => b.leftAtYear - a.leftAtYear),
    [formers],
  );

  return (
    <div>
      <div className="rv-kicker">Onde estão agora</div>
      <h2 className="rv-head rv-md">
        Ex-integrantes{ordered.length > 0 ? ` (${ordered.length})` : ""}
      </h2>

      {isLoading ? (
        <Loader size="sm" />
      ) : ordered.length === 0 ? (
        <div className="rv-empty" style={{ textAlign: "left", padding: "16px 0" }}>
          <p className="rv-deck">Ninguém saiu da banda até agora.</p>
        </div>
      ) : (
        <div className="rv-cols2" style={{ gap: "26px 34px", marginTop: 10 }}>
          {ordered.map((member) => (
            <FormerMemberCard key={member.id} member={member} bandId={bandId} catalog={catalog} />
          ))}
        </div>
      )}
    </div>
  );
}
