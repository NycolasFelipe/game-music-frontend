import {
  Button,
  Group,
  MultiSelect,
  NumberInput,
  SimpleGrid,
  Textarea,
  TextInput,
} from "@mantine/core";
import { useState } from "react";
import { InsertModal } from "@/components/revista";
import { SKILL_LABELS, SKILL_ORDER } from "@/features/bands/labels";
import type {
  Characteristic,
  MemberCandidate,
  Skills,
} from "@/features/bands/types";

const GENDERS = [
  { value: "male", label: "Masculino" },
  { value: "female", label: "Feminino" },
  { value: "neutral", label: "Neutro" },
];

/** Skill labels read like the audition cards: mono, lowercase, no tracking. */
const SKILL_INPUT_STYLES = {
  label: {
    font: "400 12px var(--rv-mono)",
    textTransform: "lowercase",
    letterSpacing: 0,
  },
} as const;

/**
 * Editor for a generated member candidate. Enforces the same bounds the backend
 * revalidates on create (age 16–30, happiness -5..5, skills 0–10, 2–4 traits).
 * Mounted only while editing, so fields initialize from the candidate.
 */
export function MemberEditModal({
  candidate,
  characteristics,
  onClose,
  onSave,
}: {
  candidate: MemberCandidate;
  characteristics: Characteristic[];
  onClose: () => void;
  onSave: (member: MemberCandidate) => void;
}) {
  const [name, setName] = useState(candidate.name);
  const [age, setAge] = useState<number | string>(candidate.age);
  const [gender, setGender] = useState<string | null>(candidate.gender);
  const [happiness, setHappiness] = useState<number | string>(
    candidate.happiness,
  );
  const [skills, setSkills] = useState<Skills>({ ...candidate.skills });
  const [primarySkill, setPrimarySkill] = useState<string | null>(
    candidate.primarySkill,
  );
  const [traits, setTraits] = useState<string[]>(candidate.characteristics);
  const [biography, setBiography] = useState(candidate.biography);

  const traitOptions = characteristics.map((c) => ({
    value: c.id,
    label: c.name,
  }));

  const valid =
    name.trim() !== "" &&
    biography.trim() !== "" &&
    gender !== null &&
    primarySkill !== null &&
    traits.length >= 2 &&
    traits.length <= 4;

  function save() {
    if (!valid || !gender || !primarySkill) return;
    onSave({
      ...candidate,
      name: name.trim(),
      age: Number(age),
      gender,
      happiness: Number(happiness),
      skills,
      primarySkill,
      characteristics: traits,
      biography: biography.trim(),
    });
  }

  return (
    <InsertModal opened onClose={onClose} label="Ficha do candidato" title="Editar integrante" size="lg">
      <div className="rv-form">
        <div className="rv-field">
          <TextInput
            label="Nome"
            value={name}
            onChange={(e) => setName(e.currentTarget.value)}
            required
          />
        </div>

        <SimpleGrid cols={2} spacing="lg">
          <div className="rv-field">
            <NumberInput
              label="Idade"
              min={16}
              max={30}
              value={age}
              onChange={setAge}
              clampBehavior="strict"
              hideControls
            />
          </div>
          <div className="rv-field">
            <NumberInput
              label="Felicidade (−5 a 5)"
              min={-5}
              max={5}
              value={happiness}
              onChange={setHappiness}
              clampBehavior="strict"
              hideControls
            />
          </div>
        </SimpleGrid>

        <div className="rv-field">
          <span className="rv-field-label">Gênero</span>
          <div className="rv-seg" role="radiogroup" aria-label="Gênero">
            {GENDERS.map((g) => (
              <button
                key={g.value}
                type="button"
                role="radio"
                aria-checked={gender === g.value}
                className={gender === g.value ? "rv-on" : undefined}
                onClick={() => setGender(g.value)}
              >
                {g.label}
              </button>
            ))}
          </div>
        </div>

        <div className="rv-field">
          <MultiSelect
            label="Características (2 a 4)"
            data={traitOptions}
            value={traits}
            onChange={setTraits}
            maxValues={4}
            searchable
            error={traits.length < 2 ? "Escolha ao menos 2" : undefined}
          />
        </div>

        <div className="rv-field">
          <span className="rv-field-label">Habilidade principal</span>
          <div className="rv-seg" role="radiogroup" aria-label="Habilidade principal">
            {SKILL_ORDER.map((key) => (
              <button
                key={key}
                type="button"
                role="radio"
                aria-checked={primarySkill === key}
                className={primarySkill === key ? "rv-on" : undefined}
                onClick={() => setPrimarySkill(key)}
              >
                {SKILL_LABELS[key]}
              </button>
            ))}
          </div>
        </div>

        <div className="rv-field">
          <span className="rv-field-label">Habilidades (0 a 10)</span>
          <SimpleGrid cols={{ base: 2, sm: 3 }} spacing="lg">
            {SKILL_ORDER.map((key) => (
              <NumberInput
                key={key}
                label={SKILL_LABELS[key]}
                min={0}
                max={10}
                value={skills[key]}
                onChange={(value) =>
                  setSkills((prev) => ({ ...prev, [key]: Number(value) || 0 }))
                }
                clampBehavior="strict"
                hideControls
                styles={SKILL_INPUT_STYLES}
              />
            ))}
          </SimpleGrid>
        </div>

        <div className="rv-field">
          <Textarea
            label="Biografia"
            value={biography}
            onChange={(e) => setBiography(e.currentTarget.value)}
            autosize
            minRows={2}
            maxRows={6}
            required
            styles={{ input: { font: "400 16px/1.5 var(--rv-serif)" } }}
          />
        </div>
      </div>

      <Group justify="space-between" mt="lg">
        <Button variant="default" onClick={onClose}>
          Cancelar
        </Button>
        <Button onClick={save} disabled={!valid}>
          Salvar
        </Button>
      </Group>
    </InsertModal>
  );
}
