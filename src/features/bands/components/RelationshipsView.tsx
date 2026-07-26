import { SegmentedControl, Stack } from "@mantine/core";
import { RelationshipCards } from "@/features/bands/components/RelationshipCards";
import { RelationshipGraph } from "@/features/bands/components/RelationshipGraph";
import type { RelationshipsViewProps } from "@/features/bands/components/relationship-utils";
import { usePeopleView } from "@/features/preferences";
import type { PeopleViewMode } from "@/features/preferences";

/**
 * Relationships section with a switcher between the per-member cards and the
 * graph. The choice belongs to the account, not to this save (ADR-0018), so it
 * follows the player to any band and any machine.
 */
export function RelationshipsView(props: RelationshipsViewProps) {
  const [view, setView] = usePeopleView();

  return (
    <Stack gap="md">
      <SegmentedControl
        value={view}
        onChange={(value) => setView(value as PeopleViewMode)}
        w="fit-content"
        data={[
          { value: "cards", label: "Cartões" },
          { value: "graph", label: "Grafo" },
        ]}
      />

      {view === "graph" ? (
        <RelationshipGraph {...props} />
      ) : (
        <RelationshipCards {...props} />
      )}
    </Stack>
  );
}
