/**
 * Thread/Session Status Computation
 *
 * Provides deterministic visibility into a Brenner Protocol session:
 * - Which agents responded (role completion)
 * - Pending acknowledgements
 * - Latest compiled artifact pointer
 *
 * Used by both web UI and CLI for consistent status display.
 *
 * @see brenner_bot-5so.3.3.2
 */

import type { AgentMailMessage, AgentMailThread } from "./agentMail";
import { AGENT_ROLES, getAgentRole, type AgentRole, type RoleConfig } from "./session-kickoff";

// ============================================================================
// Types
// ============================================================================

/** Status of a single participant in the session */
export interface ParticipantStatus {
  /** Agent name */
  agentName: string;
  /** Assigned role */
  role: RoleConfig;
  /** Whether this agent has responded to the kickoff */
  hasResponded: boolean;
  /** Count of messages from this agent */
  messageCount: number;
  /** Count of pending acks (messages from this agent requiring ack) */
  pendingAcks: number;
  /** Timestamp of latest response */
  lastResponseAt: string | null;
  /** Whether this agent acknowledged the kickoff */
  acknowledgedKickoff: boolean;
}

/** Aggregated status by role */
export interface RoleStatus {
  /** The role type */
  role: AgentRole;
  /** Display name for the role */
  displayName: string;
  /** All agents assigned to this role */
  agents: string[];
  /** Whether at least one agent in this role has responded */
  hasResponse: boolean;
  /** Total messages from agents in this role */
  totalMessages: number;
  /** Whether all agents in this role have acknowledged */
  allAcknowledged: boolean;
}

/** Information about the latest artifact */
export interface LatestArtifact {
  /** Message ID containing the artifact */
  messageId: number;
  /** Thread ID */
  threadId: string;
  /** Subject line */
  subject: string;
  /** Who compiled/sent it */
  from: string;
  /** When it was created */
  createdAt: string;
  /** Whether it's a compiled artifact (subject contains ARTIFACT or COMPILED) */
  isCompiled: boolean;
}

/** Overall thread/session status */
export interface ThreadStatus {
  /** Thread ID */
  threadId: string;
  /** Total messages in thread */
  totalMessages: number;
  /** Total pending acknowledgements */
  totalPendingAcks: number;
  /** Per-participant status */
  participants: ParticipantStatus[];
  /** Per-role aggregation */
  roleStatus: RoleStatus[];
  /** Latest artifact message, if any */
  latestArtifact: LatestArtifact | null;
  /** Whether all required roles have responded */
  allRolesResponded: boolean;
  /** Whether session is complete (all acks done + artifact compiled) */
  isComplete: boolean;
  /** Session phase: kickoff, gathering, compiling, complete */
  phase: "kickoff" | "gathering" | "compiling" | "complete";
  /** Human-readable summary */
  summary: string;
}

// ============================================================================
// Message Classification
// ============================================================================

/** Message types based on subject line patterns */
type MessageType =
  | "kickoff" // KICKOFF: prefix
  | "delta" // DELTA[...]: prefix
  | "artifact" // Contains ARTIFACT or COMPILED
  | "ack" // ACK or acknowledgement
  | "other";

/**
 * Classify a message based on its subject line.
 */
function classifyMessage(message: AgentMailMessage): MessageType {
  const subject = message.subject.toUpperCase();

  if (subject.startsWith("KICKOFF:")) {
    return "kickoff";
  }
  if (subject.includes("DELTA[") || subject.startsWith("DELTA:")) {
    return "delta";
  }
  if (subject.includes("ARTIFACT") || subject.includes("COMPILED")) {
    return "artifact";
  }
  if (subject.includes("ACK") || subject.toLowerCase().includes("acknowledg")) {
    return "ack";
  }
  return "other";
}

/**
 * Check if a message is a response to the kickoff (not the kickoff itself).
 */
function isResponse(message: AgentMailMessage): boolean {
  const type = classifyMessage(message);
  return type === "delta" || type === "artifact" || type === "other";
}

/**
 * Check if a message contains a compiled artifact.
 */
function isArtifactMessage(message: AgentMailMessage): boolean {
  return classifyMessage(message) === "artifact";
}

// ============================================================================
// Status Computation
// ============================================================================

/**
 * Extract unique senders from thread messages.
 */
function extractParticipants(messages: AgentMailMessage[]): string[] {
  const senders = new Set<string>();
  for (const msg of messages) {
    if (msg.from) {
      senders.add(msg.from);
    }
  }
  return Array.from(senders);
}

/**
 * Build participant status for each agent in the thread.
 */
function buildParticipantStatuses(messages: AgentMailMessage[]): ParticipantStatus[] {
  const participants = extractParticipants(messages);
  const statuses: ParticipantStatus[] = [];

  for (const agentName of participants) {
    const agentMessages = messages.filter((m) => m.from === agentName);
    const responseMessages = agentMessages.filter(isResponse);
    const pendingAcks = agentMessages.filter((m) => m.ack_required === true).length;

    // Find kickoff and check if acknowledged
    const kickoffs = messages.filter((m) => classifyMessage(m) === "kickoff");
    const kickoffToThisAgent = kickoffs.find(
      (k) => k.to?.includes(agentName) || k.to?.map((t) => t.toLowerCase()).includes(agentName.toLowerCase())
    );
    const acknowledgedKickoff =
      kickoffToThisAgent !== undefined && agentMessages.some((m) => classifyMessage(m) === "ack" || isResponse(m));

    // Get latest response timestamp
    const sortedResponses = responseMessages.sort(
      (a, b) => new Date(b.created_ts).getTime() - new Date(a.created_ts).getTime()
    );
    const lastResponseAt = sortedResponses.length > 0 ? sortedResponses[0].created_ts : null;

    statuses.push({
      agentName,
      role: getAgentRole(agentName),
      hasResponded: responseMessages.length > 0,
      messageCount: agentMessages.length,
      pendingAcks,
      lastResponseAt,
      acknowledgedKickoff,
    });
  }

  return statuses;
}

/**
 * Aggregate participant statuses by role.
 */
function aggregateByRole(participants: ParticipantStatus[]): RoleStatus[] {
  const roleMap = new Map<AgentRole, RoleStatus>();

  // Initialize with all known roles
  const allRoles: AgentRole[] = ["hypothesis_generator", "test_designer", "adversarial_critic"];
  for (const role of allRoles) {
    const config = Object.values(AGENT_ROLES).find((r) => r.role === role);
    if (config) {
      roleMap.set(role, {
        role,
        displayName: config.displayName,
        agents: [],
        hasResponse: false,
        totalMessages: 0,
        allAcknowledged: true,
      });
    }
  }

  // Aggregate participant data
  for (const participant of participants) {
    const role = participant.role.role;
    const status = roleMap.get(role);
    if (status) {
      status.agents.push(participant.agentName);
      status.hasResponse = status.hasResponse || participant.hasResponded;
      status.totalMessages += participant.messageCount;
      status.allAcknowledged = status.allAcknowledged && participant.acknowledgedKickoff;
    }
  }

  // Filter to only roles with participants
  return Array.from(roleMap.values()).filter((r) => r.agents.length > 0);
}

/**
 * Find the latest artifact message in the thread.
 */
function findLatestArtifact(threadId: string, messages: AgentMailMessage[]): LatestArtifact | null {
  const artifactMessages = messages.filter(isArtifactMessage);

  if (artifactMessages.length === 0) {
    return null;
  }

  // Sort by timestamp descending
  const sorted = artifactMessages.sort(
    (a, b) => new Date(b.created_ts).getTime() - new Date(a.created_ts).getTime()
  );

  const latest = sorted[0];

  return {
    messageId: latest.id,
    threadId,
    subject: latest.subject,
    from: latest.from || "unknown",
    createdAt: latest.created_ts,
    isCompiled: true,
  };
}

/**
 * Determine the session phase based on message patterns.
 */
function determinePhase(
  messages: AgentMailMessage[],
  allRolesResponded: boolean,
  hasArtifact: boolean
): ThreadStatus["phase"] {
  const hasKickoff = messages.some((m) => classifyMessage(m) === "kickoff");
  const hasDeltas = messages.some((m) => classifyMessage(m) === "delta");

  if (!hasKickoff) {
    return "kickoff";
  }
  if (hasArtifact) {
    return "complete";
  }
  if (allRolesResponded && hasDeltas) {
    return "compiling";
  }
  return "gathering";
}

/**
 * Generate a human-readable summary of thread status.
 */
function generateSummary(status: Omit<ThreadStatus, "summary">): string {
  const parts: string[] = [];

  // Role completion
  const respondedRoles = status.roleStatus.filter((r) => r.hasResponse).length;
  const totalRoles = status.roleStatus.length;
  parts.push(`${respondedRoles}/${totalRoles} roles responded`);

  // Pending acks
  if (status.totalPendingAcks > 0) {
    parts.push(`${status.totalPendingAcks} pending acks`);
  }

  // Phase
  parts.push(`Phase: ${status.phase}`);

  // Artifact
  if (status.latestArtifact) {
    parts.push(`Latest artifact: ${status.latestArtifact.subject.slice(0, 30)}...`);
  }

  return parts.join(" | ");
}

// ============================================================================
// Public API
// ============================================================================

/**
 * Compute the status of a thread/session from its messages.
 *
 * @param thread - The thread data from Agent Mail
 * @returns Complete status object
 *
 * @example
 * ```typescript
 * const client = new AgentMailClient();
 * const thread = await client.readThread({ projectKey, threadId, includeBodies: true });
 * const status = computeThreadStatus(thread);
 * console.log(status.summary);
 * ```
 */
export function computeThreadStatus(thread: AgentMailThread): ThreadStatus {
  const { thread_id: threadId, messages } = thread;

  // Build participant statuses
  const participants = buildParticipantStatuses(messages);

  // Aggregate by role
  const roleStatus = aggregateByRole(participants);

  // Calculate totals
  const totalPendingAcks = participants.reduce((sum, p) => sum + p.pendingAcks, 0);
  const allRolesResponded = roleStatus.length > 0 && roleStatus.every((r) => r.hasResponse);

  // Find latest artifact
  const latestArtifact = findLatestArtifact(threadId, messages);

  // Determine phase
  const phase = determinePhase(messages, allRolesResponded, latestArtifact !== null);

  // Is complete?
  const isComplete = phase === "complete" && totalPendingAcks === 0;

  // Build status object (without summary)
  const statusWithoutSummary = {
    threadId,
    totalMessages: messages.length,
    totalPendingAcks,
    participants,
    roleStatus,
    latestArtifact,
    allRolesResponded,
    isComplete,
    phase,
  };

  return {
    ...statusWithoutSummary,
    summary: generateSummary(statusWithoutSummary),
  };
}

/**
 * Compute a minimal status summary for display.
 * Useful for list views where full status is too heavy.
 */
export function computeThreadStatusSummary(thread: AgentMailThread): {
  threadId: string;
  phase: ThreadStatus["phase"];
  respondedRoleCount: number;
  totalRoleCount: number;
  pendingAcks: number;
  hasArtifact: boolean;
  summary: string;
} {
  const status = computeThreadStatus(thread);
  return {
    threadId: status.threadId,
    phase: status.phase,
    respondedRoleCount: status.roleStatus.filter((r) => r.hasResponse).length,
    totalRoleCount: status.roleStatus.length,
    pendingAcks: status.totalPendingAcks,
    hasArtifact: status.latestArtifact !== null,
    summary: status.summary,
  };
}

/**
 * Check if a thread is waiting for a specific role.
 */
export function isWaitingForRole(thread: AgentMailThread, role: AgentRole): boolean {
  const status = computeThreadStatus(thread);
  const roleStatus = status.roleStatus.find((r) => r.role === role);
  return roleStatus !== undefined && !roleStatus.hasResponse;
}

/**
 * Get the agents who haven't responded yet.
 */
export function getPendingAgents(thread: AgentMailThread): string[] {
  const status = computeThreadStatus(thread);
  return status.participants.filter((p) => !p.hasResponded).map((p) => p.agentName);
}

/**
 * Get the agents who have pending acknowledgements.
 */
export function getAgentsWithPendingAcks(thread: AgentMailThread): string[] {
  const status = computeThreadStatus(thread);
  return status.participants.filter((p) => p.pendingAcks > 0).map((p) => p.agentName);
}
