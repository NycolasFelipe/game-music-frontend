/** Public API of the bands feature. */
export { BandNameConfigModal } from "@/features/bands/components/BandNameConfigModal";
export { BandGameOptions } from "@/features/bands/components/BandGameOptions";
export { BandHeader } from "@/features/bands/components/BandHeader";
export { BandPhoto } from "@/features/bands/portrait/BandPhoto";
export { FaceThumb, MemberFace, MemberPortrait } from "@/features/bands/portrait/MemberPortrait";
export { resolveScene, SCENE_TEXT } from "@/features/bands/portrait/scenes";
export { HAIR_VARIANTS, hairVariantOf } from "@/features/bands/portrait/looks";
export type { HairVariant, PortraitSubject } from "@/features/bands/portrait/looks";
export {
  DEFAULT_PORTRAIT_TUNING,
  LIGHT_HAIR_LEVELS,
  PortraitTuningContext,
  SKIN_LEVELS,
  tuningCells,
} from "@/features/bands/portrait/tuning";
export type { LightHairLevel, PortraitTuning, SkinLevel } from "@/features/bands/portrait/tuning";
export { BandCover } from "@/features/bands/components/BandCover";
export { BandStatistics } from "@/features/bands/components/BandStatistics";
export { DeleteBandButton } from "@/features/bands/components/DeleteBandButton";
export { DepartureModal } from "@/features/bands/components/DepartureModal";
export { FormerMemberCard } from "@/features/bands/components/FormerMemberCard";
export { FormerMembersTab } from "@/features/bands/components/FormerMembersTab";
export { MemberCard } from "@/features/bands/components/MemberCard";
export { MemberEditModal } from "@/features/bands/components/MemberEditModal";
export { MemberHoverName } from "@/features/bands/components/MemberHoverName";
export { MemberMentions } from "@/features/bands/components/MemberMentions";
export { MemberInterviewModal } from "@/features/bands/components/MemberInterviewModal";
export { SalaryBadge } from "@/features/bands/components/SalaryBadge";
export { bandKeys, useBand, useBands } from "@/features/bands/hooks/useBands";
export {
  formerMemberKeys,
  useFormerMembers,
} from "@/features/bands/hooks/useFormerMembers";
export {
  salaryKeys,
  useMemberSalaryHistory,
  useUpdateMemberSalary,
} from "@/features/bands/hooks/useMemberSalary";
export { useDeleteBand } from "@/features/bands/hooks/useDeleteBand";
export { useUpdateBandSettings } from "@/features/bands/hooks/useBandSettings";
export {
  catalogKeys,
  useBandOptions,
  useCharacteristics,
  useHappinessLevels,
  useRelationshipLevels,
  useSkillDescriptions,
} from "@/features/bands/hooks/useBandOptions";
export { RelationshipsView } from "@/features/bands/components/RelationshipsView";
export { useCreateBand } from "@/features/bands/hooks/useCreateBand";
export {
  useGenerateBandNames,
  useGenerateCandidates,
  useRegenerateAvatar,
} from "@/features/bands/hooks/useGenerateCandidates";
export {
  formatSkillLevel,
  SKILL_LABELS,
  SKILL_ORDER,
} from "@/features/bands/labels";
export {
  buildLookups,
  firstName,
  levelColor,
  levelHex,
  pairKey,
} from "@/features/bands/components/relationship-utils";
export type {
  Band,
  BandDetail,
  BandMember,
  BandOptions,
  BandSettings,
  Characteristic,
  CreateBandInput,
  CreateBandMemberSeed,
  Fame,
  GenerateNameOptions,
  MemberCandidate,
  MemberRelationship,
  RelationshipLevelInfo,
  SalaryAgreement,
  Skills,
} from "@/features/bands/types";
