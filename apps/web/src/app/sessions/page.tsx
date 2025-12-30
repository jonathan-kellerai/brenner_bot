import { resolve } from "node:path";
import Link from "next/link";
import { cookies, headers } from "next/headers";
import { RefreshControls } from "@/components/sessions";
import { AgentMailClient, type AgentMailMessage } from "@/lib/agentMail";
import { isLabModeEnabled, checkOrchestrationAuth } from "@/lib/auth";
import { computeThreadStatus, type SessionPhase } from "@/lib/threadStatus";
import { Jargon } from "@/components/jargon";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sessions",
  description: "Browse Brenner Loop research sessions.",
};

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// ============================================================================
// Icons
// ============================================================================

function InboxIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 13.5h3.86a2.25 2.25 0 012.012 1.244l.256.512a2.25 2.25 0 002.013 1.244h3.218a2.25 2.25 0 002.013-1.244l.256-.512a2.25 2.25 0 012.013-1.244h3.859m-19.5.338V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18v-4.162c0-.224-.034-.447-.1-.661L19.24 5.338a2.25 2.25 0 00-2.15-1.588H6.911a2.25 2.25 0 00-2.15 1.588L2.35 13.177a2.25 2.25 0 00-.1.661z" />
    </svg>
  );
}

function PlusIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
    </svg>
  );
}

function LockClosedIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
    </svg>
  );
}

// ============================================================================
// Phase styling
// ============================================================================

const PHASE_LABELS: Record<SessionPhase, string> = {
  not_started: "Not Started",
  awaiting_responses: "Awaiting Responses",
  partially_complete: "Partial",
  awaiting_compilation: "Awaiting Compilation",
  compiled: "Compiled",
  in_critique: "In Critique",
  closed: "Closed",
};

const PHASE_BADGE_CLASSES: Record<SessionPhase, string> = {
  not_started: "bg-muted text-muted-foreground border-border",
  awaiting_responses: "bg-primary/15 text-primary border-primary/20",
  partially_complete: "bg-info/15 text-info border-info/20",
  awaiting_compilation: "bg-warning/15 text-warning border-warning/20",
  compiled: "bg-success/15 text-success border-success/20",
  in_critique: "bg-purple-500/15 text-purple-600 border-purple-500/20",
  closed: "bg-muted text-muted-foreground border-border",
};

// ============================================================================
// Types
// ============================================================================

interface ThreadSummary {
  threadId: string;
  messageCount: number;
  firstMessageTs: string;
  lastMessageTs: string;
  phase: SessionPhase;
  hasArtifact: boolean;
  pendingAcks: number;
  participants: string[];
}

// ============================================================================
// Helpers
// ============================================================================

function repoRootFromWebCwd(): string {
  return resolve(process.cwd(), "../..");
}

function formatTs(ts: string): string {
  const d = new Date(ts);
  if (Number.isNaN(d.getTime())) return ts;
  return d.toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });
}

function formatRelativeTs(ts: string): string {
  const d = new Date(ts);
  if (Number.isNaN(d.getTime())) return ts;

  const now = Date.now();
  const diff = now - d.getTime();
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (seconds < 60) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  return formatTs(ts);
}

// ============================================================================
// Sub-components
// ============================================================================

function LockedState({ reason }: { reason: string }) {
  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-in-up">
      <div className="rounded-2xl border border-border bg-card p-8">
        <div className="flex items-start gap-4">
          <div className="flex items-center justify-center size-12 rounded-xl bg-warning/10 border border-warning/20 text-warning">
            <LockClosedIcon className="size-6" />
          </div>
          <div className="space-y-2">
            <h1 className="text-xl font-bold tracking-tight text-foreground">Lab Mode Locked</h1>
            <p className="text-sm text-muted-foreground">{reason}</p>
          </div>
        </div>
      </div>

      <div className="text-center">
        <Link href="/sessions/new" className="text-primary hover:underline">
          Go to New Session
        </Link>
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="max-w-2xl mx-auto">
      <div className="rounded-2xl border border-dashed border-border bg-muted/20 p-12 text-center">
        <div className="flex items-center justify-center size-16 mx-auto mb-4 rounded-xl bg-muted/50">
          <InboxIcon className="size-8 text-muted-foreground" />
        </div>
        <h2 className="text-lg font-semibold text-foreground mb-2">No sessions yet</h2>
        <p className="text-sm text-muted-foreground mb-6">
          Start a new research session to kick off a collaborative discussion.
        </p>
        <Link
          href="/sessions/new"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
        >
          <PlusIcon className="size-4" />
          New Session
        </Link>
      </div>
    </div>
  );
}

function ThreadCard({ thread }: { thread: ThreadSummary }) {
  return (
    <Link
      href={`/sessions/${thread.threadId}`}
      className="block rounded-xl border border-border bg-card p-5 hover:border-primary/30 hover:bg-muted/30 transition-all"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-2 min-w-0 flex-1">
          {/* Thread ID */}
          <div className="font-mono text-sm font-medium text-foreground truncate">
            {thread.threadId}
          </div>

          {/* Badges */}
          <div className="flex flex-wrap gap-2">
            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${PHASE_BADGE_CLASSES[thread.phase]}`}>
              {PHASE_LABELS[thread.phase]}
            </span>
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-muted text-foreground border border-border">
              {thread.messageCount} messages
            </span>
            {thread.hasArtifact && (
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-success/15 text-success border border-success/20">
                compiled
              </span>
            )}
            {thread.pendingAcks > 0 && (
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-warning/15 text-warning border border-warning/20">
                {thread.pendingAcks} pending acks
              </span>
            )}
          </div>

          {/* Participants */}
          {thread.participants.length > 0 && (
            <div className="text-xs text-muted-foreground">
              <span className="font-mono">{thread.participants.slice(0, 4).join(", ")}</span>
              {thread.participants.length > 4 && (
                <span> +{thread.participants.length - 4} more</span>
              )}
            </div>
          )}
        </div>

        {/* Timestamp */}
        <div className="text-right shrink-0">
          <div className="text-xs text-muted-foreground">{formatRelativeTs(thread.lastMessageTs)}</div>
        </div>
      </div>
    </Link>
  );
}

// ============================================================================
// Main Page
// ============================================================================

export default async function SessionsListPage() {
  // Check lab mode
  if (!isLabModeEnabled()) {
    return <LockedState reason="Lab mode is disabled. Set BRENNER_LAB_MODE=1 to enable orchestration." />;
  }

  // Check auth
  const reqHeaders = await headers();
  const reqCookies = await cookies();
  const pageAuth = checkOrchestrationAuth(reqHeaders, reqCookies);
  if (!pageAuth.authorized) {
    return <LockedState reason={pageAuth.reason} />;
  }

  const repoRoot = repoRootFromWebCwd();
  const projectKey = process.env.BRENNER_PROJECT_KEY ?? repoRoot;
  const agentName = process.env.BRENNER_AGENT_NAME ?? "human";

  // Fetch inbox (all messages for this project/agent)
  const threads: ThreadSummary[] = [];
  let loadError: string | null = null;

  try {
    const client = new AgentMailClient();
    const inbox = await client.readInbox({ projectKey, agentName, includeBodies: false });

    // Group messages by thread_id
    const messagesByThread = new Map<string, AgentMailMessage[]>();
    for (const msg of inbox.messages) {
      if (!msg.thread_id) continue;
      const existing = messagesByThread.get(msg.thread_id) ?? [];
      existing.push(msg);
      messagesByThread.set(msg.thread_id, existing);
    }

    // Compute status for each thread
    for (const [threadId, messages] of messagesByThread) {
      const sorted = [...messages].sort(
        (a, b) => new Date(a.created_ts).getTime() - new Date(b.created_ts).getTime()
      );

      const status = computeThreadStatus(sorted);

      threads.push({
        threadId,
        messageCount: messages.length,
        firstMessageTs: sorted[0]?.created_ts ?? "",
        lastMessageTs: sorted[sorted.length - 1]?.created_ts ?? "",
        phase: status.phase,
        hasArtifact: status.latestArtifact !== null,
        pendingAcks: status.acks.pendingCount,
        participants: status.stats.participants,
      });
    }

    // Sort by last message (most recent first)
    threads.sort((a, b) => new Date(b.lastMessageTs).getTime() - new Date(a.lastMessageTs).getTime());
  } catch (err) {
    loadError = err instanceof Error ? err.message : String(err);
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <header className="flex items-center justify-between gap-4 animate-fade-in-up">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Sessions</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Browse and monitor research sessions
          </p>
        </div>
        <div className="flex flex-wrap items-center justify-end gap-2">
          <RefreshControls />
          <Link
            href="/sessions/new"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
          >
            <PlusIcon className="size-4" />
            New Session
          </Link>
        </div>
      </header>

      {/* Error state */}
      {loadError && (
        <div className="rounded-xl border border-warning/30 bg-warning/5 p-4 animate-fade-in-up">
          <div className="font-semibold text-warning">Failed to load sessions</div>
          <div className="mt-1 text-sm text-muted-foreground break-words">{loadError}</div>
        </div>
      )}

      {/* Content */}
      {!loadError && threads.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="space-y-3 animate-fade-in-up">
          {threads.map((thread) => (
            <ThreadCard key={thread.threadId} thread={thread} />
          ))}
        </div>
      )}
    </div>
  );
}
