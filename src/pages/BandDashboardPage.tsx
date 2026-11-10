import { Button, Loader, Stack, Text, Title } from "@mantine/core";
import { IconArrowLeft } from "@tabler/icons-react";
import { Link, Navigate, useNavigate, useParams } from "react-router-dom";
import { MagazineIndex } from "@/components/revista";
import {
  BandGameOptions,
  BandHeader,
  BandStatistics,
  DeleteBandButton,
  FormerMembersTab,
  useBand,
  useBandOptions,
} from "@/features/bands";
import { DecisionsModal } from "@/features/decisions";
import {
  DiscographyTab,
  ReleaseRevealHost,
  VinylPreview,
} from "@/features/releases";
import { useTurns } from "@/features/turns";
import { DEV_OPTIONS_ENABLED } from "@/config/app";
import { BandCastTab } from "@/pages/BandCastTab";
import { BandTimelineTab } from "@/pages/BandTimelineTab";
import { BandTurnTab } from "@/pages/BandTurnTab";

/** As seções da revista da banda, na ordem do índice (ADR-0002). */
const SECTIONS = [
  { id: "turno", label: "Turno" },
  { id: "elenco", label: "Elenco" },
  { id: "discografia", label: "Discografia" },
  { id: "numeros", label: "Números" },
  { id: "arquivo", label: "Arquivo" },
  { id: "ex-integrantes", label: "Ex-integrantes" },
  { id: "expediente", label: "Expediente" },
  ...(DEV_OPTIONS_ENABLED ? [{ id: "dev", label: "Oficina (dev)" }] : []),
] as const;

type SectionId = (typeof SECTIONS)[number]["id"];

/**
 * A edição da banda: cabeçalho, índice e a seção aberta (na URL). A central de
 * decisões e a revelação de lançamento ficam fora das seções, para alcançar o
 * jogador onde ele estiver (ADR-0001).
 */
export function BandDashboardPage() {
  const { bandId = "", section } = useParams();
  const navigate = useNavigate();
  const { data: band, isLoading, isError } = useBand(bandId);
  const { data: options } = useBandOptions();
  const { data: turns } = useTurns(bandId);

  const current = SECTIONS.find((s) => s.id === section)?.id as SectionId | undefined;
  if (section && !current) {
    return <Navigate to={`/bands/${bandId}`} replace />;
  }
  const open: SectionId = current ?? "turno";

  const label = (list: { id: string; label: string }[] | undefined, id: string) =>
    list?.find((o) => o.id === id)?.label ?? id;

  const last = turns?.[turns.length - 1];
  const previous = turns?.[turns.length - 2];
  const balanceDelta =
    last?.balance != null && previous?.balance != null ? last.balance - previous.balance : null;

  return (
    <>
      {isLoading && <Loader mt="md" color="ink" />}
      {isError && (
        <Text c="red" mt="md">
          Falha ao carregar o save.
        </Text>
      )}

      {band && (
        <>
          <DecisionsModal band={band} />
          <ReleaseRevealHost />

          <BandHeader
            band={band}
            themeLabel={label(options?.themes, band.theme)}
            originLabel={label(options?.origins, band.origin)}
            issueNumber={(turns?.length ?? 0) + 1}
            balanceDelta={balanceDelta}
          />
          <MagazineIndex
            sections={SECTIONS.map((s) => ({
              to: s.id === "turno" ? `/bands/${band.id}` : `/bands/${band.id}/${s.id}`,
              label: s.label,
              active: s.id === open,
            }))}
          />

          <section style={{ marginTop: 20 }}>
            {open === "turno" && <BandTurnTab band={band} />}
            {open === "elenco" && <BandCastTab band={band} />}
            {open === "discografia" && <DiscographyTab band={band} />}
            {open === "numeros" && <BandStatistics band={band} turns={turns ?? []} />}
            {open === "arquivo" && <BandTimelineTab band={band} />}
            {open === "ex-integrantes" && <FormerMembersTab bandId={band.id} />}
            {open === "expediente" && (
              <Stack gap="xl">
                <div>
                  <div className="rv-kicker">Expediente</div>
                  <Title order={2} className="rv-head rv-md">
                    Quem manda nesta edição
                  </Title>
                </div>
                <BandGameOptions band={band} />
                <Stack gap="md" maw={420}>
                  <div className="rv-sectionhead">
                    <h3>O save</h3>
                  </div>
                  <Button
                    component={Link}
                    to="/"
                    variant="default"
                    leftSection={<IconArrowLeft size={16} />}
                    w="fit-content"
                  >
                    Voltar à banca
                  </Button>
                  <DeleteBandButton
                    mode="button"
                    bandId={band.id}
                    bandName={band.name}
                    onDeleted={() => navigate("/")}
                  />
                </Stack>
              </Stack>
            )}
            {open === "dev" && DEV_OPTIONS_ENABLED && (
              <Stack gap="xl">
                <div>
                  <div className="rv-kicker">Oficina</div>
                  <Title order={2} className="rv-head rv-md">
                    Ferramentas de desenvolvimento
                  </Title>
                  <Text size="sm" c="dimmed">
                    Só aparecem durante o desenvolvimento e ficam de fora da versão final do jogo.
                  </Text>
                </div>
                <VinylPreview />
              </Stack>
            )}
          </section>
        </>
      )}
    </>
  );
}
