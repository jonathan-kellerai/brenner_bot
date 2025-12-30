"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type SessionActionsProps = {
  threadId: string;
  projectKey: string;
  defaultSender?: string;
  defaultRecipients?: string[];
  hasCompiledArtifact?: boolean;
};

type ApiSuccess =
  | {
      success: true;
      action: "compile";
      threadId: string;
      version: number;
      compiledAt: string;
      artifactMarkdown: string;
      lint: { valid: boolean; summary: { errors: number; warnings: number; info: number } };
      merge: { applied: number; skipped: number };
      deltaStats: { deltaMessageCount: number; totalBlocks: number; validBlocks: number; invalidBlocks: number };
    }
  | {
      success: true;
      action: "publish";
      threadId: string;
      version: number;
      compiledAt: string;
      messageId?: number;
    }
  | {
      success: true;
      action: "request_critique";
      threadId: string;
      version: number;
      messageId?: number;
    };

type ApiError = {
  success: false;
  error: string;
  code: string;
  details?: unknown;
};

function parseRecipients(text: string): string[] {
  return Array.from(
    new Set(
      text
        .split(",")
        .map((t) => t.trim())
        .filter((t) => t.length > 0)
    )
  );
}

async function postAction(body: Record<string, unknown>): Promise<ApiSuccess> {
  const res = await fetch("/api/sessions/actions", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  const json = (await res.json()) as ApiSuccess | ApiError;
  if (!res.ok || !json.success) {
    const err = json as ApiError;
    throw new Error(err?.error || "Request failed");
  }
  return json as ApiSuccess;
}

export function SessionActions({
  threadId,
  projectKey,
  defaultSender = "",
  defaultRecipients = [],
  hasCompiledArtifact = false,
}: SessionActionsProps) {
  const router = useRouter();

  const [sender, setSender] = React.useState(defaultSender);
  const [recipientsText, setRecipientsText] = React.useState(defaultRecipients.join(", "));

  const [busy, setBusy] = React.useState<null | "compile" | "publish" | "request_critique">(null);
  const [error, setError] = React.useState<string | null>(null);
  const [compilePreview, setCompilePreview] = React.useState<Extract<ApiSuccess, { action: "compile" }> | null>(null);
  const [lastOk, setLastOk] = React.useState<string | null>(null);

  const recipients = parseRecipients(recipientsText);
  const canSend = sender.trim().length > 0 && recipients.length > 0;

  const run = async (action: "compile" | "publish" | "request_critique") => {
    setBusy(action);
    setError(null);
    setLastOk(null);

    try {
      const payload: Record<string, unknown> = { action, threadId };
      payload.projectKey = projectKey;

      if (action !== "compile") {
        payload.sender = sender.trim();
        payload.recipients = recipients;
      }

      const result = await postAction(payload);
      if (result.action === "compile") {
        setCompilePreview(result);
        setLastOk(`Compiled v${result.version} (preview)`);
      } else if (result.action === "publish") {
        setLastOk(`Published COMPILED v${result.version}`);
        setCompilePreview(null);
        router.refresh();
      } else if (result.action === "request_critique") {
        setLastOk(`Requested critique for v${result.version}`);
        router.refresh();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setBusy(null);
    }
  };

  return (
    <section className="rounded-xl border border-border bg-card p-5 space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="space-y-1">
          <div className="text-sm text-muted-foreground">Actions</div>
          <div className="text-sm font-medium text-foreground">Compile → publish → request critique</div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={busy !== null}
            onClick={() => void run("compile")}
          >
            {busy === "compile" ? "Compiling…" : "Compile"}
          </Button>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            disabled={busy !== null || !canSend}
            onClick={() => void run("publish")}
          >
            {busy === "publish" ? "Publishing…" : "Publish"}
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={busy !== null || !canSend || !hasCompiledArtifact}
            onClick={() => void run("request_critique")}
          >
            {busy === "request_critique" ? "Requesting…" : "Request Critique"}
          </Button>
        </div>
      </div>

      <details className="group rounded-xl border border-border bg-muted/30 overflow-hidden">
        <summary className="cursor-pointer list-none p-4 text-sm text-muted-foreground group-open:text-foreground hover:bg-muted/50 active:bg-muted/70 transition-colors touch-manipulation flex items-center justify-between">
          <span>Configure sender/recipients</span>
          <svg className="size-4 text-muted-foreground transition-transform group-open:rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
          </svg>
        </summary>
        <div className="px-4 pb-4 grid gap-4 sm:grid-cols-2">
          <Input
            label="Sender"
            value={sender}
            onChange={(e) => setSender(e.target.value)}
            placeholder="Operator"
            hint="Used for publish + critique requests"
          />
          <Input
            label="Recipients"
            value={recipientsText}
            onChange={(e) => setRecipientsText(e.target.value)}
            placeholder="Claude,Codex,Gemini"
            hint="Comma-separated agent names"
          />
        </div>
        {!hasCompiledArtifact && (
          <p className="px-4 pb-4 text-xs text-muted-foreground">
            Request Critique is disabled until a <span className="font-mono">COMPILED:</span> message exists in the thread.
          </p>
        )}
      </details>

      {error && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
          {error}
        </div>
      )}

      {lastOk && (
        <div className="rounded-lg border border-border bg-muted/30 p-3 text-sm text-foreground">
          {lastOk}
        </div>
      )}

      {compilePreview && (
        <details className="group rounded-xl border border-border bg-background overflow-hidden">
          <summary className="cursor-pointer list-none p-4 text-sm font-medium hover:bg-muted/50 active:bg-muted/70 transition-colors touch-manipulation flex items-center justify-between gap-2">
            <span>Preview: compiled v{compilePreview.version} (lint: {compilePreview.lint.summary.errors}e/{compilePreview.lint.summary.warnings}w)</span>
            <svg className="size-4 text-muted-foreground flex-shrink-0 transition-transform group-open:rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
            </svg>
          </summary>
          <div className="px-4 pb-4 space-y-3">
            <div className="text-xs text-muted-foreground font-mono">
              {compilePreview.deltaStats.deltaMessageCount} delta messages • {compilePreview.deltaStats.validBlocks}/{compilePreview.deltaStats.totalBlocks} valid blocks • applied {compilePreview.merge.applied}, skipped {compilePreview.merge.skipped}
            </div>
            <pre className="text-xs font-mono whitespace-pre-wrap rounded-lg border border-border bg-muted/30 p-3 overflow-auto max-h-[420px]">
              {compilePreview.artifactMarkdown}
            </pre>
          </div>
        </details>
      )}
    </section>
  );
}
