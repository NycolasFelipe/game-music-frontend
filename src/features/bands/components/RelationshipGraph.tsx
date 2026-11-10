import { Box, Group, Stack, Text } from "@mantine/core";
import { useState } from "react";
import {
  buildLookups,
  firstName,
  levelHex,
  pairKey,
  type RelationshipsViewProps,
} from "@/features/bands/components/relationship-utils";
import { FaceThumb } from "@/features/bands/portrait/MemberPortrait";
import type { RelationshipLevelInfo } from "@/features/bands/types";

function LegendDot({ hex, label }: { hex: string; label: string }) {
  return (
    <Group gap={6} wrap="nowrap">
      <Box
        w={12}
        h={12}
        style={{ backgroundColor: hex, flexShrink: 0 }}
      />
      <Text size="xs" c="dimmed">
        {label}
      </Text>
    </Group>
  );
}

interface Edge {
  i: number;
  j: number;
  level: number;
  info?: RelationshipLevelInfo;
}

/**
 * Circular graph: members are nodes on a circle, edges are colored by
 * relationship level and thickened by its intensity. Hover an edge (wide hit
 * area) to see the bond described below the graph.
 */
export function RelationshipGraph({
  members,
  relationships,
  levels,
}: RelationshipsViewProps) {
  const { levelByPair, infoByLevel } = buildLookups(relationships, levels);
  const [hovered, setHovered] = useState<Edge | null>(null);

  if (members.length < 2) {
    return (
      <Text size="sm" c="dimmed">
        Relacionamentos aparecem quando a banda tem 2 ou mais integrantes.
      </Text>
    );
  }

  const n = members.length;
  const size = 340;
  const cx = size / 2;
  const cy = size / 2;
  const radius = size / 2 - 48;
  const pos = members.map((_, i) => {
    const theta = -Math.PI / 2 + (2 * Math.PI * i) / n;
    return { x: cx + radius * Math.cos(theta), y: cy + radius * Math.sin(theta) };
  });

  const edges: Edge[] = [];
  for (let i = 0; i < n; i += 1) {
    for (let j = i + 1; j < n; j += 1) {
      const level = levelByPair.get(pairKey(members[i].id, members[j].id));
      if (level === undefined) continue;
      edges.push({ i, j, level, info: infoByLevel.get(level) });
    }
  }

  const isActive = (e: Edge) =>
    hovered !== null && hovered.i === e.i && hovered.j === e.j;

  return (
    <Stack align="center" gap="xs">
      <Box style={{ width: "100%", maxWidth: size }}>
        <svg
          viewBox={`0 0 ${size} ${size}`}
          width="100%"
          role="img"
          aria-label="Grafo de relacionamentos"
        >
          {edges.map((e) => {
            const active = isActive(e);
            return (
              <g key={`${e.i}-${e.j}`}>
                <line
                  x1={pos[e.i].x}
                  y1={pos[e.i].y}
                  x2={pos[e.j].x}
                  y2={pos[e.j].y}
                  style={{
                    stroke: levelHex(e.level),
                    strokeWidth: 1 + Math.abs(e.level) * 0.7 + (active ? 1.5 : 0),
                    strokeDasharray: e.level < 0 ? "6 4" : undefined,
                    opacity: active ? 1 : 0.8,
                  }}
                />
                {/* Wide invisible hit area for easy hovering. */}
                <line
                  x1={pos[e.i].x}
                  y1={pos[e.i].y}
                  x2={pos[e.j].x}
                  y2={pos[e.j].y}
                  style={{
                    stroke: "transparent",
                    strokeWidth: 18,
                    pointerEvents: "stroke",
                    cursor: "pointer",
                  }}
                  onMouseEnter={() => setHovered(e)}
                  onMouseLeave={() => setHovered(null)}
                />
              </g>
            );
          })}

          {members.map((member, i) => (
            <g key={member.id}>
              <FaceThumb
                subject={{ gender: "", age: 25, happiness: 0, ...member }}
                x={pos[i].x} y={pos[i].y} r={22} />
              <circle
                cx={pos[i].x}
                cy={pos[i].y}
                r={22}
                style={{ fill: "none", stroke: "var(--rv-ink)", strokeWidth: 2 }}
              />
              <text
                x={pos[i].x}
                y={pos[i].y + 36}
                fontSize={11}
                textAnchor="middle"
                style={{ fill: "var(--rv-ink)", fontFamily: "var(--rv-mono)" }}
              >
                {firstName(member.name)}
              </text>
            </g>
          ))}
        </svg>
      </Box>

      <Group gap="lg" justify="center">
        <LegendDot hex={levelHex(-4)} label="Hostil (tracejado)" />
        <LegendDot hex={levelHex(0)} label="Neutro" />
        <LegendDot hex={levelHex(4)} label="Próximo" />
      </Group>

      {hovered?.info ? (
        <Text size="sm" ta="center">
          <Text span fw={600}>
            {hovered.info.name}
          </Text>{" "}
          <Text size="xs" c="dimmed">
            {hovered.info.description}
          </Text>
        </Text>
      ) : (
        <Text size="xs" c="dimmed" ta="center">
          Passe o mouse nas linhas para ver o vínculo · espessura = intensidade
        </Text>
      )}
    </Stack>
  );
}
