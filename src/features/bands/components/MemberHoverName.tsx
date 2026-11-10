import { Group, HoverCard, Text } from "@mantine/core";
import {
  MemberCard,
  type MemberCardData,
} from "@/features/bands/components/MemberCard";
import { MemberFace } from "@/features/bands/portrait/MemberPortrait";
import type { Characteristic } from "@/features/bands/types";

/**
 * A member's avatar + name that reveals the full member details on hover.
 */
export function MemberHoverName({
  member,
  catalog,
}: {
  member: MemberCardData;
  catalog: Map<string, Characteristic>;
}) {
  return (
    <HoverCard width={340} shadow="md" withArrow openDelay={120} position="top">
      <HoverCard.Target>
        <Group
          gap={4}
          wrap="nowrap"
          style={{ cursor: "help", display: "inline-flex" }}
        >
          <MemberFace subject={{ ...member, happiness: member.happiness ?? 0 }} size={20} />
          <Text component="span" size="sm" fw={600} td="underline">
            {member.name}
          </Text>
        </Group>
      </HoverCard.Target>
      <HoverCard.Dropdown p={0}>
        <MemberCard member={member} catalog={catalog} />
      </HoverCard.Dropdown>
    </HoverCard>
  );
}
