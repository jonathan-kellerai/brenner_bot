"use client";

/**
 * AgentTribunalPanel
 *
 * UI for summarizing a TRIBUNAL Agent Mail thread into per-role cards with
 * status + preview + full-response modal.
 *
 * @see brenner_bot-xlk2.3 (bead)
 */

import * as React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { cn } from "@/lib/utils";
import type { AgentMailMessage } from "@/lib/agentMail";
import {
  DEFAULT_DISPATCH_ROLES,
  TRIBUNAL_AGENTS,
  isTribunalAgentRole,
  type TribunalAgentRole,
} from "@/lib/brenner-loop/agents";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type AgentCardStatus = "pending" | "analyzing" | "complete" | "error";

export interface AgentTribunalCard {
  role: TribunalAgentRole;
  status: AgentCardStatus;
  preview: string | null;
  content: string | null;
  agentName: string | null;
  receivedAt: string | null;
}

export interface AgentTribunalPanelProps {
  messages: AgentMailMessage[];
  roles?: TribunalAgentRole[];
  className?: string;
}

function timeMs(ts: string | null | undefined): number {
  if (!ts) return 0;
  const ms = Date.parse(ts);
  return Number.isNaN(ms) ? 0 : ms;
}

function normalizeRoleToken(token: string): string {
  return token
    .trim()
    .toLowerCase()
    .replace(/[\s-]+/g, "_")
    .replace(/[^a-z0-9_]/g, "");
}

function inferRoleFromSubject(subject: string | null | undefined): TribunalAgentRole | null {
  const subjectText = typeof subject === "string" ? subject : "";
  if (!subjectText) return null;

  const match = subjectText.match(/\bTRIBUNAL\[([^\]]+)\]:/i);
  if (match?.[1]) {
    const token = normalizeRoleToken(match[1]);
    return isTribunalAgentRole(token) ? token : null;
  }

  const normalized = normalizeRoleToken(subjectText);
  for (const role of Object.keys(TRIBUNAL_AGENTS) as TribunalAgentRole[]) {
    if (normalized.includes(role)) return role;
  }

  return null;
}

function makePreview(markdown: string, maxChars = 220): string {
  const withoutCodeBlocks = markdown.replace(/```[\s\S]*?```/g, "");
  const firstMeaningfulLine =
    withoutCodeBlocks
      .split(/\r?\n/)
      .map((line) => line.trim())
      .find((line) => line.length > 0) ?? "";
  const collapsed = firstMeaningfulLine.replace(/\s+/g, " ").trim();
  if (!collapsed) return "";
  if (collapsed.length <= maxChars) return collapsed;
  return `${collapsed.slice(0, Math.max(0, maxChars - 1)).trimEnd()}…`;
}

function badgeForStatus(status: AgentCardStatus): { label: string; className: string } {
  switch (status) {
    case "complete":
      return { label: "Complete", className: "border-success/20 bg-success/15 text-success" };
    case "analyzing":
      return { label: "Analyzing", className: "border-primary/20 bg-primary/10 text-primary" };
    case "error":
      return { label: "Error", className: "border-destructive/20 bg-destructive/10 text-destructive" };
    case "pending":
    default:
      return { label: "Pending", className: "border-border bg-muted/40 text-muted-foreground" };
  }
}

function deriveCardsFromMessages(params: {
  messages: AgentMailMessage[];
  roles: TribunalAgentRole[];
}): AgentTribunalCard[] {
  const rolesSet = new Set<TribunalAgentRole>(params.roles);

  const dispatchByRole = new Map<TribunalAgentRole, AgentMailMessage>();
  for (const msg of params.messages) {
    const role = inferRoleFromSubject(msg.subject);
    if (!role || !rolesSet.has(role)) continue;
    if (typeof msg.reply_to === "number") continue;
    if (typeof msg.body_md !== "string") continue;
    if (!msg.body_md.trimStart().startsWith("# Tribunal Analysis Request")) continue;

    const prev = dispatchByRole.get(role);
    if (!prev || timeMs(msg.created_ts) > timeMs(prev.created_ts)) {
      dispatchByRole.set(role, msg);
    }
  }

  const dispatchIdToRole = new Map<number, TribunalAgentRole>();
  for (const [role, msg] of dispatchByRole.entries()) {
    dispatchIdToRole.set(msg.id, role);
  }

  const responseByRole = new Map<TribunalAgentRole, AgentMailMessage>();
  const sortedNewestFirst = [...params.messages].sort((a, b) => timeMs(b.created_ts) - timeMs(a.created_ts));

  for (const msg of sortedNewestFirst) {
    if (!msg.body_md) continue;

    let role: TribunalAgentRole | null = null;
    if (typeof msg.reply_to === "number") {
      role = dispatchIdToRole.get(msg.reply_to) ?? null;
    }
    if (!role) {
      role = inferRoleFromSubject(msg.subject);
    }
    if (!role || !rolesSet.has(role)) continue;

    const dispatchId = dispatchByRole.get(role)?.id ?? null;
    if (dispatchId && msg.id === dispatchId) continue;
    if (responseByRole.has(role)) continue;

    responseByRole.set(role, msg);
  }

  return params.roles.map((role) => {
    const dispatchMsg = dispatchByRole.get(role) ?? null;
    const responseMsg = responseByRole.get(role) ?? null;
    const content = responseMsg?.body_md ?? null;

    const status: AgentCardStatus =
      responseMsg ? "complete" : dispatchMsg ? "analyzing" : "pending";

    return {
      role,
      status,
      preview: content ? makePreview(content) : null,
      content,
      agentName: responseMsg?.from ?? null,
      receivedAt: responseMsg?.created_ts ?? null,
    };
  });
}

export function AgentTribunalPanel({ messages, roles = DEFAULT_DISPATCH_ROLES, className }: AgentTribunalPanelProps) {
  const cards = React.useMemo(() => deriveCardsFromMessages({ messages, roles }), [messages, roles]);

  const [openRole, setOpenRole] = React.useState<TribunalAgentRole | null>(null);
  const openCard = openRole ? cards.find((c) => c.role === openRole) ?? null : null;
  const openConfig = openCard ? TRIBUNAL_AGENTS[openCard.role] : null;

  const closeDialog = () => setOpenRole(null);

  return (
    <Card className={cn("border-border", className)}>
      <CardHeader className="space-y-2">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="space-y-1">
            <CardTitle>Agent Tribunal</CardTitle>
            <p className="text-sm text-muted-foreground">
              Your hypothesis is being evaluated by multiple perspectives.
            </p>
          </div>
          <Badge variant="outline" className="border-border bg-muted/40 text-muted-foreground">
            {cards.filter((c) => c.status === "complete").length}/{cards.length} complete
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="grid gap-4 lg:grid-cols-2">
          {cards.map((card) => {
            const agent = TRIBUNAL_AGENTS[card.role];
            const badge = badgeForStatus(card.status);
            const showExpand = card.status === "complete" && Boolean(card.content);

            return (
              <div key={card.role} className="rounded-xl border border-border bg-card p-4 shadow-sm">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <div
                      className={cn(
                        "flex size-10 items-center justify-center rounded-xl border",
                        card.status === "complete" ? "border-success/20 bg-success/10" : "border-border bg-muted/30"
                      )}
                      aria-hidden="true"
                    >
                      <span className="text-lg leading-none">{agent.icon}</span>
                    </div>
                    <div className="space-y-1">
                      <div className="text-sm font-semibold text-foreground">{agent.displayName}</div>
                      <div className="text-xs text-muted-foreground">{agent.description}</div>
                    </div>
                  </div>
                  <Badge variant="outline" className={cn("shrink-0", badge.className)}>
                    {badge.label}
                  </Badge>
                </div>

                <div className="mt-4 text-sm text-muted-foreground">
                  {card.status === "complete" ? (
                    <p className="text-foreground/90">{card.preview || "Response received."}</p>
                  ) : card.status === "analyzing" ? (
                    <p>Awaiting response…</p>
                  ) : card.status === "error" ? (
                    <p className="text-destructive">Failed to get a response.</p>
                  ) : (
                    <p>Not dispatched yet.</p>
                  )}
                </div>

                {(card.agentName || card.receivedAt) && (
                  <div className="mt-3 text-xs text-muted-foreground">
                    {card.agentName && (
                      <span className="font-mono text-foreground/80">{card.agentName}</span>
                    )}
                    {card.agentName && card.receivedAt && <span className="mx-2">·</span>}
                    {card.receivedAt && (
                      <span className="font-mono">{new Date(card.receivedAt).toLocaleString()}</span>
                    )}
                  </div>
                )}

                <div className="mt-4 flex flex-wrap gap-2">
                  {showExpand && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setOpenRole(card.role)}
                    >
                      Expand Full Response
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <Dialog
          open={Boolean(openRole)}
          onOpenChange={(nextOpen) => {
            if (!nextOpen) closeDialog();
          }}
        >
          <DialogContent size="xl">
            <DialogHeader separated>
              <DialogTitle className="flex items-center gap-2">
                <span aria-hidden="true">{openConfig?.icon}</span>
                <span>{openConfig?.displayName ?? "Agent Response"}</span>
              </DialogTitle>
              <DialogDescription>
                {openCard?.agentName ? (
                  <>
                    From <span className="font-mono text-foreground/80">{openCard.agentName}</span>
                  </>
                ) : (
                  "Full response"
                )}
              </DialogDescription>
            </DialogHeader>
            <DialogBody>
              {openCard?.content ? (
                <div className="prose prose-sm dark:prose-invert max-w-none">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>{openCard.content}</ReactMarkdown>
                </div>
              ) : (
                <div className="text-sm text-muted-foreground">No response body.</div>
              )}
            </DialogBody>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}

export default AgentTribunalPanel;
