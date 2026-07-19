import { Card, Center, Stack, Text, Title } from "@mantine/core";
import { useNavigate } from "react-router-dom";
import { LoginForm } from "@/features/auth";
import { APP_DESCRIPTION, APP_NAME } from "@/config/app";

/** Login route: on success, navigates to the bands list. */
export function LoginPage() {
  const navigate = useNavigate();

  return (
    <Center mih="100vh" p="md">
      <Card withBorder shadow="sm" w={360} padding="lg">
        <Stack>
          <div>
            <Title order={3} ta="center">
              {APP_NAME}
            </Title>
            <Text size="sm" c="dimmed" ta="center">
              {APP_DESCRIPTION}
            </Text>
          </div>
          <LoginForm onSuccess={() => navigate("/")} />
        </Stack>
      </Card>
    </Center>
  );
}
