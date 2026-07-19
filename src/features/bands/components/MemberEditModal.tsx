import {
  Button,
  Group,
  Modal,
  MultiSelect,
  NumberInput,
  Select,
  SimpleGrid,
  Stack,
  Text,
  Textarea,
  TextInput,
} from "@mantine/core";
import { useState } from "react";
import { SKILL_LABELS, SKILL_ORDER } from "@/features/bands/labels";
import type {
  Characteristic,
  MemberCandidate,
  Skills,
} from "@/features/bands/types";

const GENDERS = [
  { value: "male", label: "Masculino" },
  { value: "female", label: "Feminino" },
];

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
  const skillOptions = SKILL_ORDER.map((key) => ({
    value: key,
    label: SKILL_LABELS[key],
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
    <Modal opened onClose={onClose} title="Editar integrante" centered size="lg">
      <Stack>
        <TextInput
          label="Nome"
          value={name}
          onChange={(e) => setName(e.currentTarget.value)}
          required
        />

        <Group grow>
          <NumberInput
            label="Idade"
            min={16}
            max={30}
            value={age}
            onChange={setAge}
            clampBehavior="strict"
          />
          <Select
            label="Gênero"
            data={GENDERS}
            value={gender}
            onChange={setGender}
            allowDeselect={false}
          />
          <NumberInput
            label="Felicidade"
            min={-5}
            max={5}
            value={happiness}
            onChange={setHappiness}
            clampBehavior="strict"
          />
        </Group>

        <MultiSelect
          label="Características (2 a 4)"
          data={traitOptions}
          value={traits}
          onChange={setTraits}
          maxValues={4}
          searchable
          error={traits.length < 2 ? "Escolha ao menos 2" : undefined}
        />

        <Select
          label="Habilidade principal"
          data={skillOptions}
          value={primarySkill}
          onChange={setPrimarySkill}
          allowDeselect={false}
        />

        <div>
          <Text size="sm" fw={500} mb={4}>
            Habilidades (0–10)
          </Text>
          <SimpleGrid cols={{ base: 2, sm: 3 }}>
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
              />
            ))}
          </SimpleGrid>
        </div>

        <Textarea
          label="Biografia"
          value={biography}
          onChange={(e) => setBiography(e.currentTarget.value)}
          autosize
          minRows={2}
          maxRows={6}
          required
        />

        <Group justify="flex-end" mt="sm">
          <Button variant="subtle" onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={save} disabled={!valid}>
            Salvar
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}
