import { Badge, Group, Paper, Progress, Stack, Text } from "@mantine/core";
import { VINYL_KEYFRAMES } from "@/features/releases/components/VinylRecord";
import type { CreationEvent, CreationEventKind } from "@/features/releases/types";

/** Display metadata per creation-event kind (flavor for the studio session). */
const KINDS: Record<
  CreationEventKind,
  { label: string; emoji: string; color: string }
> = {
  conflito_visao: { label: "Conflito de visão", emoji: "⚔️", color: "red" },
  ideia_maluca: { label: "Ideia maluca", emoji: "💡", color: "yellow" },
  perfeccionismo: { label: "Perfeccionismo", emoji: "🔬", color: "blue" },
  preguica: { label: "Preguiça", emoji: "😴", color: "gray" },
};

/** A small vinyl spinning while the session runs. */
function SpinningDisc() {
  return (
    <div
      aria-hidden
      style={{
        width: 34,
        height: 34,
        borderRadius: "50%",
        background:
          "repeating-radial-gradient(circle at 50% 50%, rgba(0,0,0,0.6) 0 1.5px, rgba(255,255,255,0.05) 1.5px 3px), radial-gradient(circle at 36% 30%, #3a3a3a, #050505 62%)",
        boxShadow: "0 0 0 1px rgba(255,255,255,0.08)",
        animation: "vinylSpin 3s linear infinite",
        flexShrink: 0,
      }}
    >
      <div
        style={{
          width: 10,
          height: 10,
          borderRadius: "50%",
          background: "var(--mantine-color-blue-5)",
          margin: "12px auto",
        }}
      />
    </div>
  );
}

/**
 * One studio session: the decision that came up while recording, with its
 * options as cards. The player's choice quietly nudges the work's quality —
 * the odds stay hidden (the backend never sends them).
 */
export function CreationEventStage({
  event,
  index,
  total,
  pending,
  onChoose,
}: {
  event: CreationEvent;
  /** 1-based index of this session. */
  index: number;
  total: number;
  pending: boolean;
  onChoose: (optionId: string) => void;
}) {
  const kind = KINDS[event.kind];

  return (
    <Stack gap="sm">
      <style>{VINYL_KEYFRAMES}</style>

      <Group gap="sm" wrap="nowrap">
        <SpinningDisc />
        <Stack gap={4} flex={1}>
          <Group justify="space-between" wrap="nowrap">
            <Text size="xs" fw={700} tt="uppercase" c="dimmed">
              Sessão {index} de {total}
            </Text>
            <Badge variant="light" color={kind.color}>
              {kind.emoji} {kind.label}
            </Badge>
          </Group>
          <Progress
            value={((index - 1) / total) * 100}
            size="sm"
            radius="xl"
            color={kind.color}
          />
        </Stack>
      </Group>

      <Paper withBorder p="md" radius="md">
        <Text fs="italic" ta="center">
          &ldquo;{event.prompt}&rdquo;
        </Text>
      </Paper>

      <Stack gap="xs">
        {event.options.map((option) => (
          <Paper
            key={option.id}
            withBorder
            p="sm"
            radius="md"
            role="button"
            tabIndex={pending ? -1 : 0}
            aria-disabled={pending}
            onClick={() => !pending && onChoose(option.id)}
            onKeyDown={(keyEvent) => {
              if (!pending && (keyEvent.key === "Enter" || keyEvent.key === " ")) {
                keyEvent.preventDefault();
                onChoose(option.id);
              }
            }}
            style={{
              cursor: pending ? "progress" : "pointer",
              opacity: pending ? 0.6 : 1,
              transition: "transform 120ms ease, border-color 120ms ease",
            }}
            onMouseEnter={(hoverEvent) => {
              hoverEvent.currentTarget.style.transform = "translateX(4px)";
              hoverEvent.currentTarget.style.borderColor =
                "var(--mantine-color-blue-5)";
            }}
            onMouseLeave={(hoverEvent) => {
              hoverEvent.currentTarget.style.transform = "none";
              hoverEvent.currentTarget.style.borderColor = "";
            }}
          >
            <Text fw={600} size="sm">
              {option.label}
            </Text>
            <Text size="xs" c="dimmed">
              {option.description}
            </Text>
          </Paper>
        ))}
      </Stack>

      <Text size="xs" c="dimmed" ta="center">
        Pode fechar e retomar depois pela Discografia — o rascunho fica salvo.
      </Text>
    </Stack>
  );
}
