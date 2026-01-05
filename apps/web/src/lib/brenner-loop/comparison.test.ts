import { describe, it, expect } from "vitest";
import type { HypothesisCard } from "./hypothesis";
import type { ComparisonMatrix } from "./hypothesis-arena";
import {
  buildComparisonResults,
  buildEvidenceSummary,
  buildPredictionConflictMatrix,
} from "./comparison";

function makeHypothesis(overrides: Partial<HypothesisCard>): HypothesisCard {
  return {
    id: overrides.id ?? "HC-TEST-001-v1",
    version: overrides.version ?? 1,
    statement: overrides.statement ?? "Baseline hypothesis",
    mechanism: overrides.mechanism ?? "Baseline mechanism",
    domain: overrides.domain ?? ["psychology"],
    predictionsIfTrue: overrides.predictionsIfTrue ?? ["Prediction A"],
    predictionsIfFalse: overrides.predictionsIfFalse ?? ["Prediction B"],
    impossibleIfTrue: overrides.impossibleIfTrue ?? ["Falsification"],
    confounds: overrides.confounds ?? [],
    assumptions: overrides.assumptions ?? [],
    confidence: overrides.confidence ?? 50,
    createdAt: overrides.createdAt ?? new Date("2026-01-01T00:00:00Z"),
    updatedAt: overrides.updatedAt ?? new Date("2026-01-01T00:00:00Z"),
    createdBy: overrides.createdBy,
    sessionId: overrides.sessionId,
    parentVersion: overrides.parentVersion,
    evolutionReason: overrides.evolutionReason,
  };
}

function makeMatrix(): ComparisonMatrix {
  return {
    arenaId: "AR-001",
    question: "Why does this happen?",
    tests: [
      { id: "T1", name: "Test 1", appliedAt: new Date("2026-01-01T00:00:00Z") },
      { id: "T2", name: "Test 2", appliedAt: new Date("2026-01-02T00:00:00Z") },
    ],
    rows: [
      {
        hypothesisId: "H1",
        statement: "Hypothesis A",
        status: "active",
        score: 10,
        testResults: { T1: "supports", T2: "neutral" },
        confidence: 60,
      },
      {
        hypothesisId: "H2",
        statement: "Hypothesis B",
        status: "active",
        score: -5,
        testResults: { T1: "challenges", T2: "neutral" },
        confidence: 45,
      },
    ],
    stats: {
      totalTests: 2,
      activeHypotheses: 2,
      eliminatedHypotheses: 0,
      averageScore: 2,
    },
  };
}

describe("comparison", () => {
  it("builds field-by-field comparison results", () => {
    const hypothesisA = makeHypothesis({
      id: "H1",
      statement: "Social media increases anxiety",
      predictionsIfTrue: ["Anxiety rises with usage"],
    });
    const hypothesisB = makeHypothesis({
      id: "H2",
      statement: "Social media increases anxiety",
      predictionsIfTrue: ["Anxiety falls with usage"],
    });

    const results = buildComparisonResults(hypothesisA, hypothesisB, ["statement", "predictionsIfTrue"]);
    const statement = results.find((result) => result.field === "statement");
    const predictions = results.find((result) => result.field === "predictionsIfTrue");

    expect(statement?.similarity).toBe(1);
    expect(predictions?.similarity).toBeLessThan(0.8);
  });

  it("builds prediction conflict matrix and summary", () => {
    const matrix = makeMatrix();
    const rows = buildPredictionConflictMatrix(matrix, "H1", "H2");
    expect(rows).toHaveLength(2);
    expect(rows[0].discriminating).toBe(true);

    const summary = buildEvidenceSummary(rows);
    expect(summary.discriminating).toBe(1);
    expect(summary.favorsA).toBe(1);
    expect(summary.favorsB).toBe(0);
  });
});
