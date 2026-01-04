/**
 * Brenner Loop Operators Module
 *
 * Exports all operator-related types, functions, and configurations.
 *
 * @module brenner-loop/operators
 */

// ============================================================================
// Framework (bead vw6p.1)
// ============================================================================

export type {
  // Core types
  OperatorType,
  OperatorMetadata,
  OperatorSessionStatus,
  OperatorInsight,

  // Step types
  OperatorStepConfig,
  StepValidation,
  OperatorStepState,

  // Session types
  OperatorSession,
  OperatorSessionAction,
} from "./framework";

export {
  // Type guards
  isOperatorType,

  // Metadata
  OPERATOR_METADATA,

  // Factory functions
  generateSessionId,
  generateInsightId,
  createStepStates,
  createSession,

  // State management
  sessionReducer,

  // Utility functions
  getCurrentStep,
  getCurrentStepConfig,
  canProceedToNext,
  canGoBack,
  canSkipCurrent,
  getProgress,
  getSessionSummary,

  // Serialization
  serializeSession,
  deserializeSession,
} from "./framework";

// ============================================================================
// Level Split Operator (bead vw6p.2)
// ============================================================================

export type {
  Level,
  LevelCategory,
  LevelCombination,
  SubHypothesis,
  LevelSplitResult,
} from "./level-split";

export {
  // Step configurations
  LEVEL_SPLIT_STEP_IDS,
  LEVEL_SPLIT_STEPS,

  // Level templates
  X_LEVEL_TEMPLATES,
  Y_LEVEL_TEMPLATES,

  // Generation functions
  generateXLevels,
  generateYLevels,
  generateCombinationMatrix,
  generateSubHypothesis,
  buildLevelSplitResult,

  // Quote references
  LEVEL_SPLIT_QUOTE_ANCHORS,
  LEVEL_SPLIT_FALLBACK_QUOTES,
} from "./level-split";
