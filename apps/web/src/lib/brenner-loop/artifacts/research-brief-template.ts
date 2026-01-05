/**
 * Research Brief Template
 *
 * Generates a structured markdown template for Brenner Loop research briefs.
 * Handles missing data gracefully by inserting explicit placeholders.
 *
 * @see brenner_bot-nu8g.1 (Design Research Brief Template)
 */

import type { ObjectionSeverity, ObjectionType } from "../agents/objections";

// ============================================================================
// Types
// ============================================================================

export type ResearchBriefStatus =
  | "draft"
  | "under_pressure"
  | "supported"
  | "challenged"
  | "unclear"
  | "complete";

export interface ResearchBriefMetadata {
  type: "research_brief";
  version: string;
  sessionId?: string;
  hypothesisId?: string;
  createdAt?: string;
  finalConfidence?: number;
  status?: ResearchBriefStatus;
  operatorsApplied?: string[];
  agentsConsulted?: string[];
  testsIdentified?: number;
  testsCompleted?: number;
  brennerCitations?: string[];
}

export interface HypothesisStatement {
  statement?: string;
  mechanism?: string;
  domain?: string[];
}

export interface HypothesisEvolution {
  summary?: string;
  changes?: string[];
  triggers?: string[];
  diagram?: string;
}

export interface DiscriminativeStructure {
  predictionsIfTrue?: string[];
  predictionsIfFalse?: string[];
  falsificationConditions?: string[];
}

export interface OperatorAppliedSummary {
  operator: string;
  discoveries?: string[];
  outputs?: string[];
}

export interface AgentAnalysis {
  devilsAdvocate?: string[];
  experimentDesigner?: string[];
  statistician?: string[];
  brennerChanneler?: string[];
  consensus?: string[];
  conflicts?: string[];
}

export type ObjectionStatus =
  | "open"
  | "acknowledged"
  | "testing"
  | "addressed"
  | "accepted"
  | "dismissed";

export interface ResearchBriefObjectionSource {
  agentName?: string | null;
  role?: string | null;
  messageId?: number;
  createdAt?: string;
  subject?: string;
}

export interface ResearchBriefObjection {
  id: string;
  type: ObjectionType;
  severity: ObjectionSeverity;
  status: ObjectionStatus;
  summary: string;
  source?: ResearchBriefObjectionSource;
  response?: string;
}

export interface ObjectionRegisterSection {
  objections?: ResearchBriefObjection[];
  note?: string;
}

export interface EvidenceSummary {
  testsRun?: string[];
  results?: string[];
  confidenceTrajectory?: string[];
}

export interface ResearchBriefTemplateInput {
  metadata?: Partial<ResearchBriefMetadata>;
  executiveSummary?: string;
  hypothesisStatement?: HypothesisStatement;
  hypothesisEvolution?: HypothesisEvolution;
  discriminativeStructure?: DiscriminativeStructure;
  operatorsApplied?: OperatorAppliedSummary[];
  agentAnalysis?: AgentAnalysis;
  objectionRegister?: ObjectionRegisterSection;
  evidenceSummary?: EvidenceSummary;
  brennerPrinciples?: string[];
  recommendedNextSteps?: string[];
}

// ============================================================================
// Constants
// ============================================================================

export const RESEARCH_BRIEF_TEMPLATE_VERSION = "1.0";

// ============================================================================
// Public API
// ============================================================================

export const renderResearchBriefTemplate = (input: ResearchBriefTemplateInput = {}): string => {
  const metadata = normalizeMetadata(input.metadata);
  const lines: string[] = [];

  lines.push("---");
  lines.push(`type: research_brief`);
  lines.push(`version: ${metadata.version}`);
  lines.push(`session_id: ${metadata.sessionId}`);
  lines.push(`hypothesis_id: ${metadata.hypothesisId}`);
  lines.push(`created_at: ${metadata.createdAt}`);
  lines.push(`final_confidence: ${formatConfidence(metadata.finalConfidence)}`);
  lines.push(`status: ${metadata.status}`);
  lines.push(`operators_applied:${formatYamlList(metadata.operatorsApplied)}`);
  lines.push(`agents_consulted:${formatYamlList(metadata.agentsConsulted)}`);
  lines.push(`tests_identified: ${metadata.testsIdentified}`);
  lines.push(`tests_completed: ${metadata.testsCompleted}`);
  lines.push(`brenner_citations:${formatYamlList(metadata.brennerCitations)}`);
  lines.push("---");
  lines.push("");

  lines.push("# Research Brief");
  lines.push("");
  lines.push("## Executive Summary");
  lines.push(formatParagraph(input.executiveSummary, "Summarize the hypothesis, key finding, and recommendation."));
  lines.push("");

  lines.push("## Hypothesis Statement");
  lines.push(formatField("Statement", input.hypothesisStatement?.statement));
  lines.push(formatField("Mechanism", input.hypothesisStatement?.mechanism));
  lines.push(formatField("Domain", formatInlineList(input.hypothesisStatement?.domain)));
  lines.push("");

  lines.push("## Hypothesis Evolution");
  lines.push(formatParagraph(input.hypothesisEvolution?.summary, "Describe how the hypothesis changed (if at all)."));
  lines.push(formatList("Evolution steps", input.hypothesisEvolution?.changes));
  lines.push(formatList("Triggers", input.hypothesisEvolution?.triggers));
  lines.push(formatField("Diagram / sketch", input.hypothesisEvolution?.diagram));
  lines.push("");

  lines.push("## Discriminative Structure");
  lines.push(formatList("Predictions if true", input.discriminativeStructure?.predictionsIfTrue));
  lines.push(formatList("Predictions if false", input.discriminativeStructure?.predictionsIfFalse));
  lines.push(formatList("Falsification conditions", input.discriminativeStructure?.falsificationConditions));
  lines.push("");

  lines.push("## Operators Applied");
  if (input.operatorsApplied && input.operatorsApplied.length > 0) {
    input.operatorsApplied.forEach((entry) => {
      lines.push(`### ${entry.operator}`);
      lines.push(formatList("Discoveries", entry.discoveries));
      lines.push(formatList("Key outputs", entry.outputs));
      lines.push("");
    });
  } else {
    lines.push("- _No operators recorded yet._");
    lines.push("");
  }

  lines.push("## Agent Analysis");
  lines.push(formatList("Devil's Advocate", input.agentAnalysis?.devilsAdvocate));
  lines.push(formatList("Experiment Designer", input.agentAnalysis?.experimentDesigner));
  lines.push(formatList("Statistician", input.agentAnalysis?.statistician));
  lines.push(formatList("Brenner Channeler", input.agentAnalysis?.brennerChanneler));
  lines.push(formatList("Consensus", input.agentAnalysis?.consensus));
  lines.push(formatList("Conflicts", input.agentAnalysis?.conflicts));
  lines.push("");

  lines.push("## Objection Register");
  lines.push(...formatObjectionRegister(input.objectionRegister));
  lines.push("");

  lines.push("## Evidence Summary");
  lines.push(formatList("Tests run", input.evidenceSummary?.testsRun));
  lines.push(formatList("Results", input.evidenceSummary?.results));
  lines.push(formatList("Confidence trajectory", input.evidenceSummary?.confidenceTrajectory));
  lines.push("");

  lines.push("## Brenner Principles");
  lines.push(formatList("Relevant sections", input.brennerPrinciples));
  lines.push("");

  lines.push("## Recommended Next Steps");
  lines.push(formatOrderedList(input.recommendedNextSteps));

  return lines.join("\n");
};

export const createResearchBriefTemplate = renderResearchBriefTemplate;

// ============================================================================
// Helpers
// ============================================================================

/** Normalized metadata with all fields defined */
type NormalizedMetadata = Omit<Required<ResearchBriefMetadata>, "finalConfidence"> & {
  finalConfidence: number | null;
};

const OBJECTION_STATUS_LABELS: Record<ObjectionStatus, string> = {
  open: "Open",
  acknowledged: "Acknowledged",
  testing: "Testing",
  addressed: "Addressed",
  accepted: "Accepted",
  dismissed: "Dismissed",
};

const RESOLVED_OBJECTION_STATUSES = new Set<ObjectionStatus>(["addressed", "accepted", "dismissed"]);

const normalizeMetadata = (metadata?: Partial<ResearchBriefMetadata>): NormalizedMetadata => {
  const now = new Date().toISOString();
  return {
    type: "research_brief",
    version: metadata?.version ?? RESEARCH_BRIEF_TEMPLATE_VERSION,
    sessionId: metadata?.sessionId ?? "unknown",
    hypothesisId: metadata?.hypothesisId ?? "unknown",
    createdAt: metadata?.createdAt ?? now,
    finalConfidence: typeof metadata?.finalConfidence === "number" ? metadata.finalConfidence : null,
    status: metadata?.status ?? "draft",
    operatorsApplied: metadata?.operatorsApplied ?? [],
    agentsConsulted: metadata?.agentsConsulted ?? [],
    testsIdentified: typeof metadata?.testsIdentified === "number" ? metadata.testsIdentified : 0,
    testsCompleted: typeof metadata?.testsCompleted === "number" ? metadata.testsCompleted : 0,
    brennerCitations: metadata?.brennerCitations ?? [],
  };
};

const formatConfidence = (value: number | null): string => {
  if (value === null) return "unknown";
  return `${Math.round(value)}%`;
};

const formatYamlList = (items?: string[]): string => {
  if (!items || items.length === 0) return " []";
  return `\n${items.map((item) => `  - ${item}`).join("\n")}`;
};

const formatObjectionSource = (source?: ResearchBriefObjectionSource): string => {
  if (!source) return "";

  const who = source.role?.trim() || source.agentName?.trim() || "";
  const messageId = typeof source.messageId === "number" ? source.messageId : null;

  if (who && messageId !== null) return `${who} (msg ${messageId})`;
  if (who) return who;
  if (messageId !== null) return `msg ${messageId}`;
  return "";
};

const formatObjectionRegister = (section?: ObjectionRegisterSection): string[] => {
  const objections = section?.objections ?? [];
  const lines: string[] = [];

  if (objections.length === 0) {
    lines.push("- _No objections recorded yet._");
    return lines;
  }

  const unresolvedCount = objections.reduce(
    (acc, objection) => acc + (RESOLVED_OBJECTION_STATUSES.has(objection.status) ? 0 : 1),
    0
  );

  lines.push(`- **Total objections:** ${objections.length}`);
  lines.push(`- **Unresolved objections:** ${unresolvedCount}`);

  if (section?.note && section.note.trim().length > 0) {
    lines.push(`- **Note:** ${section.note.trim()}`);
  }

  lines.push("");
  for (const objection of objections) {
    const statusLabel = OBJECTION_STATUS_LABELS[objection.status] ?? objection.status;
    const typeLabel = objection.type.replace(/_/g, " ");
    const severityLabel = objection.severity.charAt(0).toUpperCase() + objection.severity.slice(1);
    const source = formatObjectionSource(objection.source);
    const sourceSuffix = source ? ` — ${source}` : "";

    lines.push(`- [${statusLabel}] (${severityLabel}) ${typeLabel}: ${objection.summary}${sourceSuffix}`);
    if (objection.response && objection.response.trim().length > 0) {
      lines.push(`  - Response: ${objection.response.trim()}`);
    }
  }

  return lines;
};

const formatInlineList = (items?: string[]): string => {
  if (!items || items.length === 0) return "unknown";
  return items.join(", ");
};

const formatParagraph = (value: string | undefined, fallback: string): string => {
  return value && value.trim().length > 0 ? value : `_${fallback}_`;
};

const formatField = (label: string, value?: string): string => {
  const safeValue = value && value.trim().length > 0 ? value : "_Not provided yet._";
  return `- **${label}:** ${safeValue}`;
};

const formatList = (label: string, items?: string[]): string => {
  if (items && items.length > 0) {
    return [`- **${label}:**`, ...items.map((item) => `  - ${item}`)].join("\n");
  }
  return `- **${label}:** _Not provided yet._`;
};

const formatOrderedList = (items?: string[]): string => {
  if (items && items.length > 0) {
    return items.map((item, index) => `${index + 1}. ${item}`).join("\n");
  }
  return "1. _Identify the most discriminative test to run next._";
};
