import { Box, Stack, Title } from "@mantine/core";
import {
  Bar,
  BarChart,
  CartesianGrid,
  LabelList,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { tone } from "@/components/halftone";
import { BandTrends } from "@/features/bands/components/BandTrends";
import { SKILL_LABELS, SKILL_ORDER } from "@/features/bands/labels";
import type { BandDetail, Skills } from "@/features/bands/types";
import { formatPeriod } from "@/utils/period";
import { formatMoney } from "@/utils/money";

/** Minimal turn-history point (a Turn is assignable to this). */
interface TurnPoint {
  year: number;
  period: string;
  fanCount: number;
  balance?: number | null;
  happinessAvg?: number | null;
  relationshipAvg?: number | null;
}

const mean = (values: number[]) =>
  values.length ? values.reduce((sum, v) => sum + v, 0) / values.length : 0;

/** Uma casa da ficha de números (rótulo, valor e nota). */
function StatTile({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div>
      <span>{label}</span>
      <b>{value}</b>
      {sub && <div className="rv-caption" style={{ marginTop: 0 }}>{sub}</div>}
    </div>
  );
}

interface TooltipEntry {
  name?: string;
  value?: number | string;
  dataKey?: string | number;
}

function ChartTooltip({
  active,
  label,
  payload,
}: {
  active?: boolean;
  label?: string | number;
  payload?: TooltipEntry[];
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rv-chart-tip">
      <div className="rv-chart-tip-head">{label}</div>
      {payload.map((entry) => (
        <div key={String(entry.dataKey)} className="rv-chart-tip-row">
          <span>{entry.name}</span>
          <b>{entry.value}</b>
        </div>
      ))}
    </div>
  );
}

const axisTick = { fill: "var(--rv-soft)", fontSize: 11, fontFamily: "var(--rv-mono)" };
const gridStroke = "var(--rv-soft)";

/** Statistics tab: headline tiles, time-series trends, and skill profile. */
export function BandStatistics({
  band,
  turns,
}: {
  band: BandDetail;
  turns: TurnPoint[];
}) {
  const happiness = band.members.map((m) => m.happiness);
  const ages = band.members.map((m) => m.age);
  const relationLevels = band.relationships.map((r) => r.level);

  const skillData = SKILL_ORDER.map((key: keyof Skills) => ({
    skill: SKILL_LABELS[key],
    value: Number(mean(band.members.map((m) => m.skills[key])).toFixed(1)),
  }));

  return (
    <Stack gap="xl">
      <div>
        <div className="rv-kicker">Números</div>
        <h2 className="rv-head rv-md">A banda em números</h2>
      </div>
      <div className="rv-facts" style={{ ["--rv-n" as string]: 7 }}>
        <StatTile label="Fãs" value={band.fanCount.toLocaleString("pt-BR")} />
        <StatTile label="Caixa" value={formatMoney(band.balance)} />
        <StatTile
          label="Fama"
          value={`Nível ${band.fame.level}`}
          sub={band.fame.title}
        />
        <StatTile label="Período" value={formatPeriod(band.currentYear)} />
        <StatTile
          label="Felicidade média"
          value={mean(happiness).toFixed(1)}
          sub="escala -5 a 5"
        />
        <StatTile label="Idade média" value={mean(ages).toFixed(0)} sub="anos" />
        <StatTile
          label="Relação média"
          value={relationLevels.length ? mean(relationLevels).toFixed(1) : "—"}
          sub="escala -5 a 5"
        />
      </div>

      <div>
        <Title order={5} mb="sm">
          Evolução ao longo do tempo
        </Title>
        <BandTrends turns={turns} />
      </div>

      <div>
        <Title order={5} mb="sm">
          Perfil de habilidades (média da banda)
        </Title>
        <Box h={240}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={skillData}
              layout="vertical"
              margin={{ top: 4, right: 32, bottom: 4, left: 8 }}
            >
              <CartesianGrid stroke={gridStroke} strokeDasharray="1 4" horizontal={false} />
              <XAxis type="number" domain={[0, 10]} tick={axisTick} />
              <YAxis
                type="category"
                dataKey="skill"
                tick={axisTick}
                width={70}
              />
              <Tooltip content={<ChartTooltip />} cursor={{ fill: "var(--rv-ink)", fillOpacity: 0.06 }} />
              <Bar
                dataKey="value"
                name="Média"
                fill={tone(6)}
                stroke="var(--rv-ink)"
                strokeWidth={1}
              >
                <LabelList
                  dataKey="value"
                  position="right"
                  fill="var(--mantine-color-dimmed)"
                  fontSize={11}
                />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Box>
      </div>
    </Stack>
  );
}
