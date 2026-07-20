import { Badge, Card, Group, Stack, Text } from "@mantine/core";
import { MemberHoverName, SKILL_LABELS, SKILL_ORDER } from "@/features/bands";
import type { BandMember, Characteristic } from "@/features/bands";
import { qualityTierColor } from "@/features/releases/labels";
import type { QualityTier, Release } from "@/features/releases/types";
import { formatPeriod } from "@/utils/period";

/** A launched work in the discography. */
export function ReleaseCard({
  release,
  members,
  catalog,
  formatLabel,
  qualityTier,
}: {
  release: Release;
  members: BandMember[];
  catalog: Map<string, Characteristic>;
  formatLabel: string;
  qualityTier?: QualityTier;
}) {
  const byId = new Map(members.map((m) => [m.id, m]));
  const revenue =
    (release.masterRevenueTotal ?? 0) + (release.publishingRevenueTotal ?? 0);

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
