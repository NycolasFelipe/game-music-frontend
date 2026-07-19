import { Button, Group, Modal, Select, Stack, Switch, Text } from "@mantine/core";
import { useState } from "react";
import type {
  GenerateNameOptions,
  NameGenre,
  NameLanguage,
} from "@/features/bands/types";

const LANGUAGES = [
  { value: "pt", label: "Português" },
  { value: "en", label: "English" },
  { value: "es", label: "Español" },
];

const GENRES = [
  { value: "rock", label: "Rock" },
  { value: "metal", label: "Metal" },
  { value: "electronic", label: "Eletrônico" },
  { value: "punk", label: "Punk" },
];

/**
 * Configuration modal for the band-name generator. It only edits the options;
 * "Gerar Nome" hands them back so the caller generates with (and remembers)
 * them — so the config also drives the quick-generate button.
 *
 * Mounted only while open, so its fields initialize from the current options
 * on every open (no effect-based syncing needed).
 */
export function BandNameConfigModal({
  onClose,
  currentOptions,
  onGenerate,
}: {
  onClose: () => void;
  currentOptions: GenerateNameOptions;
  onGenerate: (options: GenerateNameOptions) => void;
}) {
  const [language, setLanguage] = useState<NameLanguage>(
    currentOptions.language ?? "pt",
  );
  const [includeArticle, setIncludeArticle] = useState(
    currentOptions.includeArticle ?? true,
  );
  const [genre, setGenre] = useState<string | null>(
    currentOptions.genre ?? null,
  );

  function handleGenerate() {
    onGenerate({
      language,
      includeArticle,
      genre: (genre as NameGenre | null) ?? undefined,
    });
    onClose();
  }

  return (
    <Modal
      opened
      onClose={onClose}
      title="Configurar gerador de nomes"
      centered
    >
      <Stack>
        <Text size="sm" c="dimmed">
          Personalize a geração de nomes de banda de acordo com suas
          preferências.
        </Text>

        <Select
          label="Idioma"
          description="Idioma usado para gerar o nome da banda"
          data={LANGUAGES}
          value={language}
          onChange={(value) => setLanguage((value as NameLanguage) ?? "pt")}
          allowDeselect={false}
        />

        <Switch
          label="Incluir artigos"
          description="Adiciona artigos (Os, A, The…) no início do nome"
          checked={includeArticle}
          onChange={(event) => setIncludeArticle(event.currentTarget.checked)}
        />

        <Select
          label="Gênero Musical (opcional)"
          description="Gera palavras específicas relacionadas ao gênero"
          data={GENRES}
          value={genre}
          onChange={setGenre}
          clearable
          placeholder="Nenhum selecionado"
        />

        <Group justify="flex-end" mt="md">
          <Button variant="subtle" onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={handleGenerate}>Gerar Nome</Button>
        </Group>
      </Stack>
    </Modal>
  );
}
