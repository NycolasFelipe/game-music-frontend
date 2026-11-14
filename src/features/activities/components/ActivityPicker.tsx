import { Button, Stack } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { useState } from "react";
import { GuestPicker } from "@/features/activities/components/GuestPicker";
import {
  useActivityOptions,
  useHoldActivity,
} from "@/features/activities/hooks/useActivities";
import type { ActivityOption, ActivityResult } from "@/features/activities/types";
import type { BandDetail } from "@/features/bands";
import { formatMoney } from "@/utils/money";

/** How a composed risk reads to the player — no percentages on the table. */
function riskBadge(chance: number): { label: string; high: boolean } {
  if (chance >= 0.4) return { label: "risco alto", high: true };
  if (chance >= 0.15) return { label: "risco médio", high: false };
  return { label: "risco baixo", high: false };
}

/**
 * The night-out choice inside the Convívio insert (ADR-0017). The guest list is
 * the decision: the effect only reaches who went, so taking the two who cannot
 * stand each other is both the only way to mend that bond and the likeliest
 * way to blow it up.
 *
 * @param props.band - The band.
 * @param props.onHeld - Called with the result and the activity's name.
 */
export function ActivityPicker({
  band,
  onHeld,
}: {
  band: BandDetail;
  onHeld: (result: ActivityResult, label: string) => void;
}) {
  const { data: options } = useActivityOptions(band.id);
  const hold = useHoldActivity(band.id);
  const [guests, setGuests] = useState<string[]>([]);
  const [pickedId, setPickedId] = useState<string | null>(null);

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

  // The first activity leads until the player picks another one.
  const picked =
    options?.activities.find((activity) => activity.id === pickedId) ??
    options?.activities[0] ??
    null;
  const pickedCost = picked ? costOf(picked) : null;
  const pickedFits =
    picked !== null &&
    guests.length >= picked.minParticipants &&
    guests.length <= picked.maxParticipants;
  const pickedAffordable = pickedCost !== null && band.balance >= pickedCost;

  function handleHold(activity: ActivityOption) {
    hold.mutate(
      { activityId: activity.id, participantIds: guests },
      {
        onSuccess: (result) => {
          onHeld(result, activity.label);
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
      <div>
        <GuestPicker
          members={band.members}
          relationships={band.relationships}
          selected={guests}
          onToggle={toggleGuest}
          onSetAll={setGuests}
        />
        {worstLevel !== null && worstLevel < 0 && (
          <p className="rv-note">
            Tem gente na lista que não se suporta.
          </p>
        )}
      </div>

      <div>
        {(options?.activities ?? []).map((activity) => {
          const cost = costOf(activity);
          const fits =
            guests.length >= activity.minParticipants &&
            guests.length <= activity.maxParticipants;
          const risk = riskBadge(riskOf(activity));
          const isPicked = activity.id === picked?.id;

          return (
            <button
              key={activity.id}
              type="button"
              className={`rv-listing ${isPicked ? "rv-sel" : ""}`}
              aria-pressed={isPicked}
              onClick={() => setPickedId(activity.id)}
            >
              <span className="rv-v">{activity.label}</span>
              <span className="rv-n">
                {fits && cost !== null
                  ? formatMoney(cost)
                  : `${activity.minParticipants}–${activity.maxParticipants} pess.`}
              </span>
              <span className="rv-d">
                humor +{activity.happinessGain.toString().replace(".", ",")} · relação +
                {activity.relationshipGain}
                {options ? ` (até +${options.relationshipCap})` : ""} · <span className={risk.high ? "rv-red" : undefined}>{risk.label}</span>
              </span>
            </button>
          );
        })}
      </div>

      {picked && (
        <div>
          <Button
            color="press"
            disabled={!pickedFits || !pickedAffordable}
            loading={hold.isPending}
            onClick={() => handleHold(picked)}
          >
            {!pickedFits
              ? `Leve ${picked.minParticipants}–${picked.maxParticipants}`
              : !pickedAffordable
                ? "Caixa insuficiente"
                : `Marcar · ${pickedCost !== null ? formatMoney(pickedCost) : ""}`}
          </Button>
        </div>
      )}

    </Stack>
  );
}
