import {
  Button,
  Container,
  Loader,
  SimpleGrid,
  Stack,
  Tabs,
  Text,
  Title,
} from "@mantine/core";
import {
  IconArrowLeft,
  IconChartBar,
  IconDisc,
  IconFlask,
  IconMicrophone,
  IconSettings,
  IconTimeline,
  IconUserMinus,
  IconUsers,
} from "@tabler/icons-react";
import { useMemo } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  BandGameOptions,
  BandHeader,
  BandStatistics,
  DeleteBandButton,
  FormerMembersTab,
  MemberCard,
  MemberSalaryControl,
  RelationshipsView,
  useBand,
  useBandOptions,
  useCharacteristics,
  useRelationshipLevels,
} from "@/features/bands";
import type { Characteristic } from "@/features/bands";
import { DecisionsModal } from "@/features/decisions";
import { GigsTab } from "@/features/gigs";
import {
  DiscographyTab,
  ReleaseRevealHost,
  VinylPreview,
} from "@/features/releases";
import { useTurns } from "@/features/turns";
import { DEV_OPTIONS_ENABLED } from "@/config/app";
import { BandTimelineTab } from "@/pages/BandTimelineTab";

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
      {isLoading && <Loader mt="md" />}
      {isError && (
        <Text c="red" mt="md">
          Falha ao carregar o save.
        </Text>
      )}

      {band && (
        <Stack mt="sm">
          {/* Mounted outside the tabs: a decision reaches the player wherever
              they are, instead of waiting in the tab that produced it. */}
          <DecisionsModal band={band} />
          <ReleaseRevealHost />

          <BandHeader
            band={band}
            themeLabel={label(options?.themes, band.theme)}
            originLabel={label(options?.origins, band.origin)}
          />

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
              <Tabs.Tab value="gigs" leftSection={<IconMicrophone size={16} />}>
                Shows
              </Tabs.Tab>
              <Tabs.Tab value="stats" leftSection={<IconChartBar size={16} />}>
                Estatísticas
              </Tabs.Tab>
              <Tabs.Tab
                value="former"
                leftSection={<IconUserMinus size={16} />}
              >
                Ex-integrantes
              </Tabs.Tab>
              <Tabs.Tab value="options" leftSection={<IconSettings size={16} />}>
                Opções
              </Tabs.Tab>
              {DEV_OPTIONS_ENABLED && (
                <Tabs.Tab
                  value="dev-options"
                  leftSection={<IconFlask size={16} />}
                >
                  Opções (dev)
                </Tabs.Tab>
              )}
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

            <Tabs.Panel value="gigs" pt="lg">
              <GigsTab band={band} />
            </Tabs.Panel>

            <Tabs.Panel value="stats" pt="lg">
              <BandStatistics band={band} turns={turns ?? []} />
            </Tabs.Panel>

            <Tabs.Panel value="former" pt="lg">
              <FormerMembersTab bandId={band.id} />
            </Tabs.Panel>

            <Tabs.Panel value="options" pt="lg">
              <Stack gap="xl">
                <Stack gap="md" maw={420}>
                  <div>
                    <Title order={5}>Save</Title>
                    <Text size="sm" c="dimmed">
                      Gerencie este save da banda.
                    </Text>
                  </div>
                  <Button
                    component={Link}
                    to="/"
                    variant="default"
                    leftSection={<IconArrowLeft size={16} />}
                    w="fit-content"
                  >
                    Voltar aos saves
                  </Button>
                  <DeleteBandButton
                    mode="button"
                    bandId={band.id}
                    bandName={band.name}
                    onDeleted={() => navigate("/")}
                  />
                </Stack>

                <BandGameOptions band={band} />
              </Stack>
            </Tabs.Panel>

            {DEV_OPTIONS_ENABLED && (
              <Tabs.Panel value="dev-options" pt="lg">
                <Stack gap="xl">
                  <div>
                    <Title order={5}>Ferramentas de desenvolvimento</Title>
                    <Text size="sm" c="dimmed">
                      Só aparecem durante o desenvolvimento — ficam de fora da
                      versão final do jogo.
                    </Text>
                  </div>
                  <VinylPreview />
                </Stack>
              </Tabs.Panel>
            )}
          </Tabs>
        </Stack>
      )}
    </Container>
  );
}
