/** Public API of the events feature. */
export { ActiveEventDecision } from "@/features/events/components/ActiveEventDecision";
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
