import type { OperatorType } from "./operators/framework";
import { calculateFalsifiabilityScore, calculateSpecificityScore } from "./hypothesis";
import type { HypothesisCard, Session } from "./types";

// Threshold constants for hypothesis outcome classification
const FALSIFIED_CONFIDENCE_THRESHOLD = 20;
const ROBUST_CONFIDENCE_THRESHOLD = 80;

export interface TrendPoint {
  /** YYYY-MM-DD (UTC) */
  date: string;
  sessionsCreated: number;
  sessionsCompleted: number;
  averageFalsifiabilityScore: number;
  averageSpecificityScore: number;
}

export interface TrendData {
  windowDays: number;
  points: TrendPoint[];
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  unlocked: boolean;
}

export interface PersonalAnalytics {
  userId: string;
  computedAt: string;

  sessionsTotal: number;
  sessionsCompleted: number;
  completionRate: number;

  hypothesesTested: number;
  hypothesesWithCompetitors: number;

  testsRecorded: number;

  averageFalsifiabilityScore: number;
  averageSpecificityScore: number;
  averageSessionDurationMinutes: number;

  operatorsUsedDistribution: Record<OperatorType, number>;

  hypothesesFalsified: number;
  hypothesesRobust: number;
  hypothesesAbandoned: number;

  objectionsAddressed: number;
  objectionsAccepted: number;
  revisionsAfterEvidence: number;

  trendsOver30Days: TrendData;
  trendsOver90Days: TrendData;

  insights: string[];
  achievements: Achievement[];
}

interface SessionScores {
  falsifiability: number;
  specificity: number;
}

const OPERATOR_KEYS: readonly OperatorType[] = [
  "level_split",
  "exclusion_test",
  "object_transpose",
  "scale_check",
];

function createEmptyOperatorDistribution(): Record<OperatorType, number> {
  return {
    level_split: 0,
    exclusion_test: 0,
    object_transpose: 0,
    scale_check: 0,
  };
}

function safeParseIsoDate(value: string | null | undefined): Date | null {
  if (!value) return null;
  const ms = Date.parse(value);
  if (Number.isNaN(ms)) return null;
  return new Date(ms);
}

function toUtcDateKey(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function clampScore(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.max(0, Math.min(100, value));
}

function mean(values: number[]): number {
  if (values.length === 0) return 0;
  return values.reduce((sum, v) => sum + v, 0) / values.length;
}

function getSessionScores(session: Session): SessionScores | null {
  const primary = session.hypothesisCards?.[session.primaryHypothesisId];
  if (!primary) return null;

  return {
    falsifiability: clampScore(calculateFalsifiabilityScore(primary)),
    specificity: clampScore(calculateSpecificityScore(primary)),
  };
}

function countOperatorUsage(session: Session, distribution: Record<OperatorType, number>): void {
  const apps = session.operatorApplications;
  if (!apps) return;

  if (Array.isArray(apps.levelSplit) && apps.levelSplit.length > 0) distribution.level_split += 1;
  if (Array.isArray(apps.exclusionTest) && apps.exclusionTest.length > 0) distribution.exclusion_test += 1;
  if (Array.isArray(apps.objectTranspose) && apps.objectTranspose.length > 0) distribution.object_transpose += 1;
  if (Array.isArray(apps.scaleCheck) && apps.scaleCheck.length > 0) distribution.scale_check += 1;
}

/**
 * Classify a hypothesis as falsified, robust, or in-progress based on confidence.
 * - Falsified: confidence < 20 (very speculative, essentially ruled out)
 * - Robust: confidence > 80 (strong support, passed discriminative tests)
 * - In-progress: everything else
 */
function classifyHypothesisOutcome(card: HypothesisCard): "falsified" | "robust" | "in_progress" {
  const confidence = card.confidence ?? 50;
  if (confidence < FALSIFIED_CONFIDENCE_THRESHOLD) return "falsified";
  if (confidence > ROBUST_CONFIDENCE_THRESHOLD) return "robust";
  return "in_progress";
}

/**
 * Count hypothesis outcomes across all sessions.
 * - Abandoned: hypotheses in archivedHypothesisIds
 * - Falsified: hypotheses with confidence < 20
 * - Robust: hypotheses with confidence > 80 in completed sessions
 */
function countHypothesisOutcomes(sessions: Session[]): {
  falsified: number;
  robust: number;
  abandoned: number;
} {
  let falsified = 0;
  let robust = 0;
  let abandoned = 0;

  for (const session of sessions) {
    // Count abandoned hypotheses (archived)
    abandoned += session.archivedHypothesisIds?.length ?? 0;

    // Classify active hypotheses by confidence
    const cards = session.hypothesisCards;
    if (!cards || typeof cards !== "object") continue;

    for (const cardId of Object.keys(cards)) {
      const card = cards[cardId];
      if (!card) continue;

      // Skip archived hypotheses (already counted as abandoned)
      if (session.archivedHypothesisIds?.includes(cardId)) continue;

      const outcome = classifyHypothesisOutcome(card);
      if (outcome === "falsified") {
        falsified += 1;
      } else if (outcome === "robust" && session.phase === "complete") {
        // Only count robust if session is complete (hypothesis has "survived")
        robust += 1;
      }
    }
  }

  return { falsified, robust, abandoned };
}

/**
 * Count revisions triggered by evidence across all sessions.
 * Looks at hypothesisEvolution entries with trigger === "evidence".
 */
function countRevisionsAfterEvidence(sessions: Session[]): number {
  let count = 0;
  for (const session of sessions) {
    const evolutions = session.hypothesisEvolution;
    if (!Array.isArray(evolutions)) continue;

    for (const evolution of evolutions) {
      if (evolution.trigger === "evidence") {
        count += 1;
      }
    }
  }
  return count;
}

function computeAverageDurationMinutes(sessions: Session[]): number {
  const minutes = sessions
    .map((session) => {
      const createdAt = safeParseIsoDate(session.createdAt);
      const updatedAt = safeParseIsoDate(session.updatedAt);
      if (!createdAt || !updatedAt) return null;
      const diffMs = updatedAt.getTime() - createdAt.getTime();
      if (!Number.isFinite(diffMs)) return null;
      return Math.max(0, diffMs / 60000);
    })
    .filter((v): v is number => typeof v === "number");

  return mean(minutes);
}

function buildTrendData(params: {
  sessions: Session[];
  windowDays: number;
  now: Date;
}): TrendData {
  const end = new Date(Date.UTC(params.now.getUTCFullYear(), params.now.getUTCMonth(), params.now.getUTCDate()));
  const start = new Date(end);
  start.setUTCDate(start.getUTCDate() - (params.windowDays - 1));

  const byDay = new Map<string, Session[]>();
  for (const session of params.sessions) {
    const createdAt = safeParseIsoDate(session.createdAt);
    if (!createdAt) continue;
    const createdDay = new Date(Date.UTC(createdAt.getUTCFullYear(), createdAt.getUTCMonth(), createdAt.getUTCDate()));
    if (createdDay < start || createdDay > end) continue;
    const key = toUtcDateKey(createdDay);
    const bucket = byDay.get(key) ?? [];
    bucket.push(session);
    byDay.set(key, bucket);
  }

  const points: TrendPoint[] = [];
  for (let i = 0; i < params.windowDays; i++) {
    const day = new Date(start);
    day.setUTCDate(start.getUTCDate() + i);
    const key = toUtcDateKey(day);
    const sessions = byDay.get(key) ?? [];

    const scores: SessionScores[] = sessions.map(getSessionScores).filter((s): s is SessionScores => s !== null);
    const completed = sessions.filter((s) => s.phase === "complete").length;

    points.push({
      date: key,
      sessionsCreated: sessions.length,
      sessionsCompleted: completed,
      averageFalsifiabilityScore: mean(scores.map((s) => s.falsifiability)),
      averageSpecificityScore: mean(scores.map((s) => s.specificity)),
    });
  }

  return { windowDays: params.windowDays, points };
}

function buildInsights(params: {
  sessionsTotal: number;
  completionRate: number;
  averageFalsifiability: number;
  operatorsUsedDistribution: Record<OperatorType, number>;
  hypothesesWithCompetitors: number;
}): string[] {
  const insights: string[] = [];

  if (params.sessionsTotal === 0) {
    insights.push("No local Brenner Loop sessions found yet. Start one to build your analytics history.");
    return insights;
  }

  if (params.completionRate < 0.4) {
    insights.push("Low completion rate: consider shorter session templates or skipping non-essential phases early.");
  }

  if (params.averageFalsifiability < 30) {
    insights.push("Your falsification criteria are often underspecified. Add 2–3 concrete 'impossible if true' conditions.");
  }

  const scaleUsed = params.operatorsUsedDistribution.scale_check;
  if (scaleUsed / Math.max(1, params.sessionsTotal) < 0.25) {
    insights.push("Scale Check is underused. Add at least one order-of-magnitude constraint in important sessions.");
  }

  if (params.hypothesesWithCompetitors / Math.max(1, params.sessionsTotal) < 0.5) {
    insights.push("Third alternatives are underused. Add at least one competing hypothesis before designing tests.");
  }

  return insights;
}

function buildAchievements(params: {
  sessionsCompleted: number;
  operatorsUsedDistribution: Record<OperatorType, number>;
  sessionsTotal: number;
  hypothesesFalsified: number;
  hypothesesRobust: number;
}): Achievement[] {
  const operatorsUsedCount = OPERATOR_KEYS.filter((op) => params.operatorsUsedDistribution[op] > 0).length;

  return [
    {
      id: "first-session",
      title: "First Session",
      description: "Complete your first Brenner Loop session.",
      unlocked: params.sessionsCompleted >= 1,
    },
    {
      id: "five-sessions",
      title: "Consistency",
      description: "Complete five sessions.",
      unlocked: params.sessionsCompleted >= 5,
    },
    {
      id: "operator-explorer",
      title: "Operator Explorer",
      description: "Use at least three different operators across your sessions.",
      unlocked: operatorsUsedCount >= 3,
    },
    {
      id: "full-operator-stack",
      title: "Full Stack",
      description: "Use all four operators at least once.",
      unlocked: operatorsUsedCount === 4,
    },
    {
      id: "staying-power",
      title: "Staying Power",
      description: "Create at least ten sessions.",
      unlocked: params.sessionsTotal >= 10,
    },
    {
      id: "hypothesis-hunter",
      title: "Hypothesis Hunter",
      description: "Falsify at least 5 hypotheses through discriminative testing.",
      unlocked: params.hypothesesFalsified >= 5,
    },
    {
      id: "robust-thinker",
      title: "Robust Thinker",
      description: "Have at least 3 hypotheses survive rigorous testing.",
      unlocked: params.hypothesesRobust >= 3,
    },
  ];
}

/**
 * Optional objection statistics computed externally (from localStorage).
 * These are passed in because the analytics module doesn't have localStorage access.
 */
export interface ObjectionStats {
  addressed: number;
  accepted: number;
}

/**
 * Load objection stats from localStorage for a list of session/thread IDs.
 * This is a client-side helper that aggregates status counts across all threads.
 *
 * @param threadIds - List of thread IDs (typically derived from session IDs)
 * @returns Aggregated objection statistics
 */
export function loadObjectionStatsFromStorage(threadIds: string[]): ObjectionStats {
  if (typeof window === "undefined") {
    return { addressed: 0, accepted: 0 };
  }

  let addressed = 0;
  let accepted = 0;

  for (const threadId of threadIds) {
    const key = `brenner-objection-register:${threadId}`;
    try {
      const raw = window.localStorage.getItem(key);
      if (!raw) continue;

      const parsed = JSON.parse(raw) as unknown;
      if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) continue;

      const statuses = parsed as Record<string, unknown>;
      for (const status of Object.values(statuses)) {
        if (status === "addressed") addressed += 1;
        if (status === "accepted") accepted += 1;
      }
    } catch {
      // Best-effort: localStorage issues should not break analytics
    }
  }

  return { addressed, accepted };
}

/**
 * Generate potential thread IDs from a session ID.
 * Thread IDs follow the pattern: TRIBUNAL-{sessionId}-{suffix}
 * Since we don't know the exact suffix, we search for matching keys.
 */
export function findThreadIdsForSession(sessionId: string): string[] {
  if (typeof window === "undefined") return [];

  const prefix = `brenner-objection-register:TRIBUNAL-${sessionId}`;
  const threadIds: string[] = [];

  try {
    for (let i = 0; i < window.localStorage.length; i++) {
      const key = window.localStorage.key(i);
      if (key?.startsWith(prefix)) {
        // Extract thread ID from the storage key
        const threadId = key.replace("brenner-objection-register:", "");
        threadIds.push(threadId);
      }
    }
  } catch {
    // Best-effort
  }

  return threadIds;
}

export function computePersonalAnalytics(params: {
  sessions: Session[];
  userId?: string;
  now?: Date;
  /** Optional objection stats from localStorage (computed by UI layer) */
  objectionStats?: ObjectionStats;
}): PersonalAnalytics {
  const now = params.now ?? new Date();
  const sessions = params.sessions;

  const sessionsTotal = sessions.length;
  const sessionsCompleted = sessions.filter((s) => s.phase === "complete").length;
  const completionRate = sessionsTotal > 0 ? sessionsCompleted / sessionsTotal : 0;

  const hypothesesTested = sessions.reduce((sum, session) => {
    const cards = session.hypothesisCards;
    if (!cards || typeof cards !== "object") return sum;
    return sum + Object.keys(cards).length;
  }, 0);

  const hypothesesWithCompetitors = sessions.filter(
    (s) => Array.isArray(s.alternativeHypothesisIds) && s.alternativeHypothesisIds.length > 0
  ).length;

  const testsRecorded = sessions.reduce((sum, session) => sum + (session.testIds?.length ?? 0), 0);

  const scores = sessions.map(getSessionScores).filter((s): s is SessionScores => s !== null);
  const averageFalsifiabilityScore = mean(scores.map((s) => s.falsifiability));
  const averageSpecificityScore = mean(scores.map((s) => s.specificity));

  const operatorsUsedDistribution = createEmptyOperatorDistribution();
  for (const session of sessions) countOperatorUsage(session, operatorsUsedDistribution);

  const averageSessionDurationMinutes = computeAverageDurationMinutes(sessions);

  const trendsOver30Days = buildTrendData({ sessions, windowDays: 30, now });
  const trendsOver90Days = buildTrendData({ sessions, windowDays: 90, now });

  const insights = buildInsights({
    sessionsTotal,
    completionRate,
    averageFalsifiability: averageFalsifiabilityScore,
    operatorsUsedDistribution,
    hypothesesWithCompetitors,
  });

  // Compute hypothesis outcomes
  const hypothesisOutcomes = countHypothesisOutcomes(sessions);
  const revisionsAfterEvidence = countRevisionsAfterEvidence(sessions);

  // Objection stats from external source (localStorage)
  const objectionStats = params.objectionStats ?? { addressed: 0, accepted: 0 };

  const achievements = buildAchievements({
    sessionsCompleted,
    operatorsUsedDistribution,
    sessionsTotal,
    hypothesesFalsified: hypothesisOutcomes.falsified,
    hypothesesRobust: hypothesisOutcomes.robust,
  });

  return {
    userId: params.userId ?? "local",
    computedAt: now.toISOString(),

    sessionsTotal,
    sessionsCompleted,
    completionRate,

    hypothesesTested,
    hypothesesWithCompetitors,

    testsRecorded,

    averageFalsifiabilityScore,
    averageSpecificityScore,
    averageSessionDurationMinutes,

    operatorsUsedDistribution,

    hypothesesFalsified: hypothesisOutcomes.falsified,
    hypothesesRobust: hypothesisOutcomes.robust,
    hypothesesAbandoned: hypothesisOutcomes.abandoned,

    objectionsAddressed: objectionStats.addressed,
    objectionsAccepted: objectionStats.accepted,
    revisionsAfterEvidence,

    trendsOver30Days,
    trendsOver90Days,

    insights,
    achievements,
  };
}

