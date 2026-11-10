import { Button } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { useMemo, useState } from "react";
import { ActivitiesPanel } from "@/features/activities";
import {
  BandPhoto,
  DepartureModal,
  resolveScene,
  SCENE_TEXT,
  SKILL_LABELS,
  useCharacteristics,
  useHappinessLevels,
} from "@/features/bands";
import type { BandDetail, Characteristic, Skills } from "@/features/bands";
import { useDecisionsUi, usePendingDecisions } from "@/features/decisions";
import { GigsColumn } from "@/features/gigs";
import { StudioColumn } from "@/features/releases";
import { useAdvanceTurn, useTurnPanel } from "@/features/turns";
import type { AdvanceTurnResult, TurnPanel } from "@/features/turns";
import type { FormerMember } from "@/types/former-member";

/** Número no formato brasileiro, arredondado. */
const money = (value: number) => Math.round(value).toLocaleString("pt-BR");

/** Número com sinal no formato brasileiro. */
function signed(value: number, digits = 1): string {
  const abs = Math.abs(value).toLocaleString("pt-BR", {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  });
  return value > 0 ? `+${abs}` : value < 0 ? `−${abs}` : `±${abs}`;
}

const firstName = (name: string) => name.split(" ")[0];

/** A matéria de capa do turno: o assunto mais urgente da edição. */
function coverStory(band: BandDetail, panel: TurnPanel | undefined, blocking: number) {
  const release = panel?.studio.release ?? null;
  if (release?.ready) {
    return {
      kicker: "Matéria de capa · Pronto para lançar",
      head: `"${release.title}" ficou pronto. E agora?`,
      deck:
        panel?.studio.nextMarketMultiplier != null && (panel?.studio.launchesThisYear ?? 0) > 0
          ? `A gravação terminou. Seria a ${(panel?.studio.launchesThisYear ?? 0) + 1}ª obra do ano, e o mercado paga ×${panel.studio.nextMarketMultiplier.toLocaleString("pt-BR")}.`
          : "A gravação terminou e o mercado está cheio de espaço para ela.",
      cta: "Lançar",
    };
  }
  if (blocking > 0) {
    return {
      kicker: "Matéria de capa · Decisão na mesa",
      head: blocking === 1 ? "Uma decisão segura a edição" : `${blocking} decisões seguram a edição`,
      deck: "Nada avança até a banda resolver o que está pendente.",
      cta: "Resolver",
    };
  }
  if (release) {
    return {
      kicker: "Matéria de capa · No estúdio",
      head: `"${release.title}" segue em gravação`,
      deck: `Falta${release.turnsLeft === 1 ? "" : "m"} ${release.turnsLeft} turno${release.turnsLeft === 1 ? "" : "s"} de estúdio. Enquanto isso, o palco paga as contas.`,
      cta: null,
    };
  }
  const worst = [...band.members].sort((a, b) => a.happiness - b.happiness)[0];
  return {
    kicker: "Matéria de capa · Entre discos",
    head: "Estúdio vazio, agenda aberta",
    deck: worst
      ? `Sem obra em produção. ${firstName(worst.name)} é quem mais precisa de atenção (humor ${signed(worst.happiness)}).`
      : "Sem obra em produção.",
    cta: null,
  };
}

/** Texto do aviso depois de fechar a edição (avançar o turno). */
function advanceMessage(result: AdvanceTurnResult, nameOf: (id: string) => string) {
  const lines = [
    result.activeEvent
      ? "Um evento requer sua decisão."
      : result.passiveEvent
        ? "Novidades na cena musical."
        : "Tudo tranquilo por enquanto.",
  ];
  if (result.salariesPaid > 0 || result.salariesDue > 0) {
    lines.push(
      `Folha: ${money(result.salariesPaid)} de ${money(result.salariesDue)} pagos` +
        (result.salariesFullyPaid ? "." : " (caixa insuficiente)."),
    );
  }
  if (result.salaryRaises.length > 0) {
    lines.push(
      `Salários ajustados: ${result.salaryRaises.map((r) => `${r.name} ${money(r.from)} → ${money(r.to)}`).join(", ")}.`,
    );
  }
  if (result.production) {
    const { title, turnsLeft, ready, newSession } = result.production;
    lines.push(
      ready
        ? `"${title}" saiu do estúdio e está pronta para lançar.`
        : `"${title}" segue em produção: falta${turnsLeft === 1 ? "" : "m"} ${turnsLeft} turno${turnsLeft === 1 ? "" : "s"}.` +
            (newSession ? " Uma decisão de estúdio apareceu." : ""),
    );
  }
  const atRisk = result.atRiskMemberIds.map(nameOf).join(", ");
  if (atRisk) lines.push(`Salário atrasado, risco de saída: ${atRisk}.`);
  const departed = result.departures.map((d) => d.name).join(", ");
  if (departed) lines.push(`Deixou a banda: ${departed}.`);
  return { text: lines.join(" "), alarm: Boolean(departed || atRisk || !result.salariesFullyPaid) };
}

/**
 * Aba Turno (ADR-0002): tudo o que se faz num turno numa tela só. A capa com a
 * foto da banda e a matéria do momento, as pendências, as colunas Palco,
 * Convívio e Estúdio, e o fechamento com a previsão do caixa e o botão que
 * avança o tempo. Pendências e previsão vêm do painel do turno (ADR-0022).
 */
export function BandTurnTab({ band }: { band: BandDetail }) {
  const { data: panel } = useTurnPanel(band.id);
  const { data: happinessLevels } = useHappinessLevels();
  const { data: characteristics } = useCharacteristics();
  const { blocking } = usePendingDecisions(band.id);
  const openDecisions = useDecisionsUi((state) => state.openDecisions);
  const advance = useAdvanceTurn(band.id);
  const [departures, setDepartures] = useState<FormerMember[]>([]);
  const [departureOpen, setDepartureOpen] = useState(false);

  const catalog = useMemo(
    () => new Map<string, Characteristic>((characteristics ?? []).map((c) => [c.id, c])),
    [characteristics],
  );
  const nameOf = (id: string) => band.members.find((m) => m.id === id)?.name ?? "um integrante";
  const roleOf = (skill: string) => SKILL_LABELS[skill as keyof Skills]?.toLowerCase() ?? skill;

  const scene = resolveScene(band.id, band.photoScene);
  const story = coverStory(band, panel, blocking.length);
  const pending = panel?.pending ?? [];
  const blockingCount = Math.max(blocking.length, pending.filter((p) => p.blocking).length);
  const forecast = panel?.forecast;

  function handleAdvance() {
    advance.mutate(undefined, {
      onSuccess: (result) => {
        const { text, alarm } = advanceMessage(result, nameOf);
        if (result.departures.length > 0) {
          setDepartures(result.departures);
          setDepartureOpen(true);
        }
        notifications.show({
          title: `Edição fechada · ${result.period}`,
          message: text,
          color: alarm ? "red" : "ink",
        });
      },
      onError: () =>
        notifications.show({ color: "red", message: "Resolva o que está pendente antes de fechar a edição." }),
    });
  }

  return (
    <>
      <DepartureModal
        members={departures}
        catalog={catalog}
        opened={departureOpen}
        onClose={() => setDepartureOpen(false)}
      />

      {/* Capa */}
      <div className="rv-cover">
        <div>
          <BandPhoto
            members={band.members}
            scene={scene}
            label={`Formação da ${band.name}`}
            tag={panel?.studio.release?.ready ? "Lançamento" : SCENE_TEXT[scene].tag}
          />
          <div className="rv-caption">
            A banda {SCENE_TEXT[scene].where}. Da esquerda:{" "}
            {band.members.map((m) => `${firstName(m.name)} (${roleOf(m.primarySkill)})`).join(", ")}.
          </div>
        </div>
        <div>
          <div className="rv-kicker">{story.kicker}</div>
          <h2 className="rv-head">{story.head}</h2>
          <p className="rv-deck">{story.deck}</p>
          <div className="rv-facts">
            <div>
              <span>Caixa</span>
              <b>{money(band.balance)}</b>
            </div>
            <div>
              <span>Fãs</span>
              <b>{money(band.fanCount)}</b>
            </div>
            <div>
              <span>Palco</span>
              <b>{panel ? panel.performance.toLocaleString("pt-BR", { maximumFractionDigits: 2 }) : "—"}</b>
            </div>
          </div>
          {story.cta && (
            <Button color="press" onClick={openDecisions}>
              {story.cta}
            </Button>
          )}
          <div className="rv-quotes">
            {band.members.map((member) => {
              const level = happinessLevels?.find(
                (l) => l.level === Math.max(-5, Math.min(5, Math.round(member.happiness))),
              );
              return (
                <div key={member.id} className={`rv-q ${member.happiness < -1 ? "rv-neg" : ""}`}>
                  <b className={member.happiness < -1 ? "rv-red" : undefined}>“{level?.name ?? "…"}.”</b>
                  <span className={member.happiness < -1 ? "rv-red" : undefined}>
                    {firstName(member.name)}, humor {signed(member.happiness)}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Pendências */}
      {pending.length > 0 && (
        <>
          <div className="rv-sectionhead">
            <h3>Antes de fechar</h3>
            <span>
              {blockingCount > 0
                ? `${blockingCount} decis${blockingCount === 1 ? "ão bloqueia" : "ões bloqueiam"} o fechamento`
                : "nada bloqueia o fechamento"}
            </span>
          </div>
          {pending.map((item) => (
            <button key={`${item.kind}-${item.id}`} type="button" className="rv-listing" onClick={openDecisions}>
              <span className="rv-v">{item.title}</span>
              <span className="rv-n">
                <span className="rv-link">{item.kind === "release-ready" ? "Lançar" : "Resolver"}</span>
              </span>
              <span className="rv-d">
                {item.kind === "active-event"
                  ? "evento da banda"
                  : item.kind === "studio-session"
                    ? "sessão de estúdio"
                    : "obra pronta"}
                {item.blocking ? " · bloqueia" : ""}
              </span>
            </button>
          ))}
        </>
      )}

      {/* Ações do turno */}
      <div className="rv-cols3">
        <section className="rv-col">
          <h3>Palco</h3>
          <GigsColumn band={band} previews={panel?.gig.previews} performance={panel?.performance} />
        </section>
        <section className="rv-col">
          <h3>Convívio</h3>
          <div className="rv-sub">Opcional · só quem vai recebe o efeito</div>
          <ActivitiesPanel band={band} heldThisTurn={panel?.activity.heldThisTurn} />
        </section>
        <section className="rv-col">
          <h3>Estúdio</h3>
          <StudioColumn
            band={band}
            launchesThisYear={panel?.studio.launchesThisYear}
            nextMarketMultiplier={panel?.studio.nextMarketMultiplier}
          />
        </section>
      </div>

      {/* Fechamento */}
      <div className="rv-closing">
        <div className="rv-ledger">
          <div>
            <span>Caixa agora</span>
            <span>{money(forecast?.balance ?? band.balance)}</span>
          </div>
          {(forecast?.royaltyPayouts ?? []).map((payout) => (
            <div key={payout.releaseId}>
              <span>Royalties de "{payout.title}"</span>
              <span className="rv-pos">+{money(payout.amount)}</span>
            </div>
          ))}
          {forecast && forecast.salaryRaises > 0 && (
            <div>
              <span>Reajustes automáticos</span>
              <span className="rv-neg">−{money(forecast.salaryRaises)}</span>
            </div>
          )}
          {forecast && (
            <div>
              <span>Folha de {band.members.length} integrantes</span>
              <span className="rv-neg">−{money(forecast.payroll)}</span>
            </div>
          )}
          {forecast && (
            <div>
              <b>Fechamento estimado</b>
              <b className={forecast.balanceAfter < 0 ? "rv-neg" : undefined}>{money(forecast.balanceAfter)}</b>
            </div>
          )}
          {forecast && (forecast.departingMemberIds?.length ?? 0) > 0 && (
            <div>
              <span className="rv-red">
                Sairia da banda neste fechamento: {(forecast.departingMemberIds ?? []).map(nameOf).join(", ")}
              </span>
              <span />
            </div>
          )}
          {forecast && forecast.atRiskMemberIds.length > 0 && (
            <div>
              <span className="rv-red">Sem dinheiro para pagar: {forecast.atRiskMemberIds.map(nameOf).join(", ")}</span>
              <span />
            </div>
          )}
        </div>
        <div style={{ textAlign: "right" }}>
          {blocking.length > 0 ? (
            <Button size="lg" color="press" onClick={openDecisions}>
              Resolver {blocking.length} decis{blocking.length === 1 ? "ão" : "ões"}
            </Button>
          ) : (
            <Button size="lg" color="press" onClick={handleAdvance} loading={advance.isPending}>
              Fechar a edição →
            </Button>
          )}
          <div className="rv-caption">
            {blocking.length > 0
              ? "Resolva as decisões para fechar."
              : "Avança o turno: royalties, folha e eventos."}
          </div>
        </div>
      </div>
    </>
  );
}
