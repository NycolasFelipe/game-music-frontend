import {
  ActionIcon,
  useComputedColorScheme,
  useMantineColorScheme,
} from "@mantine/core";
import { IconMoon, IconSun } from "@tabler/icons-react";

/**
 * Light/dark toggle. The chosen scheme is persisted to localStorage by
 * Mantine's default color-scheme manager.
 */
export function ColorSchemeToggle() {
  const { setColorScheme } = useMantineColorScheme();
  const computed = useComputedColorScheme("light", {
    getInitialValueInEffect: true,
  });
  const isDark = computed === "dark";

  return (
    <ActionIcon
      variant="default"
      size="lg"
      aria-label={isDark ? "Ativar tema claro" : "Ativar tema escuro"}
      onClick={() => setColorScheme(isDark ? "light" : "dark")}
    >
      {isDark ? <IconSun size={18} /> : <IconMoon size={18} />}
    </ActionIcon>
  );
}
