import {
  Button,
  Card,
  Container,
  Group,
  Loader,
  Stack,
  Text,
  Title,
} from "@mantine/core";
import { useAuth } from "@/features/auth";
import { useBands } from "@/features/bands";
import { EmptyState } from "@/components/EmptyState";

/** Bands list route. Composes the bands feature; no data logic lives here. */
export function BandsPage() {
  const { data, isLoading, isError } = useBands();
  const { logout } = useAuth();

  return (
    <Container py="xl">
      <Group justify="space-between" mb="lg">
        <Title order={2}>Minhas bandas</Title>
        <Button variant="light" onClick={logout}>
          Sair
        </Button>
      </Group>

      {isLoading && <Loader />}
      {isError && <Text c="red">Falha ao carregar bandas.</Text>}
      {data && data.length === 0 && (
        <EmptyState
          title="Nenhuma banda ainda"
          description="Crie sua primeira banda para começar."
        />
      )}
      {data && data.length > 0 && (
        <Stack>
          {data.map((band) => (
            <Card key={band.id} withBorder>
              <Group justify="space-between">
                <Text fw={600}>{band.name}</Text>
                <Text size="sm" c="dimmed">
                  {band.fame.title} · {band.fanCount} fãs
                </Text>
              </Group>
            </Card>
          ))}
        </Stack>
      )}
    </Container>
  );
}
