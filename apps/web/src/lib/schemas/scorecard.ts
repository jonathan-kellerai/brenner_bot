import { z } from "zod";

/**
 * Brenner Method Scorecard Schema
 *
 * Implements the 14-criterion evaluation rubric for scoring Brenner method
 * contributions. Provides per-session and per-contribution scores on method
 * adherence with actionable feedback.
 *
 * @see specs/evaluation_rubric_v0.1.md - The authoritative source
 * @see brenner_bot-nihv (bead)
 */

// ============================================================================
// Score Types
// ============================================================================

/**
 * Standard 0-3 score range used by most criteria.
 */
export const ScoreSchema = z.number().int().min(0).max(3);
export type Score = z.infer<typeof ScoreSchema>;

/**
 * 0-2 score range used by optional/conditional criteria.
 */
export const OptionalScoreSchema = z.number().int().min(0).max(2);
export type OptionalScore = z.infer<typeof OptionalScoreSchema>;

// ============================================================================
// Role Types
// ============================================================================

/**
 * Roles in the Brenner method that produce contributions.
 *
 * - hypothesis_generator: Creates and manages hypotheses (typically Codex)
 * - test_designer: Designs discriminative tests (typically Opus)
 * - adversarial_critic: Challenges and validates work (typically Gemini)
 */
export const RoleSchema = z.enum([
  "hypothesis_generator",
  "test_designer",
  "adversarial_critic",
]);
export type Role = z.infer<typeof RoleSchema>;

// ============================================================================
// Universal Criteria (1-3)
// ============================================================================

/**
 * Criterion 1: Structural Correctness (0-3)
 * Does the output follow the delta format specification?
 */
export const StructuralCorrectnessSchema = z.object({
  score: ScoreSchema,
  validJson: z.boolean(),
  hasRequiredFields: z.boolean(),
  sectionOperationMatch: z.boolean(),
  notes: z.string().optional(),
});
export type StructuralCorrectness = z.infer<typeof StructuralCorrectnessSchema>;

/**
 * Criterion 2: Citation Compliance (0-3)
 * Are transcript anchors and inference markers used correctly?
 */
export const CitationComplianceSchema = z.object({
  score: ScoreSchema,
  anchorCount: z.number().int().min(0),
  validAnchors: z.number().int().min(0),
  hasInferenceMarkers: z.boolean(),
  fakeAnchorDetected: z.boolean(),
  notes: z.string().optional(),
});
export type CitationCompliance = z.infer<typeof CitationComplianceSchema>;

/**
 * Criterion 3: Rationale Quality (0-3)
 * Does the rationale explain the contribution effectively?
 */
export const RationaleQualitySchema = z.object({
  score: ScoreSchema,
  hasRationale: z.boolean(),
  mentionsOperators: z.boolean(),
  explainsWhy: z.boolean(),
  notes: z.string().optional(),
});
export type RationaleQuality = z.infer<typeof RationaleQualitySchema>;

// ============================================================================
// Hypothesis Generator Criteria (4-6)
// ============================================================================

/**
 * Criterion 4: Level Separation (0-3)
 * Has the contributor applied ⊘ Level-Split correctly?
 *
 * Level conflation red flags:
 * - "The gene tells the cell to..."
 * - "The organism decides to..."
 * - Confusing "won't" (chastity) with "can't" (impotence)
 */
export const LevelSeparationSchema = z.object({
  score: ScoreSchema,
  conflationDetected: z.boolean(),
  conflationPatterns: z.array(z.string()).optional(),
  mechanismTyped: z.boolean(),
  notes: z.string().optional(),
});
export type LevelSeparation = z.infer<typeof LevelSeparationSchema>;

/**
 * Criterion 5: Third Alternative Presence (0-3)
 * Is a genuine third alternative included?
 *
 * Quality indicators:
 * - Proposes a different causal structure, not a blend
 * - Comes from cross-domain transfer (⊕)
 * - Identifies a shared assumption that could be false
 */
export const ThirdAlternativePresenceSchema = z.object({
  score: ScoreSchema,
  hasThirdAlternative: z.boolean(),
  isGenuinelyOrthogonal: z.boolean(),
  isPlaceholder: z.boolean(), // "both could be wrong" without specifics
  notes: z.string().optional(),
});
export type ThirdAlternativePresence = z.infer<typeof ThirdAlternativePresenceSchema>;

/**
 * Criterion 6: Paradox Exploitation (0-2, optional)
 * Does the contribution leverage paradoxes productively?
 */
export const ParadoxExploitationSchema = z.object({
  score: OptionalScoreSchema,
  applicable: z.boolean(),
  paradoxIdentified: z.boolean(),
  hypothesisDerivedFromParadox: z.boolean(),
  notes: z.string().optional(),
});
export type ParadoxExploitation = z.infer<typeof ParadoxExploitationSchema>;

// ============================================================================
// Test Designer Criteria (7-10)
// ============================================================================

/**
 * Criterion 7: Discriminative Power (0-3)
 * Does the test actually distinguish hypotheses?
 *
 * Checklist:
 * - Expected outcomes differ for each hypothesis
 * - Difference is binary or quantitatively large
 * - Both outcomes are actually observable
 */
export const DiscriminativePowerSchema = z.object({
  score: ScoreSchema,
  hypothesesDiscriminated: z.number().int().min(0),
  outcomesAreDifferent: z.boolean(),
  outcomesAreObservable: z.boolean(),
  likelihoodRatioEstimate: z.string().optional(), // e.g., ">100:1"
  notes: z.string().optional(),
});
export type DiscriminativePower = z.infer<typeof DiscriminativePowerSchema>;

/**
 * Criterion 8: Potency Check Sufficiency (0-3)
 * Can we distinguish "no effect" from "assay failed"?
 *
 * Components:
 * - Positive control that would show the effect if present
 * - Sensitivity verification that detection threshold is adequate
 * - Timing validation that the assay window is correct
 */
export const PotencyCheckSufficiencySchema = z.object({
  score: ScoreSchema,
  hasPotencyCheck: z.boolean(),
  hasPositiveControl: z.boolean(),
  hasSensitivityVerification: z.boolean(),
  hasTimingValidation: z.boolean(),
  notes: z.string().optional(),
});
export type PotencyCheckSufficiency = z.infer<typeof PotencyCheckSufficiencySchema>;

/**
 * Criterion 9: Object Transposition Considered (0-2, optional)
 * Has the contributor considered alternative experimental systems?
 */
export const ObjectTranspositionSchema = z.object({
  score: OptionalScoreSchema,
  applicable: z.boolean(),
  alternativesConsidered: z.boolean(),
  costBenefitProvided: z.boolean(),
  notes: z.string().optional(),
});
export type ObjectTransposition = z.infer<typeof ObjectTranspositionSchema>;

/**
 * Criterion 10: Score Calibration Honesty (0-2)
 * Is the 4-dimension score realistic?
 */
export const ScoreCalibrationHonestySchema = z.object({
  score: OptionalScoreSchema,
  hasEvidenceScore: z.boolean(),
  isInflated: z.boolean(), // All 3s is suspicious
  isConservative: z.boolean(),
  notes: z.string().optional(),
});
export type ScoreCalibrationHonesty = z.infer<typeof ScoreCalibrationHonestySchema>;

// ============================================================================
// Adversarial Critic Criteria (11-14)
// ============================================================================

/**
 * Criterion 11: Scale Check Rigor (0-3)
 * Are physical constraints calculated, not assumed?
 *
 * Components:
 * - Actual numbers (not "fast" or "slow")
 * - Units and dimensional analysis
 * - Comparison to relevant physical constraint
 * - Explicit conclusion about what violates the constraint
 */
export const ScaleCheckRigorSchema = z.object({
  score: ScoreSchema,
  hasScaleCheck: z.boolean(),
  hasCalculation: z.boolean(),
  hasUnits: z.boolean(),
  hasConclusion: z.boolean(),
  notes: z.string().optional(),
});
export type ScaleCheckRigor = z.infer<typeof ScaleCheckRigorSchema>;

/**
 * Criterion 12: Anomaly Quarantine Discipline (0-3)
 * Are anomalies tracked explicitly rather than swept or destroyed?
 *
 * Discipline:
 * - Anomaly explicitly named and described
 * - Conflict with specific hypotheses/assumptions noted
 * - Resolution plan or deferral reason stated
 * - Neither hidden nor allowed to destroy coherent framework
 */
export const AnomalyQuarantineDisciplineSchema = z.object({
  score: ScoreSchema,
  anomalyCount: z.number().int().min(0),
  quarantinedCount: z.number().int().min(0),
  hasResolutionPlans: z.boolean(),
  prematurelyDestroys: z.boolean(),
  notes: z.string().optional(),
});
export type AnomalyQuarantineDiscipline = z.infer<typeof AnomalyQuarantineDisciplineSchema>;

/**
 * Criterion 13: Theory Kill Justification (0-3, when KILL operation used)
 * Is the kill justified with sufficient evidence?
 *
 * Unjustified kill indicators:
 * - "This seems unlikely"
 * - "We don't need this anymore"
 * - "This is getting complicated"
 */
export const TheoryKillJustificationSchema = z.object({
  score: ScoreSchema,
  applicable: z.boolean(), // Only applies for KILL operations
  hasEvidence: z.boolean(),
  evidenceIsDecisive: z.boolean(),
  rescueMovesConsidered: z.boolean(),
  unjustifiedPatternDetected: z.boolean(),
  notes: z.string().optional(),
});
export type TheoryKillJustification = z.infer<typeof TheoryKillJustificationSchema>;

/**
 * Criterion 14: Real Third Alternative (0-3)
 * Does the critique propose a constructive alternative?
 */
export const RealThirdAlternativeSchema = z.object({
  score: ScoreSchema,
  hasAlternative: z.boolean(),
  isSpecific: z.boolean(),
  hasMechanism: z.boolean(),
  hasTestablePredictions: z.boolean(),
  notes: z.string().optional(),
});
export type RealThirdAlternative = z.infer<typeof RealThirdAlternativeSchema>;

// ============================================================================
// Composite Score Schemas
// ============================================================================

/**
 * Universal criteria that apply to all roles.
 */
export const UniversalCriteriaSchema = z.object({
  structuralCorrectness: StructuralCorrectnessSchema,
  citationCompliance: CitationComplianceSchema,
  rationaleQuality: RationaleQualitySchema,
});
export type UniversalCriteria = z.infer<typeof UniversalCriteriaSchema>;

/**
 * Hypothesis Generator (Codex) role-specific criteria.
 *
 * Score formula:
 *   (Structural × 1.0) + (Citation × 1.0) + (Rationale × 0.5) +
 *   (Level-Sep × 1.5) + (Third-Alt × 2.0) + (Paradox × 0.5)
 * Max = 19 points
 */
export const HypothesisGeneratorCriteriaSchema = z.object({
  levelSeparation: LevelSeparationSchema,
  thirdAlternativePresence: ThirdAlternativePresenceSchema,
  paradoxExploitation: ParadoxExploitationSchema,
});
export type HypothesisGeneratorCriteria = z.infer<typeof HypothesisGeneratorCriteriaSchema>;

/**
 * Test Designer (Opus) role-specific criteria.
 *
 * Score formula:
 *   (Structural × 1.0) + (Citation × 1.0) + (Rationale × 0.5) +
 *   (Discriminative × 2.0) + (Potency × 2.0) + (Object-Trans × 0.5) + (Calibration × 0.5)
 * Max = 21.5 points
 */
export const TestDesignerCriteriaSchema = z.object({
  discriminativePower: DiscriminativePowerSchema,
  potencyCheckSufficiency: PotencyCheckSufficiencySchema,
  objectTransposition: ObjectTranspositionSchema,
  scoreCalibrationHonesty: ScoreCalibrationHonestySchema,
});
export type TestDesignerCriteria = z.infer<typeof TestDesignerCriteriaSchema>;

/**
 * Adversarial Critic (Gemini) role-specific criteria.
 *
 * Score formula:
 *   (Structural × 1.0) + (Citation × 1.0) + (Rationale × 0.5) +
 *   (Scale × 1.5) + (Quarantine × 1.5) + [Kill-Justify × 1.5]* + (Real-Third × 1.5)
 * *Kill-Justify only applies for KILL operations
 *
 * Max (with KILL) = 25.5 points
 * Max (ADD/EDIT)  = 21 points
 */
export const AdversarialCriticCriteriaSchema = z.object({
  scaleCheckRigor: ScaleCheckRigorSchema,
  anomalyQuarantineDiscipline: AnomalyQuarantineDisciplineSchema,
  theoryKillJustification: TheoryKillJustificationSchema,
  realThirdAlternative: RealThirdAlternativeSchema,
});
export type AdversarialCriticCriteria = z.infer<typeof AdversarialCriticCriteriaSchema>;

// ============================================================================
// Contribution Score
// ============================================================================

/**
 * Complete score for a single contribution (delta).
 */
export const ContributionScoreSchema = z.object({
  /** ID of the contribution being scored */
  contributionId: z.string(),

  /** Session this contribution belongs to */
  sessionId: z.string(),

  /** Role that produced this contribution */
  role: RoleSchema,

  /** Universal criteria scores */
  universal: UniversalCriteriaSchema,

  /** Role-specific criteria (only one will be populated based on role) */
  hypothesisGenerator: HypothesisGeneratorCriteriaSchema.optional(),
  testDesigner: TestDesignerCriteriaSchema.optional(),
  adversarialCritic: AdversarialCriticCriteriaSchema.optional(),

  /** Computed weighted composite score */
  compositeScore: z.number().min(0),

  /** Maximum possible score for this contribution */
  maxScore: z.number().min(0),

  /** Percentage score (compositeScore / maxScore) */
  percentage: z.number().min(0).max(100),

  /** Pass/fail gates */
  passFailGates: z.object({
    passed: z.boolean(),
    failures: z.array(
      z.object({
        gate: z.string(),
        reason: z.string(),
      })
    ),
  }),

  /** Warnings for low-scoring areas */
  warnings: z.array(
    z.object({
      criterion: z.string(),
      message: z.string(),
      suggestion: z.string().optional(),
      brennerQuote: z.string().optional(),
    })
  ),

  /** When this score was computed */
  scoredAt: z.string().datetime(),
});
export type ContributionScore = z.infer<typeof ContributionScoreSchema>;

// ============================================================================
// Session Score
// ============================================================================

/**
 * Aggregated score for an entire session.
 */
export const SessionScoreSchema = z.object({
  /** Session ID */
  sessionId: z.string(),

  /** Individual contribution scores */
  contributions: z.array(ContributionScoreSchema),

  /** Per-role aggregations */
  roleAggregations: z.object({
    hypothesisGenerator: z
      .object({
        count: z.number().int().min(0),
        meanScore: z.number().min(0),
        meanPercentage: z.number().min(0).max(100),
      })
      .optional(),
    testDesigner: z
      .object({
        count: z.number().int().min(0),
        meanScore: z.number().min(0),
        meanPercentage: z.number().min(0).max(100),
      })
      .optional(),
    adversarialCritic: z
      .object({
        count: z.number().int().min(0),
        meanScore: z.number().min(0),
        meanPercentage: z.number().min(0).max(100),
      })
      .optional(),
  }),

  /** Session-level metrics */
  sessionMetrics: z.object({
    /** Total valid contributions */
    totalContributions: z.number().int().min(0),

    /** Did quality improve over rounds? */
    progression: z.enum(["improving", "stable", "declining", "unknown"]),

    /** Did hypotheses narrow (kills > adds by end)? */
    convergence: z.object({
      addCount: z.number().int().min(0),
      killCount: z.number().int().min(0),
      converging: z.boolean(),
    }),

    /** Were all operators used? */
    operatorCoverage: z.object({
      used: z.array(z.string()),
      missing: z.array(z.string()),
      coveragePercentage: z.number().min(0).max(100),
    }),
  }),

  /** Overall session quality */
  overallScore: z.number().min(0),
  overallPercentage: z.number().min(0).max(100),

  /** When this score was computed */
  scoredAt: z.string().datetime(),
});
export type SessionScore = z.infer<typeof SessionScoreSchema>;

// ============================================================================
// Weight Configuration
// ============================================================================

/**
 * Weight configuration for composite score calculation.
 * Based on evaluation_rubric_v0.1.md.
 */
export const SCORE_WEIGHTS = {
  // Universal criteria (all roles)
  structuralCorrectness: 1.0,
  citationCompliance: 1.0,
  rationaleQuality: 0.5,

  // Hypothesis Generator criteria
  levelSeparation: 1.5,
  thirdAlternativePresence: 2.0,
  paradoxExploitation: 0.5,

  // Test Designer criteria
  discriminativePower: 2.0,
  potencyCheckSufficiency: 2.0,
  objectTransposition: 0.5,
  scoreCalibrationHonesty: 0.5,

  // Adversarial Critic criteria
  scaleCheckRigor: 1.5,
  anomalyQuarantineDiscipline: 1.5,
  theoryKillJustification: 1.5,
  realThirdAlternative: 1.5,
} as const;

/**
 * Maximum scores per criterion.
 */
export const MAX_SCORES = {
  // Standard criteria (0-3)
  structuralCorrectness: 3,
  citationCompliance: 3,
  rationaleQuality: 3,
  levelSeparation: 3,
  thirdAlternativePresence: 3,
  discriminativePower: 3,
  potencyCheckSufficiency: 3,
  scaleCheckRigor: 3,
  anomalyQuarantineDiscipline: 3,
  theoryKillJustification: 3,
  realThirdAlternative: 3,

  // Optional criteria (0-2)
  paradoxExploitation: 2,
  objectTransposition: 2,
  scoreCalibrationHonesty: 2,
} as const;

/**
 * Maximum possible weighted scores per role.
 *
 * Hypothesis Generator: 3 + 3 + 1.5 + 4.5 + 6 + 1 = 19
 * Test Designer: 3 + 3 + 1.5 + 6 + 6 + 1 + 1 = 21.5
 * Adversarial Critic (with KILL): 3 + 3 + 1.5 + 4.5 + 4.5 + 4.5 + 4.5 = 25.5
 * Adversarial Critic (ADD/EDIT): 3 + 3 + 1.5 + 4.5 + 4.5 + 4.5 = 21
 */
export const MAX_ROLE_SCORES = {
  hypothesis_generator: 19,
  test_designer: 21.5,
  adversarial_critic_with_kill: 25.5,
  adversarial_critic_no_kill: 21,
} as const;

// ============================================================================
// Scoring Functions
// ============================================================================

/**
 * Calculate weighted score for universal criteria.
 */
export function calculateUniversalScore(criteria: UniversalCriteria): number {
  return (
    criteria.structuralCorrectness.score * SCORE_WEIGHTS.structuralCorrectness +
    criteria.citationCompliance.score * SCORE_WEIGHTS.citationCompliance +
    criteria.rationaleQuality.score * SCORE_WEIGHTS.rationaleQuality
  );
}

/**
 * Calculate weighted score for Hypothesis Generator criteria.
 */
export function calculateHypothesisGeneratorScore(
  universal: UniversalCriteria,
  specific: HypothesisGeneratorCriteria
): { score: number; maxScore: number } {
  const universalScore = calculateUniversalScore(universal);

  const specificScore =
    specific.levelSeparation.score * SCORE_WEIGHTS.levelSeparation +
    specific.thirdAlternativePresence.score * SCORE_WEIGHTS.thirdAlternativePresence +
    (specific.paradoxExploitation.applicable
      ? specific.paradoxExploitation.score * SCORE_WEIGHTS.paradoxExploitation
      : 0);

  // Adjust max score if paradox exploitation is not applicable
  const maxScore = specific.paradoxExploitation.applicable
    ? MAX_ROLE_SCORES.hypothesis_generator
    : MAX_ROLE_SCORES.hypothesis_generator - MAX_SCORES.paradoxExploitation * SCORE_WEIGHTS.paradoxExploitation;

  return {
    score: universalScore + specificScore,
    maxScore,
  };
}

/**
 * Calculate weighted score for Test Designer criteria.
 */
export function calculateTestDesignerScore(
  universal: UniversalCriteria,
  specific: TestDesignerCriteria
): { score: number; maxScore: number } {
  const universalScore = calculateUniversalScore(universal);

  const specificScore =
    specific.discriminativePower.score * SCORE_WEIGHTS.discriminativePower +
    specific.potencyCheckSufficiency.score * SCORE_WEIGHTS.potencyCheckSufficiency +
    (specific.objectTransposition.applicable
      ? specific.objectTransposition.score * SCORE_WEIGHTS.objectTransposition
      : 0) +
    (specific.scoreCalibrationHonesty.hasEvidenceScore
      ? specific.scoreCalibrationHonesty.score * SCORE_WEIGHTS.scoreCalibrationHonesty
      : 0);

  // Adjust max score for non-applicable criteria
  let maxScore = MAX_ROLE_SCORES.test_designer;
  if (!specific.objectTransposition.applicable) {
    maxScore -= MAX_SCORES.objectTransposition * SCORE_WEIGHTS.objectTransposition;
  }
  if (!specific.scoreCalibrationHonesty.hasEvidenceScore) {
    maxScore -= MAX_SCORES.scoreCalibrationHonesty * SCORE_WEIGHTS.scoreCalibrationHonesty;
  }

  return {
    score: universalScore + specificScore,
    maxScore,
  };
}

/**
 * Calculate weighted score for Adversarial Critic criteria.
 */
export function calculateAdversarialCriticScore(
  universal: UniversalCriteria,
  specific: AdversarialCriticCriteria
): { score: number; maxScore: number } {
  const universalScore = calculateUniversalScore(universal);

  const specificScore =
    specific.scaleCheckRigor.score * SCORE_WEIGHTS.scaleCheckRigor +
    specific.anomalyQuarantineDiscipline.score * SCORE_WEIGHTS.anomalyQuarantineDiscipline +
    (specific.theoryKillJustification.applicable
      ? specific.theoryKillJustification.score * SCORE_WEIGHTS.theoryKillJustification
      : 0) +
    specific.realThirdAlternative.score * SCORE_WEIGHTS.realThirdAlternative;

  const maxScore = specific.theoryKillJustification.applicable
    ? MAX_ROLE_SCORES.adversarial_critic_with_kill
    : MAX_ROLE_SCORES.adversarial_critic_no_kill;

  return {
    score: universalScore + specificScore,
    maxScore,
  };
}

// ============================================================================
// Pass/Fail Gate Definitions
// ============================================================================

/**
 * Pass/fail gate definitions.
 * Certain failures are disqualifying regardless of other scores.
 */
export const PASS_FAIL_GATES = {
  invalidJson: {
    check: (score: ContributionScore) => score.universal.structuralCorrectness.validJson,
    message: "Invalid JSON in delta block",
  },
  missingRequiredFields: {
    check: (score: ContributionScore) => score.universal.structuralCorrectness.hasRequiredFields,
    message: "Missing required fields in delta",
  },
  missingPotencyCheck: {
    check: (score: ContributionScore) =>
      score.role !== "test_designer" || (score.testDesigner?.potencyCheckSufficiency.hasPotencyCheck ?? true),
    message: "Missing potency check in test design",
  },
  fakeAnchor: {
    check: (score: ContributionScore) => !score.universal.citationCompliance.fakeAnchorDetected,
    message: "Fake transcript anchor detected (§n that doesn't exist)",
  },
  killWithoutRationale: {
    check: (score: ContributionScore) =>
      score.role !== "adversarial_critic" ||
      !score.adversarialCritic?.theoryKillJustification.applicable ||
      score.adversarialCritic.theoryKillJustification.hasEvidence,
    message: "KILL operation without evidence/rationale",
  },
} as const;

// ============================================================================
// Warning Threshold Definitions
// ============================================================================

/**
 * Warning thresholds for low-scoring areas.
 */
export const WARNING_THRESHOLDS = {
  lowQualityContribution: {
    check: (score: ContributionScore) => score.percentage < 50,
    message: "Low-quality contribution (< 50% of max score)",
    criterion: "composite",
  },
  hypothesisSprawl: {
    // This would need session context to check
    check: (_score: ContributionScore) => false,
    message: "> 3 ADDs without KILL indicates possible hypothesis sprawl",
    criterion: "session",
  },
  missingScaleCheck: {
    check: (score: ContributionScore) =>
      score.role === "adversarial_critic" && (score.adversarialCritic?.scaleCheckRigor.score ?? 0) === 0,
    message: "Scale check missing for mechanism claim",
    criterion: "scaleCheckRigor",
  },
  weakPotency: {
    check: (score: ContributionScore) =>
      score.role === "test_designer" && (score.testDesigner?.potencyCheckSufficiency.score ?? 0) < 2,
    message: "Weak assay design (potency score < 2)",
    criterion: "potencyCheckSufficiency",
  },
} as const;

// ============================================================================
// Brenner Quotes for Feedback
// ============================================================================

/**
 * Sydney Brenner quotes to include in feedback, keyed by criterion.
 */
export const BRENNER_QUOTES: Record<string, string> = {
  levelSeparation: "Programs don't have wants. Interpreters do. (§58)",
  thirdAlternativePresence: "Both could be wrong. (§103)",
  scaleCheckRigor: "The imprisoned imagination — scale constraints are load-bearing. (§58)",
  anomalyQuarantineDiscipline: "Neither hidden nor allowed to destroy coherent framework.",
  theoryKillJustification: "When they go ugly, kill them. Get rid of them. (§229)",
  discriminativePower: "Exclusion is always a tremendously good thing. (§147)",
};

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Check if a score passes all gates.
 */
export function checkPassFailGates(score: ContributionScore): { passed: boolean; failures: { gate: string; reason: string }[] } {
  const failures: { gate: string; reason: string }[] = [];

  for (const [gateName, gate] of Object.entries(PASS_FAIL_GATES)) {
    if (!gate.check(score)) {
      failures.push({ gate: gateName, reason: gate.message });
    }
  }

  return {
    passed: failures.length === 0,
    failures,
  };
}

/**
 * Generate warnings for a score.
 */
export function generateWarnings(score: ContributionScore): ContributionScore["warnings"] {
  const warnings: ContributionScore["warnings"] = [];

  for (const [, threshold] of Object.entries(WARNING_THRESHOLDS)) {
    if (threshold.check(score)) {
      warnings.push({
        criterion: threshold.criterion,
        message: threshold.message,
        brennerQuote: BRENNER_QUOTES[threshold.criterion],
      });
    }
  }

  return warnings;
}

/**
 * Create an empty score for a criterion with score 0.
 */
export function createEmptyStructuralCorrectness(): StructuralCorrectness {
  return {
    score: 0,
    validJson: false,
    hasRequiredFields: false,
    sectionOperationMatch: false,
  };
}

export function createEmptyCitationCompliance(): CitationCompliance {
  return {
    score: 0,
    anchorCount: 0,
    validAnchors: 0,
    hasInferenceMarkers: false,
    fakeAnchorDetected: false,
  };
}

export function createEmptyRationaleQuality(): RationaleQuality {
  return {
    score: 0,
    hasRationale: false,
    mentionsOperators: false,
    explainsWhy: false,
  };
}
