import { SegmentedControl, Stack } from "@mantine/core";
import { useLocalStorage } from "@mantine/hooks";
import { RelationshipCards } from "@/features/bands/components/RelationshipCards";
import { RelationshipGraph } from "@/features/bands/components/RelationshipGraph";
import type { RelationshipsViewProps } from "@/features/bands/components/relationship-utils";

type View = "cards" | "graph";

/**
 * Relationships section with a switcher between the per-member cards and the
 * graph. The chosen view is persisted to localStorage.
 */
export function RelationshipsView(props: RelationshipsViewProps) {
  const [view, setView] = useLocalStorage<View>({
    key: "gm-relationships-view",
    defaultValue: "cards",
  });

  return (
    <Stack gap="md">
      <SegmentedControl
        value={view}
        onChange={(value) => setView(value as View)}
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
