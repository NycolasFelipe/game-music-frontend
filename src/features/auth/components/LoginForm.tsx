import { Alert, Button, PasswordInput, Stack, TextInput } from "@mantine/core";
import { useState } from "react";
import type { FormEvent } from "react";
import { useLogin } from "@/features/auth/hooks/useLogin";
import { ApiError } from "@/services/http";

/** Presentational + container login form. Calls `onSuccess` once logged in. */
export function LoginForm({ onSuccess }: { onSuccess: () => void }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const login = useLogin();

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    login.mutate({ username, password }, { onSuccess });
  }

  return (
    <form onSubmit={handleSubmit}>
      <Stack>
        <TextInput
          label="Usuário"
          value={username}
          onChange={(event) => setUsername(event.currentTarget.value)}
          required
        />
        <PasswordInput
          label="Senha"
          value={password}
          onChange={(event) => setPassword(event.currentTarget.value)}
          required
        />
        {login.isError && (
          <Alert color="red" title="Falha no login">
            {login.error instanceof ApiError
              ? login.error.message
              : "Erro inesperado."}
          </Alert>
        )}
        <Button type="submit" loading={login.isPending} fullWidth>
          Entrar
        </Button>
      </Stack>
    </form>
  );
}
