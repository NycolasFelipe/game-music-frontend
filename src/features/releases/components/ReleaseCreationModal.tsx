import {
  ActionIcon,
  Alert,
  Badge,
  Button,
  Card,
  Group,
  Loader,
  Modal,
  Progress,
  Select,
  Stack,
  Text,
  Textarea,
  TextInput,
  Tooltip,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { IconDice } from "@tabler/icons-react";
import { useState } from "react";
import { SKILL_ORDER, useBandOptions } from "@/features/bands";
import type { BandDetail } from "@/features/bands";
import { CreditsEditor } from "@/features/releases/components/CreditsEditor";
import {
  useBudgetTiers,
  useGenerateReleaseConcept,
  useGenerateReleaseTitle,
  useReleaseFormats,
} from "@/features/releases/hooks/useReleaseCatalogs";
import {
  useCancelRelease,
  useFinalizeRelease,
  useRelease,
  useResolveCreationEvent,
  useStartRelease,
} from "@/features/releases/hooks/useReleases";
import type {
  BudgetTierId,
  CreationEventKind,
  ReleaseCredits,
  ReleaseFormatId,
} from "@/features/releases/types";
import { ApiError } from "@/services/http";

const KIND_LABELS: Record<CreationEventKind, string> = {
  conflito_visao: "Conflito de visão",
  ideia_maluca: "Ideia maluca",
  perfeccionismo: "Perfeccionismo",
  preguica: "Preguiça",
};

/** Turns an unknown error into a readable message. */
function errorMessage(error: unknown): string {
  return error instanceof ApiError ? error.message : "Erro inesperado.";
}

/**
 * Drives the full creation flow of a work: configure (title/concept/style/
 * format/budget/credits) → resolve creation events → launch. Closing mid-flow
 * keeps the draft (it stays in the discography to continue or discard later).
 */
export function ReleaseCreationModal({
  band,
  resumeReleaseId = null,
  onClose,
}: {
  band: BandDetail;
  resumeReleaseId?: string | null;
  onClose: () => void;
}) {
  const bandId = band.id;
  const [releaseId, setReleaseId] = useState<string | null>(resumeReleaseId);
  const [title, setTitle] = useState("");
  const [concept, setConcept] = useState("");
  const [style, setStyle] = useState(band.theme);
  const [format, setFormat] = useState<ReleaseFormatId>("single");
  const [budgetTier, setBudgetTier] = useState<BudgetTierId>("estudio");
  const [credits, setCredits] = useState<ReleaseCredits>({});

  const { data: options } = useBandOptions();
  const { data: formats } = useReleaseFormats();
  const { data: tiers } = useBudgetTiers();
  const genTitle = useGenerateReleaseTitle();
  const genConcept = useGenerateReleaseConcept();
  const start = useStartRelease(bandId);
  const finalize = useFinalizeRelease(bandId);
  const cancel = useCancelRelease(bandId);
  const resolve = useResolveCreationEvent(bandId, releaseId ?? "");
  const { data: detail, isLoading: detailLoading } = useRelease(
    bandId,
    releaseId,
  );

  const formatObj = formats?.find((f) => f.id === format);
  const tierObj = tiers?.find((t) => t.id === budgetTier);
  const estimatedCost =
    formatObj && tierObj
      ? Math.round(formatObj.baseCost * tierObj.costMultiplier * 100) / 100
      : null;
  const canAfford = estimatedCost === null || band.balance >= estimatedCost;
  const hasCredit = SKILL_ORDER.some((a) => (credits[a]?.length ?? 0) > 0);

  const pending = (detail?.creationEvents ?? []).filter((e) => !e.resolved);
  const total = detail?.creationEvents.length ?? 0;
  const step = !releaseId
    ? "config"
    : detailLoading
      ? "loading"
      : pending.length > 0
        ? "events"
        : "finalize";

  function handleGenerateTitle() {
    genTitle.mutate(
      { count: 1 },
      { onSuccess: (r) => r.titles[0] && setTitle(r.titles[0]) },
    );
  }

  function handleGenerateConcept() {
    genConcept.mutate(
      { title: title || undefined, style },
      { onSuccess: (r) => setConcept(r.concept) },
    );
  }

  function handleStart() {
    start.mutate(
      { title, concept: concept || undefined, style, format, budgetTier, credits },
      {
        onSuccess: (rel) => setReleaseId(rel.id),
        onError: (e) =>
          notifications.show({
            title: "Não foi possível iniciar a obra",
            message: errorMessage(e),
            color: "red",
          }),
      },
    );
  }

  function handleFinalize() {
    if (!releaseId) return;
    finalize.mutate(releaseId, {
      onSuccess: (rel) => {
        notifications.show({
          title: `Lançado: ${rel.title}`,
          message:
            `Qualidade ${rel.quality} · +${(rel.fansGained ?? 0).toLocaleString("pt-BR")} fãs · custo ${(rel.cost ?? 0).toLocaleString("pt-BR")}` +
            (rel.criticScore !== null
              ? ` · Crítica ${Math.round(rel.criticScore)} · Público ${Math.round(rel.publicScore ?? 0)}`
              : ""),
          color: "teal",
        });
        onClose();
      },
      onError: (e) =>
        notifications.show({
          title: "Falha ao lançar",
          message: errorMessage(e),
          color: "red",
        }),
    });
  }

  function handleDiscard() {
    if (!releaseId) {
      onClose();
      return;
    }
    cancel.mutate(releaseId, { onSuccess: onClose });
  }

  return (
    <Modal
      opened
      onClose={onClose}
      title="Criar obra musical"
      centered
      size="lg"
    >
      {step === "config" && (
        <Stack>
          <Group align="flex-end" gap="xs">
            <TextInput
              label="Título"
              placeholder="Nome da obra"
              value={title}
              onChange={(e) => setTitle(e.currentTarget.value)}
              flex={1}
            />
            <Tooltip label="Gerar título">
              <ActionIcon
                variant="default"
                size="lg"
                onClick={handleGenerateTitle}
                loading={genTitle.isPending}
                aria-label="Gerar título"
              >
                <IconDice size={18} />
              </ActionIcon>
            </Tooltip>
          </Group>

          <Group align="flex-end" gap="xs">
            <Textarea
              label="Álbum conceitual"
              placeholder="A ideia por trás do disco"
              value={concept}
              onChange={(e) => setConcept(e.currentTarget.value)}
              autosize
              minRows={2}
              flex={1}
            />
            <Tooltip label="Gerar conceito">
              <ActionIcon
                variant="default"
                size="lg"
                onClick={handleGenerateConcept}
                loading={genConcept.isPending}
                aria-label="Gerar conceito"
              >
                <IconDice size={18} />
              </ActionIcon>
            </Tooltip>
          </Group>

          <Select
            label="Estilo musical"
            data={(options?.themes ?? []).map((t) => ({
              value: t.id,
              label: t.label,
            }))}
            value={style}
            onChange={(v) => v && setStyle(v)}
            searchable
          />

          <Group grow>
            <Select
              label="Formato"
              data={(formats ?? []).map((f) => ({
                value: f.id,
                label: f.label,
              }))}
              value={format}
              onChange={(v) => v && setFormat(v as ReleaseFormatId)}
            />
            <Select
              label="Orçamento"
              data={(tiers ?? []).map((t) => ({
                value: t.id,
                label: t.label,
              }))}
              value={budgetTier}
              onChange={(v) => v && setBudgetTier(v as BudgetTierId)}
            />
          </Group>

          {estimatedCost !== null && (
            <Text size="sm" c={canAfford ? "dimmed" : "red"}>
              Custo estimado: {estimatedCost.toLocaleString("pt-BR")} · Caixa:{" "}
              {band.balance.toLocaleString("pt-BR")}
              {!canAfford && " — saldo insuficiente"}
            </Text>
          )}

          <div>
            <Text fw={600} size="sm" mb={4}>
              Créditos
            </Text>
            <Text size="xs" c="dimmed" mb="xs">
              Atribua os integrantes a cada aspecto da obra.
            </Text>
            <CreditsEditor
              members={band.members}
              value={credits}
              onChange={setCredits}
            />
          </div>

          <Group justify="flex-end" mt="sm">
            <Button variant="subtle" color="gray" onClick={onClose}>
              Cancelar
            </Button>
            <Button
              onClick={handleStart}
              loading={start.isPending}
              disabled={!title.trim() || !hasCredit || !canAfford}
            >
              Iniciar criação
            </Button>
          </Group>
        </Stack>
      )}

      {step === "loading" && (
        <Group justify="center" py="xl">
          <Loader />
        </Group>
      )}

      {step === "events" && pending[0] && (
        <Stack>
          <Progress value={((total - pending.length) / total) * 100} />
          <Text size="xs" c="dimmed">
            Decisão {total - pending.length + 1} de {total}
          </Text>
          <Card withBorder padding="md">
            <Stack gap="sm">
              <Badge variant="light" w="fit-content">
                {KIND_LABELS[pending[0].kind]}
              </Badge>
              <Text>{pending[0].prompt}</Text>
              <Stack gap="xs">
                {pending[0].options.map((option) => (
                  <Button
                    key={option.id}
                    variant="default"
                    fullWidth
                    justify="flex-start"
                    h="auto"
                    py="xs"
                    loading={resolve.isPending}
                    onClick={() =>
                      resolve.mutate({
                        eventId: pending[0].id,
                        optionId: option.id,
                      })
                    }
                  >
                    <Stack gap={0} align="flex-start">
                      <Text fw={600}>{option.label}</Text>
                      <Text size="xs" c="dimmed">
                        {option.description}
                      </Text>
                    </Stack>
                  </Button>
                ))}
              </Stack>
            </Stack>
          </Card>
          <Text size="xs" c="dimmed">
            Você pode fechar e continuar depois pela Discografia.
          </Text>
        </Stack>
      )}

      {step === "finalize" && detail && (
        <Stack>
          <Alert color="teal" title="Tudo pronto para lançar">
            As decisões de criação foram tomadas. Revise e lance a obra.
          </Alert>
          <Card withBorder padding="md">
            <Stack gap={4}>
              <Text fw={600}>{detail.title}</Text>
              {detail.concept && (
                <Text size="xs" c="dimmed">
                  {detail.concept}
                </Text>
              )}
              <Text size="sm" c="dimmed">
                {formats?.find((f) => f.id === detail.format)?.label ??
                  detail.format}{" "}
                ·{" "}
                {tiers?.find((t) => t.id === detail.budgetTier)?.label ??
                  detail.budgetTier}
              </Text>
            </Stack>
          </Card>
          <Group justify="space-between" mt="sm">
            <Button
              variant="subtle"
              color="red"
              onClick={handleDiscard}
              loading={cancel.isPending}
            >
              Descartar
            </Button>
            <Button onClick={handleFinalize} loading={finalize.isPending}>
              Lançar obra
            </Button>
          </Group>
        </Stack>
      )}
    </Modal>
  );
}
