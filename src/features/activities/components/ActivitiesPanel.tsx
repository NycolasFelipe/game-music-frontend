import { Button, Text } from "@mantine/core";
import { useEffect, useMemo, useState } from "react";
import { InsertModal } from "@/components/revista";
import { ActivityDetail } from "@/features/activities/components/ActivityDetail";
import { ActivityOutcome } from "@/features/activities/components/ActivityOutcome";
import { EmptyTable } from "@/features/activities/components/EmptyTable";
import { activityOutcomeTitle } from "@/features/activities/format";
import { useActivityOptions, useBandActivities } from "@/features/activities/hooks/useActivities";
import { ActivityPicker } from "@/features/activities/components/ActivityPicker";
import type { ActivityResult, BandActivity } from "@/features/activities/types";
import { useCharacteristics } from "@/features/bands";
import type { BandDetail, Characteristic } from "@/features/bands";
import { useActiveEvents } from "@/features/events";
import { useDecisionsUi } from "@/features/decisions/store/decisions.store";
import { formatMoney } from "@/utils/money";
import { formatPeriod } from "@/utils/period";

/** Quantas saídas passadas a coluna mostra. */
const HISTORY_SIZE = 4;

/**
 * Coluna Convívio da aba Turno (ADR-0017): se já houve saída no semestre, as
 * últimas saídas (ou uma ilustração de mesa vazia, antes da primeira) e, no
 * rodapé, o botão que abre o encarte. A lista de convidados, a atividade e o resultado
 * acontecem dentro do encarte. Enquanto ele está aberto, uma decisão nascida
 * de uma noite que deu errado espera o encarte fechar.
 *
 * @param props.band - A banda.
 * @param props.heldThisTurn - Se a banda já saiu neste turno (painel do turno).
 */
export function ActivitiesPanel({
  band,
  heldThisTurn = false,
}: {
  band: BandDetail;
  heldThisTurn?: boolean;
}) {
  const [opened, setOpened] = useState(false);
  const [held, setHeld] = useState<{ result: ActivityResult; label: string } | null>(null);
  const setDeferred = useDecisionsUi((state) => state.setDeferred);
  const { data: options } = useActivityOptions(band.id);
  const { data: history } = useBandActivities(band.id);
  const { data: events } = useActiveEvents(band.id);
  const { data: characteristics } = useCharacteristics();
  const [detail, setDetail] = useState<BandActivity | null>(null);
  const catalog = useMemo(
    () => new Map<string, Characteristic>((characteristics ?? []).map((c) => [c.id, c])),
    [characteristics],
  );
  const past = (history ?? []).slice(0, HISTORY_SIZE);
  const labelOf = (id: string) => options?.activities.find((activity) => activity.id === id)?.label ?? id;

  useEffect(() => {
    setDeferred(opened);
    return () => setDeferred(false);
  }, [opened, setDeferred]);

  function openPicker() {
    setHeld(null);
    setOpened(true);
  }

  return (
    <div className="rv-col-body">
      {heldThisTurn && (
        <Text size="xs" ff="monospace" c="dimmed" mb="xs">
          A banda já saiu junta desta vez. O próximo convívio fica para o turno que vem.
        </Text>
      )}

      {past.length > 0 ? (
        <div className="rv-col-history">
          <div className="rv-kicker">Últimas saídas</div>
          {past.map((held) => (
            <button key={held.id} type="button" className="rv-listing" onClick={() => setDetail(held)}>
              <span className="rv-v">{labelOf(held.activityId)}</span>
              <span className="rv-n rv-neg">{formatMoney(-held.cost)}</span>
              <span className="rv-d">
                {formatPeriod(held.heldAtYear, held.bandId, "short")}
                {held.trouble ? " · deu treta" : ""}
              </span>
            </button>
          ))}
        </div>
      ) : (
        history && <EmptyTable />
      )}

      <div className="rv-col-foot">
        <Button onClick={openPicker} disabled={heldThisTurn}>
          Marcar convívio
        </Button>
      </div>

      <InsertModal
        opened={opened}
        onClose={() => setOpened(false)}
        label="Convívio · só quem vai recebe o efeito"
        title={held ? activityOutcomeTitle(held.result, held.label) : "Quem sai com quem"}
        size="lg"
      >
        {held ? (
          <ActivityOutcome result={held.result} band={band} onClose={() => setOpened(false)} />
        ) : (
          <ActivityPicker band={band} onHeld={(result, label) => setHeld({ result, label })} />
        )}
      </InsertModal>

      <InsertModal
        opened={detail !== null}
        onClose={() => setDetail(null)}
        label={detail ? `Convívio · ${formatPeriod(detail.heldAtYear, detail.bandId)}` : ""}
        title={detail ? labelOf(detail.activityId) : ""}
        size="lg"
      >
        {detail && (
          <ActivityDetail
            held={detail}
            band={band}
            catalog={catalog}
            troubleEvent={events?.find((event) => event.id === detail.troubleEventId) ?? null}
            onClose={() => setDetail(null)}
          />
        )}
      </InsertModal>
    </div>
  );
}
