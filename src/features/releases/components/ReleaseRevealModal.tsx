import { Divider, Modal, Rating, Stack, Text } from "@mantine/core";
import { useEffect, useState, type ReactNode } from "react";
import { reviewTierColor } from "@/features/releases/labels";
import type { Release, ReviewTier } from "@/features/releases/types";

/** Golden glow that pulses on the stars/score when a work lands on Obra-prima. */
const MASTERPIECE_GLOW_KEYFRAMES = `
@keyframes releaseMasterpieceGlow {
  0%, 100% {
    filter: drop-shadow(0 0 3px rgba(255, 210, 60, 0.85))
            drop-shadow(0 0 8px rgba(255, 190, 40, 0.5));
  }
  50% {
    filter: drop-shadow(0 0 10px rgba(255, 224, 100, 0.95))
            drop-shadow(0 0 22px rgba(255, 190, 40, 0.75));
  }
}
`;

interface RevealState {
  /** Current animated star value (0..5). */
  value: number;
  /** Animation intensity (1 at the start → 0 when settled), for the pulse. */
  intensity: number;
  /** Whether the animation has landed on the final value. */
  settled: boolean;
}

/**
 * Slot-machine style star reveal: the meter sweeps 0↔5 several times (spinning
 * hard) while its amplitude decays, its center drifting toward the target until
 * it locks on the final value. The first update happens inside the animation
 * frame (async), so no state is set synchronously in the effect body.
 */
function useStarReveal(target: number): RevealState {
  const [state, setState] = useState<RevealState>({
    value: 0,
    intensity: 1,
    settled: false,
  });

  useEffect(() => {
    let raf = 0;
    const start = performance.now();
    const duration = 2600;
    const spinFreq = 30; // ~5 sweeps across the whole range
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      const env = Math.exp(-3.2 * t); // 1 → ~0.04
      const center = 2.5 * env + target * (1 - env); // 2.5 → target
      const raw = center - 2.5 * env * Math.cos(spinFreq * t);
      if (t < 1) {
        setState({
          value: Math.max(0, Math.min(5, raw)),
          intensity: env,
          settled: false,
        });
        raf = requestAnimationFrame(tick);
      } else {
        setState({ value: target, intensity: 0, settled: true });
      }
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target]);

  return state;
}

/** Fades (and lifts) its children in on mount, after an optional delay. */
function Reveal({
  delay = 0,
  children,
}: {
  delay?: number;
  children: ReactNode;
}) {
  const [shown, setShown] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setShown(true), 20);
    return () => clearTimeout(t);
  }, []);
  return (
    <div
      style={{
        opacity: shown ? 1 : 0,
        transform: shown ? "none" : "translateY(6px)",
        transition: "opacity 500ms ease, transform 500ms ease",
        transitionDelay: `${delay}ms`,
      }}
    >
      {children}
    </div>
  );
}

/** One animated review section: rating meter reveals, then comments fade in. */
function ReviewSection({
  heading,
  score,
  stars,
  color,
  masterpiece,
  showComments,
  comments,
}: {
  heading: string;
  score: number;
  stars: number;
  color: string;
  masterpiece: boolean;
  showComments: boolean;
  comments: Release["criticComments"];
}) {
  const { value, intensity, settled } = useStarReveal(stars);
  const displayScore = settled ? Math.round(score) : Math.round(value * 20);
  const glowing = settled && masterpiece;

  return (
    <Stack gap="xs" align="center">
      <Text fw={700} tt="uppercase" size="sm" c="dimmed">
        {heading}
      </Text>

      <Stack
        gap="xs"
        align="center"
        style={{
          animation: glowing
            ? "releaseMasterpieceGlow 1.5s ease-in-out infinite"
            : undefined,
        }}
      >
        <div
          style={{
            transform: `scale(${1 + intensity * 0.2})`,
            transition: settled ? "transform 260ms ease" : "none",
          }}
        >
          <Rating
            value={value}
            count={5}
            fractions={10}
            readOnly
            size="xl"
            color={color}
          />
        </div>

        <Text
          fw={900}
          c={color}
          style={{
            fontSize: "2.4rem",
            lineHeight: 1,
            fontVariantNumeric: "tabular-nums",
            transform: `scale(${1 + intensity * 0.12})`,
            transition: settled ? "transform 260ms ease" : "none",
          }}
        >
          {displayScore}
          <Text span size="sm" c="dimmed" fw={500}>
            {" "}
            / 100
          </Text>
        </Text>
      </Stack>

      {glowing && (
        <Reveal>
          <Text
            fw={800}
            c="yellow"
            style={{
              letterSpacing: 1,
              textShadow: "0 0 12px rgba(255, 210, 60, 0.85)",
            }}
          >
            ✨ Obra-prima ✨
          </Text>
        </Reveal>
      )}

      {showComments && (
        <Stack gap="sm" mt="xs" w="100%">
          {comments.map((comment, index) => (
            <Reveal key={index} delay={index * 250}>
              <Text size="sm" fs="italic" ta="center">
                &ldquo;{comment.text}&rdquo;
              </Text>
              <Text size="xs" c="dimmed" fw={600} ta="center">
                — {comment.author}
              </Text>
            </Reveal>
          ))}
        </Stack>
      )}
    </Stack>
  );
}

/**
 * The sequenced body: critic rating animates and its comments fade in, then the
 * public rating animates and its comments fade in. Remounted per release, so the
 * phase resets naturally (no state reset in an effect).
 */
function RevealBody({
  release,
  reviewTiers,
}: {
  release: Release;
  reviewTiers: ReviewTier[] | undefined;
}) {
  // Phases: 0 critic rating · 1 critic comments · 2 public rating · 3 public
  // comments. Advanced by timers — the star animation runs ~2.6s.
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    if (phase >= 3) return undefined;
    const nextAfter = phase === 0 || phase === 2 ? 2900 : 2000;
    const t = setTimeout(() => setPhase((p) => p + 1), nextAfter);
    return () => clearTimeout(t);
  }, [phase]);

  const starsOf = (tierId: string | null) =>
    reviewTiers?.find((t) => t.id === tierId)?.stars ?? 0;

  return (
    <Stack gap="lg">
      <ReviewSection
        heading="Crítica especializada"
        score={release.criticScore ?? 0}
        stars={starsOf(release.criticTier)}
        color={reviewTierColor(release.criticTier)}
        masterpiece={release.criticTier === "obra-prima"}
        showComments={phase >= 1}
        comments={release.criticComments}
      />

      {phase >= 2 && (
        <Reveal>
          <Divider mb="lg" />
          <ReviewSection
            heading="Público"
            score={release.publicScore ?? 0}
            stars={starsOf(release.publicTier)}
            color={reviewTierColor(release.publicTier)}
            masterpiece={release.publicTier === "obra-prima"}
            showComments={phase >= 3}
            comments={release.publicComments}
          />
        </Reveal>
      )}

      {phase >= 3 && release.formatComment && (
        <Reveal>
          <Text size="xs" c="dimmed" fs="italic" ta="center">
            Sobre o formato: &ldquo;{release.formatComment}&rdquo;
          </Text>
        </Reveal>
      )}
    </Stack>
  );
}

/**
 * Reveal modal shown when a work is launched: a gradual, sequential reveal of
 * the critic and public reviews in a single modal (ADR-0011).
 */
export function ReleaseRevealModal({
  release,
  reviewTiers,
  opened,
  onClose,
}: {
  release: Release | null;
  reviewTiers: ReviewTier[] | undefined;
  opened: boolean;
  onClose: () => void;
}) {
  const hasReviews =
    release && release.criticScore !== null && release.publicScore !== null;

  return (
    <Modal
      opened={opened && Boolean(hasReviews)}
      onClose={onClose}
      title={release ? `Lançado: ${release.title}` : ""}
      size="md"
      centered
    >
      <style>{MASTERPIECE_GLOW_KEYFRAMES}</style>
      {hasReviews && release && (
        <RevealBody
          key={release.id}
          release={release}
          reviewTiers={reviewTiers}
        />
      )}
    </Modal>
  );
}
