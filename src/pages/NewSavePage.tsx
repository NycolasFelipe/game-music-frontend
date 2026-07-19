import {
  Alert,
  Button,
  Container,
  Group,
  Loader,
  Select,
  SimpleGrid,
  Stack,
  Stepper,
  Text,
  TextInput,
  Title,
} from "@mantine/core";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  MemberCard,
  useBandOptions,
  useCharacteristics,
  useCreateBand,
  useGenerateBandName,
  useGenerateCandidates,
} from "@/features/bands";
import type {
  Characteristic,
  CreateBandMemberSeed,
  MemberCandidate,
} from "@/features/bands";
import { ApiError } from "@/services/http";

const CANDIDATE_COUNT = 9;
const MIN_MEMBERS = 3;
const MAX_MEMBERS = 6;

/** Guided create-save wizard: band data → pick candidates → review & create. */
export function NewSavePage() {
  const navigate = useNavigate();
  const { data: options } = useBandOptions();
  const { data: characteristics } = useCharacteristics();

  const generateName = useGenerateBandName();
  const generateCandidates = useGenerateCandidates();
  const createBand = useCreateBand();

  const [step, setStep] = useState(0);
  const [name, setName] = useState("");
  const [theme, setTheme] = useState<string | null>(null);
  const [origin, setOrigin] = useState<string | null>(null);
  const [year, setYear] = useState<string | null>(null);
  const [candidates, setCandidates] = useState<MemberCandidate[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());

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

  function suggestName() {
    generateName.mutate(undefined, {
      onSuccess: (data) => setName(data.name),
    });
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
        happiness: c.happiness,
        characteristics: c.characteristics,
        skills: c.skills,
        biography: c.biography,
        primarySkill: c.primarySkill,
        joinYear: foundationYear,
      }));

    createBand.mutate(
      { name: name.trim(), theme, origin, foundationYear, members },
      { onSuccess: (band) => navigate(`/bands/${band.id}`) },
    );
  }

  return (
    <Container py="xl" size="lg">
      <Title order={2} mb="lg">
        Novo save
      </Title>

      <Stepper active={step} onStepClick={setStep} mb="xl">
        <Stepper.Step label="Banda" description="Dados da banda" />
        <Stepper.Step label="Integrantes" description="Escolha 3 a 6" />
        <Stepper.Step label="Revisão" description="Criar save" />
      </Stepper>

      {step === 0 && (
        <Stack maw={420}>
          <Group align="flex-end" gap="xs">
            <TextInput
              label="Nome da banda"
              value={name}
              onChange={(e) => setName(e.currentTarget.value)}
              flex={1}
            />
            <Button
              variant="light"
              onClick={suggestName}
              loading={generateName.isPending}
            >
              Gerar
            </Button>
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

      {step === 1 && (
        <Stack>
          <Group justify="space-between">
            <Text>
              Selecionados: {selected.size}/{MAX_MEMBERS} (mínimo {MIN_MEMBERS})
            </Text>
            <Button
              variant="light"
              onClick={rollCandidates}
              loading={generateCandidates.isPending}
            >
              Gerar novos candidatos
            </Button>
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
