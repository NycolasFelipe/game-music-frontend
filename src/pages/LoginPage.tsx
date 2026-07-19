import { Card, Center, Stack, Title } from "@mantine/core";
import { useNavigate } from "react-router-dom";
import { LoginForm } from "@/features/auth";

/** Login route: on success, navigates to the bands list. */
export function LoginPage() {
  const navigate = useNavigate();

  return (
    <Center mih="100vh" p="md">
      <Card withBorder shadow="sm" w={360} padding="lg">
        <Stack>
          <Title order={3} ta="center">
            Game Music
          </Title>
          <LoginForm onSuccess={() => navigate("/")} />
        </Stack>
      </Card>
    </Center>
  );
}
