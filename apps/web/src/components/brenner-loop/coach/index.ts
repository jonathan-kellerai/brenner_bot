/**
 * Coach Mode Components
 *
 * Components for the Guided Coach Mode feature.
 *
 * @see brenner_bot-reew.8 (bead)
 */

// Explanation components
export {
  CoachExplanation,
  CoachTip,
  type CoachExplanationProps,
  type CoachTipProps,
} from "./CoachExplanation";

// Quality checkpoint components
export {
  QualityCheckpoint,
  HypothesisQualityChecker,
  type QualityCheckpointProps,
  type QualityCheckResult,
  type QualityIssue,
  type CheckSeverity,
  type HypothesisQualityCheckerProps,
} from "./QualityCheckpoint";

// Progress components
export {
  ProgressCelebration,
  LevelBadge,
  AchievementCard,
  CoachProgressStats,
  type ProgressCelebrationProps,
  type LevelBadgeProps,
  type AchievementCardProps,
  type Achievement,
  type CoachProgressStatsProps,
} from "./CoachProgress";

// Settings components
export {
  CoachSettingsPanel,
  CoachToggle,
  type CoachSettingsPanelProps,
  type CoachToggleProps,
} from "./CoachSettingsPanel";
