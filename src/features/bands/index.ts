/** Public API of the bands feature. */
export { BandNameConfigModal } from "@/features/bands/components/BandNameConfigModal";
export { DeleteBandButton } from "@/features/bands/components/DeleteBandButton";
export { MemberCard } from "@/features/bands/components/MemberCard";
export { MemberEditModal } from "@/features/bands/components/MemberEditModal";
export { bandKeys, useBand, useBands } from "@/features/bands/hooks/useBands";
export { useDeleteBand } from "@/features/bands/hooks/useDeleteBand";
export {
  catalogKeys,
  useBandOptions,
  useCharacteristics,
} from "@/features/bands/hooks/useBandOptions";
export { useCreateBand } from "@/features/bands/hooks/useCreateBand";
export {
  useGenerateBandNames,
  useGenerateCandidates,
} from "@/features/bands/hooks/useGenerateCandidates";
export { SKILL_LABELS, SKILL_ORDER } from "@/features/bands/labels";
export type {
  Band,
  BandDetail,
  BandMember,
  BandOptions,
  Characteristic,
  CreateBandInput,
  CreateBandMemberSeed,
  Fame,
  GenerateNameOptions,
  MemberCandidate,
  MemberRelationship,
  Skills,
} from "@/features/bands/types";
