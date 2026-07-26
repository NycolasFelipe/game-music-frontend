import {
  Badge,
  Group,
  Paper,
  Popover,
  Stack,
  Text,
  UnstyledButton,
} from "@mantine/core";
import { useState } from "react";
import { formatSkillLevel, SKILL_LABELS, SKILL_ORDER } from "@/features/bands";
import type { BandMember, MemberRelationship, Skills } from "@/features/bands";
import {
  bestMemberFor,
  chemistryFactor,
  creditLoad,
  focusFactor,
  importanceStars,
} from "@/features/releases/creation-forecast";
import type { ReleaseCredits } from "@/features/releases/types";

/** Instrument art per aspect — the stage reads by shape, not by label. */
const ASPECT_EMOJI: Record<keyof Skills, string> = {
  vocal: "🎤",
  guitar: "🎸",
  bass: "🎻",
  drums: "🥁",
  piano: "🎹",
  lyrics: "✍️",
};

/** Color for a skill level, so a weak pick reads as weak at a glance. */
function skillColor(level: number): string {
  if (level >= 7) return "teal";
  if (level >= 4) return "blue";
  if (level >= 2) return "yellow";
  return "gray";
}

/** Mantine color for how stretched a member is (ADR-0014 §1). */
function focusColor(focus: number): string {
  if (focus >= 0.95) return "gray";
  if (focus >= 0.8) return "yellow";
  return "red";
}

/**
 * A musician's token: avatar, name and one figure — how loaded they are (in the
 * roster) or how good they are here (on the stage).
 */
function MemberToken({
  member,
  caption,
  captionColor,
  state,
  label,
  onClick,
  onDragStart,
}: {
  member: BandMember;
  caption: string;
  captionColor?: string;
  /** `idle` in the roster, `held` while picked up, `placed` inside a slot. */
  state: "idle" | "held" | "placed";
  label: string;
  onClick: () => void;
  onDragStart?: () => void;
}) {
  const held = state === "held";

  return (
    <UnstyledButton
      onClick={onClick}
      aria-label={label}
      aria-pressed={held}
      draggable={Boolean(onDragStart)}
      onDragStart={onDragStart}
      style={{
        padding: "6px 10px",
        borderRadius: 12,
        border: held
          ? "2px solid var(--mantine-color-blue-6)"
          : "1px solid var(--mantine-color-default-border)",
        background: held
          ? "var(--mantine-color-blue-light)"
          : state === "placed"
            ? "var(--mantine-color-default-hover)"
            : undefined,
        transform: held ? "translateY(-3px) scale(1.04)" : undefined,
        boxShadow: held ? "0 6px 14px rgba(0,0,0,0.18)" : undefined,
        transition: "transform 120ms ease, box-shadow 120ms ease",
        cursor: onDragStart ? "grab" : "pointer",
      }}
    >
      <Group gap={8} wrap="nowrap">
        <Text fz={22} lh={1}>
          {member.avatar}
        </Text>
        <div>
          <Text size="sm" fw={600} lh={1.1}>
            {member.name}
          </Text>
          <Text size="xs" c={captionColor ?? "dimmed"} lh={1.2}>
            {caption}
          </Text>
        </div>
      </Group>
    </UnstyledButton>
  );
}

/** Picks who signs an aspect starting from the instrument, ranked by skill. */
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
    <Popover opened={opened} onChange={setOpened} position="bottom" withArrow>
      <Popover.Target>
        <UnstyledButton
          onClick={() => setOpened((o) => !o)}
          aria-label={`Escolher quem assina ${SKILL_LABELS[aspect]}`}
          style={{
            padding: "4px 10px",
            borderRadius: 10,
            border: "1px dashed var(--mantine-color-dimmed)",
          }}
        >
          <Text size="xs" c="dimmed">
            {assigned.length === 0 ? "+ quem toca aqui" : "+ dividir"}
          </Text>
        </UnstyledButton>
      </Popover.Target>
      <Popover.Dropdown p={6}>
        <Stack gap={4}>
          {ranked.map((member) => (
            <UnstyledButton
              key={member.id}
              onClick={() => {
                onPick(member.id);
                setOpened(false);
              }}
              aria-label={`${
                assigned.includes(member.id) ? "Remover" : "Creditar"
              } ${member.name} ${
                assigned.includes(member.id) ? "de" : "em"
              } ${SKILL_LABELS[aspect]}`}
              style={{ padding: "4px 6px", borderRadius: 8 }}
            >
              <Group gap={8} justify="space-between" wrap="nowrap" w={190}>
                <Group gap={6} wrap="nowrap">
                  <Text fz={16}>{member.avatar}</Text>
                  <Text size="sm">{member.name}</Text>
                </Group>
                <Badge
                  size="sm"
                  variant="light"
                  color={
                    assigned.includes(member.id)
                      ? "gray"
                      : skillColor(member.skills[aspect])
                  }
                >
                  {assigned.includes(member.id)
                    ? "sai"
                    : formatSkillLevel(member.skills[aspect])}
                </Badge>
              </Group>
            </UnstyledButton>
          ))}
        </Stack>
      </Popover.Dropdown>
    </Popover>
  );
}

/**
 * The credits stage: the band's roster on top, the instruments below as
 * positions to fill. Pick a musician (click or drag) and drop them on the
 * instruments they will play — the position shows what that musician is worth
 * there, how stretched they already are (ADR-0014 §1) and what the chemistry of
 * a shared instrument adds (ADR-0014 §2). Aspects are ordered by how much the
 * chosen style leans on them.
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
  /** The style's per-aspect weights; when absent, the canonical order is used. */
  weights?: Record<keyof Skills, number>;
  /** The band's relationships, for the chemistry of shared aspects. */
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
    <Stack gap="sm">
      <Paper withBorder radius="md" p="xs">
        <Group gap="xs" wrap="wrap">
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
                        focus < 1 ? ` · ${Math.round(focus * 100)}%` : ""
                      }`
                }
                captionColor={count > 1 ? focusColor(focus) : undefined}
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
        </Group>
        <Text size="xs" c="dimmed" mt={6}>
          {held
            ? `${held.name} na mão — toque nos instrumentos que ${held.name.split(" ")[0]} vai tocar.`
            : "Escolha um integrante (ou arraste) e distribua pelos instrumentos."}
        </Text>
      </Paper>

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
          <Paper
            key={aspect}
            withBorder
            radius="md"
            p="sm"
            onDragOver={(event) => held && event.preventDefault()}
            onDrop={() => held && !holdsThis && toggle(aspect, held.id)}
            style={{
              borderStyle: assigned.length === 0 ? "dashed" : "solid",
              borderColor: crucialAndEmpty
                ? "var(--mantine-color-red-6)"
                : held
                  ? "var(--mantine-color-blue-4)"
                  : undefined,
            }}
          >
            <Group justify="space-between" wrap="nowrap" mb={8}>
              <Group gap={8} wrap="nowrap">
                <Text fz={24} lh={1}>
                  {ASPECT_EMOJI[aspect]}
                </Text>
                <div>
                  <Text size="sm" fw={700} lh={1.1}>
                    {SKILL_LABELS[aspect]}
                  </Text>
                  {weights && (
                    <Text size="xs" c="dimmed" lh={1.2}>
                      <Text span c="yellow.7">
                        {"★".repeat(stars)}
                      </Text>
                      {`${"★".repeat(3 - stars)} · ${Math.round(weight * 100)}% da nota`}
                    </Text>
                  )}
                </div>
              </Group>

              {chemistryPercent !== 0 && (
                <Badge
                  size="sm"
                  variant="light"
                  color={chemistryPercent > 0 ? "teal" : "red"}
                >
                  {chemistryPercent > 0 ? "🤝" : "💢"} química{" "}
                  {chemistryPercent > 0 ? "+" : ""}
                  {chemistryPercent}%
                </Badge>
              )}
            </Group>

            <Group gap="xs" wrap="wrap">
              {assigned.map((id) => {
                const player = members.find((m) => m.id === id);
                if (!player) return null;
                return (
                  <MemberToken
                    key={id}
                    member={player}
                    state="placed"
                    caption={`${formatSkillLevel(player.skills[aspect])}${
                      id === best ? " ⭐" : ""
                    }`}
                    captionColor={skillColor(player.skills[aspect])}
                    label={`Remover ${player.name} de ${SKILL_LABELS[aspect]}`}
                    onClick={() => toggle(aspect, id)}
                  />
                );
              })}

              {held && !holdsThis && (
                <UnstyledButton
                  onClick={() => toggle(aspect, held.id)}
                  aria-label={`Creditar ${held.name} em ${SKILL_LABELS[aspect]}`}
                  style={{
                    padding: "6px 12px",
                    borderRadius: 12,
                    border: "2px dashed var(--mantine-color-blue-5)",
                    background: "var(--mantine-color-blue-light)",
                  }}
                >
                  <Group gap={6} wrap="nowrap">
                    <Text fz={18} lh={1}>
                      {held.avatar}
                    </Text>
                    <Text size="xs" fw={700} c={skillColor(held.skills[aspect])}>
                      entra com {formatSkillLevel(held.skills[aspect])}
                      {held.id === best ? " ⭐" : ""}
                    </Text>
                  </Group>
                </UnstyledButton>
              )}

              {!held && (
                <SlotPicker
                  aspect={aspect}
                  members={members}
                  assigned={assigned}
                  onPick={(memberId) => toggle(aspect, memberId)}
                />
              )}
            </Group>

            {crucialAndEmpty && (
              <Text size="xs" c="red" mt={6}>
                ⚠️ Instrumento decisivo neste estilo e ninguém assumiu.
              </Text>
            )}
          </Paper>
        );
      })}
    </Stack>
  );
}
