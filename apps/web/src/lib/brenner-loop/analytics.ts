import type { OperatorType } from "./operators/framework";
import { calculateFalsifiabilityScore, calculateSpecificityScore } from "./hypothesis";
import type { Session } from "./types";

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
  ];
}

export function computePersonalAnalytics(params: {
  sessions: Session[];
  userId?: string;
  now?: Date;
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

  const achievements = buildAchievements({
    sessionsCompleted,
    operatorsUsedDistribution,
    sessionsTotal,
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

    hypothesesFalsified: 0,
    hypothesesRobust: 0,
    hypothesesAbandoned: 0,

    objectionsAddressed: 0,
    objectionsAccepted: 0,
    revisionsAfterEvidence: 0,

    trendsOver30Days,
    trendsOver90Days,

    insights,
    achievements,
  };
}

