import { Button, Stack, Text } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { useState } from "react";
import { GuestPicker } from "@/features/activities/components/GuestPicker";
import {
  useActivityOptions,
  useBandActivities,
  useHoldActivity,
} from "@/features/activities/hooks/useActivities";
import type { ActivityOption } from "@/features/activities/types";
import type { BandDetail } from "@/features/bands";
import { formatPeriod } from "@/utils/period";
import { formatMoney } from "@/utils/money";

/** How a composed risk reads to the player — no percentages on the table. */
function riskBadge(chance: number): { label: string; high: boolean } {
  if (chance >= 0.4) return { label: "risco alto", high: true };
  if (chance >= 0.15) return { label: "risco médio", high: false };
  return { label: "risco baixo", high: false };
}

/**
 * Spending cash on the cast (ADR-0017). The guest list is the decision: the
 * effect only reaches who went, so taking the two who cannot stand each other
 * is both the only way to mend that bond and the likeliest way to blow it up.
 */
export function ActivitiesPanel({
  band,
  heldThisTurn = false,
}: {
  band: BandDetail;
  /** Whether the band already went out this turn (from the turn panel). */
  heldThisTurn?: boolean;
}) {
  const { data: options } = useActivityOptions(band.id);
  const { data: history } = useBandActivities(band.id);
  const hold = useHoldActivity(band.id);
  const [guests, setGuests] = useState<string[]>([]);

  const memberName = (id: string) =>
    band.members.find((member) => member.id === id)?.name ?? "alguém";

  function toggleGuest(id: string) {
    setGuests((current) =>
      current.includes(id)
        ? current.filter((guest) => guest !== id)
        : [...current, id],
    );
  }

  /** The lowest relationship level among the chosen guests, if any. */
  const worstLevel = band.relationships
    .filter(
      (relationship) =>
        guests.includes(relationship.memberAId) &&
        guests.includes(relationship.memberBId),
    )
    .reduce<number | null>(
      (worst, relationship) =>
        worst === null || relationship.level < worst ? relationship.level : worst,
      null,
    );

  function costOf(activity: ActivityOption): number | null {
    return (
      activity.costs.find((entry) => entry.participants === guests.length)
        ?.cost ?? null
    );
  }

  function riskOf(activity: ActivityOption): number {
    const hostility = worstLevel === null ? 0 : Math.max(0, -worstLevel);
    return Math.min(
      options?.troubleChanceMax ?? 1,
      activity.troubleChance + hostility * (options?.hostilityRisk ?? 0),
    );
  }

  function handleHold(activity: ActivityOption) {
    hold.mutate(
      { activityId: activity.id, participantIds: guests },
      {
        onSuccess: (result) => {
          const mended = result.relationshipChanges
            .filter((change) => change.to !== change.from)
            .map(
              (change) =>
                `${memberName(change.memberAId)} × ${memberName(change.memberBId)} ${change.from} → ${change.to}`,
            )
            .join(", ");
          notifications.show({
            title: result.trouble
              ? `${activity.label}, e a noite virou`
              : activity.label,
            message:
              `Custou ${formatMoney(result.activity.cost)} · humor ${result.activity.happinessDelta > 0 ? "+" : ""}${result.activity.happinessDelta.toString().replace(".", ",")}` +
              (mended ? ` · ${mended}` : "") +
              (result.trouble ? " · Uma decisão apareceu." : ""),
            color: result.trouble ? "orange" : "teal",
          });
          setGuests([]);
        },
        onError: () =>
          notifications.show({
            color: "red",
            message: "Não foi possível marcar esta confraternização.",
          }),
      },
    );
  }

  return (
    <Stack gap="sm">
      {heldThisTurn && (
        <Text size="xs" ff="monospace" c="dimmed">
          Já houve convívio neste turno.
        </Text>
      )}
      <div>
        <GuestPicker
          members={band.members}
          relationships={band.relationships}
          selected={guests}
          onToggle={toggleGuest}
        />
        {worstLevel !== null && worstLevel < 0 && (
          <p className="rv-note">
            Tem gente na lista que não se suporta: é o que mais compensa e o que mais arrisca.
          </p>
        )}
      </div>

      <div>
        {(options?.activities ?? []).map((activity) => {
          const cost = costOf(activity);
          const fits =
            guests.length >= activity.minParticipants &&
            guests.length <= activity.maxParticipants;
          const affordable = cost !== null && band.balance >= cost;
          const risk = riskBadge(riskOf(activity));

          return (
            <div key={activity.id} className="rv-classified" style={{ cursor: "default" }}>
              <b>
                {activity.label}
                {fits && cost !== null ? ` — ${formatMoney(cost)}` : ""}
              </b>
              <p>
                Humor +{activity.happinessGain.toString().replace(".", ",")}, relação +
                {activity.relationshipGain}, {activity.minParticipants}–{activity.maxParticipants} pessoas,{" "}
                <span className={risk.high ? "rv-red" : undefined}>{risk.label}</span>.
              </p>
              <Button
                mt={8}
                size="compact-xs"
                variant={fits && affordable ? "filled" : "default"}
                disabled={!fits || !affordable}
                loading={hold.isPending}
                onClick={() => handleHold(activity)}
              >
                {!fits
                  ? `Leve ${activity.minParticipants}–${activity.maxParticipants}`
                  : !affordable
                    ? "Caixa insuficiente"
                    : `Marcar · ${cost !== null ? formatMoney(cost) : ""}`}
              </Button>
            </div>
          );
        })}
      </div>

      {(history ?? []).length > 0 && (
        <div className="rv-ledger">
          {(history ?? []).slice(0, 3).map((held) => (
            <div key={held.id}>
              <span>
                {(options?.activities ?? []).find((activity) => activity.id === held.activityId)?.label ??
                  held.activityId}{" "}
                · {formatPeriod(held.heldAtYear)}
                {held.trouble ? " · deu treta" : ""}
              </span>
              <span className="rv-neg">{formatMoney(-held.cost)}</span>
            </div>
          ))}
        </div>
      )}
    </Stack>
  );
}
