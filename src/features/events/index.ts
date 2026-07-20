/** Public API of the events feature. */
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
