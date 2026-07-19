import {
  Badge,
  Button,
  Card,
  Container,
  Group,
  Loader,
  SimpleGrid,
  Stack,
  Text,
  Title,
} from "@mantine/core";
import { Link } from "react-router-dom";
import { useAuth, useCurrentUser } from "@/features/auth";
import { useBandOptions, useBands } from "@/features/bands";
import { EmptyState } from "@/components/EmptyState";
import { formatPeriod } from "@/utils/period";

/** Post-login home: user data + save history + continue / create a save. */
export function HomePage() {
  const { data: user } = useCurrentUser();
  const { logout } = useAuth();
  const { data: bands, isLoading, isError } = useBands();
  const { data: options } = useBandOptions();

  const themeLabel = (id: string) =>
    options?.themes.find((t) => t.id === id)?.label ?? id;

  return (
    <Container py="xl" size="md">
      <Group justify="space-between" mb="xl">
        <div>
          <Title order={2}>Olá, {user?.username ?? "…"}</Title>
          <Text size="sm" c="dimmed">
            {user ? `ID: ${user.id}` : "Carregando usuário…"}
          </Text>
        </div>
        <Button variant="subtle" color="gray" onClick={logout}>
          Sair
        </Button>
      </Group>

      <Group justify="space-between" mb="md">
        <Title order={4}>Seus saves</Title>
        <Button component={Link} to="/saves/new">
          Criar novo save
        </Button>
      </Group>

      {isLoading && <Loader />}
      {isError && <Text c="red">Falha ao carregar seus saves.</Text>}

      {bands && bands.length === 0 && (
        <EmptyState
          title="Nenhum save ainda"
          description="Crie sua primeira banda para começar a jogar."
          action={
            <Button component={Link} to="/saves/new" mt="sm">
              Criar novo save
            </Button>
          }
        />
      )}

      {bands && bands.length > 0 && (
        <SimpleGrid cols={{ base: 1, sm: 2 }}>
          {bands.map((band) => (
            <Card key={band.id} withBorder padding="lg">
              <Stack gap="xs">
                <Group justify="space-between" wrap="nowrap">
                  <Text fw={600} size="lg">
                    {band.name}
                  </Text>
                  <Badge variant="light">{themeLabel(band.theme)}</Badge>
                </Group>
                <Text size="sm" c="dimmed">
                  {formatPeriod(band.currentYear)}
                </Text>
                <Group gap="xs">
                  <Badge color="grape" variant="light">
                    {band.fame.title} · Nível {band.fame.level}
                  </Badge>
                  <Badge color="gray" variant="light">
                    {band.fanCount.toLocaleString("pt-BR")} fãs
                  </Badge>
                </Group>
                <Button
                  component={Link}
                  to={`/bands/${band.id}`}
                  variant="light"
                  mt="xs"
                >
                  Continuar
                </Button>
              </Stack>
            </Card>
          ))}
        </SimpleGrid>
      )}
    </Container>
  );
}
