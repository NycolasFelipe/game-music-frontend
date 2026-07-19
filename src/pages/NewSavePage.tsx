import {
  ActionIcon,
  Alert,
  Button,
  Container,
  Group,
  Loader,
  Modal,
  Select,
  SimpleGrid,
  Stack,
  Stepper,
  Text,
  TextInput,
  Title,
  Tooltip,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import {
  IconDice,
  IconPencil,
  IconSettings,
  IconWand,
} from "@tabler/icons-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useBlocker, useNavigate } from "react-router-dom";
import {
  BandNameConfigModal,
  MemberCard,
  MemberEditModal,
  useBandOptions,
  useCharacteristics,
  useCreateBand,
  useGenerateBandNames,
  useGenerateCandidates,
} from "@/features/bands";
import type {
  Characteristic,
  CreateBandMemberSeed,
  GenerateNameOptions,
  MemberCandidate,
} from "@/features/bands";
import { ApiError } from "@/services/http";

const CANDIDATE_COUNT = 9;
const MIN_MEMBERS = 3;
const MAX_MEMBERS = 6;

/** Uniformly picks one item from a non-empty array. */
function randomItem<T>(items: T[]): T {
  return items[Math.floor(Math.random() * items.length)];
}

/** Guided create-save wizard: band data → pick candidates → review & create. */
export function NewSavePage() {
  const navigate = useNavigate();
  const { data: options } = useBandOptions();
  const { data: characteristics } = useCharacteristics();

  const generateName = useGenerateBandNames();
  const generateCandidates = useGenerateCandidates();
  const createBand = useCreateBand();
  const [nameModalOpened, nameModal] = useDisclosure(false);

  const [step, setStep] = useState(0);
  const [name, setName] = useState("");
  const [theme, setTheme] = useState<string | null>(null);
  const [origin, setOrigin] = useState<string | null>(null);
  const [year, setYear] = useState<string | null>(null);
  const [candidates, setCandidates] = useState<MemberCandidate[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [nameOptions, setNameOptions] = useState<GenerateNameOptions>({
    language: "pt",
    includeArticle: true,
  });
  const [editing, setEditing] = useState<MemberCandidate | null>(null);

  // The creation is "in progress" once any choice has been made. A successful
  // create sets `savedRef` so the guard lets us navigate into the new save.
  const savedRef = useRef(false);
  const hasProgress =
    step > 0 ||
    name.trim() !== "" ||
    theme !== null ||
    origin !== null ||
    year !== null ||
    candidates.length > 0;

  // `savedRef` is read live inside the callback so the post-create navigation
  // is never blocked, even though the ref change does not re-render.
  const blocker = useBlocker(
    ({ currentLocation, nextLocation }) =>
      hasProgress &&
      !savedRef.current &&
      currentLocation.pathname !== nextLocation.pathname,
  );

  // Guard the browser tab close / refresh while a creation is in progress.
  useEffect(() => {
    if (!hasProgress) return;
    const handler = (event: BeforeUnloadEvent) => event.preventDefault();
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [hasProgress]);

  const catalog = useMemo(
    () =>
      new Map<string, Characteristic>(
        (characteristics ?? []).map((c) => [c.id, c]),
      ),
    [characteristics],
  );

  const bandStepValid = Boolean(name.trim() && theme && origin && year);
  const membersStepValid =
    selected.size >= MIN_MEMBERS && selected.size <= MAX_MEMBERS;

  function rollCandidates() {
    generateCandidates.mutate(CANDIDATE_COUNT, {
      onSuccess: (data) => {
        setCandidates(data);
        setSelected(new Set());
      },
    });
  }

  function goToMembers() {
    if (candidates.length === 0) rollCandidates();
    setStep(1);
  }

  function toggle(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else if (next.size < MAX_MEMBERS) {
        next.add(id);
      }
      return next;
    });
  }

  function selectRandomMembers() {
    if (candidates.length === 0) return;
    const pool = [...candidates];
    for (let i = pool.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      [pool[i], pool[j]] = [pool[j], pool[i]];
    }
    const count =
      MIN_MEMBERS + Math.floor(Math.random() * (MAX_MEMBERS - MIN_MEMBERS + 1));
    const chosen = pool.slice(0, Math.min(count, pool.length));
    setSelected(new Set(chosen.map((c) => c.id)));
  }

  function randomizeBand() {
    if (!options) return;
    setTheme(randomItem(options.themes).id);
    setOrigin(randomItem(options.origins).id);
    setYear(String(randomItem(options.foundationYears)));
    generateWith(nameOptions);
  }

  function generateWith(options: GenerateNameOptions) {
    generateName.mutate(
      { ...options, count: 1 },
      {
        onSuccess: (data) => {
          if (data.names[0]) setName(data.names[0]);
        },
      },
    );
  }

  function create() {
    if (!theme || !origin || !year) return;
    const foundationYear = Number(year);
    const members: CreateBandMemberSeed[] = candidates
      .filter((c) => selected.has(c.id))
      .map((c) => ({
        name: c.name,
        age: c.age,
        gender: c.gender,
        avatar: c.avatar,
        happiness: c.happiness,
        characteristics: c.characteristics,
        skills: c.skills,
        biography: c.biography,
        primarySkill: c.primarySkill,
        joinYear: foundationYear,
      }));

    createBand.mutate(
      { name: name.trim(), theme, origin, foundationYear, members },
      {
        onSuccess: (band) => {
          savedRef.current = true;
          navigate(`/bands/${band.id}`);
        },
      },
    );
  }

  return (
    <Container py="xl" size="lg">
      <Group justify="space-between" mb="lg">
        <Title order={2}>Novo save</Title>
        <Button variant="subtle" color="gray" onClick={() => navigate("/")}>
          Cancelar
        </Button>
      </Group>

      <Modal
        opened={blocker.state === "blocked"}
        onClose={() => blocker.reset?.()}
        title="Descartar criação em andamento?"
        centered
      >
        <Text size="sm">
          Você tem uma criação de banda em andamento. Se sair agora, o progresso
          será perdido.
        </Text>
        <Group justify="flex-end" mt="lg">
          <Button variant="default" onClick={() => blocker.reset?.()}>
            Continuar criando
          </Button>
          <Button color="red" onClick={() => blocker.proceed?.()}>
            Descartar e sair
          </Button>
        </Group>
      </Modal>

      <Stepper
        active={step}
        onStepClick={setStep}
        allowNextStepsSelect={false}
        mb="xl"
      >
        <Stepper.Step label="Banda" description="Dados da banda" />
        <Stepper.Step label="Integrantes" description="Escolha 3 a 6" />
        <Stepper.Step label="Revisão" description="Criar save" />
      </Stepper>

      {step === 0 && (
        <Stack maw={420}>
          <Button
            variant="light"
            leftSection={<IconWand size={16} />}
            onClick={randomizeBand}
            disabled={!options}
          >
            Gerar aleatoriamente
          </Button>

          <Group align="flex-end" gap="xs">
            <TextInput
              label="Nome da banda"
              value={name}
              onChange={(e) => setName(e.currentTarget.value)}
              flex={1}
            />
            <Tooltip label="Gerar nome">
              <ActionIcon
                variant="default"
                size="lg"
                onClick={() => generateWith(nameOptions)}
                loading={generateName.isPending}
                aria-label="Gerar nome"
              >
                <IconDice size={18} />
              </ActionIcon>
            </Tooltip>
            <Tooltip label="Configurar geração">
              <ActionIcon
                variant="default"
                size="lg"
                onClick={nameModal.open}
                aria-label="Configurar geração de nomes"
              >
                <IconSettings size={18} />
              </ActionIcon>
            </Tooltip>
          </Group>
          <Select
            label="Estilo"
            placeholder="Selecione"
            data={(options?.themes ?? []).map((t) => ({
              value: t.id,
              label: t.label,
            }))}
            value={theme}
            onChange={setTheme}
            searchable
          />
          <Select
            label="Origem"
            placeholder="Selecione"
            data={(options?.origins ?? []).map((o) => ({
              value: o.id,
              label: o.label,
            }))}
            value={origin}
            onChange={setOrigin}
            searchable
          />
          <Select
            label="Década de fundação"
            placeholder="Selecione"
            data={(options?.foundationYears ?? []).map((y) => ({
              value: String(y),
              label: String(y),
            }))}
            value={year}
            onChange={setYear}
          />
          <Group justify="flex-end" mt="md">
            <Button disabled={!bandStepValid} onClick={goToMembers}>
              Próximo
            </Button>
          </Group>
        </Stack>
      )}

      {nameModalOpened && (
        <BandNameConfigModal
          onClose={nameModal.close}
          currentOptions={nameOptions}
          onGenerate={(options) => {
            setNameOptions(options);
            generateWith(options);
          }}
        />
      )}

      {editing && (
        <MemberEditModal
          candidate={editing}
          characteristics={characteristics ?? []}
          onClose={() => setEditing(null)}
          onSave={(updated) => {
            setCandidates((cs) =>
              cs.map((c) => (c.id === updated.id ? updated : c)),
            );
            setEditing(null);
          }}
        />
      )}

      {step === 1 && (
        <Stack>
          <Group justify="space-between">
            <Text>
              Selecionados: {selected.size}/{MAX_MEMBERS} (mínimo {MIN_MEMBERS})
            </Text>
            <Group gap="xs">
              <Button
                variant="light"
                leftSection={<IconWand size={16} />}
                onClick={selectRandomMembers}
                disabled={candidates.length === 0}
              >
                Selecionar aleatoriamente
              </Button>
              <Button
                variant="default"
                onClick={rollCandidates}
                loading={generateCandidates.isPending}
              >
                Gerar novos candidatos
              </Button>
            </Group>
          </Group>

          {generateCandidates.isPending && <Loader />}
          {generateCandidates.isError && (
            <Alert color="red">Falha ao gerar candidatos.</Alert>
          )}

          <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }}>
            {candidates.map((candidate) => (
              <MemberCard
                key={candidate.id}
                member={candidate}
                catalog={catalog}
                selected={selected.has(candidate.id)}
                onToggle={() => toggle(candidate.id)}
                actions={
                  <ActionIcon
                    variant="subtle"
                    color="gray"
                    aria-label="Editar integrante"
                    onClick={(event) => {
                      event.stopPropagation();
                      setEditing(candidate);
                    }}
                  >
                    <IconPencil size={16} />
                  </ActionIcon>
                }
              />
            ))}
          </SimpleGrid>

          <Group justify="space-between" mt="md">
            <Button variant="default" onClick={() => setStep(0)}>
              Voltar
            </Button>
            <Button disabled={!membersStepValid} onClick={() => setStep(2)}>
              Próximo
            </Button>
          </Group>
        </Stack>
      )}

      {step === 2 && (
        <Stack maw={520}>
          <Text fw={600}>Confira antes de criar:</Text>
          <Text>
            <strong>{name}</strong> —{" "}
            {options?.themes.find((t) => t.id === theme)?.label} ·{" "}
            {options?.origins.find((o) => o.id === origin)?.label} · {year}
          </Text>
          <Text c="dimmed">
            {selected.size} integrantes selecionados. Fama inicial: Anônimos (0
            fãs).
          </Text>
          {createBand.isError && (
            <Alert color="red" title="Falha ao criar o save">
              {createBand.error instanceof ApiError
                ? createBand.error.message
                : "Erro inesperado."}
            </Alert>
          )}
          <Group justify="space-between" mt="md">
            <Button variant="default" onClick={() => setStep(1)}>
              Voltar
            </Button>
            <Button onClick={create} loading={createBand.isPending}>
              Criar save
            </Button>
          </Group>
        </Stack>
      )}
    </Container>
  );
}
