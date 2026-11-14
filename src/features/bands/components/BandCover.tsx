import { Link } from "react-router-dom";
import { DeleteBandButton } from "@/features/bands/components/DeleteBandButton";
import { useBand } from "@/features/bands/hooks/useBands";
import { BandPhoto } from "@/features/bands/portrait/BandPhoto";
import { resolveScene } from "@/features/bands/portrait/scenes";
import type { Band } from "@/features/bands/types";
import { formatPeriod } from "@/utils/period";

/**
 * A capa de uma banda na banca (ADR-0002): título, foto da formação no
 * cenário da banda e a ficha de estilo, fãs e fama. Busca o elenco da banda
 * para a foto.
 *
 * @param props.band - A banda (como vem da lista).
 * @param props.themeLabel - Estilo musical por extenso.
 */
export function BandCover({ band, themeLabel }: { band: Band; themeLabel: string }) {
  const { data: detail } = useBand(band.id);
  const name = band.name.trim();
  const cut = name.lastIndexOf(" ");

  return (
    <Link to={`/bands/${band.id}`} className="rv-mag">
      <div className="rv-meta">{formatPeriod(band.currentYear, band.id)}</div>
      <div className="rv-t">
        {cut > 0 ? name.slice(0, cut + 1) : ""}
        <em>{cut > 0 ? name.slice(cut + 1) : name}</em>
      </div>
      {detail ? (
        <BandPhoto
          members={detail.members}
          scene={resolveScene(band.id, band.photoScene)}
          label={`Capa da ${band.name}`}
          shape="square"
          namesOnHover={false}
        />
      ) : (
        <div className="rv-photo rv-sq" />
      )}
      <div className="rv-meta" style={{ marginTop: 8 }}>
        {themeLabel} · {band.fanCount.toLocaleString("pt-BR")} fãs · nível {band.fame.level}
      </div>
      <p style={{ margin: "8px 0 0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span className="rv-link">Continuar →</span>
        <span onClick={(event) => event.preventDefault()}>
          <DeleteBandButton bandId={band.id} bandName={band.name} />
        </span>
      </p>
    </Link>
  );
}
