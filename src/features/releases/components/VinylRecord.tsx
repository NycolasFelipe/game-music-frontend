import {
  Badge,
  Group,
  HoverCard,
  Stack,
  Text,
  UnstyledButton,
} from "@mantine/core";
import { useHover } from "@mantine/hooks";
import { qualityTierColor, reviewTierColor } from "@/features/releases/labels";
import type {
  QualityTier,
  Release,
  ReviewTier,
} from "@/features/releases/types";
import { formatPeriod } from "@/utils/period";

/** Keyframes for the spinning vinyl — render once per page. */
export const VINYL_KEYFRAMES = `
@keyframes vinylSpin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
`;

/** Fixed outer footprint — every shelf item is the same size, single or double. */
const FRAME = 112;

/** Deterministic 32-bit hash of a string (FNV-1a), for a per-disc appearance. */
function hashString(value: string): number {
  let hash = 2166136261;
  for (let i = 0; i < value.length; i += 1) {
    hash ^= value.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

/** Label colorways (Mantine color names), for the disc's center label. */
const LABEL_COLORS = [
  "red",
  "pink",
  "grape",
  "violet",
  "indigo",
  "blue",
  "cyan",
  "teal",
  "green",
  "lime",
  "yellow",
  "orange",
];

/** Metallic frames by quality tier (the award "moldura"). */
const BRONZE = "linear-gradient(135deg, #e0a060, #8c5a2b, #cd7f32)";
const SILVER = "linear-gradient(135deg, #f5f5f5, #a8a8a8, #e8e8e8)";
const GOLD = "linear-gradient(135deg, #fff3b0, #d4af37, #ffe28a)";
const PLATINUM = "linear-gradient(135deg, #ffffff, #cfd0d6, #f0f0f5, #d8d9de)";

interface Frame {
  ring?: string;
  width: number;
  double?: boolean;
}

const FRAMES: Record<string, Frame> = {
  fracasso: { width: 0 },
  mediocre: { ring: BRONZE, width: 5 },
  solido: { ring: SILVER, width: 6 },
  grande: { ring: GOLD, width: 8 },
  "obra-prima": { ring: PLATINUM, width: 7, double: true },
};

/** A single spinning (all-black) vinyl disc, optionally set in a metallic ring. */
function Disc({
  size,
  labelColor,
  ring,
  ringWidth,
  spinning,
  style,
}: {
  size: number;
  labelColor: string;
  ring?: string;
  ringWidth: number;
  spinning: boolean;
  style?: React.CSSProperties;
}) {
  const grooves =
    "repeating-radial-gradient(circle at 50% 50%, rgba(0,0,0,0.55) 0 1.5px, rgba(255,255,255,0.03) 1.5px 3px)";
  const labelSize = size * 0.42;

  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        boxSizing: "border-box",
        padding: ringWidth,
        background: ring ?? "transparent",
        boxShadow: ring ? "0 2px 6px rgba(0,0,0,0.35)" : undefined,
        ...style,
      }}
    >
      <div
        style={{
          width: "100%",
          height: "100%",
          borderRadius: "50%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
          background: `${grooves}, radial-gradient(circle at 36% 30%, #3a3a3a, #050505 62%)`,
          boxShadow: "0 4px 10px rgba(0,0,0,0.45), inset 0 0 18px rgba(0,0,0,0.7)",
          animation: spinning ? "vinylSpin 3.2s linear infinite" : undefined,
        }}
      >
        <div
          style={{
            width: labelSize,
            height: labelSize,
            borderRadius: "50%",
            background: `var(--mantine-color-${labelColor}-8)`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 0 0 3px rgba(0,0,0,0.25)",
            position: "relative",
          }}
        >
          <div
            style={{
              position: "absolute",
              width: 7,
              height: 7,
              borderRadius: "50%",
              background: "#0a0a0a",
              boxShadow: "inset 0 0 2px #000",
            }}
          />
        </div>
      </div>
    </div>
  );
}

/**
 * A launched work shown as a vinyl record on the shelf: a unique-looking disc
 * (color/label seeded by its id) framed by a metal that reflects its quality
 * (bronze → silver → gold → platinum; a masterpiece is a double-platinum pair).
 * Every shelf item keeps the same footprint. Hovering spins it and shows a quick
 * preview; clicking opens the details modal.
 */
export function VinylRecord({
  release,
  formatLabel,
  qualityTier,
  criticTier,
  publicTier,
  onClick,
}: {
  release: Release;
  formatLabel: string;
  qualityTier?: QualityTier;
  criticTier?: ReviewTier;
  publicTier?: ReviewTier;
  onClick: () => void;
}) {
  const { hovered, ref } = useHover();

  const labelColor =
    LABEL_COLORS[hashString(`${release.id}:label`) % LABEL_COLORS.length];
  const frame = FRAMES[release.qualityTier ?? ""] ?? { width: 0 };
  const year =
    release.releasedAtYear !== null ? Math.floor(release.releasedAtYear) : null;

  // The disc's overall rating: the average of the critic and public stars (falls
  // back to the quality when there are no reviews).
  const overallStars =
    criticTier && publicTier
      ? Math.round((criticTier.stars + publicTier.stars) / 2)
      : release.quality !== null
        ? Math.max(1, Math.round(release.quality / 20))
        : 0;

  const discProps = { labelColor, spinning: hovered };

  return (
    <HoverCard
      openDelay={120}
      closeDelay={40}
      position="top"
      withArrow
      shadow="md"
      width={260}
    >
      <HoverCard.Target>
        <UnstyledButton
          ref={ref}
          onClick={onClick}
          style={{
            transform: hovered ? "translateY(-4px)" : "none",
            transition: "transform 200ms ease",
          }}
        >
          <Stack align="center" gap={6} w={FRAME}>
            <div
              style={{
                width: FRAME,
                height: FRAME,
                position: "relative",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {frame.double ? (
                <>
                  <Disc
                    size={FRAME * 0.68}
                    ring={frame.ring}
                    ringWidth={frame.width}
                    {...discProps}
                    style={{
                      position: "absolute",
                      left: 0,
                      top: FRAME * 0.16,
                    }}
                  />
                  <Disc
                    size={FRAME * 0.68}
                    ring={frame.ring}
                    ringWidth={frame.width}
                    {...discProps}
                    style={{
                      position: "absolute",
                      right: 0,
                      top: FRAME * 0.16,
                    }}
                  />
                </>
              ) : (
                <Disc
                  size={FRAME}
                  ring={frame.ring}
                  ringWidth={frame.width}
                  {...discProps}
                />
              )}
            </div>

            <Text size="xs" fw={600} ta="center" lineClamp={1} w={FRAME}>
              {release.title}
            </Text>
            <Text size="10px" c="dimmed" ta="center" lineClamp={1} w={FRAME}>
              {formatLabel}
              {year !== null ? ` · ${year}` : ""}
            </Text>
            {overallStars > 0 && (
              <Text size="10px" ta="center" w={FRAME} c="yellow.6">
                {stars(overallStars)}
              </Text>
            )}
          </Stack>
        </UnstyledButton>
      </HoverCard.Target>

      <HoverCard.Dropdown>
        <Stack gap={6}>
          <div>
            <Text fw={700} size="sm">
              {release.title}
            </Text>
            <Text size="xs" c="dimmed">
              {formatLabel}
              {release.releasedAtYear !== null &&
                ` · ${formatPeriod(release.releasedAtYear)}`}
            </Text>
          </div>

          {release.qualityTier && (
            <Badge
              color={qualityTierColor(release.qualityTier)}
              variant="light"
              w="fit-content"
            >
              {qualityTier
                ? `${qualityTier.emoji} ${qualityTier.label}`
                : release.qualityTier}
            </Badge>
          )}

          {release.criticScore !== null && (
            <Group gap="lg">
              <Text size="xs">
                <Text span fw={600}>
                  Crítica
                </Text>{" "}
                <Text span c={reviewTierColor(release.criticTier)}>
                  {criticTier ? stars(criticTier.stars) : ""}
                </Text>{" "}
                {Math.round(release.criticScore)}
              </Text>
              <Text size="xs">
                <Text span fw={600}>
                  Público
                </Text>{" "}
                <Text span c={reviewTierColor(release.publicTier)}>
                  {publicTier ? stars(publicTier.stars) : ""}
                </Text>{" "}
                {Math.round(release.publicScore ?? 0)}
              </Text>
            </Group>
          )}

          {release.concept && (
            <Text size="xs" c="dimmed" lineClamp={2}>
              {release.concept}
            </Text>
          )}

          <Text size="10px" c="dimmed">
            Clique para ver os detalhes.
          </Text>
        </Stack>
      </HoverCard.Dropdown>
    </HoverCard>
  );
}

/** Renders a 1..5 star rating with filled and empty stars. */
function stars(count: number): string {
  const filled = Math.max(0, Math.min(5, count));
  return "⭐".repeat(filled) + "☆".repeat(5 - filled);
}
