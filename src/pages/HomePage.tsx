import { Loader, Text } from "@mantine/core";
import { Link } from "react-router-dom";
import { Masthead } from "@/components/revista";
import { useCurrentUser } from "@/features/auth";
import { BandCover, useBandOptions, useBands } from "@/features/bands";

/** A banca (ADR-0002): uma capa por save, mais a vaga para fundar uma banda nova. */
export function HomePage() {
  const { data: user } = useCurrentUser();
  const { data: bands, isLoading, isError } = useBands();
  const { data: options } = useBandOptions();

  const themeLabel = (id: string) => options?.themes.find((t) => t.id === id)?.label ?? id;

  return (
    <>
      <div className="rv-topline">
        <span>Banca do assinante · {user?.username ?? "…"}</span>
      </div>
      <Masthead title="A banca" small />
      <div className="rv-issue">
        <span>
          {bands ? `${bands.length} banda${bands.length === 1 ? "" : "s"} em circulação` : "Carregando…"}
        </span>
      </div>

      {isLoading && <Loader mt="md" color="ink" />}
      {isError && (
        <Text c="red" mt="md">
          Falha ao carregar seus saves.
        </Text>
      )}

      <div className="rv-covers">
        {(bands ?? []).map((band) => (
          <BandCover key={band.id} band={band} themeLabel={themeLabel(band.theme)} />
        ))}
        <Link to="/saves/new" className="rv-mag rv-new">
          <div>
            <div className="rv-t" style={{ fontSize: 28 }}>
              Nova <em>banda</em>
            </div>
            <div className="rv-meta">Fundar uma banda e lançar a edição nº 1</div>
          </div>
        </Link>
      </div>
    </>
  );
}
