import {
  Anchor,
  Badge,
  Container,
  Group,
  Loader,
  SimpleGrid,
  Stack,
  Tabs,
  Text,
  Title,
} from "@mantine/core";
import {
  IconChartBar,
  IconDisc,
  IconTimeline,
  IconUsers,
} from "@tabler/icons-react";
import { useMemo } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  BandStatistics,
  DeleteBandButton,
  MemberCard,
  MemberSalaryControl,
  RelationshipsView,
  useBand,
  useBandOptions,
  useCharacteristics,
  useRelationshipLevels,
} from "@/features/bands";
import type { Characteristic } from "@/features/bands";
import { DiscographyTab } from "@/features/releases";
import { useTurns } from "@/features/turns";
import { BandTimelineTab } from "@/pages/BandTimelineTab";
import { formatPeriod } from "@/utils/period";

/** The "continue save" screen: the band's state across tabbed views. */
export function BandDashboardPage() {
  const { bandId = "" } = useParams();
  const navigate = useNavigate();
  const { data: band, isLoading, isError } = useBand(bandId);
  const { data: characteristics } = useCharacteristics();
  const { data: options } = useBandOptions();
  const { data: relationshipLevels } = useRelationshipLevels();
  const { data: turns } = useTurns(bandId);

  const catalog = useMemo(
    () =>
      new Map<string, Characteristic>(
        (characteristics ?? []).map((c) => [c.id, c]),
      ),
    [characteristics],
  );

  const label = (list: { id: string; label: string }[] | undefined, id: string) =>
    list?.find((o) => o.id === id)?.label ?? id;

  return (
    <Container py="xl" size="lg">
      <Group justify="space-between">
        <Anchor component={Link} to="/" size="sm">
          ← Voltar aos saves
        </Anchor>
        {band && (
          <DeleteBandButton
            mode="button"
            bandId={band.id}
            bandName={band.name}
            onDeleted={() => navigate("/")}
          />
        )}
      </Group>

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
              <Badge size="lg" color="teal" variant="light">
                💰 {band.balance.toLocaleString("pt-BR")} no caixa
              </Badge>
            </Stack>
          </Group>

          <Tabs defaultValue="overview" mt="md">
            <Tabs.List>
              <Tabs.Tab
                value="overview"
                leftSection={<IconTimeline size={16} />}
              >
                Visão geral
              </Tabs.Tab>
              <Tabs.Tab value="members" leftSection={<IconUsers size={16} />}>
                Integrantes
              </Tabs.Tab>
              <Tabs.Tab value="releases" leftSection={<IconDisc size={16} />}>
                Discografia
              </Tabs.Tab>
              <Tabs.Tab value="stats" leftSection={<IconChartBar size={16} />}>
                Estatísticas
              </Tabs.Tab>
            </Tabs.List>

            <Tabs.Panel value="overview" pt="lg">
              <BandTimelineTab band={band} />
            </Tabs.Panel>

            <Tabs.Panel value="members" pt="lg">
              <Stack gap="xl">
                <div>
                  <Title order={4} mb="sm">
                    Personagens ({band.members.length})
                  </Title>
                  <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }}>
                    {band.members.map((member) => (
                      <MemberCard
                        key={member.id}
                        member={member}
                        catalog={catalog}
                        actions={
                          <MemberSalaryControl
                            bandId={band.id}
                            member={member}
                          />
                        }
                      />
                    ))}
                  </SimpleGrid>
                </div>

                <div>
                  <Title order={4} mb="sm">
                    Relacionamentos
                  </Title>
                  <RelationshipsView
                    members={band.members}
                    relationships={band.relationships}
                    levels={relationshipLevels ?? []}
                  />
                </div>
              </Stack>
            </Tabs.Panel>

            <Tabs.Panel value="releases" pt="lg">
              <DiscographyTab band={band} />
            </Tabs.Panel>

            <Tabs.Panel value="stats" pt="lg">
              <BandStatistics band={band} turns={turns ?? []} />
            </Tabs.Panel>
          </Tabs>
        </Stack>
      )}
    </Container>
  );
}
