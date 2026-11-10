import {
  ActionIcon,
  Alert,
  Button,
  Group,
  Loader,
  Modal,
  Select,
  Text,
  TextInput,
  Tooltip,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import {
  IconDice,
  IconSettings,
} from "@tabler/icons-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useBlocker, useNavigate } from "react-router-dom";
import { Masthead } from "@/components/revista";
import {
  StyleProfile,
  aspectList,
  keyAspects,
  useGenreProfiles,
} from "@/features/releases";
import {
  BandNameConfigModal,
  BandPhoto,
  MemberCard,
  resolveScene,
  MemberEditModal,
  useBandOptions,
  useCharacteristics,
  useCreateBand,
  useGenerateBandNames,
  useGenerateCandidates,
  useRegenerateAvatar,
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
  const { data: genreProfiles } = useGenreProfiles();
  const { data: characteristics } = useCharacteristics();

  const generateName = useGenerateBandNames();
  const generateCandidates = useGenerateCandidates();
  const regenerateAvatar = useRegenerateAvatar();
  const createBand = useCreateBand();
  const [nameModalOpened, nameModal] = useDisclosure(false);
  const [regeneratingAvatarId, setRegeneratingAvatarId] = useState<
    string | null
  >(null);

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

  function regenerateAvatarFor(candidate: MemberCandidate) {
    setRegeneratingAvatarId(candidate.id);
    regenerateAvatar.mutate({ gender: candidate.gender, age: candidate.age }, {
      onSuccess: (data) => {
        setCandidates((cs) =>
          cs.map((c) =>
            c.id === candidate.id
              ? { ...c, avatar: data.avatar, appearance: data.appearance ?? c.appearance }
              : c,
          ),
        );
      },
      onSettled: () => setRegeneratingAvatarId(null),
    });
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
        appearance: c.appearance ?? undefined,
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

  const chosen = candidates.filter((c) => selected.has(c.id));
  const themeName = options?.themes.find((t) => t.id === theme)?.label;
  const originName = options?.origins.find((o) => o.id === origin)?.label;
  const STEPS = ["A banda", "Audições", "Revisão"];
  const formationPhoto = (tag: string) =>
    <BandPhoto
      members={chosen.map((c) => ({ ...c, happiness: c.happiness ?? 0 }))}
      scene={resolveScene(name || "nova")}
      label={chosen.length > 0 ? "Formação escolhida" : "Cenário da foto, ainda sem a banda"}
      tag={tag}
    />;

  return (
    <>
      <div className="rv-topline">
        <Link to="/">← Banca</Link>
        <span>Nova banda · passo {step + 1} de 3</span>
        <button type="button" className="rv-link" style={{ color: "var(--rv-soft)" }} onClick={() => navigate("/")}>
          Cancelar
        </button>
      </div>
      <Masthead title={STEPS[step] ?? "Nova banda"} small />
      <nav className="rv-index" aria-label="Passos">
        {STEPS.map((label, i) => (
          <button
            key={label}
            type="button"
            className={i === step ? "rv-on" : undefined}
            disabled={i > step}
            aria-current={i === step ? "step" : undefined}
            onClick={() => setStep(i)}
          >
            <span className="rv-pg">{i + 1}</span>
            {label}
          </button>
        ))}
      </nav>

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

      {step === 0 && (
        <div className="rv-cols2" style={{ marginTop: 20 }}>
          <div className="rv-form">
            <div className="rv-kicker">Ficha da banda</div>
            <p className="rv-deck" style={{ marginTop: 6 }}>
              Nome, estilo, cidade e década. Quem toca sai das audições, no próximo passo.
            </p>
            <button type="button" className="rv-link" onClick={randomizeBand} disabled={!options}>
              Sortear tudo
            </button>

            <div className="rv-field">
              <Group align="flex-end" gap="xs" wrap="nowrap">
                <TextInput
                  label="Nome da banda"
                  placeholder="Como a banda vai se chamar"
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
            </div>
            <div className="rv-field">
              <Select
                label="Estilo"
                placeholder="Escolha o estilo"
                data={(options?.themes ?? []).map((t) => ({ value: t.id, label: t.label }))}
                value={theme}
                onChange={setTheme}
                searchable
                renderOption={({ option }) => {
                  const weights = genreProfiles?.find((p) => p.style === option.value)?.weights;
                  return (
                    <div>
                      <div>{option.label}</div>
                      {weights && (
                        <div className="rv-caption" style={{ marginTop: 2 }}>
                          {aspectList(keyAspects(weights))}
                        </div>
                      )}
                    </div>
                  );
                }}
              />
              {theme && (
                <StyleProfile
                  style={theme}
                  description={options?.themes.find((t) => t.id === theme)?.description}
                />
              )}
            </div>
            <div className="rv-field">
              <Select
                label="Origem"
                placeholder="Escolha a cidade"
                data={(options?.origins ?? []).map((o) => ({ value: o.id, label: o.label }))}
                value={origin}
                onChange={setOrigin}
                searchable
              />
            </div>
            <div className="rv-field">
              <span className="rv-field-label">Década de fundação</span>
              <div className="rv-seg" role="radiogroup" aria-label="Década de fundação">
                {(options?.foundationYears ?? []).map((y) => (
                  <button
                    key={y}
                    type="button"
                    role="radio"
                    aria-checked={year === String(y)}
                    className={year === String(y) ? "rv-on" : undefined}
                    onClick={() => setYear(String(y))}
                  >
                    {y}
                  </button>
                ))}
              </div>
            </div>
            <Button mt="md" disabled={!bandStepValid} onClick={goToMembers}>
              Próximo: audições →
            </Button>
          </div>
          <div>
            {formationPhoto("Edição nº 1")}
            {name && (
              <p className="rv-caption">
                {[name, themeName, originName].filter(Boolean).join(" · ")}.
              </p>
            )}
          </div>
        </div>
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
            setCandidates((cs) => cs.map((c) => (c.id === updated.id ? updated : c)));
            setEditing(null);
          }}
        />
      )}

      {step === 1 && (
        <>
          <div className="rv-issue" style={{ borderTopWidth: 1, marginTop: 16 }}>
            <span>
              Selecionados <b>{selected.size}</b> de {MAX_MEMBERS} · mínimo {MIN_MEMBERS}
            </span>
            <button
              type="button"
              className="rv-link"
              onClick={selectRandomMembers}
              disabled={candidates.length === 0}
            >
              Escolher ao acaso
            </button>
            <button
              type="button"
              className="rv-link"
              onClick={rollCandidates}
              disabled={generateCandidates.isPending}
            >
              {generateCandidates.isPending ? "Chamando…" : "Novos candidatos"}
            </button>
          </div>

          {generateCandidates.isPending && <Loader mt="md" color="ink" />}
          {generateCandidates.isError && <Alert color="red" mt="md">Falha ao gerar candidatos.</Alert>}

          <div className="rv-roster">
            {candidates.map((candidate) => (
              <MemberCard
                key={candidate.id}
                member={candidate}
                catalog={catalog}
                selected={selected.has(candidate.id)}
                onToggle={() => toggle(candidate.id)}
                crop="wide"
                onRegenerateAvatar={() => regenerateAvatarFor(candidate)}
                avatarRegenerating={regeneratingAvatarId === candidate.id}
                actions={
                  <button
                    type="button"
                    className="rv-link"
                    aria-label="Editar integrante"
                    onClick={(event) => {
                      event.stopPropagation();
                      setEditing(candidate);
                    }}
                  >
                    Editar ficha
                  </button>
                }
              />
            ))}
          </div>

          <div className="rv-closing">
            <div>
              <Button variant="default" onClick={() => setStep(0)}>
                ← Voltar
              </Button>
            </div>
            <Button disabled={!membersStepValid} onClick={() => setStep(2)}>
              Próximo: revisão →
            </Button>
          </div>
        </>
      )}

      {step === 2 && (
        <>
          <div className="rv-cover">
            <div>
              {formationPhoto("Edição nº 1")}
              <p className="rv-caption">
                Da esquerda: {chosen.map((c) => c.name.split(" ")[0]).join(", ") || "ninguém ainda"}.
              </p>
            </div>
            <div>
              <div className="rv-kicker">Estreia</div>
              <h2 className="rv-head">{name || "Banda sem nome"}</h2>
              <p className="rv-deck">
                {themeName ?? "Estilo a definir"} · {originName ?? "origem a definir"} · fundada em {year ?? "—"}.
              </p>
              <div className="rv-facts">
                <div>
                  <span>Integrantes</span>
                  <b>{selected.size}</b>
                </div>
                <div>
                  <span>Fãs</span>
                  <b>0</b>
                </div>
                <div>
                  <span>Fama</span>
                  <b>Anônimos</b>
                </div>
              </div>
              {createBand.isError && (
                <Alert color="red" title="Falha ao criar o save">
                  {createBand.error instanceof ApiError ? createBand.error.message : "Erro inesperado."}
                </Alert>
              )}
            </div>
          </div>
          <div className="rv-closing">
            <div>
              <Button variant="default" onClick={() => setStep(1)}>
                ← Voltar
              </Button>
            </div>
            <Button size="lg" color="press" onClick={create} loading={createBand.isPending}>
              Lançar a edição nº 1 →
            </Button>
          </div>
        </>
      )}
    </>
  );
}
