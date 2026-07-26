import {
  Avatar,
  Box,
  Group,
  Paper,
  SegmentedControl,
  Stack,
  Text,
} from "@mantine/core";
import { firstName, levelHex, pairKey } from "@/features/bands";
import type { BandMember, MemberRelationship } from "@/features/bands";
import { usePeopleView } from "@/features/preferences";
import type { PeopleViewMode } from "@/features/preferences";

interface GuestPickerProps {
  members: BandMember[];
  relationships: MemberRelationship[];
  /** Ids currently on the guest list. */
  selected: string[];
  onToggle: (memberId: string) => void;
}

/** The label a node or card answers to, so both views query the same way. */
const toggleLabel = (name: string, going: boolean) =>
  `${going ? "Tirar" : "Levar"} ${name}`;

/** One member as a card, in or out of the guest list. */
function GuestCard({
  member,
  going,
  onToggle,
}: {
  member: BandMember;
  going: boolean;
  onToggle: () => void;
}) {
  return (
    <Paper
      withBorder
      radius="xl"
      px="sm"
      py={6}
      role="checkbox"
      aria-checked={going}
      aria-label={toggleLabel(member.name, going)}
      tabIndex={0}
      onClick={onToggle}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onToggle();
        }
      }}
      style={{
        cursor: "pointer",
        borderColor: going ? "var(--mantine-color-blue-6)" : undefined,
        borderWidth: going ? 2 : 1,
        background: going ? "var(--mantine-color-blue-light)" : undefined,
      }}
    >
      <Group gap={6} wrap="nowrap">
        <Avatar size={22} radius="xl">
          {member.avatar ?? "🧑"}
        </Avatar>
        <Text size="sm" fw={going ? 700 : 400}>
          {member.name}
        </Text>
      </Group>
    </Paper>
  );
}

/**
 * The same circle the relationships graph draws, turned into a picker: click a
 * node to put that person on the guest list. Only the bonds whose *both* ends
 * are going light up — the activity mends exactly those, so the player sees
 * what the money buys before spending it.
 */
function GuestGraph({
  members,
  relationships,
  selected,
  onToggle,
}: GuestPickerProps) {
  if (members.length < 2) {
    return (
      <Text size="sm" c="dimmed">
        O grafo aparece quando a banda tem 2 ou mais integrantes.
      </Text>
    );
  }

  const levelByPair = new Map(
    relationships.map((r) => [pairKey(r.memberAId, r.memberBId), r.level]),
  );

  const n = members.length;
  const size = 340;
  const center = size / 2;
  const radius = size / 2 - 48;
  const pos = members.map((_, index) => {
    const theta = -Math.PI / 2 + (2 * Math.PI * index) / n;
    return {
      x: center + radius * Math.cos(theta),
      y: center + radius * Math.sin(theta),
    };
  });

  const edges: Array<{ i: number; j: number; level: number; live: boolean }> =
    [];
  for (let i = 0; i < n; i += 1) {
    for (let j = i + 1; j < n; j += 1) {
      const level = levelByPair.get(pairKey(members[i].id, members[j].id));
      if (level === undefined) continue;
      edges.push({
        i,
        j,
        level,
        live:
          selected.includes(members[i].id) && selected.includes(members[j].id),
      });
    }
  }

  return (
    <Stack align="center" gap={4}>
      <Box style={{ width: "100%", maxWidth: size }}>
        <svg viewBox={`0 0 ${size} ${size}`} width="100%">
          {edges.map((edge) => (
            <line
              key={`${edge.i}-${edge.j}`}
              x1={pos[edge.i].x}
              y1={pos[edge.i].y}
              x2={pos[edge.j].x}
              y2={pos[edge.j].y}
              style={{
                stroke: levelHex(edge.level),
                strokeWidth:
                  1 + Math.abs(edge.level) * 0.7 + (edge.live ? 2.5 : 0),
                opacity: edge.live ? 1 : 0.18,
              }}
            />
          ))}

          {members.map((member, index) => {
            const going = selected.includes(member.id);
            return (
              <g
                key={member.id}
                role="checkbox"
                aria-checked={going}
                aria-label={toggleLabel(member.name, going)}
                tabIndex={0}
                style={{ cursor: "pointer" }}
                onClick={() => onToggle(member.id)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    onToggle(member.id);
                  }
                }}
              >
                <circle
                  cx={pos[index].x}
                  cy={pos[index].y}
                  r={going ? 23 : 20}
                  style={{
                    fill: going
                      ? "var(--mantine-color-blue-light)"
                      : "var(--mantine-color-body)",
                    stroke: going
                      ? "var(--mantine-color-blue-6)"
                      : "var(--mantine-color-default-border)",
                    strokeWidth: going ? 2.5 : 1,
                    transition: "r 120ms ease",
                  }}
                />
                <text
                  x={pos[index].x}
                  y={pos[index].y}
                  fontSize={22}
                  textAnchor="middle"
                  dominantBaseline="central"
                >
                  {member.avatar}
                </text>
                <text
                  x={pos[index].x}
                  y={pos[index].y + 36}
                  fontSize={11}
                  fontWeight={going ? 700 : 400}
                  textAnchor="middle"
                  style={{
                    fill: going
                      ? "var(--mantine-color-blue-text)"
                      : "var(--mantine-color-dimmed)",
                  }}
                >
                  {firstName(member.name)}
                </text>
              </g>
            );
          })}
        </svg>
      </Box>

      <Text size="xs" c="dimmed" ta="center">
        Clique em quem vai — acendem as relações que a saída vai mexer
      </Text>
    </Stack>
  );
}

/**
 * Picks the guest list, as cards or on the relationship circle (ADR-0017 §1).
 * It shares the account's people-view preference with the relationships section
 * (ADR-0018 §4): it is the same question about the same people.
 */
export function GuestPicker(props: GuestPickerProps) {
  const [view, setView] = usePeopleView();

  return (
    <Stack gap="sm">
      <Group justify="space-between" wrap="wrap" gap="xs">
        <Text size="xs" c="dimmed" tt="uppercase" fw={600}>
          Quem vai ({props.selected.length})
        </Text>
        <SegmentedControl
          size="xs"
          value={view}
          onChange={(value) => setView(value as PeopleViewMode)}
          data={[
            { value: "cards", label: "Cartões" },
            { value: "graph", label: "Grafo" },
          ]}
        />
      </Group>

      {view === "graph" ? (
        <GuestGraph {...props} />
      ) : (
        <Group gap="xs">
          {props.members.map((member) => (
            <GuestCard
              key={member.id}
              member={member}
              going={props.selected.includes(member.id)}
              onToggle={() => props.onToggle(member.id)}
            />
          ))}
        </Group>
      )}
    </Stack>
  );
}
