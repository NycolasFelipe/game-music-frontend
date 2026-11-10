/** Public API of the events feature. */
export { ActiveEventDecision } from "@/features/events/components/ActiveEventDecision";
export { EventOutcome } from "@/features/events/components/EventOutcome";
export { snapshotBand } from "@/features/events/eventOutcome";
export type { BandSnapshot } from "@/features/events/eventOutcome";
export { SceneNewspaper } from "@/features/events/components/SceneNewspaper";
export type { NewspaperItem } from "@/features/events/components/SceneNewspaper";
export {
  eventKeys,
  useActiveEvents,
  usePassiveEvents,
  useResolveActiveEvent,
} from "@/features/events/hooks/useEvents";
export type {
  ActiveEvent,
  ActiveEventOption,
  EventConsequence,
  EventResolution,
  FameChange,
  PassiveEvent,
} from "@/features/events/types";
