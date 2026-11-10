import { useGenreProfiles } from "@/features/releases/hooks/useReleaseCatalogs";
import { aspectList, keyAspects } from "@/features/releases/style-aspects";

interface StyleProfileProps {
  /** The band theme id. */
  style: string;
  /** The style's one-line pitch, when known. */
  description?: string;
  /** An extra line under the profile (e.g. that the choice is permanent). */
  footnote?: string;
}

/**
 * What a style asks of the band, in words: the instruments that weigh most and
 * the style's pitch (ADR-0030 of the backend). No percentages for the player.
 */
export function StyleProfile({ style, description, footnote }: StyleProfileProps) {
  const { data: profiles } = useGenreProfiles();
  const weights = profiles?.find((p) => p.style === style)?.weights;

  if (!weights && !description && !footnote) return null;

  return (
    <div>
      {description && <p className="rv-style-pitch">{description}</p>}
      {weights && <p className="rv-caption">Pesa mais: {aspectList(keyAspects(weights))}.</p>}
      {footnote && <p className="rv-note">{footnote}</p>}
    </div>
  );
}
