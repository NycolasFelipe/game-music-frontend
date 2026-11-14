import { Button, Loader, NumberInput } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { useState } from "react";
import { InsertModal } from "@/components/revista";
import { SkillBars } from "@/features/bands/components/SkillBars";
import {
  useHappinessLevels,
  useRelationshipLevels,
} from "@/features/bands/hooks/useBandOptions";
import {
  useMemberSalaryHistory,
  useUpdateMemberSalary,
} from "@/features/bands/hooks/useMemberSalary";
import { SKILL_LABELS } from "@/features/bands/labels";
import { bandmateOpinions } from "@/features/bands/opinions";
import { MemberFace, MemberPortrait } from "@/features/bands/portrait/MemberPortrait";
import type {
  BandMember,
  Characteristic,
  MemberRelationship,
  Skills,
} from "@/features/bands/types";
import { formatMoney } from "@/utils/money";
import { formatPeriod } from "@/utils/period";

const REASON_LABELS: Record<string, string> = {
  inicial: "inicial",
  ajuste: "ajuste",
  automatico: "automático",
};

/**
 * O humor com sinal e uma casa, no formato brasileiro ("+2,0", "−1,5").
 *
 * @param value - Humor de −5 a 5.
 * @returns O humor formatado.
 */
function signedMood(value: number): string {
  const rounded = Math.round(value * 10) / 10 || 0;
  const abs = Math.abs(rounded).toLocaleString("pt-BR", {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  });
  return rounded > 0 ? `+${abs}` : rounded < 0 ? `−${abs}` : `±${abs}`;
}

/**
 * O corpo da entrevista, montado só com o encarte aberto (o histórico de
 * salário só é buscado aí).
 *
 * @param props.bandId - A banda.
 * @param props.member - O integrante.
 * @param props.bandmates - Os outros integrantes.
 * @param props.relationships - Relações da banda.
 * @param props.catalog - Catálogo de traços.
 * @param props.onClose - Fecha o encarte.
 */
function InterviewBody({
  bandId,
  member,
  bandmates,
  relationships,
  catalog,
  onClose,
}: {
  bandId: string;
  member: BandMember;
  bandmates: BandMember[];
  relationships: MemberRelationship[];
  catalog: Map<string, Characteristic>;
  onClose: () => void;
}) {
  const { data: levels } = useHappinessLevels();
  const { data: relationshipLevels } = useRelationshipLevels();
  const levelWith = (mateId: string) =>
    relationships.find(
      (r) =>
        (r.memberAId === member.id && r.memberBId === mateId) ||
        (r.memberBId === member.id && r.memberAId === mateId),
    )?.level ?? 0;
  const opinions = bandmateOpinions(
    member.id,
    bandmates.map((mate) => ({ id: mate.id, name: mate.name, level: levelWith(mate.id) })),
  );
  const history = useMemberSalaryHistory(bandId, member.id, true);
  const update = useUpdateMemberSalary(bandId);
  const [amount, setAmount] = useState<number>(member.salary);

  const level = levels?.find(
    (entry) => entry.level === Math.max(-5, Math.min(5, Math.round(member.happiness))),
  );
  const role = SKILL_LABELS[member.primarySkill as keyof Skills] ?? member.primarySkill;
  const belowTarget = member.salary < member.salaryTarget;

  function save() {
    update.mutate(
      { memberId: member.id, amount },
      {
        onSuccess: () => {
          notifications.show({
            color: "ink",
            message: `Salário de ${member.name} ajustado para ${formatMoney(amount)}.`,
          });
          onClose();
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
    <div>
      <div style={{ display: "grid", gridTemplateColumns: "minmax(120px, 190px) 1fr", gap: 22 }}>
        <div>
          <MemberPortrait
            subject={member}
            tag={member.moodAtRisk ? "Prestes a sair" : member.happiness < -1 ? "Em crise" : undefined}
          />
          <p className="rv-caption">
            {member.age} anos · {role.toLowerCase()}
          </p>
        </div>
        <div style={{ minWidth: 0 }}>
          {level && (
            <p className="rv-pull" style={{ marginTop: 0 }}>
              “{level.description}”
              <small>
                Humor {signedMood(member.happiness)} · {level.name}
                {member.moodAtRisk && (
                  <span className="rv-red"> · mais um turno assim e sai da banda</span>
                )}
              </small>
            </p>
          )}
          <p className="rv-body rv-lede">{member.biography}</p>
        </div>
      </div>

      <div className="rv-cols2" style={{ marginTop: 14 }}>
        <div>
          <div className="rv-kicker">Habilidades</div>
          <SkillBars skills={member.skills} primarySkill={member.primarySkill} />
          <p className="rv-caption">★ instrumento principal · passe o mouse para ler o nível</p>
        </div>
        <div>
          <div className="rv-kicker">Personalidade</div>
          {member.characteristics.map((id) => {
            const trait = catalog.get(id);
            return (
              <p key={id} style={{ margin: "6px 0" }}>
                <b className="rv-mono" style={{ fontSize: 12, textTransform: "uppercase" }}>
                  {trait?.name ?? id}
                </b>{" "}
                <span style={{ fontSize: 14 }}>{trait?.description ?? ""}</span>
              </p>
            );
          })}
        </div>
      </div>

      {bandmates.length > 0 && (
        <>
          <div className="rv-sectionhead">
            <h3 style={{ fontSize: 24 }}>Sobre os colegas</h3>
            <span>o que {member.name.split(" ")[0]} diz de cada um</span>
          </div>
          <div className="rv-quotes">
            {bandmates.map((mate) => {
              const level = levelWith(mate.id);
              const info = relationshipLevels?.find((entry) => entry.level === level);
              return (
                <div key={mate.id} className={`rv-q ${level < 0 ? "rv-neg" : ""}`}>
                  <b style={{ display: "flex", gap: 8, alignItems: "center" }}>
                    <MemberFace subject={mate} size={22} />
                    {mate.name}
                  </b>
                  <span className={`rv-tierword ${level < 0 ? "rv-red" : ""}`}>
                    {info?.name ?? "Relação"} · {level > 0 ? `+${level}` : level}
                  </span>
                  <p style={{ margin: "2px 0 0", fontStyle: "italic" }}>“{opinions.get(mate.id)}”</p>
                </div>
              );
            })}
          </div>
        </>
      )}

      <div className="rv-sectionhead">
        <h3 style={{ fontSize: 24 }}>Salário</h3>
        <span className={member.salaryAtRisk ? "rv-neg" : undefined}>
          {member.salaryAtRisk
            ? "em atraso: risco de saída"
            : belowTarget
              ? "abaixo do alvo: o humor cai a cada turno"
              : "em dia"}
        </span>
      </div>
      <div className="rv-cols2" style={{ marginTop: 8 }}>
        <div>
          <div className="rv-facts" style={{ ["--rv-n" as string]: 2, marginTop: 0 }}>
            <div>
              <span>Atual</span>
              <b className={belowTarget || member.salaryAtRisk ? "rv-neg" : undefined}>
                {formatMoney(member.salary)}
              </b>
            </div>
            <div>
              <span>Alvo</span>
              <b>{formatMoney(member.salaryTarget)}</b>
            </div>
          </div>
          <div className="rv-form" style={{ display: "flex", gap: 10, alignItems: "flex-end" }}>
            <NumberInput
              label="Novo salário por turno"
              value={amount}
              onChange={(value) => setAmount(typeof value === "number" ? value : 0)}
              min={0}
              step={50}
              allowDecimal={false}
              thousandSeparator="."
              decimalSeparator=","
              prefix="$"
              style={{ flex: 1 }}
            />
            <Button onClick={save} loading={update.isPending} disabled={amount === member.salary}>
              Salvar
            </Button>
          </div>
        </div>
        <div>
          <div className="rv-kicker">Histórico</div>
          {history.isLoading ? (
            <Loader size="xs" />
          ) : (
            <div className="rv-ledger">
              {(history.data ?? []).length === 0 ? (
                <div>
                  <span>Sem histórico</span>
                  <span />
                </div>
              ) : (
                (history.data ?? []).map((entry, index) => (
                  <div key={index}>
                    <span>
                      {formatPeriod(entry.effectiveYear, bandId, "short")} · {REASON_LABELS[entry.reason] ?? entry.reason}
                    </span>
                    <span>{formatMoney(entry.amount)}</span>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * Entrevista de um integrante (ADR-0002), aberta ao clicar na ficha do Elenco:
 * retrato, a fala que o humor dele rende, biografia, habilidades, personalidade
 * com a descrição de cada traço, a opinião sobre cada colega (uma fala do nível
 * de relação entre os dois, sem repetir na mesma entrevista) e o salário, com
 * ajuste e histórico.
 *
 * @param props.bandId - A banda.
 * @param props.member - O integrante (ou `null` com o encarte fechado).
 * @param props.members - Todos os integrantes, para a opinião sobre os colegas.
 * @param props.relationships - Relações da banda.
 * @param props.catalog - Catálogo de traços.
 * @param props.onClose - Fecha o encarte.
 */
export function MemberInterviewModal({
  bandId,
  member,
  members = [],
  relationships = [],
  catalog,
  onClose,
}: {
  bandId: string;
  member: BandMember | null;
  members?: BandMember[];
  relationships?: MemberRelationship[];
  catalog: Map<string, Characteristic>;
  onClose: () => void;
}) {
  return (
    <InsertModal
      opened={Boolean(member)}
      onClose={onClose}
      label="Entrevista"
      title={member?.name ?? ""}
      size="xl"
    >
      {member && (
        <InterviewBody
          key={member.id}
          bandId={bandId}
          member={member}
          bandmates={members.filter((other) => other.id !== member.id)}
          relationships={relationships}
          catalog={catalog}
          onClose={onClose}
        />
      )}
    </InsertModal>
  );
}
