import { Group, HoverCard, Text } from "@mantine/core";
import {
  MemberCard,
  type MemberCardData,
} from "@/features/bands/components/MemberCard";
import { MemberFace } from "@/features/bands/portrait/MemberPortrait";
import type { Characteristic } from "@/features/bands/types";

/**
 * A member's avatar + name that reveals the full member details on hover, in
 * the card's side layout so the whole profile fits on screen.
 *
 * @param props.member - The member to show.
 * @param props.catalog - Trait catalog (names and descriptions).
 * @param props.inline - Renders only the name, in the surrounding text's font,
 *   for names mentioned inside a sentence.
 * @param props.label - Text shown instead of the full name (e.g. the first name
 *   as written in the sentence).
 */
export function MemberHoverName({
  member,
  catalog,
  inline = false,
  label,
}: {
  member: MemberCardData;
  catalog: Map<string, Characteristic>;
  inline?: boolean;
  label?: string;
}) {
  return (
    <HoverCard
      width={500}
      shadow="md"
      withArrow
      openDelay={120}
      position="bottom-start"
      middlewares={{ flip: true, shift: { padding: 12 } }}
    >
      <HoverCard.Target>
        {inline ? (
          <span className="rv-mention">{label ?? member.name}</span>
        ) : (
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
        )}
      </HoverCard.Target>
      <HoverCard.Dropdown p={0}>
        <MemberCard member={member} catalog={catalog} layout="side" />
      </HoverCard.Dropdown>
    </HoverCard>
  );
}
