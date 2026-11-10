import {
  ActionIcon,
  Button,
  Group,
  Loader,
  Textarea,
  TextInput,
  Tooltip,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { IconDice } from "@tabler/icons-react";
import { useState } from "react";
import { InsertModal } from "@/components/revista";
import { SKILL_LABELS, SKILL_ORDER, useBandOptions } from "@/features/bands";
import type { BandDetail } from "@/features/bands";
import { useDecisionsUi } from "@/features/decisions";
import { CreditsEditor } from "@/features/releases/components/CreditsEditor";
import { LaunchSummary } from "@/features/releases/components/LaunchSummary";
import { useLaunchCost } from "@/features/releases/hooks/useLaunchCost";
import { StyleProfile } from "@/features/releases/components/StyleProfile";
import {
  BudgetPicker,
  FormatPicker,
} from "@/features/releases/components/ProductionPickers";
import { uncoveredCrucialAspects } from "@/features/releases/creation-forecast";
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
import { formatMoney } from "@/utils/money";

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
 * → credits → studio sessions → launch, laid out as a magazine insert
 * (ADR-0002). Each step shows what it costs and what it is worth (the style's
 * demands, the cash after launch), so the choices read as decisions instead of
 * a form. Closing mid-flow keeps the draft — it stays in the discography to
 * continue or discard later.
 *
 * @param props.band - The band making the work.
 * @param props.resumeReleaseId - An existing draft to reopen, if any.
 * @param props.onClose - Closes the insert.
 * @param props.onFinalized - Called with the launched work so the parent can reveal its reviews.
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
  onFinalized?: (release: Release) => void;
}) {
  const bandId = band.id;
  // Set up here, recorded over the next turns: once the work enters the studio
  // this modal is only ever reopened on an existing draft.
  const releaseId = resumeReleaseId;
  const [configStep, setConfigStep] = useState(0);
  const [title, setTitle] = useState("");
  const [concept, setConcept] = useState("");
  // Every work takes the band's style, chosen once at creation (ADR-0030).
  const style = band.theme;
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
  const launchCost = useLaunchCost(bandId, releaseId);
  // The summary says why; the button just refuses what the server would.
  const canLaunch = launchCost !== null && band.balance >= launchCost;
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

  const styleOption = options?.themes.find((t) => t.id === style);

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
  const workName = currentFormat ? `${currentFormat.label}` : "obra";

  const label =
    stage === "config"
      ? `Novo ${workName} · ${band.name} · passo ${configStep + 1} de 3`
      : stage === "finalize"
        ? `Lançamento · ${band.name}`
        : `No estúdio · ${band.name}`;
  const heading =
    stage === "config"
      ? STEP_LABELS[configStep]
      : stage === "finalize" && detail
        ? `“${detail.title}” está pronta.`
        : stage === "events"
          ? "Uma sessão espera sua palavra."
          : detail
            ? `Gravando “${detail.title}”`
            : "No estúdio";

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
            color: "ink",
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

  const discardLink = (
    <button
      type="button"
      className="rv-link"
      style={{ color: "var(--rv-soft)" }}
      onClick={handleDiscard}
      disabled={cancel.isPending}
    >
      {cancel.isPending ? "Descartando…" : "Descartar obra"}
    </button>
  );

  return (
    <InsertModal
      opened
      onClose={onClose}
      label={label}
      title={heading}
      size="xl"
      closeOnClickOutside={stage !== "config"}
    >
      <nav className="rv-index" aria-label="Etapas da obra" style={{ marginTop: -6, marginBottom: 14 }}>
        {STEP_LABELS.map((step, index) => {
          const reachable = stage === "config" && index <= configStep && index < 3;
          return (
            <button
              key={step}
              type="button"
              className={index === activeStep ? "rv-on" : undefined}
              aria-current={index === activeStep ? "step" : undefined}
              disabled={!reachable}
              onClick={() => setConfigStep(index)}
            >
              <span className="rv-pg">{index + 1}</span>
              {step}
            </button>
          );
        })}
      </nav>

      {stage === "config" && configStep === 0 && (
        <div className="rv-form">
          <div className="rv-field">
            <Group align="flex-end" gap="xs" wrap="nowrap">
              <TextInput
                label="Título"
                placeholder="Nome da obra"
                value={title}
                onChange={(e) => setTitle(e.currentTarget.value)}
                flex={1}
              />
              <Tooltip label="Sortear título">
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
          </div>

          <div className="rv-field">
            <span className="rv-field-label">Estilo musical</span>
            <p className="rv-body" style={{ margin: 0 }}>{styleOption?.label ?? style}</p>
            <StyleProfile style={style} description={styleOption?.description} />
          </div>

          <div className="rv-field">
            <Group align="flex-end" gap="xs" wrap="nowrap">
              <Textarea
                label="Álbum conceitual (opcional)"
                placeholder="A ideia por trás do disco"
                value={concept}
                onChange={(e) => setConcept(e.currentTarget.value)}
                autosize
                minRows={2}
                flex={1}
                styles={{ input: { fontSize: 16, fontWeight: 400, fontStyle: "italic" } }}
              />
              <Tooltip label="Sortear conceito">
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
          </div>

          <Group justify="space-between" mt="lg">
            <Button variant="default" onClick={onClose}>
              Cancelar
            </Button>
            <Button onClick={() => setConfigStep(1)} disabled={!title.trim()}>
              Produção →
            </Button>
          </Group>
        </div>
      )}

      {stage === "config" && configStep === 1 && (
        <div>
          <div className="rv-cols2">
            <div>
              <div className="rv-kicker">Formato</div>
              <p className="rv-caption" style={{ marginBottom: 6 }}>
                Discos maiores custam e alcançam mais, ensinam mais a quem gravou
                e ocupam mais turnos de estúdio.
              </p>
              <FormatPicker
                formats={formats ?? []}
                value={format}
                onChange={(id) => setFormat(id as ReleaseFormatId)}
              />
            </div>
            <div>
              <div className="rv-kicker">Orçamento</div>
              <p className="rv-caption" style={{ marginBottom: 10 }}>
                Quanto melhor o estúdio, mais a obra rende em nota.
              </p>
              <BudgetPicker
                tiers={tiers ?? []}
                value={budgetTier}
                onChange={(id) => setBudgetTier(id as BudgetTierId)}
                baseCost={formatObj?.baseCost ?? null}
                balance={band.balance}
              />
              {estimatedCost !== null && (
                <div className="rv-ledger" style={{ marginTop: 6 }}>
                  <div>
                    <span>Custo no lançamento</span>
                    <span className={canAfford ? undefined : "rv-neg"}>
                      {formatMoney(estimatedCost)}
                    </span>
                  </div>
                  <div>
                    <span>Caixa hoje</span>
                    <span>{formatMoney(band.balance)}</span>
                  </div>
                </div>
              )}
              {!canAfford && (
                <p className="rv-note">
                  O caixa não cobre esta produção. Escolha um formato menor ou um
                  estúdio mais barato.
                </p>
              )}
            </div>
          </div>

          <Group justify="space-between" mt="lg">
            <Button variant="default" onClick={() => setConfigStep(0)}>
              ← Conceito
            </Button>
            <Button onClick={() => setConfigStep(2)} disabled={!canAfford}>
              Créditos →
            </Button>
          </Group>
        </div>
      )}

      {stage === "config" && configStep === 2 && (
        <div>
          <div className="rv-kicker">Escalação</div>
          <p className="rv-caption" style={{ marginBottom: 10 }}>
            Quem acumula funções entrega menos em cada uma. Quem divide um
            instrumento com um amigo rende mais do que sozinho, e com um
            desafeto, menos.
          </p>
          <CreditsEditor
            members={band.members}
            value={credits}
            onChange={setCredits}
            weights={weights}
            relationships={band.relationships}
          />

          {uncovered.length > 0 && (
            <p className="rv-note">
              Ninguém em {uncovered.map((a) => SKILL_LABELS[a]).join(", ")}: são
              instrumentos que pesam muito neste estilo e vão contar zero na nota.
            </p>
          )}

          <Group justify="space-between" mt="lg">
            <Button variant="default" onClick={() => setConfigStep(1)}>
              ← Produção
            </Button>
            <Button
              color="press"
              onClick={handleStart}
              loading={start.isPending}
              disabled={!title.trim() || !hasCredit || !canAfford}
            >
              Entrar no estúdio
            </Button>
          </Group>
        </div>
      )}

      {stage === "loading" && (
        <Group justify="center" py="xl">
          <Loader />
        </Group>
      )}

      {stage === "events" && (
        <div>
          <p className="rv-deck">
            A gravação só segue depois que você decidir o que fazer na sessão.
          </p>
          <Group justify="space-between" mt="lg">
            {discardLink}
            <Button
              color="press"
              onClick={() => {
                openDecisions();
                onClose();
              }}
            >
              Ir para a decisão
            </Button>
          </Group>
        </div>
      )}

      {stage === "recording" && detail && (
        <div>
          <p className="rv-deck">
            A banda está em estúdio. Falta
            {detail.productionTurnsLeft === 1 ? "" : "m"}{" "}
            {detail.productionTurnsLeft} turno
            {detail.productionTurnsLeft === 1 ? "" : "s"} para a obra ficar
            pronta.
          </p>
          {productionTurns > 0 && (
            <div className="rv-tape" aria-hidden>
              {Array.from({ length: Math.max(productionTurns, detail.productionTurnsLeft) }, (_, i) => {
                const total = Math.max(productionTurns, detail.productionTurnsLeft);
                const done = i < total - detail.productionTurnsLeft;
                const now = i === total - detail.productionTurnsLeft;
                return <i key={i} className={done ? "rv-done" : now ? "rv-now" : undefined} />;
              })}
            </div>
          )}
          <p className="rv-caption">
            Cada quadro é um turno de estúdio. Feche a edição na aba Turno para
            a gravação andar; a cada turno pode surgir uma decisão de estúdio.
          </p>
          <Group justify="space-between" mt="lg">
            {discardLink}
            <Button variant="default" onClick={onClose}>
              Voltar à edição
            </Button>
          </Group>
        </div>
      )}

      {stage === "finalize" && detail && releaseId && (
        <div>
          <LaunchSummary bandId={bandId} releaseId={releaseId} balance={band.balance} />
          <Group justify="space-between" mt="lg">
            {discardLink}
            <Group gap="xs">
              <Button variant="default" onClick={onClose}>
                Ainda não
              </Button>
              <Button
                color="press"
                onClick={handleFinalize}
                loading={finalize.isPending}
                disabled={!canLaunch}
              >
                Lançar {currentFormat?.label ?? "obra"}
              </Button>
            </Group>
          </Group>
        </div>
      )}
    </InsertModal>
  );
}
