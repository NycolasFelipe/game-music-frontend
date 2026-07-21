import {
  Badge,
  Card,
  Collapse,
  Group,
  Stack,
  Text,
  UnstyledButton,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { MemberHoverName, SKILL_LABELS, SKILL_ORDER } from "@/features/bands";
import type { BandMember, Characteristic } from "@/features/bands";
import { qualityTierColor, reviewTierColor } from "@/features/releases/labels";
import type {
  QualityTier,
  Release,
  ReviewTier,
} from "@/features/releases/types";
import { formatPeriod } from "@/utils/period";

/** Renders a 1..5 star rating with filled and empty stars. */
function stars(count: number): string {
  const filled = Math.max(0, Math.min(5, count));
  return "⭐".repeat(filled) + "☆".repeat(5 - filled);
}

/** A launched work in the discography. */
export function ReleaseCard({
  release,
  members,
  catalog,
  formatLabel,
  qualityTier,
  criticTier,
  publicTier,
}: {
  release: Release;
  members: BandMember[];
  catalog: Map<string, Characteristic>;
  formatLabel: string;
  qualityTier?: QualityTier;
  criticTier?: ReviewTier;
  publicTier?: ReviewTier;
}) {
  const byId = new Map(members.map((m) => [m.id, m]));
  const revenue =
    (release.masterRevenueTotal ?? 0) + (release.publishingRevenueTotal ?? 0);
  const [reviewsOpen, reviews] = useDisclosure(false);

  return (
    <Card withBorder padding="md">
      <Stack gap="xs">
        <Group justify="space-between" align="flex-start" wrap="nowrap">
          <div>
            <Text fw={600}>{release.title}</Text>
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
              size="lg"
            >
              {qualityTier ? `${qualityTier.emoji} ${qualityTier.label}` : release.qualityTier}
            </Badge>
          )}
        </Group>

        {release.criticScore !== null && (
          <Stack gap={6}>
            <Group gap="lg">
              <Group gap={6} wrap="nowrap">
                <Text size="xs" c="dimmed" fw={600}>
                  Crítica
                </Text>
                <Badge
                  color={reviewTierColor(release.criticTier)}
                  variant="light"
                >
                  {criticTier ? `${stars(criticTier.stars)} ` : ""}
                  {Math.round(release.criticScore)}
                </Badge>
              </Group>
              <Group gap={6} wrap="nowrap">
                <Text size="xs" c="dimmed" fw={600}>
                  Público
                </Text>
                <Badge
                  color={reviewTierColor(release.publicTier)}
                  variant="light"
                >
                  {publicTier ? `${stars(publicTier.stars)} ` : ""}
                  {Math.round(release.publicScore ?? 0)}
                </Badge>
              </Group>
            </Group>

            {(release.criticComments.length > 0 ||
              release.publicComments.length > 0) && (
              <>
                <UnstyledButton onClick={reviews.toggle}>
                  <Text size="xs" c="blue">
                    {reviewsOpen ? "Ocultar análise" : "Ver análise"}
                  </Text>
                </UnstyledButton>

                <Collapse in={reviewsOpen}>
                  <Stack gap="sm" mt={4}>
                    <div>
                      <Text size="xs" fw={700}>
                        Crítica especializada
                        {criticTier ? ` — ${criticTier.label}` : ""}{" "}
                        {criticTier ? stars(criticTier.stars) : ""}
                      </Text>
                      <Stack gap={6} mt={4}>
                        {release.criticComments.map((comment, index) => (
                          <div key={index}>
                            <Text size="xs" c="dimmed" fs="italic">
                              &ldquo;{comment.text}&rdquo;
                            </Text>
                            <Text size="xs" c="dimmed" fw={600}>
                              — {comment.author}
                            </Text>
                          </div>
                        ))}
                      </Stack>
                    </div>

                    <div>
                      <Text size="xs" fw={700}>
                        Público {publicTier ? stars(publicTier.stars) : ""}
                      </Text>
                      <Stack gap={6} mt={4}>
                        {release.publicComments.map((comment, index) => (
                          <div key={index}>
                            <Text size="xs" c="dimmed">
                              &ldquo;{comment.text}&rdquo;
                            </Text>
                            <Text size="xs" c="dimmed" fw={600}>
                              — {comment.author}
                            </Text>
                          </div>
                        ))}
                      </Stack>
                    </div>

                    {release.formatComment && (
                      <Text size="xs" c="dimmed" fs="italic">
                        Sobre o formato: &ldquo;{release.formatComment}&rdquo;
                      </Text>
                    )}
                  </Stack>
                </Collapse>
              </>
            )}
          </Stack>
        )}

        {release.concept && (
          <Text size="xs" c="dimmed">
            {release.concept}
          </Text>
        )}

        <Group gap="lg">
          <Text size="sm">
            <Text span fw={600} c="teal">
              +{(release.fansGained ?? 0).toLocaleString("pt-BR")}
            </Text>{" "}
            fãs
          </Text>
          <Text size="sm">
            <Text span fw={600}>
              {revenue.toLocaleString("pt-BR")}
            </Text>{" "}
            de receita
          </Text>
          {release.royaltyTurnsLeft > 0 && (
            <Text size="xs" c="dimmed">
              royalties por +{release.royaltyTurnsLeft} turnos
            </Text>
          )}
        </Group>

        <Stack gap={2}>
          {SKILL_ORDER.filter((a) => (release.credits[a]?.length ?? 0) > 0).map(
            (aspect) => (
              <Group key={aspect} gap="xs" wrap="wrap">
                <Text size="xs" c="dimmed" w={64}>
                  {SKILL_LABELS[aspect]}
                </Text>
                {(release.credits[aspect] ?? []).map((id) => {
                  const member = byId.get(id);
                  return member ? (
                    <MemberHoverName
                      key={id}
                      member={member}
                      catalog={catalog}
                    />
                  ) : null;
                })}
              </Group>
            ),
          )}
        </Stack>
      </Stack>
    </Card>
  );
}
