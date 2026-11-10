import { Link } from "react-router-dom";
import { Masthead } from "@/components/revista";
import type { BandDetail } from "@/features/bands/types";
import { formatPeriod } from "@/utils/period";
import { formatMoney } from "@/utils/money";

/** Número com sinal, no formato brasileiro. */
function signed(value: number, digits = 0): string {
  const abs = Math.abs(value).toLocaleString("pt-BR", {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  });
  return value > 0 ? `+${abs}` : value < 0 ? `−${abs}` : `±${abs}`;
}

/**
 * Cabeçalho da edição (ADR-0002): a linha de serviço (número, período, origem,
 * caixa), o nome da banda como logotipo e a faixa da fama. A fama ganha linha
 * própria porque é uma posição, não um montante: diz em que palcos a banda
 * entra (ADR-0016) e quanto falta para o próximo degrau.
 *
 * @param props.band - A banda.
 * @param props.themeLabel - Estilo musical por extenso.
 * @param props.originLabel - Cidade de origem por extenso.
 * @param props.issueNumber - Número da edição (o turno em curso).
 * @param props.balanceDelta - Variação do caixa desde o turno anterior.
 */
export function BandHeader({
  band,
  themeLabel,
  originLabel,
  issueNumber,
  balanceDelta,
}: {
  band: BandDetail;
  themeLabel: string;
  originLabel: string;
  issueNumber?: number;
  balanceDelta?: number | null;
}) {
  const { fame } = band;
  const span = fame.nextLevelAtFans === null ? 0 : fame.nextLevelAtFans - fame.currentLevelMinFans;
  const climbed = span > 0 ? band.fanCount - fame.currentLevelMinFans : 0;
  const progress = span > 0 ? Math.min(100, (climbed / span) * 100) : 100;
  const missing = fame.nextLevelAtFans === null ? 0 : fame.nextLevelAtFans - band.fanCount;
  const happiness =
    band.members.length > 0
      ? band.members.reduce((sum, m) => sum + m.happiness, 0) / band.members.length
      : null;

  return (
    <header>
      <div className="rv-topline">
        <Link to="/">← Banca</Link>
        <span>
          {issueNumber ? `Nº ${issueNumber} · ` : ""}
          {formatPeriod(band.currentYear)}
        </span>
        <span>
          {originLabel} · <span>{themeLabel}</span> · <span>desde {band.foundationYear}</span>
        </span>
        <span>
          Caixa <span className={band.balance < 0 ? "rv-neg" : undefined}>{formatMoney(band.balance)}</span>
          {balanceDelta !== undefined && balanceDelta !== null && (
            <>
              {" · "}
              <span className={balanceDelta >= 0 ? "rv-pos" : "rv-neg"}>{formatMoney(balanceDelta, { signed: true })}</span>
            </>
          )}
        </span>
      </div>
      <Masthead title={band.name} />
      <div className="rv-issue">
        <span>
          Fama <b>{`Nível ${fame.level} · ${fame.title}`}</b>
          <span className="rv-fame" role="progressbar" aria-valuenow={Math.round(progress)} aria-valuemin={0} aria-valuemax={100}>
            <i style={{ width: `${progress}%` }} />
          </span>
        </span>
        <span>{fame.subtitle}</span>
        <span>
          <span>{band.fanCount.toLocaleString("pt-BR")}</span> fãs ·{" "}
          {fame.isMaxLevel
            ? "No topo da escada"
            : `faltam ${missing.toLocaleString("pt-BR")} fãs para o Nível ${fame.level + 1}`}
        </span>
        {happiness !== null && <span>Humor médio {signed(happiness, 2)}</span>}
      </div>
    </header>
  );
}
