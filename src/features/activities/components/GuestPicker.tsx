import {
  Box,
  Group,
  Paper,
  SegmentedControl,
  Stack,
  Text,
} from "@mantine/core";
import { FaceThumb, firstName, levelHex, pairKey } from "@/features/bands";
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

/**
 * O humor com sinal e uma casa, no formato brasileiro ("+2,0", "−1,5").
 *
 * @param value - Humor de −5 a 5.
 * @returns O humor formatado.
 */
function moodLabel(value: number): string {
  const rounded = roundMood(value);
  const abs = Math.abs(rounded).toLocaleString("pt-BR", {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  });
  return rounded > 0 ? `+${abs}` : rounded < 0 ? `−${abs}` : `±${abs}`;
}

/**
 * Humor arredondado a uma casa, para o sinal e a cor baterem com o número
 * mostrado (−0,04 é "±0,0", não um "−0,0" vermelho).
 *
 * @param value - Humor de −5 a 5.
 * @returns O humor com uma casa decimal.
 */
function roundMood(value: number): number {
  return Math.round(value * 10) / 10 || 0;
}

/** One member as a card, in or out of the guest list, with their mood. */
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
        borderColor: "var(--rv-ink)",
        background: going ? "var(--rv-ink)" : undefined,
      }}
    >
      <Text size="xs" ff="monospace" fw={600} c={going ? "var(--rv-paper)" : undefined}>
        {member.name}{" "}
        <span
          aria-label={`humor ${moodLabel(member.happiness)}`}
          style={{
            fontWeight: 400,
            color: roundMood(member.happiness) < 0 ? "var(--rv-red)" : going ? "var(--rv-faint)" : "var(--rv-soft)",
          }}
        >
          {moodLabel(member.happiness)}
        </span>
      </Text>
    </Paper>
  );
}

/**
 * The same circle the relationships graph draws, turned into a picker: click a
 * node to put that person on the guest list. Each face carries the member's mood
 * beside it (inward, so the right-hand side never clips). Only the bonds whose
 * *both* ends are going light up — the activity mends exactly those, so the player sees
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
  const size = 300;
  const center = size / 2;
  const radius = size / 2 - 44;
  const pos = members.map((_, index) => {
    const theta = -Math.PI / 2 + (2 * Math.PI * index) / n;
    return {
      x: center + radius * Math.cos(theta),
      y: center + radius * Math.sin(theta),
    };
  });

  // Frame only the faces and their names: with three or four members the
  // circle leaves empty bands above and below that stretch the column.
  const top = Math.min(...pos.map((p) => p.y)) - 22;
  const bottom = Math.max(...pos.map((p) => p.y)) + 44;

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
      <Box style={{ width: "100%", maxWidth: 260 }}>
        <svg viewBox={`0 ${top} ${size} ${bottom - top}`} width="100%">
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
                <FaceThumb
                  subject={member}
                  x={pos[index].x}
                  y={pos[index].y}
                  r={18}
                />
                <circle
                  cx={pos[index].x}
                  cy={pos[index].y}
                  r={18}
                  style={{
                    fill: "none",
                    stroke: going ? "var(--rv-red)" : "var(--rv-ink)",
                    strokeWidth: going ? 4 : 1.5,
                  }}
                />
                <text
                  x={pos[index].x + (pos[index].x > center + 1 ? -21 : 21)}
                  y={pos[index].y - 9}
                  fontSize={12}
                  fontWeight={600}
                  textAnchor={pos[index].x > center + 1 ? "end" : "start"}
                  aria-label={`humor ${moodLabel(member.happiness)}`}
                  style={{
                    fill: roundMood(member.happiness) < 0 ? "var(--rv-red)" : "var(--rv-ink)",
                    fontFamily: "var(--rv-mono)",
                    stroke: "var(--rv-paper)",
                    strokeWidth: 3,
                    paintOrder: "stroke",
                  }}
                >
                  {moodLabel(member.happiness)}
                </text>
                <text
                  x={pos[index].x}
                  y={pos[index].y + 36}
                  fontSize={11}
                  fontWeight={going ? 700 : 400}
                  textAnchor="middle"
                  style={{
                    fill: going ? "var(--rv-red)" : "var(--rv-ink)",
                    fontFamily: "var(--rv-mono)",
                  }}
                >
                  {firstName(member.name)}
                </text>
              </g>
            );
          })}
        </svg>
      </Box>

      <p className="rv-caption" style={{ margin: 0, textAlign: "center" }}>
        Clique em quem vai — acendem as relações que a saída vai mexer
      </p>
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
