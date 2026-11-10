import { Popover } from "@mantine/core";
import { useState } from "react";
import {
  formatSkillLevel,
  MemberFace,
  SKILL_LABELS,
  SKILL_ORDER,
} from "@/features/bands";
import type { BandMember, MemberRelationship, Skills } from "@/features/bands";
import {
  bestMemberFor,
  chemistryFactor,
  creditLoad,
  focusFactor,
  importanceStars,
  recommendedCredits,
} from "@/features/releases/creation-forecast";
import type { ReleaseCredits } from "@/features/releases/types";

/** Nível baixo demais para assinar um instrumento sem pesar contra a obra. */
const WEAK_LEVEL = 2;

/**
 * Ficha de um músico na escalação: rosto, nome e um número — quanto está
 * carregado (no elenco) ou quanto vale aqui (no instrumento).
 *
 * @param props.member - O integrante.
 * @param props.caption - Linha de baixo (funções ou nível).
 * @param props.alert - Pinta a linha de baixo de vermelho.
 * @param props.state - `idle` no elenco, `held` na mão, `placed` no instrumento.
 * @param props.label - Nome acessível do botão.
 * @param props.onClick - Pega, solta ou remove.
 * @param props.onDragStart - Começa a arrastar (só no elenco).
 */
function MemberToken({
  member,
  caption,
  alert = false,
  state,
  label,
  onClick,
  onDragStart,
}: {
  member: BandMember;
  caption: string;
  alert?: boolean;
  state: "idle" | "held" | "placed";
  label: string;
  onClick: () => void;
  onDragStart?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      aria-pressed={state === "held"}
      draggable={Boolean(onDragStart)}
      onDragStart={onDragStart}
      className={`rv-token ${state === "held" ? "rv-held" : ""} ${state === "placed" ? "rv-placed" : ""}`}
      style={{ cursor: onDragStart ? "grab" : "pointer" }}
    >
      <MemberFace subject={member} size={28} />
      <span>
        <span className="rv-nm">{member.name}</span>
        <span className="rv-cap" style={alert ? { color: "var(--rv-red)" } : undefined}>
          {caption}
        </span>
      </span>
    </button>
  );
}

/**
 * Escolhe quem assina um instrumento a partir dele, com o elenco ordenado por
 * habilidade naquele instrumento.
 *
 * @param props.aspect - O instrumento.
 * @param props.members - O elenco.
 * @param props.assigned - Quem já assina.
 * @param props.onPick - Credita ou remove alguém.
 */
function SlotPicker({
  aspect,
  members,
  assigned,
  onPick,
}: {
  aspect: keyof Skills;
  members: BandMember[];
  assigned: string[];
  onPick: (memberId: string) => void;
}) {
  const [opened, setOpened] = useState(false);
  const ranked = [...members].sort(
    (a, b) => b.skills[aspect] - a.skills[aspect],
  );

  return (
    <Popover opened={opened} onChange={setOpened} position="bottom-start">
      <Popover.Target>
        <button
          type="button"
          className="rv-token rv-add"
          onClick={() => setOpened((o) => !o)}
          aria-label={`Escolher quem assina ${SKILL_LABELS[aspect]}`}
        >
          {assigned.length === 0 ? "+ quem toca aqui" : "+ dividir"}
        </button>
      </Popover.Target>
      <Popover.Dropdown p={0}>
        <div style={{ minWidth: 220 }}>
          {ranked.map((member) => {
            const removing = assigned.includes(member.id);
            return (
              <button
                key={member.id}
                type="button"
                className="rv-listing"
                style={{ padding: "6px 10px", alignItems: "center" }}
                onClick={() => {
                  onPick(member.id);
                  setOpened(false);
                }}
                aria-label={`${removing ? "Remover" : "Creditar"} ${member.name} ${
                  removing ? "de" : "em"
                } ${SKILL_LABELS[aspect]}`}
              >
                <span className="rv-v" style={{ display: "flex", gap: 8, alignItems: "center", fontSize: 15 }}>
                  <MemberFace subject={member} size={20} />
                  {member.name}
                </span>
                <span
                  className="rv-n"
                  style={{
                    fontSize: 13,
                    color: removing
                      ? "var(--rv-soft)"
                      : member.skills[aspect] < WEAK_LEVEL
                        ? "var(--rv-red)"
                        : undefined,
                  }}
                >
                  {removing ? "sai" : formatSkillLevel(member.skills[aspect])}
                </span>
              </button>
            );
          })}
        </div>
      </Popover.Dropdown>
    </Popover>
  );
}

/**
 * A escalação de uma obra: o elenco em cima e os instrumentos embaixo, como
 * vagas a preencher. Pegue um músico (clique ou arraste) e solte nos
 * instrumentos que ele vai tocar. Cada vaga mostra quanto o músico vale ali,
 * quanto ele já está carregado (ADR-0014 §1) e a química de quem divide o
 * instrumento (ADR-0014 §2). Os instrumentos vêm na ordem do peso no estilo.
 *
 * @param props.members - O elenco.
 * @param props.value - Créditos atuais.
 * @param props.onChange - Novos créditos.
 * @param props.weights - Peso de cada instrumento no estilo; sem ele, ordem canônica.
 * @param props.relationships - Relações da banda, para a química.
 */
export function CreditsEditor({
  members,
  value,
  onChange,
  weights,
  relationships = [],
}: {
  members: BandMember[];
  value: ReleaseCredits;
  onChange: (next: ReleaseCredits) => void;
  weights?: Record<keyof Skills, number>;
  relationships?: MemberRelationship[];
}) {
  const [heldId, setHeldId] = useState<string | null>(null);
  const held = members.find((member) => member.id === heldId) ?? null;

  const aspects = weights
    ? [...SKILL_ORDER].sort((a, b) => (weights[b] ?? 0) - (weights[a] ?? 0))
    : SKILL_ORDER;
  const load = creditLoad(value);

  const toggle = (aspect: keyof Skills, memberId: string) => {
    const current = value[aspect] ?? [];
    const next = current.includes(memberId)
      ? current.filter((id) => id !== memberId)
      : [...current, memberId];
    onChange({ ...value, [aspect]: next });
  };

  return (
    <div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
        {members.map((member) => {
          const count = load.get(member.id) ?? 0;
          const focus = focusFactor(count);
          return (
            <MemberToken
              key={member.id}
              member={member}
              state={member.id === heldId ? "held" : "idle"}
              caption={
                count === 0
                  ? "livre"
                  : `${count} ${count === 1 ? "função" : "funções"}${
                      focus < 1 ? ` · foco ${Math.round(focus * 100)}%` : ""
                    }`
              }
              alert={count > 1 && focus < 0.8}
              label={`Selecionar ${member.name}`}
              onClick={() =>
                setHeldId((current) =>
                  current === member.id ? null : member.id,
                )
              }
              onDragStart={() => setHeldId(member.id)}
            />
          );
        })}
      </div>
      {weights && (
        <div style={{ marginTop: 10 }}>
          <button
            type="button"
            className="rv-link"
            onClick={() => {
              setHeldId(null);
              onChange(recommendedCredits(members, weights, relationships));
            }}
          >
            Distribuir recomendado
          </button>
        </div>
      )}
      {held && (
        <p className="rv-caption">
          {`${held.name} na mão: toque nos instrumentos que ${held.name.split(" ")[0]} vai tocar.`}
        </p>
      )}

      <div style={{ borderTop: "2px solid var(--rv-ink)", marginTop: 10 }}>
        {aspects.map((aspect) => {
          const weight = weights?.[aspect] ?? 0;
          const stars = weights ? importanceStars(weight) : 0;
          const assigned = value[aspect] ?? [];
          const crucialAndEmpty = weight >= 0.2 && assigned.length === 0;
          const best = bestMemberFor(members, aspect);
          const chemistry = chemistryFactor(assigned, relationships);
          const chemistryPercent = Math.round((chemistry - 1) * 100);
          const holdsThis = held ? assigned.includes(held.id) : false;

          return (
            <div
              key={aspect}
              className={`rv-slot ${crucialAndEmpty ? "rv-crucial" : ""}`}
              onDragOver={(event) => held && event.preventDefault()}
              onDrop={() => held && !holdsThis && toggle(aspect, held.id)}
            >
              <div>
                <div className="rv-inst">{SKILL_LABELS[aspect]}</div>
                {weights && (
                  <div className="rv-caption" style={{ marginTop: 2 }}>
                    <span style={{ color: "var(--rv-ink)" }}>{"★".repeat(stars)}</span>
                    {`${"☆".repeat(3 - stars)} · ${Math.round(weight * 100)}% da nota`}
                  </div>
                )}
              </div>

              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {assigned.map((id) => {
                  const player = members.find((m) => m.id === id);
                  if (!player) return null;
                  return (
                    <MemberToken
                      key={id}
                      member={player}
                      state="placed"
                      caption={`nível ${formatSkillLevel(player.skills[aspect])}${
                        id === best ? " · o melhor" : ""
                      }`}
                      alert={player.skills[aspect] < WEAK_LEVEL}
                      label={`Remover ${player.name} de ${SKILL_LABELS[aspect]}`}
                      onClick={() => toggle(aspect, id)}
                    />
                  );
                })}

                {held && !holdsThis && (
                  <button
                    type="button"
                    className="rv-token rv-drop"
                    onClick={() => toggle(aspect, held.id)}
                    aria-label={`Creditar ${held.name} em ${SKILL_LABELS[aspect]}`}
                  >
                    <MemberFace subject={held} size={22} />
                    <span className="rv-cap" style={{ color: "var(--rv-ink)" }}>
                      entra com {formatSkillLevel(held.skills[aspect])}
                      {held.id === best ? " · o melhor" : ""}
                    </span>
                  </button>
                )}

                {!held && (
                  <SlotPicker
                    aspect={aspect}
                    members={members}
                    assigned={assigned}
                    onPick={(memberId) => toggle(aspect, memberId)}
                  />
                )}
                {crucialAndEmpty && (
                  <span className="rv-note" style={{ margin: 0, alignSelf: "center" }}>
                    ninguém assumiu
                  </span>
                )}
              </div>

              <div className="rv-mono" style={{ fontSize: 12, textAlign: "right" }}>
                {chemistryPercent !== 0 && (
                  <span className={chemistryPercent > 0 ? "rv-pos" : "rv-neg"}>
                    química {chemistryPercent > 0 ? "+" : ""}
                    {chemistryPercent}%
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
