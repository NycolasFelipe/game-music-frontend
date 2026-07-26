import {
  ActionIcon,
  Alert,
  Badge,
  Button,
  Group,
  Loader,
  Modal,
  Paper,
  Progress,
  Select,
  Stack,
  Stepper,
  Text,
  Textarea,
  TextInput,
  Tooltip,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { IconAlertTriangle, IconDice, IconDisc } from "@tabler/icons-react";
import { useState } from "react";
import { SKILL_LABELS, SKILL_ORDER, useBandOptions } from "@/features/bands";
import type { BandDetail } from "@/features/bands";
import { useDecisionsUi } from "@/features/decisions";
import { CreditsEditor } from "@/features/releases/components/CreditsEditor";
import {
  BudgetPicker,
  FormatPicker,
} from "@/features/releases/components/ProductionPickers";
import {
  importanceStars,
  uncoveredCrucialAspects,
} from "@/features/releases/creation-forecast";
import {
  useBudgetTiers,
  useGenerateReleaseConcept,
  useGenerateReleaseTitle,
  useGenreProfiles,
  useReleaseFormats,
} from "@/features/releases/hooks/useReleaseCatalogs";
import {
  useCancelRelease,
  useFinalizeRelease,
  useRelease,
  useStartRelease,
} from "@/features/releases/hooks/useReleases";
import type {
  BudgetTierId,
  Release,
  ReleaseCredits,
  ReleaseFormatId,
} from "@/features/releases/types";
import { ApiError } from "@/services/http";

/** The creation journey, start to launch. */
const STEP_LABELS = [
  "Conceito",
  "Produção",
  "Créditos",
  "Estúdio",
  "Lançamento",
];

/** Turns an unknown error into a readable message. */
function errorMessage(error: unknown): string {
  return error instanceof ApiError ? error.message : "Erro inesperado.";
}

/**
 * Drives the full creation of a work as a staged journey: concept → production
 * → credits → studio sessions → launch. Each step shows what it costs and what
 * it is worth (the style's demands, the forecast quality), so the choices read
 * as decisions instead of a form. Closing mid-flow keeps the draft — it stays
 * in the discography to continue or discard later.
 */
export function ReleaseCreationModal({
  band,
  resumeReleaseId = null,
  onClose,
  onFinalized,
}: {
  band: BandDetail;
  resumeReleaseId?: string | null;
  onClose: () => void;
  /** Called with the launched work so the parent can reveal its reviews. */
  onFinalized?: (release: Release) => void;
}) {
  const bandId = band.id;
  // Set up here, recorded over the next turns: once the work enters the studio
  // this modal is only ever reopened on an existing draft.
  const releaseId = resumeReleaseId;
  const [configStep, setConfigStep] = useState(0);
  const [title, setTitle] = useState("");
  const [concept, setConcept] = useState("");
  const [style, setStyle] = useState(band.theme);
  const [format, setFormat] = useState<ReleaseFormatId>("single");
  const [budgetTier, setBudgetTier] = useState<BudgetTierId>("estudio");
  const [credits, setCredits] = useState<ReleaseCredits>({});

  const { data: options } = useBandOptions();
  const { data: formats } = useReleaseFormats();
  const { data: tiers } = useBudgetTiers();
  const { data: genreProfiles } = useGenreProfiles();
  const genTitle = useGenerateReleaseTitle();
  const genConcept = useGenerateReleaseConcept();
  const start = useStartRelease(bandId);
  const finalize = useFinalizeRelease(bandId);
  const cancel = useCancelRelease(bandId);
  const openDecisions = useDecisionsUi((state) => state.openDecisions);
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

  const weights = genreProfiles?.find((p) => p.style === style)?.weights;
  const uncovered = weights ? uncoveredCrucialAspects(credits, weights) : [];

  /** The style's three defining aspects, shown as its "profile". */
  const styleHighlights = weights
    ? [...SKILL_ORDER]
        .sort((a, b) => weights[b] - weights[a])
        .slice(0, 3)
        .map((aspect) => ({ aspect, weight: weights[aspect] }))
    : [];

  const pending = (detail?.creationEvents ?? []).filter((e) => !e.resolved);
  const inProduction = (detail?.productionTurnsLeft ?? 0) > 0;
  const stage = !releaseId
    ? "config"
    : detailLoading
      ? "loading"
      : pending.length > 0
        ? "events"
        : inProduction
          ? "recording"
          : "finalize";

  const activeStep =
    stage === "config" ? configStep : stage === "finalize" ? 4 : 3;
  // Once the draft exists its format is settled; before that, the picker leads.
  const currentFormat = formats?.find(
    (f) => f.id === (detail?.format ?? format),
  );
  const productionTurns = currentFormat?.productionTurns ?? 0;

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
      {
        title,
        concept: concept || undefined,
        style,
        format,
        budgetTier,
        credits,
      },
      {
        onSuccess: (rel) => {
          notifications.show({
            title: `${rel.title} entrou no estúdio`,
            message:
              `${productionTurns} turno${productionTurns === 1 ? "" : "s"} de gravação pela frente. ` +
              "As decisões de estúdio chegam a você a cada turno.",
            color: "blue",
          });
          onClose();
        },
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
      // No numbers here: the reveal is the ceremony, and a toast that reads
      // "Qualidade 78" first would be announcing the ending in the hallway.
      onSuccess: (rel) => {
        onClose();
        onFinalized?.(rel);
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
      title={
        <Group gap={8}>
          <IconDisc size={20} />
          <Text fw={700}>
            {currentFormat ? `Novo ${currentFormat.label}` : "Nova obra"} —{" "}
            {band.name}
          </Text>
        </Group>
      }
      centered
      size="xl"
    >
      <Stack>
        <Stepper
          active={activeStep}
          size="xs"
          allowNextStepsSelect={false}
          onStepClick={(index) => stage === "config" && setConfigStep(index)}
        >
          {STEP_LABELS.map((label) => (
            <Stepper.Step key={label} label={label} />
          ))}
        </Stepper>

        {stage === "config" && configStep === 0 && (
          <Stack>
            <Group align="flex-end" gap="xs">
              <TextInput
                label="Título"
                placeholder="Nome da obra"
                value={title}
                onChange={(e) => setTitle(e.currentTarget.value)}
                flex={1}
              />
              <Tooltip label="Sortear título">
                <ActionIcon
                  variant="light"
                  size="lg"
                  onClick={handleGenerateTitle}
                  loading={genTitle.isPending}
                  aria-label="Gerar título"
                >
                  <IconDice size={18} />
                </ActionIcon>
              </Tooltip>
            </Group>

            <Select
              label="Estilo musical"
              description="Define quais aspectos pesam na nota da obra."
              data={(options?.themes ?? []).map((t) => ({
                value: t.id,
                label: t.label,
              }))}
              value={style}
              onChange={(v) => v && setStyle(v)}
              searchable
            />

            {styleHighlights.length > 0 && (
              <Paper withBorder p="xs" radius="md">
                <Group gap="xs" wrap="wrap">
                  <Text size="xs" c="dimmed" fw={600}>
                    O que este estilo cobra:
                  </Text>
                  {styleHighlights.map(({ aspect, weight }) => (
                    <Badge key={aspect} variant="light" size="sm">
                      {SKILL_LABELS[aspect]} {"★".repeat(importanceStars(weight))}
                    </Badge>
                  ))}
                </Group>
              </Paper>
            )}

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
              <Tooltip label="Sortear conceito">
                <ActionIcon
                  variant="light"
                  size="lg"
                  onClick={handleGenerateConcept}
                  loading={genConcept.isPending}
                  aria-label="Gerar conceito"
                >
                  <IconDice size={18} />
                </ActionIcon>
              </Tooltip>
            </Group>

            <Group justify="flex-end" mt="sm">
              <Button variant="subtle" color="gray" onClick={onClose}>
                Cancelar
              </Button>
              <Button
                onClick={() => setConfigStep(1)}
                disabled={!title.trim()}
              >
                Produção →
              </Button>
            </Group>
          </Stack>
        )}

        {stage === "config" && configStep === 1 && (
          <Stack>
            <div>
              <Text size="sm" fw={600}>
                Formato
              </Text>
              <Text size="xs" c="dimmed" mb="xs">
                Discos maiores custam e alcançam mais, ensinam mais a quem gravou
                — e ocupam mais turnos de estúdio.
              </Text>
              <FormatPicker
                formats={formats ?? []}
                value={format}
                onChange={(id) => setFormat(id as ReleaseFormatId)}
              />
            </div>

            <div>
              <Text size="sm" fw={600}>
                Orçamento
              </Text>
              <Text size="xs" c="dimmed" mb="xs">
                Quanto melhor o estúdio, mais a obra rende em nota.
              </Text>
              <BudgetPicker
                tiers={tiers ?? []}
                value={budgetTier}
                onChange={(id) => setBudgetTier(id as BudgetTierId)}
                baseCost={formatObj?.baseCost ?? null}
                balance={band.balance}
              />
            </div>

            {estimatedCost !== null && (
              <Paper withBorder p="xs" radius="md">
                <Group justify="space-between">
                  <Text size="sm">
                    Custo da produção:{" "}
                    <Text span fw={700} c={canAfford ? undefined : "red"}>
                      {estimatedCost.toLocaleString("pt-BR")}
                    </Text>
                  </Text>
                  <Text size="sm" c="dimmed">
                    Caixa: {band.balance.toLocaleString("pt-BR")}
                  </Text>
                </Group>
              </Paper>
            )}

            {!canAfford && (
              <Alert color="red" icon={<IconAlertTriangle size={16} />}>
                O caixa não cobre esta produção. Escolha um formato menor ou um
                estúdio mais barato.
              </Alert>
            )}

            <Group justify="space-between" mt="sm">
              <Button variant="default" onClick={() => setConfigStep(0)}>
                ← Conceito
              </Button>
              <Button onClick={() => setConfigStep(2)} disabled={!canAfford}>
                Créditos →
              </Button>
            </Group>
          </Stack>
        )}

        {stage === "config" && configStep === 2 && (
          <Stack>
            <div>
              <Text size="sm" fw={600}>
                Escalação
              </Text>
              <Text size="xs" c="dimmed" mb="xs">
                Quem acumula funções entrega menos em cada uma; quem divide um
                instrumento com um amigo rende mais do que sozinho (e com um
                desafeto, menos).
              </Text>
              <CreditsEditor
                members={band.members}
                value={credits}
                onChange={setCredits}
                weights={weights}
                relationships={band.relationships}
              />
            </div>

            {uncovered.length > 0 && (
              <Alert color="yellow" icon={<IconAlertTriangle size={16} />}>
                Sem ninguém em{" "}
                {uncovered.map((a) => SKILL_LABELS[a]).join(", ")} — aspectos que
                pesam muito neste estilo contam zero na nota.
              </Alert>
            )}

            <Group justify="space-between" mt="sm">
              <Button variant="default" onClick={() => setConfigStep(1)}>
                ← Produção
              </Button>
              <Button
                onClick={handleStart}
                loading={start.isPending}
                disabled={!title.trim() || !hasCredit || !canAfford}
              >
                🎬 Entrar no estúdio
              </Button>
            </Group>
          </Stack>
        )}

        {stage === "loading" && (
          <Group justify="center" py="xl">
            <Loader />
          </Group>
        )}

        {stage === "events" && (
          <Stack align="center" gap="sm" py="md">
            <Alert
              color="yellow"
              icon={<IconAlertTriangle size={16} />}
              w="100%"
            >
              Uma sessão de estúdio está esperando sua palavra — a gravação só
              segue depois dela.
            </Alert>
            <Button
              onClick={() => {
                openDecisions();
                onClose();
              }}
            >
              Ir para a decisão
            </Button>
          </Stack>
        )}

        {stage === "recording" && detail && (
          <Stack gap="sm" align="center" py="md">
            <Text fz={40} lh={1}>
              🎚️
            </Text>
            <Text fw={700}>Gravando &ldquo;{detail.title}&rdquo;</Text>
            <Text size="sm" c="dimmed" ta="center" maw={420}>
              A banda está em estúdio. Faltam{" "}
              <Text span fw={700}>
                {detail.productionTurnsLeft} turno
                {detail.productionTurnsLeft === 1 ? "" : "s"}
              </Text>{" "}
              para a obra ficar pronta — avance o tempo pela Visão geral. A cada
              turno pode aparecer uma decisão de estúdio.
            </Text>
            {productionTurns > 0 && (
              <Progress
                value={
                  ((productionTurns - detail.productionTurnsLeft) /
                    productionTurns) *
                  100
                }
                w="100%"
                maw={420}
                size="lg"
                radius="xl"
              />
            )}
            <Group justify="space-between" mt="sm" w="100%">
              <Button
                variant="subtle"
                color="red"
                onClick={handleDiscard}
                loading={cancel.isPending}
              >
                Descartar
              </Button>
              <Button variant="default" onClick={onClose}>
                Fechar
              </Button>
            </Group>
          </Stack>
        )}

        {stage === "finalize" && detail && (
          <Stack>
            <Alert color="teal" title="A obra está pronta">
              As sessões terminaram. Prense o disco e mande para o mundo.
            </Alert>

            <Paper withBorder p="md" radius="md">
              <Stack gap={4}>
                <Text fw={700} size="lg">
                  {detail.title}
                </Text>
                {detail.concept && (
                  <Text size="xs" c="dimmed" fs="italic">
                    {detail.concept}
                  </Text>
                )}
                <Group gap="xs" mt={4}>
                  <Badge variant="light">
                    {currentFormat?.label ?? detail.format}
                  </Badge>
                  <Badge variant="light" color="grape">
                    {tiers?.find((t) => t.id === detail.budgetTier)?.label ??
                      detail.budgetTier}
                  </Badge>
                  <Badge variant="light" color="gray">
                    {options?.themes.find((t) => t.id === detail.style)?.label ??
                      detail.style}
                  </Badge>
                </Group>
                {detail.creationLog.length > 0 && (
                  <Stack gap={2} mt="xs">
                    <Text size="xs" fw={600} c="dimmed">
                      No estúdio você decidiu:
                    </Text>
                    {detail.creationLog.map((entry) => (
                      <Text key={entry.eventId} size="xs" c="dimmed">
                        · {entry.choiceLabel}
                      </Text>
                    ))}
                  </Stack>
                )}
              </Stack>
            </Paper>

            <Group justify="space-between" mt="sm">
              <Button
                variant="subtle"
                color="red"
                onClick={handleDiscard}
                loading={cancel.isPending}
              >
                Descartar
              </Button>
              <Button
                size="md"
                onClick={handleFinalize}
                loading={finalize.isPending}
              >
                🚀 Lançar {currentFormat?.label ?? "obra"}
              </Button>
            </Group>
          </Stack>
        )}
      </Stack>
    </Modal>
  );
}
