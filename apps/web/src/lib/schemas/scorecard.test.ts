import { describe, it, expect } from "vitest";
import {
  ScoreSchema,
  OptionalScoreSchema,
  RoleSchema,
  StructuralCorrectnessSchema,
  CitationComplianceSchema,
  RationaleQualitySchema,
  LevelSeparationSchema,
  ThirdAlternativePresenceSchema,
  ParadoxExploitationSchema,
  DiscriminativePowerSchema,
  PotencyCheckSufficiencySchema,
  ObjectTranspositionSchema,
  ScoreCalibrationHonestySchema,
  ScaleCheckRigorSchema,
  AnomalyQuarantineDisciplineSchema,
  TheoryKillJustificationSchema,
  RealThirdAlternativeSchema,
  ContributionScoreSchema,
  SessionScoreSchema,
  SCORE_WEIGHTS,
  MAX_SCORES,
  MAX_ROLE_SCORES,
  calculateUniversalScore,
  calculateHypothesisGeneratorScore,
  calculateTestDesignerScore,
  calculateAdversarialCriticScore,
  checkPassFailGates,
  generateWarnings,
  generateSessionWarnings,
  SESSION_WARNING_THRESHOLDS,
  createEmptyStructuralCorrectness,
  createEmptyCitationCompliance,
  createEmptyRationaleQuality,
  BRENNER_QUOTES,
  type UniversalCriteria,
  type HypothesisGeneratorCriteria,
  type TestDesignerCriteria,
  type AdversarialCriticCriteria,
  type ContributionScore,
  type SessionScore,
} from "./scorecard";

describe("Score Schemas", () => {
  describe("ScoreSchema", () => {
    it("accepts valid scores 0-3", () => {
      expect(ScoreSchema.parse(0)).toBe(0);
      expect(ScoreSchema.parse(1)).toBe(1);
      expect(ScoreSchema.parse(2)).toBe(2);
      expect(ScoreSchema.parse(3)).toBe(3);
    });

    it("rejects invalid scores", () => {
      expect(() => ScoreSchema.parse(-1)).toThrow();
      expect(() => ScoreSchema.parse(4)).toThrow();
      expect(() => ScoreSchema.parse(1.5)).toThrow();
    });
  });

  describe("OptionalScoreSchema", () => {
    it("accepts valid scores 0-2", () => {
      expect(OptionalScoreSchema.parse(0)).toBe(0);
      expect(OptionalScoreSchema.parse(1)).toBe(1);
      expect(OptionalScoreSchema.parse(2)).toBe(2);
    });

    it("rejects invalid scores", () => {
      expect(() => OptionalScoreSchema.parse(3)).toThrow();
      expect(() => OptionalScoreSchema.parse(-1)).toThrow();
    });
  });

  describe("RoleSchema", () => {
    it("accepts valid roles", () => {
      expect(RoleSchema.parse("hypothesis_generator")).toBe("hypothesis_generator");
      expect(RoleSchema.parse("test_designer")).toBe("test_designer");
      expect(RoleSchema.parse("adversarial_critic")).toBe("adversarial_critic");
    });

    it("rejects invalid roles", () => {
      expect(() => RoleSchema.parse("invalid_role")).toThrow();
    });
  });
});

describe("Universal Criteria Schemas", () => {
  describe("StructuralCorrectnessSchema", () => {
    it("accepts valid structural correctness", () => {
      const valid = {
        score: 3,
        validJson: true,
        hasRequiredFields: true,
        sectionOperationMatch: true,
      };
      expect(StructuralCorrectnessSchema.parse(valid)).toEqual(valid);
    });

    it("accepts with optional notes", () => {
      const withNotes = {
        score: 2,
        validJson: true,
        hasRequiredFields: true,
        sectionOperationMatch: false,
        notes: "Minor section mismatch",
      };
      expect(StructuralCorrectnessSchema.parse(withNotes)).toEqual(withNotes);
    });
  });

  describe("CitationComplianceSchema", () => {
    it("accepts valid citation compliance", () => {
      const valid = {
        score: 3,
        anchorCount: 5,
        validAnchors: 5,
        hasInferenceMarkers: true,
        fakeAnchorDetected: false,
      };
      expect(CitationComplianceSchema.parse(valid)).toEqual(valid);
    });
  });

  describe("RationaleQualitySchema", () => {
    it("accepts valid rationale quality", () => {
      const valid = {
        score: 3,
        hasRationale: true,
        mentionsOperators: true,
        explainsWhy: true,
      };
      expect(RationaleQualitySchema.parse(valid)).toEqual(valid);
    });
  });
});

describe("Hypothesis Generator Criteria Schemas", () => {
  describe("LevelSeparationSchema", () => {
    it("accepts valid level separation", () => {
      const valid = {
        score: 3,
        conflationDetected: false,
        mechanismTyped: true,
      };
      expect(LevelSeparationSchema.parse(valid)).toEqual(valid);
    });

    it("accepts with conflation patterns", () => {
      const withPatterns = {
        score: 1,
        conflationDetected: true,
        conflationPatterns: ["The gene tells the cell to...", "The organism decides to..."],
        mechanismTyped: false,
      };
      expect(LevelSeparationSchema.parse(withPatterns)).toEqual(withPatterns);
    });
  });

  describe("ThirdAlternativePresenceSchema", () => {
    it("accepts valid third alternative presence", () => {
      const valid = {
        score: 3,
        hasThirdAlternative: true,
        isGenuinelyOrthogonal: true,
        isPlaceholder: false,
      };
      expect(ThirdAlternativePresenceSchema.parse(valid)).toEqual(valid);
    });
  });

  describe("ParadoxExploitationSchema", () => {
    it("accepts valid paradox exploitation", () => {
      const valid = {
        score: 2,
        applicable: true,
        paradoxIdentified: true,
        hypothesisDerivedFromParadox: true,
      };
      expect(ParadoxExploitationSchema.parse(valid)).toEqual(valid);
    });

    it("handles not applicable case", () => {
      const notApplicable = {
        score: 0,
        applicable: false,
        paradoxIdentified: false,
        hypothesisDerivedFromParadox: false,
      };
      expect(ParadoxExploitationSchema.parse(notApplicable)).toEqual(notApplicable);
    });
  });
});

describe("Test Designer Criteria Schemas", () => {
  describe("DiscriminativePowerSchema", () => {
    it("accepts valid discriminative power", () => {
      const valid = {
        score: 3,
        hypothesesDiscriminated: 2,
        outcomesAreDifferent: true,
        outcomesAreObservable: true,
        likelihoodRatioEstimate: ">100:1",
      };
      expect(DiscriminativePowerSchema.parse(valid)).toEqual(valid);
    });
  });

  describe("PotencyCheckSufficiencySchema", () => {
    it("accepts valid potency check sufficiency", () => {
      const valid = {
        score: 3,
        hasPotencyCheck: true,
        hasPositiveControl: true,
        hasSensitivityVerification: true,
        hasTimingValidation: true,
      };
      expect(PotencyCheckSufficiencySchema.parse(valid)).toEqual(valid);
    });
  });

  describe("ObjectTranspositionSchema", () => {
    it("accepts valid object transposition", () => {
      const valid = {
        score: 2,
        applicable: true,
        alternativesConsidered: true,
        costBenefitProvided: true,
      };
      expect(ObjectTranspositionSchema.parse(valid)).toEqual(valid);
    });
  });

  describe("ScoreCalibrationHonestySchema", () => {
    it("accepts valid score calibration", () => {
      const valid = {
        score: 2,
        hasEvidenceScore: true,
        isInflated: false,
        isConservative: true,
      };
      expect(ScoreCalibrationHonestySchema.parse(valid)).toEqual(valid);
    });
  });
});

describe("Adversarial Critic Criteria Schemas", () => {
  describe("ScaleCheckRigorSchema", () => {
    it("accepts valid scale check rigor", () => {
      const valid = {
        score: 3,
        hasScaleCheck: true,
        hasCalculation: true,
        hasUnits: true,
        hasConclusion: true,
      };
      expect(ScaleCheckRigorSchema.parse(valid)).toEqual(valid);
    });
  });

  describe("AnomalyQuarantineDisciplineSchema", () => {
    it("accepts valid anomaly quarantine discipline", () => {
      const valid = {
        score: 3,
        anomalyCount: 2,
        quarantinedCount: 2,
        hasResolutionPlans: true,
        prematurelyDestroys: false,
      };
      expect(AnomalyQuarantineDisciplineSchema.parse(valid)).toEqual(valid);
    });
  });

  describe("TheoryKillJustificationSchema", () => {
    it("accepts valid theory kill justification", () => {
      const valid = {
        score: 3,
        applicable: true,
        hasEvidence: true,
        evidenceIsDecisive: true,
        rescueMovesConsidered: true,
        unjustifiedPatternDetected: false,
      };
      expect(TheoryKillJustificationSchema.parse(valid)).toEqual(valid);
    });

    it("handles not applicable case", () => {
      const notApplicable = {
        score: 0,
        applicable: false,
        hasEvidence: false,
        evidenceIsDecisive: false,
        rescueMovesConsidered: false,
        unjustifiedPatternDetected: false,
      };
      expect(TheoryKillJustificationSchema.parse(notApplicable)).toEqual(notApplicable);
    });
  });

  describe("RealThirdAlternativeSchema", () => {
    it("accepts valid real third alternative", () => {
      const valid = {
        score: 3,
        hasAlternative: true,
        isSpecific: true,
        hasMechanism: true,
        hasTestablePredictions: true,
      };
      expect(RealThirdAlternativeSchema.parse(valid)).toEqual(valid);
    });
  });
});

describe("Score Calculation Functions", () => {
  const createUniversalCriteria = (scores: { structural: number; citation: number; rationale: number }): UniversalCriteria => ({
    structuralCorrectness: {
      score: scores.structural,
      validJson: true,
      hasRequiredFields: true,
      sectionOperationMatch: true,
    },
    citationCompliance: {
      score: scores.citation,
      anchorCount: 3,
      validAnchors: 3,
      hasInferenceMarkers: true,
      fakeAnchorDetected: false,
    },
    rationaleQuality: {
      score: scores.rationale,
      hasRationale: true,
      mentionsOperators: true,
      explainsWhy: true,
    },
  });

  describe("calculateUniversalScore", () => {
    it("calculates correct weighted score", () => {
      const criteria = createUniversalCriteria({ structural: 3, citation: 3, rationale: 3 });
      // 3*1.0 + 3*1.0 + 3*0.5 = 7.5
      expect(calculateUniversalScore(criteria)).toBe(7.5);
    });

    it("handles zero scores", () => {
      const criteria = createUniversalCriteria({ structural: 0, citation: 0, rationale: 0 });
      expect(calculateUniversalScore(criteria)).toBe(0);
    });
  });

  describe("calculateHypothesisGeneratorScore", () => {
    it("calculates correct weighted score with paradox applicable", () => {
      const universal = createUniversalCriteria({ structural: 3, citation: 3, rationale: 3 });
      const specific: HypothesisGeneratorCriteria = {
        levelSeparation: { score: 3, conflationDetected: false, mechanismTyped: true },
        thirdAlternativePresence: { score: 3, hasThirdAlternative: true, isGenuinelyOrthogonal: true, isPlaceholder: false },
        paradoxExploitation: { score: 2, applicable: true, paradoxIdentified: true, hypothesisDerivedFromParadox: true },
      };

      const result = calculateHypothesisGeneratorScore(universal, specific);
      // Universal: 7.5
      // Specific: 3*1.5 + 3*2.0 + 2*0.5 = 4.5 + 6 + 1 = 11.5
      // Total: 19
      expect(result.score).toBe(19);
      expect(result.maxScore).toBe(19);
    });

    it("adjusts max score when paradox not applicable", () => {
      const universal = createUniversalCriteria({ structural: 3, citation: 3, rationale: 3 });
      const specific: HypothesisGeneratorCriteria = {
        levelSeparation: { score: 3, conflationDetected: false, mechanismTyped: true },
        thirdAlternativePresence: { score: 3, hasThirdAlternative: true, isGenuinelyOrthogonal: true, isPlaceholder: false },
        paradoxExploitation: { score: 0, applicable: false, paradoxIdentified: false, hypothesisDerivedFromParadox: false },
      };

      const result = calculateHypothesisGeneratorScore(universal, specific);
      // Max reduced by 2*0.5 = 1
      expect(result.maxScore).toBe(18);
      // Score: 7.5 + 4.5 + 6 + 0 = 18
      expect(result.score).toBe(18);
    });
  });

  describe("calculateTestDesignerScore", () => {
    it("calculates correct weighted score", () => {
      const universal = createUniversalCriteria({ structural: 3, citation: 3, rationale: 3 });
      const specific: TestDesignerCriteria = {
        discriminativePower: {
          score: 3,
          hypothesesDiscriminated: 2,
          outcomesAreDifferent: true,
          outcomesAreObservable: true,
        },
        potencyCheckSufficiency: {
          score: 3,
          hasPotencyCheck: true,
          hasPositiveControl: true,
          hasSensitivityVerification: true,
          hasTimingValidation: true,
        },
        objectTransposition: { score: 2, applicable: true, alternativesConsidered: true, costBenefitProvided: true },
        scoreCalibrationHonesty: { score: 2, hasEvidenceScore: true, isInflated: false, isConservative: true },
      };

      const result = calculateTestDesignerScore(universal, specific);
      // Universal: 7.5
      // Specific: 3*2.0 + 3*2.0 + 2*0.5 + 2*0.5 = 6 + 6 + 1 + 1 = 14
      // Total: 21.5
      expect(result.score).toBe(21.5);
      expect(result.maxScore).toBe(21.5);
    });
  });

  describe("calculateAdversarialCriticScore", () => {
    it("calculates correct weighted score with kill applicable", () => {
      const universal = createUniversalCriteria({ structural: 3, citation: 3, rationale: 3 });
      const specific: AdversarialCriticCriteria = {
        scaleCheckRigor: { score: 3, hasScaleCheck: true, hasCalculation: true, hasUnits: true, hasConclusion: true },
        anomalyQuarantineDiscipline: {
          score: 3,
          anomalyCount: 2,
          quarantinedCount: 2,
          hasResolutionPlans: true,
          prematurelyDestroys: false,
        },
        theoryKillJustification: {
          score: 3,
          applicable: true,
          hasEvidence: true,
          evidenceIsDecisive: true,
          rescueMovesConsidered: true,
          unjustifiedPatternDetected: false,
        },
        realThirdAlternative: { score: 3, hasAlternative: true, isSpecific: true, hasMechanism: true, hasTestablePredictions: true },
      };

      const result = calculateAdversarialCriticScore(universal, specific);
      // Universal: 7.5
      // Specific: 3*1.5 + 3*1.5 + 3*1.5 + 3*1.5 = 18
      // Total: 25.5
      expect(result.score).toBe(25.5);
      expect(result.maxScore).toBe(25.5);
    });

    it("adjusts max score when kill not applicable", () => {
      const universal = createUniversalCriteria({ structural: 3, citation: 3, rationale: 3 });
      const specific: AdversarialCriticCriteria = {
        scaleCheckRigor: { score: 3, hasScaleCheck: true, hasCalculation: true, hasUnits: true, hasConclusion: true },
        anomalyQuarantineDiscipline: {
          score: 3,
          anomalyCount: 2,
          quarantinedCount: 2,
          hasResolutionPlans: true,
          prematurelyDestroys: false,
        },
        theoryKillJustification: {
          score: 0,
          applicable: false,
          hasEvidence: false,
          evidenceIsDecisive: false,
          rescueMovesConsidered: false,
          unjustifiedPatternDetected: false,
        },
        realThirdAlternative: { score: 3, hasAlternative: true, isSpecific: true, hasMechanism: true, hasTestablePredictions: true },
      };

      const result = calculateAdversarialCriticScore(universal, specific);
      expect(result.maxScore).toBe(21);
      // Score: 7.5 + 4.5 + 4.5 + 0 + 4.5 = 21
      expect(result.score).toBe(21);
    });
  });
});

describe("Pass/Fail Gates", () => {
  const createMockContributionScore = (overrides: Partial<ContributionScore> = {}): ContributionScore => ({
    contributionId: "test-contribution-1",
    sessionId: "RS20251230",
    role: "hypothesis_generator",
    universal: {
      structuralCorrectness: {
        score: 3,
        validJson: true,
        hasRequiredFields: true,
        sectionOperationMatch: true,
      },
      citationCompliance: {
        score: 3,
        anchorCount: 3,
        validAnchors: 3,
        hasInferenceMarkers: true,
        fakeAnchorDetected: false,
      },
      rationaleQuality: {
        score: 3,
        hasRationale: true,
        mentionsOperators: true,
        explainsWhy: true,
      },
    },
    compositeScore: 19,
    maxScore: 19,
    percentage: 100,
    passFailGates: { passed: true, failures: [] },
    warnings: [],
    scoredAt: new Date().toISOString(),
    ...overrides,
  });

  describe("checkPassFailGates", () => {
    it("passes all gates with valid score", () => {
      const score = createMockContributionScore();
      const result = checkPassFailGates(score);
      expect(result.passed).toBe(true);
      expect(result.failures).toHaveLength(0);
    });

    it("fails on invalid JSON", () => {
      const score = createMockContributionScore({
        universal: {
          structuralCorrectness: {
            score: 0,
            validJson: false,
            hasRequiredFields: false,
            sectionOperationMatch: false,
          },
          citationCompliance: {
            score: 3,
            anchorCount: 3,
            validAnchors: 3,
            hasInferenceMarkers: true,
            fakeAnchorDetected: false,
          },
          rationaleQuality: {
            score: 3,
            hasRationale: true,
            mentionsOperators: true,
            explainsWhy: true,
          },
        },
      });
      const result = checkPassFailGates(score);
      expect(result.passed).toBe(false);
      expect(result.failures.some((f) => f.gate === "invalidJson")).toBe(true);
    });

    it("fails on fake anchor detected", () => {
      const score = createMockContributionScore({
        universal: {
          structuralCorrectness: {
            score: 3,
            validJson: true,
            hasRequiredFields: true,
            sectionOperationMatch: true,
          },
          citationCompliance: {
            score: 0,
            anchorCount: 1,
            validAnchors: 0,
            hasInferenceMarkers: false,
            fakeAnchorDetected: true,
          },
          rationaleQuality: {
            score: 3,
            hasRationale: true,
            mentionsOperators: true,
            explainsWhy: true,
          },
        },
      });
      const result = checkPassFailGates(score);
      expect(result.passed).toBe(false);
      expect(result.failures.some((f) => f.gate === "fakeAnchor")).toBe(true);
    });

    it("fails on missing potency check for test designer", () => {
      const score = createMockContributionScore({
        role: "test_designer",
        testDesigner: {
          discriminativePower: {
            score: 3,
            hypothesesDiscriminated: 2,
            outcomesAreDifferent: true,
            outcomesAreObservable: true,
          },
          potencyCheckSufficiency: {
            score: 0,
            hasPotencyCheck: false,
            hasPositiveControl: false,
            hasSensitivityVerification: false,
            hasTimingValidation: false,
          },
          objectTransposition: { score: 0, applicable: false, alternativesConsidered: false, costBenefitProvided: false },
          scoreCalibrationHonesty: { score: 0, hasEvidenceScore: false, isInflated: false, isConservative: false },
        },
      });
      const result = checkPassFailGates(score);
      expect(result.passed).toBe(false);
      expect(result.failures.some((f) => f.gate === "missingPotencyCheck")).toBe(true);
    });

    it("fails on kill without evidence", () => {
      const score = createMockContributionScore({
        role: "adversarial_critic",
        adversarialCritic: {
          scaleCheckRigor: { score: 0, hasScaleCheck: false, hasCalculation: false, hasUnits: false, hasConclusion: false },
          anomalyQuarantineDiscipline: {
            score: 0,
            anomalyCount: 0,
            quarantinedCount: 0,
            hasResolutionPlans: false,
            prematurelyDestroys: false,
          },
          theoryKillJustification: {
            score: 0,
            applicable: true,
            hasEvidence: false,
            evidenceIsDecisive: false,
            rescueMovesConsidered: false,
            unjustifiedPatternDetected: true,
          },
          realThirdAlternative: { score: 0, hasAlternative: false, isSpecific: false, hasMechanism: false, hasTestablePredictions: false },
        },
      });
      const result = checkPassFailGates(score);
      expect(result.passed).toBe(false);
      expect(result.failures.some((f) => f.gate === "killWithoutRationale")).toBe(true);
    });
  });
});

describe("Warning Generation", () => {
  const createMockContributionScore = (overrides: Partial<ContributionScore> = {}): ContributionScore => ({
    contributionId: "test-contribution-1",
    sessionId: "RS20251230",
    role: "hypothesis_generator",
    universal: {
      structuralCorrectness: {
        score: 3,
        validJson: true,
        hasRequiredFields: true,
        sectionOperationMatch: true,
      },
      citationCompliance: {
        score: 3,
        anchorCount: 3,
        validAnchors: 3,
        hasInferenceMarkers: true,
        fakeAnchorDetected: false,
      },
      rationaleQuality: {
        score: 3,
        hasRationale: true,
        mentionsOperators: true,
        explainsWhy: true,
      },
    },
    compositeScore: 19,
    maxScore: 19,
    percentage: 100,
    passFailGates: { passed: true, failures: [] },
    warnings: [],
    scoredAt: new Date().toISOString(),
    ...overrides,
  });

  describe("generateWarnings", () => {
    it("generates low quality warning when percentage < 50", () => {
      const score = createMockContributionScore({
        compositeScore: 5,
        maxScore: 19,
        percentage: 26,
      });
      const warnings = generateWarnings(score);
      expect(warnings.some((w) => w.criterion === "composite")).toBe(true);
    });

    it("generates missing scale check warning for adversarial critic", () => {
      const score = createMockContributionScore({
        role: "adversarial_critic",
        percentage: 60,
        adversarialCritic: {
          scaleCheckRigor: { score: 0, hasScaleCheck: false, hasCalculation: false, hasUnits: false, hasConclusion: false },
          anomalyQuarantineDiscipline: {
            score: 3,
            anomalyCount: 1,
            quarantinedCount: 1,
            hasResolutionPlans: true,
            prematurelyDestroys: false,
          },
          theoryKillJustification: {
            score: 0,
            applicable: false,
            hasEvidence: false,
            evidenceIsDecisive: false,
            rescueMovesConsidered: false,
            unjustifiedPatternDetected: false,
          },
          realThirdAlternative: { score: 3, hasAlternative: true, isSpecific: true, hasMechanism: true, hasTestablePredictions: true },
        },
      });
      const warnings = generateWarnings(score);
      expect(warnings.some((w) => w.criterion === "scaleCheckRigor")).toBe(true);
    });

    it("generates weak potency warning for test designer", () => {
      const score = createMockContributionScore({
        role: "test_designer",
        percentage: 60,
        testDesigner: {
          discriminativePower: {
            score: 3,
            hypothesesDiscriminated: 2,
            outcomesAreDifferent: true,
            outcomesAreObservable: true,
          },
          potencyCheckSufficiency: {
            score: 1,
            hasPotencyCheck: true,
            hasPositiveControl: true,
            hasSensitivityVerification: false,
            hasTimingValidation: false,
          },
          objectTransposition: { score: 0, applicable: false, alternativesConsidered: false, costBenefitProvided: false },
          scoreCalibrationHonesty: { score: 0, hasEvidenceScore: false, isInflated: false, isConservative: false },
        },
      });
      const warnings = generateWarnings(score);
      expect(warnings.some((w) => w.criterion === "potencyCheckSufficiency")).toBe(true);
    });

    it("returns empty array when no warnings", () => {
      const score = createMockContributionScore();
      const warnings = generateWarnings(score);
      expect(warnings).toHaveLength(0);
    });
  });
});

describe("Helper Functions", () => {
  describe("createEmptyStructuralCorrectness", () => {
    it("creates empty structural correctness", () => {
      const empty = createEmptyStructuralCorrectness();
      expect(empty.score).toBe(0);
      expect(empty.validJson).toBe(false);
      expect(empty.hasRequiredFields).toBe(false);
      expect(empty.sectionOperationMatch).toBe(false);
    });
  });

  describe("createEmptyCitationCompliance", () => {
    it("creates empty citation compliance", () => {
      const empty = createEmptyCitationCompliance();
      expect(empty.score).toBe(0);
      expect(empty.anchorCount).toBe(0);
      expect(empty.validAnchors).toBe(0);
      expect(empty.hasInferenceMarkers).toBe(false);
      expect(empty.fakeAnchorDetected).toBe(false);
    });
  });

  describe("createEmptyRationaleQuality", () => {
    it("creates empty rationale quality", () => {
      const empty = createEmptyRationaleQuality();
      expect(empty.score).toBe(0);
      expect(empty.hasRationale).toBe(false);
      expect(empty.mentionsOperators).toBe(false);
      expect(empty.explainsWhy).toBe(false);
    });
  });
});

describe("Constants", () => {
  describe("SCORE_WEIGHTS", () => {
    it("has correct weights", () => {
      expect(SCORE_WEIGHTS.structuralCorrectness).toBe(1.0);
      expect(SCORE_WEIGHTS.citationCompliance).toBe(1.0);
      expect(SCORE_WEIGHTS.rationaleQuality).toBe(0.5);
      expect(SCORE_WEIGHTS.levelSeparation).toBe(1.5);
      expect(SCORE_WEIGHTS.thirdAlternativePresence).toBe(2.0);
      expect(SCORE_WEIGHTS.paradoxExploitation).toBe(0.5);
      expect(SCORE_WEIGHTS.discriminativePower).toBe(2.0);
      expect(SCORE_WEIGHTS.potencyCheckSufficiency).toBe(2.0);
      expect(SCORE_WEIGHTS.objectTransposition).toBe(0.5);
      expect(SCORE_WEIGHTS.scoreCalibrationHonesty).toBe(0.5);
      expect(SCORE_WEIGHTS.scaleCheckRigor).toBe(1.5);
      expect(SCORE_WEIGHTS.anomalyQuarantineDiscipline).toBe(1.5);
      expect(SCORE_WEIGHTS.theoryKillJustification).toBe(1.5);
      expect(SCORE_WEIGHTS.realThirdAlternative).toBe(1.5);
    });
  });

  describe("MAX_SCORES", () => {
    it("has correct max values", () => {
      expect(MAX_SCORES.structuralCorrectness).toBe(3);
      expect(MAX_SCORES.paradoxExploitation).toBe(2);
      expect(MAX_SCORES.objectTransposition).toBe(2);
      expect(MAX_SCORES.scoreCalibrationHonesty).toBe(2);
    });
  });

  describe("MAX_ROLE_SCORES", () => {
    it("has correct max role scores", () => {
      expect(MAX_ROLE_SCORES.hypothesis_generator).toBe(19);
      expect(MAX_ROLE_SCORES.test_designer).toBe(21.5);
      expect(MAX_ROLE_SCORES.adversarial_critic_with_kill).toBe(25.5);
      expect(MAX_ROLE_SCORES.adversarial_critic_no_kill).toBe(21);
    });
  });

  describe("BRENNER_QUOTES", () => {
    it("has quotes for key criteria", () => {
      expect(BRENNER_QUOTES.levelSeparation).toContain("§58");
      expect(BRENNER_QUOTES.thirdAlternativePresence).toContain("§103");
      expect(BRENNER_QUOTES.theoryKillJustification).toContain("§229");
      expect(BRENNER_QUOTES.discriminativePower).toContain("§147");
    });
  });
});

describe("Composite Score Schemas", () => {
  describe("ContributionScoreSchema", () => {
    it("validates a complete contribution score", () => {
      const valid = {
        contributionId: "delta-001",
        sessionId: "RS20251230",
        role: "hypothesis_generator" as const,
        universal: {
          structuralCorrectness: {
            score: 3,
            validJson: true,
            hasRequiredFields: true,
            sectionOperationMatch: true,
          },
          citationCompliance: {
            score: 3,
            anchorCount: 3,
            validAnchors: 3,
            hasInferenceMarkers: true,
            fakeAnchorDetected: false,
          },
          rationaleQuality: {
            score: 3,
            hasRationale: true,
            mentionsOperators: true,
            explainsWhy: true,
          },
        },
        hypothesisGenerator: {
          levelSeparation: { score: 3, conflationDetected: false, mechanismTyped: true },
          thirdAlternativePresence: { score: 3, hasThirdAlternative: true, isGenuinelyOrthogonal: true, isPlaceholder: false },
          paradoxExploitation: { score: 2, applicable: true, paradoxIdentified: true, hypothesisDerivedFromParadox: true },
        },
        compositeScore: 19,
        maxScore: 19,
        percentage: 100,
        passFailGates: { passed: true, failures: [] },
        warnings: [],
        scoredAt: new Date().toISOString(),
      };

      expect(() => ContributionScoreSchema.parse(valid)).not.toThrow();
    });
  });

  describe("SessionScoreSchema", () => {
    it("validates a session score", () => {
      const valid = {
        sessionId: "RS20251230",
        contributions: [],
        roleAggregations: {
          hypothesisGenerator: {
            count: 3,
            meanScore: 15,
            meanPercentage: 78.9,
          },
        },
        sessionMetrics: {
          totalContributions: 3,
          progression: "improving" as const,
          convergence: {
            addCount: 2,
            killCount: 1,
            converging: false,
          },
          operatorCoverage: {
            used: ["⊘", "⊕"],
            missing: ["⊙"],
            coveragePercentage: 66.7,
          },
        },
        overallScore: 15,
        overallPercentage: 78.9,
        scoredAt: new Date().toISOString(),
      };

      expect(() => SessionScoreSchema.parse(valid)).not.toThrow();
    });
  });
});
