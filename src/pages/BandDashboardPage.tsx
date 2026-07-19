import {
  Anchor,
  Badge,
  Container,
  Group,
  Loader,
  SimpleGrid,
  Stack,
  Text,
  Title,
} from "@mantine/core";
import { useMemo } from "react";
import { Link, useParams } from "react-router-dom";
import {
  MemberCard,
  useBand,
  useBandOptions,
  useCharacteristics,
} from "@/features/bands";
import type { Characteristic } from "@/features/bands";
import { formatPeriod } from "@/utils/period";

/** The "continue save" screen: a band's current state and its members. */
export function BandDashboardPage() {
  const { bandId = "" } = useParams();
  const { data: band, isLoading, isError } = useBand(bandId);
  const { data: characteristics } = useCharacteristics();
  const { data: options } = useBandOptions();

  const catalog = useMemo(
    () => new Map<string, Characteristic>((characteristics ?? []).map((c) => [c.id, c])),
    [characteristics],
  );

  const label = (list: { id: string; label: string }[] | undefined, id: string) =>
    list?.find((o) => o.id === id)?.label ?? id;

  return (
    <Container py="xl" size="lg">
      <Anchor component={Link} to="/" size="sm">
        ← Voltar aos saves
      </Anchor>

      {isLoading && <Loader mt="md" />}
      {isError && (
        <Text c="red" mt="md">
          Falha ao carregar o save.
        </Text>
      )}

      {band && (
        <Stack mt="sm">
          <Group justify="space-between" align="flex-start">
            <div>
              <Title order={2}>{band.name}</Title>
              <Text c="dimmed">
                {label(options?.themes, band.theme)} ·{" "}
                {label(options?.origins, band.origin)}
              </Text>
            </div>
            <Stack gap={4} align="flex-end">
              <Badge size="lg" color="grape" variant="light">
                {band.fame.title} · Nível {band.fame.level}
              </Badge>
              <Text size="sm" c="dimmed">
                {band.fanCount.toLocaleString("pt-BR")} fãs ·{" "}
                {formatPeriod(band.currentYear)}
              </Text>
            </Stack>
          </Group>

          <Title order={4} mt="md">
            Integrantes ({band.members.length})
          </Title>
          <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }}>
            {band.members.map((member) => (
              <MemberCard key={member.id} member={member} catalog={catalog} />
            ))}
          </SimpleGrid>
        </Stack>
      )}
    </Container>
  );
}
