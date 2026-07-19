import { Anchor, AppShell, Button, Group } from "@mantine/core";
import { Link, Outlet } from "react-router-dom";
import { ColorSchemeToggle } from "@/components/ColorSchemeToggle";
import { APP_NAME } from "@/config/app";
import { useAuth } from "@/features/auth";

/**
 * Shared shell for authenticated pages: a persistent header whose title links
 * back to the menu (home) from anywhere, plus the theme toggle and logout.
 */
export function AppLayout() {
  const { logout } = useAuth();

  return (
    <AppShell header={{ height: 56 }} padding="md">
      <AppShell.Header>
        <Group h="100%" px="md" justify="space-between" wrap="nowrap">
          <Anchor
            component={Link}
            to="/"
            underline="never"
            fw={700}
            fz="lg"
            c="inherit"
          >
            {APP_NAME}
          </Anchor>
          <Group gap="xs" wrap="nowrap">
            <ColorSchemeToggle />
            <Button variant="subtle" color="gray" onClick={logout}>
              Sair
            </Button>
          </Group>
        </Group>
      </AppShell.Header>
      <AppShell.Main>
        <Outlet />
      </AppShell.Main>
    </AppShell>
  );
}
