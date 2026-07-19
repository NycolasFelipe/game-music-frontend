import { Stack, Text } from "@mantine/core";
import type { ReactNode } from "react";

/** Domain-agnostic empty-state placeholder. */
export function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <Stack align="center" gap="xs" py="xl">
      <Text fw={600}>{title}</Text>
      {description && (
        <Text size="sm" c="dimmed" ta="center">
          {description}
        </Text>
      )}
      {action}
    </Stack>
  );
}
