import { Loader, SimpleGrid, Stack, Text, Title } from "@mantine/core";
import { useMemo } from "react";
import { FormerMemberCard } from "@/features/bands/components/FormerMemberCard";
import { useCharacteristics } from "@/features/bands/hooks/useBandOptions";
import { useFormerMembers } from "@/features/bands/hooks/useFormerMembers";
import type { Characteristic } from "@/features/bands/types";

/**
 * Ex-members tab: lists the band's former (departed) members with their
 * departure snapshot.
 */
export function FormerMembersTab({ bandId }: { bandId: string }) {
  const { data: formers, isLoading } = useFormerMembers(bandId);
  const { data: characteristics } = useCharacteristics();

  const catalog = useMemo(
    () =>
      new Map<string, Characteristic>(
        (characteristics ?? []).map((c) => [c.id, c]),
      ),
    [characteristics],
  );

  if (isLoading) {
    return <Loader />;
  }

  if (!formers || formers.length === 0) {
    return (
      <Text size="sm" c="dimmed">
        Nenhum ex-integrante ainda. Membros que saírem por salário atrasado
        aparecerão aqui.
      </Text>
    );
  }

  return (
    <Stack gap="sm">
      <Title order={4}>Ex-integrantes ({formers.length})</Title>
      <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }}>
        {formers.map((member) => (
          <FormerMemberCard key={member.id} member={member} catalog={catalog} />
        ))}
      </SimpleGrid>
    </Stack>
  );
}
