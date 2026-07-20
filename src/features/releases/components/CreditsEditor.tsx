import { MultiSelect, SimpleGrid } from "@mantine/core";
import { SKILL_LABELS, SKILL_ORDER } from "@/features/bands";
import type { BandMember, Skills } from "@/features/bands";
import type { ReleaseCredits } from "@/features/releases/types";

/**
 * Assigns band members to each aspect (the six skills) of a work. Every aspect
 * accepts one or more members; a member may hold several aspects.
 */
export function CreditsEditor({
  members,
  value,
  onChange,
}: {
  members: BandMember[];
  value: ReleaseCredits;
  onChange: (next: ReleaseCredits) => void;
}) {
  const data = members.map((m) => ({ value: m.id, label: m.name }));

  const set = (aspect: keyof Skills, ids: string[]) => {
    onChange({ ...value, [aspect]: ids });
  };

  return (
    <SimpleGrid cols={{ base: 1, sm: 2 }}>
      {SKILL_ORDER.map((aspect) => (
        <MultiSelect
          key={aspect}
          label={SKILL_LABELS[aspect]}
          placeholder="Ninguém"
          data={data}
          value={value[aspect] ?? []}
          onChange={(ids) => set(aspect, ids)}
          clearable
          searchable
        />
      ))}
    </SimpleGrid>
  );
}
