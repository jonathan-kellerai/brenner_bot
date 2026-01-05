"use client";

/**
 * Session List with Sorting, Filtering & Import
 *
 * Lists locally stored Brenner Loop sessions with:
 * - Sorting by date, confidence, phase
 * - Filtering by status (active/complete)
 * - Import support (file picker + drag-and-drop)
 *
 * @see brenner_bot-1v26.4 (bead)
 * @see brenner_bot-reew.4 (bead) - Enhanced session management
 */

import * as React from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  sessionStorage,
  importSession,
  type SessionSummary,
  type StorageStats,
} from "@/lib/brenner-loop";
import { SessionCard } from "./SessionCard";

// ============================================================================
// Types
// ============================================================================

export interface SessionListProps {
  className?: string;
  onSelect?: (sessionId: string) => void;
}

type SortField = "date" | "confidence" | "phase";
type SortDirection = "asc" | "desc";
type StatusFilter = "all" | "active" | "complete";

// ============================================================================
// Icons
// ============================================================================

function ChevronUpDownIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 15L12 18.75 15.75 15m-7.5-6L12 5.25 15.75 9" />
    </svg>
  );
}

function ChevronUpIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 15.75l7.5-7.5 7.5 7.5" />
    </svg>
  );
}

function ChevronDownIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
    </svg>
  );
}


// ============================================================================
// Sorting & Filtering
// ============================================================================

const PHASE_ORDER: Record<string, number> = {
  intake: 0,
  sharpening: 1,
  level_split: 2,
  exclusion_test: 3,
  object_transpose: 4,
  scale_check: 5,
  agent_dispatch: 6,
  synthesis: 7,
  evidence_gathering: 8,
  revision: 9,
  complete: 10,
};

// ============================================================================
// Archive persistence
// ============================================================================

const ARCHIVE_INDEX_KEY = "brenner-sessions-archived-index";

type ArchivedSessionEntry = {
  id: string;
  archivedAt: string;
};

function safeParseJson(raw: string | null): unknown {
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function normalizeArchivedEntries(entries: ArchivedSessionEntry[]): ArchivedSessionEntry[] {
  const seen = new Set<string>();
  const normalized: ArchivedSessionEntry[] = [];

  for (const entry of entries) {
    if (!entry?.id || typeof entry.id !== "string") continue;
    if (!entry.archivedAt || typeof entry.archivedAt !== "string") continue;
    if (seen.has(entry.id)) continue;
    seen.add(entry.id);
    normalized.push({ id: entry.id, archivedAt: entry.archivedAt });
  }

  return normalized;
}

function loadArchivedEntries(): ArchivedSessionEntry[] {
  if (typeof window === "undefined") return [];
  const parsed = safeParseJson(window.localStorage.getItem(ARCHIVE_INDEX_KEY));
  if (!Array.isArray(parsed)) return [];

  const entries: ArchivedSessionEntry[] = [];
  for (const raw of parsed) {
    if (!raw || typeof raw !== "object") continue;
    const r = raw as Record<string, unknown>;
    if (typeof r.id !== "string") continue;
    if (typeof r.archivedAt !== "string") continue;
    entries.push({ id: r.id, archivedAt: r.archivedAt });
  }

  return normalizeArchivedEntries(entries);
}

function saveArchivedEntries(entries: ArchivedSessionEntry[]): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(ARCHIVE_INDEX_KEY, JSON.stringify(entries));
  } catch {
    // Best-effort only; archive is a convenience state.
  }
}

// ============================================================================
// Storage formatting
// ============================================================================

function formatBytes(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes <= 0) return "0 B";
  const units = ["B", "KB", "MB", "GB"] as const;
  let unitIndex = 0;
  let value = bytes;
  while (value >= 1024 && unitIndex < units.length - 1) {
    value /= 1024;
    unitIndex += 1;
  }
  const decimals = value >= 10 || unitIndex === 0 ? 0 : 1;
  return `${value.toFixed(decimals)} ${units[unitIndex]}`;
}

function sortSessions(
  sessions: SessionSummary[],
  field: SortField,
  direction: SortDirection
): SessionSummary[] {
  const sorted = [...sessions].sort((a, b) => {
    let comparison = 0;

    switch (field) {
      case "date":
        comparison = new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
        break;
      case "confidence":
        comparison = b.confidence - a.confidence;
        break;
      case "phase":
        // Higher phase number = more progressed, should come first in "desc"
        comparison = (PHASE_ORDER[b.phase] ?? 0) - (PHASE_ORDER[a.phase] ?? 0);
        break;
    }

    return direction === "desc" ? comparison : -comparison;
  });

  return sorted;
}

function filterSessions(
  sessions: SessionSummary[],
  statusFilter: StatusFilter
): SessionSummary[] {
  if (statusFilter === "all") return sessions;

  return sessions.filter((s) => {
    if (statusFilter === "complete") return s.phase === "complete";
    return s.phase !== "complete";
  });
}

// ============================================================================
// Sort Button Component
// ============================================================================

interface SortButtonProps {
  label: string;
  field: SortField;
  currentField: SortField;
  direction: SortDirection;
  onClick: (field: SortField) => void;
}

function SortButton({ label, field, currentField, direction, onClick }: SortButtonProps) {
  const isActive = currentField === field;

  return (
    <button
      type="button"
      onClick={() => onClick(field)}
      className={cn(
        "inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium rounded-lg transition-colors",
        isActive
          ? "bg-primary/10 text-primary border border-primary/20"
          : "bg-muted text-muted-foreground border border-transparent hover:bg-muted/80"
      )}
    >
      {label}
      {isActive ? (
        direction === "desc" ? (
          <ChevronDownIcon className="size-3" />
        ) : (
          <ChevronUpIcon className="size-3" />
        )
      ) : (
        <ChevronUpDownIcon className="size-3 opacity-50" />
      )}
    </button>
  );
}

// ============================================================================
// Filter Pills Component
// ============================================================================

interface FilterPillsProps {
  value: StatusFilter;
  onChange: (value: StatusFilter) => void;
  counts: { all: number; active: number; complete: number };
}

function FilterPills({ value, onChange, counts }: FilterPillsProps) {
  const options: { value: StatusFilter; label: string; count: number }[] = [
    { value: "all", label: "All", count: counts.all },
    { value: "active", label: "Active", count: counts.active },
    { value: "complete", label: "Complete", count: counts.complete },
  ];

  return (
    <div className="inline-flex items-center gap-1 p-1 bg-muted/50 rounded-lg">
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          onClick={() => onChange(option.value)}
          className={cn(
            "inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-md transition-all",
            value === option.value
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          {option.label}
          <span
            className={cn(
              "px-1.5 py-0.5 rounded text-[10px] font-semibold",
              value === option.value
                ? "bg-primary/10 text-primary"
                : "bg-muted text-muted-foreground"
            )}
          >
            {option.count}
          </span>
        </button>
      ))}
    </div>
  );
}

// ============================================================================
// Component
// ============================================================================

export function SessionList({ className, onSelect }: SessionListProps) {
  const router = useRouter();
  const [sessions, setSessions] = React.useState<SessionSummary[]>([]);
  const [archivedEntries, setArchivedEntries] = React.useState<ArchivedSessionEntry[]>([]);
  const [storageStats, setStorageStats] = React.useState<StorageStats | null>(null);
  const [importWarnings, setImportWarnings] = React.useState<string[]>([]);
  const [importError, setImportError] = React.useState<string | null>(null);
  const [isDragging, setIsDragging] = React.useState(false);
  const [showClearArchivedModal, setShowClearArchivedModal] = React.useState(false);
  const [isClearingArchived, setIsClearingArchived] = React.useState(false);
  const inputRef = React.useRef<HTMLInputElement>(null);

  // Sorting & filtering state
  const [sortField, setSortField] = React.useState<SortField>("date");
  const [sortDirection, setSortDirection] = React.useState<SortDirection>("desc");
  const [statusFilter, setStatusFilter] = React.useState<StatusFilter>("all");

  const refreshSessions = React.useCallback(async () => {
    const list = await sessionStorage.list();
    setSessions(list);
    try {
      setStorageStats(await sessionStorage.stats());
    } catch {
      setStorageStats(null);
    }
  }, []);

  React.useEffect(() => {
    void refreshSessions();
  }, [refreshSessions]);

  React.useEffect(() => {
    setArchivedEntries(loadArchivedEntries());
  }, []);

  const archivedById = React.useMemo(() => {
    const map = new Map<string, string>();
    for (const entry of archivedEntries) map.set(entry.id, entry.archivedAt);
    return map;
  }, [archivedEntries]);

  const activeSessions = React.useMemo(
    () => sessions.filter((session) => !archivedById.has(session.id)),
    [sessions, archivedById]
  );

  const archivedSessions = React.useMemo(() => {
    const list = sessions.filter((session) => archivedById.has(session.id));
    return list.sort((a, b) => {
      const aAt = archivedById.get(a.id);
      const bAt = archivedById.get(b.id);
      if (!aAt && !bAt) return 0;
      if (!aAt) return 1;
      if (!bAt) return -1;
      return Date.parse(bAt) - Date.parse(aAt);
    });
  }, [sessions, archivedById]);

  const handleImport = React.useCallback(async (file: File) => {
    setImportError(null);
    setImportWarnings([]);

    try {
      const { session, warnings } = await importSession(file);
      await sessionStorage.save(session);
      setImportWarnings(warnings);
      await refreshSessions();
    } catch (error) {
      setImportError(error instanceof Error ? error.message : "Failed to import session.");
    }
  }, [refreshSessions]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      void handleImport(file);
      event.target.value = "";
    }
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(false);
    const file = event.dataTransfer.files?.[0];
    if (file) {
      void handleImport(file);
    }
  };

  const handleSortClick = (field: SortField) => {
    if (field === sortField) {
      setSortDirection((d) => (d === "desc" ? "asc" : "desc"));
    } else {
      setSortField(field);
      setSortDirection("desc");
    }
  };

  const handleContinue = (sessionId: string) => {
    if (onSelect) {
      onSelect(sessionId);
    } else {
      router.push(`/sessions/${sessionId}`);
    }
  };

  const handleDelete = (sessionId: string) => {
    setArchivedEntries((prev) => {
      const next = prev.filter((entry) => entry.id !== sessionId);
      if (next.length !== prev.length) saveArchivedEntries(next);
      return next;
    });
    void refreshSessions();
  };

  const handleArchiveChange = React.useCallback((sessionId: string, nextArchived: boolean) => {
    setArchivedEntries((prev) => {
      const exists = prev.some((entry) => entry.id === sessionId);
      if (nextArchived && exists) return prev;
      if (!nextArchived && !exists) return prev;

      const now = new Date().toISOString();
      const next = nextArchived
        ? normalizeArchivedEntries([...prev, { id: sessionId, archivedAt: now }])
        : prev.filter((entry) => entry.id !== sessionId);

      saveArchivedEntries(next);
      return next;
    });
  }, []);

  const handleClearArchived = React.useCallback(async () => {
    if (archivedEntries.length === 0) return;
    setIsClearingArchived(true);

    try {
      const ids = archivedEntries.map((entry) => entry.id);
      for (const id of ids) {
        await sessionStorage.delete(id);
      }

      setArchivedEntries(() => {
        saveArchivedEntries([]);
        return [];
      });

      await refreshSessions();
    } finally {
      setIsClearingArchived(false);
      setShowClearArchivedModal(false);
    }
  }, [archivedEntries, refreshSessions]);

  // Calculate counts for filter pills
  const counts = React.useMemo(() => {
    const complete = activeSessions.filter((s) => s.phase === "complete").length;
    return {
      all: activeSessions.length,
      active: activeSessions.length - complete,
      complete,
    };
  }, [activeSessions]);

  // Apply filter and sort
  const displayedSessions = React.useMemo(() => {
    const filtered = filterSessions(activeSessions, statusFilter);
    return sortSessions(filtered, sortField, sortDirection);
  }, [activeSessions, statusFilter, sortField, sortDirection]);

  const storageSummary = React.useMemo(() => {
    if (!storageStats) return null;
    const total = storageStats.totalSize + storageStats.remainingQuota;
    const used = storageStats.totalSize;
    const pct = total > 0 ? used / total : 0;
    return { total, used, pct };
  }, [storageStats]);

  const isStorageWarning = Boolean(storageSummary && storageSummary.pct >= 0.8);

  return (
    <div className={cn("flex flex-col gap-4", className)}>
      {/* Import zone */}
      <div
        className={cn(
          "rounded-2xl border border-dashed border-border bg-muted/20 p-6 transition-colors",
          isDragging ? "border-primary bg-primary/5" : "hover:border-primary/40"
        )}
        onDragOver={(event) => {
          event.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
      >
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-medium text-foreground">Import Session</h3>
            <p className="text-xs text-muted-foreground">
              Drag a session JSON export here, or browse to upload.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <input
              ref={inputRef}
              type="file"
              accept="application/json,.json"
              className="hidden"
              onChange={handleFileChange}
            />
            <Button variant="outline" size="sm" onClick={() => inputRef.current?.click()}>
              Choose File
            </Button>
          </div>
        </div>

        {importError && (
          <p className="mt-3 text-xs text-destructive">{importError}</p>
        )}
        {importWarnings.length > 0 && (
          <div className="mt-3 text-xs text-warning">
            {importWarnings.map((warning) => (
              <div key={warning}>• {warning}</div>
            ))}
          </div>
        )}
      </div>

      {/* Storage usage + lifecycle controls */}
      {storageSummary && (
        <Card>
          <CardContent className="py-5 space-y-4">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="space-y-1">
                <div className="text-sm font-semibold text-foreground">Storage Usage</div>
                <div className="text-xs text-muted-foreground">
                  {formatBytes(storageSummary.used)} used · {formatBytes(storageSummary.total)} estimated limit
                </div>
                <div className="text-xs text-muted-foreground">
                  Sessions:{" "}
                  <span className="font-medium text-foreground">{activeSessions.length}</span> active{" "}
                  {archivedSessions.length > 0 && (
                    <>
                      · <span className="font-medium text-foreground">{archivedSessions.length}</span> archived
                    </>
                  )}
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={archivedSessions.length === 0}
                  onClick={() => setShowClearArchivedModal(true)}
                >
                  Clear Archived
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <div className="h-2 rounded-full bg-muted overflow-hidden">
                <div
                  className={cn("h-full", isStorageWarning ? "bg-warning" : "bg-primary")}
                  style={{ width: `${Math.min(100, Math.max(0, storageSummary.pct * 100))}%` }}
                />
              </div>
              {isStorageWarning && (
                <div className="text-xs text-warning">
                  Storage is getting tight. Consider exporting and clearing archived sessions.
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Controls: Filter + Sort */}
      {activeSessions.length > 0 && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Filter pills */}
          <FilterPills value={statusFilter} onChange={setStatusFilter} counts={counts} />

          {/* Sort controls */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">Sort:</span>
            <SortButton
              label="Date"
              field="date"
              currentField={sortField}
              direction={sortDirection}
              onClick={handleSortClick}
            />
            <SortButton
              label="Confidence"
              field="confidence"
              currentField={sortField}
              direction={sortDirection}
              onClick={handleSortClick}
            />
            <SortButton
              label="Phase"
              field="phase"
              currentField={sortField}
              direction={sortDirection}
              onClick={handleSortClick}
            />
          </div>
        </div>
      )}

      {/* Session cards */}
      <div className="grid gap-3">
        {displayedSessions.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="py-8 text-center text-sm text-muted-foreground">
              {activeSessions.length === 0
                ? "No local sessions yet. Import one to get started."
                : "No sessions match the current filter."}
            </CardContent>
          </Card>
        ) : (
          displayedSessions.map((session) => (
            <SessionCard
              key={session.id}
              session={session}
              onContinue={handleContinue}
              onDelete={handleDelete}
              onArchiveChange={handleArchiveChange}
            />
          ))
        )}
      </div>

      {archivedSessions.length > 0 && (
        <details className="rounded-2xl border border-border bg-muted/10 px-4 py-3">
          <summary className="cursor-pointer list-none flex items-center justify-between gap-3">
            <div className="text-sm font-semibold text-foreground">
              Archived Sessions <span className="text-muted-foreground">({archivedSessions.length})</span>
            </div>
            <span className="text-xs text-muted-foreground">Click to expand</span>
          </summary>
          <div className="mt-4 grid gap-3">
            {archivedSessions.map((session) => (
              <SessionCard
                key={session.id}
                session={session}
                isArchived
                archivedAt={archivedById.get(session.id)}
                onContinue={handleContinue}
                onDelete={handleDelete}
                onArchiveChange={handleArchiveChange}
              />
            ))}
          </div>
        </details>
      )}

      {showClearArchivedModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-background/80 backdrop-blur-sm"
            onClick={() => setShowClearArchivedModal(false)}
            aria-hidden="true"
          />
          <div className="relative z-10 w-full max-w-md rounded-xl border border-border bg-card p-6 shadow-xl animate-fade-in-up space-y-4">
            <div>
              <h3 className="text-lg font-semibold text-foreground">Clear archived sessions?</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                This will permanently delete <span className="font-medium text-foreground">{archivedSessions.length}</span>{" "}
                archived session(s) from your browser storage. Consider exporting first if you want a backup.
              </p>
            </div>
            <div className="flex justify-end gap-3">
              <Button variant="outline" size="sm" onClick={() => setShowClearArchivedModal(false)} disabled={isClearingArchived}>
                Cancel
              </Button>
              <Button variant="destructive" size="sm" onClick={() => void handleClearArchived()} disabled={isClearingArchived}>
                {isClearingArchived ? "Clearing..." : "Delete Archived"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
