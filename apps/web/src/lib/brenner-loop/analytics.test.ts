import { describe, expect, it } from "vitest";
import { computePersonalAnalytics } from "./analytics";
import { createSession } from "./types";
import { createHypothesisCard, generateHypothesisCardId } from "./hypothesis";
import type { HypothesisCard } from "./hypothesis";
import type { Session } from "./types";

function createTestHypothesis(
  sessionId: string,
  sequence: number,
  overrides: Partial<Parameters<typeof createHypothesisCard>[0]> = {}
): HypothesisCard {
  const id = generateHypothesisCardId(sessionId, sequence, 1);
  return createHypothesisCard({
    id,
    statement: `Hypothesis ${sequence} statement with details`,
    mechanism: `Mechanism ${sequence} via causal path`,
    domain: ["testing"],
    predictionsIfTrue: [`Predict true ${sequence}`],
    predictionsIfFalse: [`Predict false ${sequence}`],
    impossibleIfTrue: [`Falsify ${sequence} if we observe something`],
    sessionId,
    ...overrides,
  });
}

function sessionWithPrimaryHypothesis(sessionId: string, createdAt: string, phase: Session["phase"]): Session {
  const session = createSession({ id: sessionId });
  session.createdAt = createdAt;
  session.updatedAt = createdAt;
  session.phase = phase;

  const hypothesis = createTestHypothesis(sessionId, 1, { confidence: 60 });
  session.primaryHypothesisId = hypothesis.id;
  session.hypothesisCards[hypothesis.id] = hypothesis;

  return session;
}

describe("computePersonalAnalytics", () => {
  it("computes core counts and operator usage", () => {
    const now = new Date("2026-01-05T12:00:00.000Z");

    const sessionA = sessionWithPrimaryHypothesis("SESSION-A", "2026-01-04T10:00:00.000Z", "complete");
    sessionA.testIds = ["T-1", "T-2"];
    sessionA.operatorApplications.levelSplit.push({} as never);
    sessionA.operatorApplications.exclusionTest.push({} as never);

    const sessionB = sessionWithPrimaryHypothesis("SESSION-B", "2026-01-05T11:00:00.000Z", "intake");
    sessionB.testIds = [];
    sessionB.operatorApplications.objectTranspose.push({} as never);
    sessionB.alternativeHypothesisIds = ["ALT-1"];

    const analytics = computePersonalAnalytics({ sessions: [sessionA, sessionB], now });

    expect(analytics.sessionsTotal).toBe(2);
    expect(analytics.sessionsCompleted).toBe(1);
    expect(analytics.completionRate).toBeCloseTo(0.5);

    expect(analytics.testsRecorded).toBe(2);
    expect(analytics.hypothesesTested).toBe(2); // 1 per session
    expect(analytics.hypothesesWithCompetitors).toBe(1);

    expect(analytics.operatorsUsedDistribution.level_split).toBe(1);
    expect(analytics.operatorsUsedDistribution.exclusion_test).toBe(1);
    expect(analytics.operatorsUsedDistribution.object_transpose).toBe(1);
    expect(analytics.operatorsUsedDistribution.scale_check).toBe(0);

    expect(analytics.trendsOver30Days.windowDays).toBe(30);
    expect(analytics.trendsOver90Days.windowDays).toBe(90);
    expect(analytics.trendsOver30Days.points).toHaveLength(30);
    expect(analytics.trendsOver90Days.points).toHaveLength(90);
  });

  it("returns empty analytics for no sessions", () => {
    const now = new Date("2026-01-05T12:00:00.000Z");
    const analytics = computePersonalAnalytics({ sessions: [], now });

    expect(analytics.sessionsTotal).toBe(0);
    expect(analytics.sessionsCompleted).toBe(0);
    expect(analytics.completionRate).toBe(0);
    expect(analytics.insights[0]).toMatch(/No local Brenner Loop sessions/i);
  });
});

