/**
 * Brenner Loop Session Storage
 *
 * LocalStorage persistence layer for Brenner Loop sessions.
 * Enables sessions to survive browser refresh without a backend.
 *
 * Storage structure:
 * - `brenner-sessions-index`: Array of SessionSummary for listing
 * - `brenner-session-{id}`: Full Session object for each session
 *
 * Design principles:
 * 1. Fail gracefully on quota limits
 * 2. Recover from corrupted data
 * 3. Handle concurrent tabs via storage events
 * 4. Support future migration to IndexedDB/remote
 *
 * @see brenner_bot-1v26.2 (bead)
 * @module brenner-loop/storage
 */

import type { Session, SessionPhase } from "./types";

// ============================================================================
// Constants
// ============================================================================

/** Key pattern for individual sessions */
const SESSION_KEY_PREFIX = "brenner-session-";

/** Key for the sessions index */
const INDEX_KEY = "brenner-sessions-index";

/** Maximum sessions to store (prevent runaway storage) */
const MAX_SESSIONS = 100;

/** Approximate max size per session in bytes (5MB localStorage limit) */
const MAX_SESSION_SIZE = 50_000; // 50KB per session

/** Current storage schema version for migrations */
const STORAGE_VERSION = 1;

// ============================================================================
// Types
// ============================================================================

/**
 * Summary of a session for list views.
 * Avoids loading full session data for browsing.
 */
export interface SessionSummary {
  /** Session ID */
  id: string;

  /** Preview of the hypothesis statement */
  hypothesis: string;

  /** Current session phase */
  phase: SessionPhase;

  /** Current confidence level (0-100) */
  confidence: number;

  /** Research question (if set) */
  researchQuestion?: string;

  /** Theme (if set) */
  theme?: string;

  /** When the session was last updated */
  updatedAt: string;

  /** When the session was created */
  createdAt: string;
}

/**
 * Storage interface for session persistence.
 * Designed to be implementation-agnostic for future migration.
 */
export interface SessionStorage {
  /**
   * Save a session to storage.
   * Creates or updates as appropriate.
   * @throws StorageError on quota exceeded or other failures
   */
  save(session: Session): Promise<void>;

  /**
   * Load a session by ID.
   * @returns Session if found, null otherwise
   */
  load(sessionId: string): Promise<Session | null>;

  /**
   * List all sessions with summaries.
   * Sorted by updatedAt (most recent first).
   */
  list(): Promise<SessionSummary[]>;

  /**
   * Delete a session by ID.
   * Silently succeeds if session doesn't exist.
   */
  delete(sessionId: string): Promise<void>;

  /**
   * Clear all sessions (use with caution).
   */
  clear(): Promise<void>;

  /**
   * Get storage statistics.
   */
  stats(): Promise<StorageStats>;
}

/**
 * Storage statistics for monitoring.
 */
export interface StorageStats {
  /** Number of sessions stored */
  sessionCount: number;

  /** Approximate total size in bytes */
  totalSize: number;

  /** Approximate remaining quota in bytes */
  remainingQuota: number;

  /** Oldest session date */
  oldestSession?: string;

  /** Newest session date */
  newestSession?: string;
}

/**
 * Error types for storage operations.
 */
export class StorageError extends Error {
  constructor(
    message: string,
    public readonly code: StorageErrorCode,
    public readonly cause?: unknown
  ) {
    super(message);
    this.name = "StorageError";
  }
}

export type StorageErrorCode =
  | "QUOTA_EXCEEDED"
  | "CORRUPTED_DATA"
  | "SESSION_NOT_FOUND"
  | "SERIALIZATION_ERROR"
  | "UNKNOWN_ERROR";

// ============================================================================
// Index Management
// ============================================================================

/**
 * Internal index format stored in localStorage.
 */
interface StorageIndex {
  version: number;
  summaries: SessionSummary[];
}

/**
 * Load the sessions index from localStorage.
 */
function loadIndex(): StorageIndex {
  if (typeof window === "undefined") {
    return { version: STORAGE_VERSION, summaries: [] };
  }

  try {
    const raw = window.localStorage.getItem(INDEX_KEY);
    if (!raw) {
      return { version: STORAGE_VERSION, summaries: [] };
    }

    const parsed = JSON.parse(raw) as StorageIndex;

    // Handle version migration if needed
    if (parsed.version !== STORAGE_VERSION) {
      console.warn(
        `Storage index version mismatch: expected ${STORAGE_VERSION}, got ${parsed.version}`
      );
      // For now, just accept it. Future: add migration logic.
    }

    return parsed;
  } catch (error) {
    console.error("Failed to load session index, starting fresh:", error);
    return { version: STORAGE_VERSION, summaries: [] };
  }
}

/**
 * Save the sessions index to localStorage.
 */
function saveIndex(index: StorageIndex): void {
  if (typeof window === "undefined") return;

  try {
    window.localStorage.setItem(INDEX_KEY, JSON.stringify(index));
  } catch (error) {
    // If we can't save the index, we're in trouble
    console.error("Failed to save session index:", error);
    throw new StorageError(
      "Failed to save session index",
      "QUOTA_EXCEEDED",
      error
    );
  }
}

/**
 * Create a summary from a full session.
 */
function createSummary(session: Session): SessionSummary {
  // Get hypothesis preview (first 100 chars)
  const hypothesisPreview =
    session.hypothesisCards[session.primaryHypothesisId]?.statement ||
    "(No hypothesis)";

  // Get confidence from primary hypothesis
  const confidence =
    session.hypothesisCards[session.primaryHypothesisId]?.confidence ?? 50;

  return {
    id: session.id,
    hypothesis:
      hypothesisPreview.length > 100
        ? hypothesisPreview.slice(0, 97) + "..."
        : hypothesisPreview,
    phase: session.phase,
    confidence,
    researchQuestion: session.researchQuestion,
    theme: session.theme,
    updatedAt: session.updatedAt,
    createdAt: session.createdAt,
  };
}

// ============================================================================
// LocalStorage Implementation
// ============================================================================

/**
 * LocalStorage-based implementation of SessionStorage.
 */
export class LocalStorageSessionStorage implements SessionStorage {
  /**
   * Check if localStorage is available.
   */
  private isAvailable(): boolean {
    if (typeof window === "undefined") return false;

    try {
      const testKey = "__storage_test__";
      window.localStorage.setItem(testKey, testKey);
      window.localStorage.removeItem(testKey);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Get the storage key for a session.
   */
  private getSessionKey(sessionId: string): string {
    return `${SESSION_KEY_PREFIX}${sessionId}`;
  }

  async save(session: Session): Promise<void> {
    if (!this.isAvailable()) {
      throw new StorageError(
        "LocalStorage not available",
        "UNKNOWN_ERROR"
      );
    }

    // Update session timestamp
    const updatedSession: Session = {
      ...session,
      updatedAt: new Date().toISOString(),
    };

    // Serialize the session
    let serialized: string;
    try {
      serialized = JSON.stringify(updatedSession);
    } catch (error) {
      throw new StorageError(
        "Failed to serialize session",
        "SERIALIZATION_ERROR",
        error
      );
    }

    // Check size limit
    if (serialized.length > MAX_SESSION_SIZE) {
      console.warn(
        `Session ${session.id} exceeds recommended size (${serialized.length} bytes)`
      );
    }

    // Try to save the session
    try {
      window.localStorage.setItem(
        this.getSessionKey(session.id),
        serialized
      );
    } catch (error) {
      // Check if it's a quota error
      if (
        error instanceof DOMException &&
        (error.name === "QuotaExceededError" ||
          error.name === "NS_ERROR_DOM_QUOTA_REACHED")
      ) {
        throw new StorageError(
          "Storage quota exceeded. Try deleting old sessions.",
          "QUOTA_EXCEEDED",
          error
        );
      }
      throw new StorageError(
        "Failed to save session",
        "UNKNOWN_ERROR",
        error
      );
    }

    // Update the index
    const index = loadIndex();
    const existingIdx = index.summaries.findIndex(
      (s) => s.id === session.id
    );
    const summary = createSummary(updatedSession);

    if (existingIdx >= 0) {
      // Update existing
      index.summaries[existingIdx] = summary;
    } else {
      // Add new
      index.summaries.unshift(summary);

      // Enforce max sessions limit
      if (index.summaries.length > MAX_SESSIONS) {
        // Remove oldest sessions
        const toRemove = index.summaries.splice(MAX_SESSIONS);
        for (const old of toRemove) {
          try {
            window.localStorage.removeItem(this.getSessionKey(old.id));
          } catch {
            // Ignore cleanup errors
          }
        }
        console.warn(
          `Removed ${toRemove.length} old sessions to stay under limit`
        );
      }
    }

    // Sort by updatedAt (most recent first)
    index.summaries.sort(
      (a, b) =>
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );

    saveIndex(index);
  }

  async load(sessionId: string): Promise<Session | null> {
    if (!this.isAvailable()) {
      return null;
    }

    try {
      const raw = window.localStorage.getItem(
        this.getSessionKey(sessionId)
      );
      if (!raw) {
        return null;
      }

      const session = JSON.parse(raw) as Session;

      // Basic validation
      if (!session.id || !session.phase) {
        console.error(`Corrupted session data for ${sessionId}`);
        throw new StorageError(
          "Session data is corrupted",
          "CORRUPTED_DATA"
        );
      }

      return session;
    } catch (error) {
      if (error instanceof StorageError) throw error;

      console.error(`Failed to load session ${sessionId}:`, error);
      throw new StorageError(
        "Failed to parse session data",
        "CORRUPTED_DATA",
        error
      );
    }
  }

  async list(): Promise<SessionSummary[]> {
    if (!this.isAvailable()) {
      return [];
    }

    const index = loadIndex();

    // Verify summaries against actual storage (cleanup orphans)
    const validSummaries = index.summaries.filter((summary) => {
      const exists =
        window.localStorage.getItem(this.getSessionKey(summary.id)) !==
        null;
      if (!exists) {
        console.warn(`Orphaned index entry for ${summary.id}, removing`);
      }
      return exists;
    });

    // Update index if we cleaned up orphans
    if (validSummaries.length !== index.summaries.length) {
      index.summaries = validSummaries;
      saveIndex(index);
    }

    return validSummaries;
  }

  async delete(sessionId: string): Promise<void> {
    if (!this.isAvailable()) return;

    // Remove from storage
    try {
      window.localStorage.removeItem(this.getSessionKey(sessionId));
    } catch (error) {
      console.error(`Failed to delete session ${sessionId}:`, error);
    }

    // Remove from index
    const index = loadIndex();
    index.summaries = index.summaries.filter((s) => s.id !== sessionId);
    saveIndex(index);
  }

  async clear(): Promise<void> {
    if (!this.isAvailable()) return;

    const index = loadIndex();

    // Remove all session data
    for (const summary of index.summaries) {
      try {
        window.localStorage.removeItem(this.getSessionKey(summary.id));
      } catch {
        // Ignore individual failures
      }
    }

    // Clear the index
    index.summaries = [];
    saveIndex(index);
  }

  async stats(): Promise<StorageStats> {
    if (!this.isAvailable()) {
      return {
        sessionCount: 0,
        totalSize: 0,
        remainingQuota: 0,
      };
    }

    const index = loadIndex();
    let totalSize = 0;

    // Calculate total size of sessions
    for (const summary of index.summaries) {
      const raw = window.localStorage.getItem(
        this.getSessionKey(summary.id)
      );
      if (raw) {
        totalSize += raw.length * 2; // UTF-16 = 2 bytes per char
      }
    }

    // Add index size
    const indexRaw = window.localStorage.getItem(INDEX_KEY);
    if (indexRaw) {
      totalSize += indexRaw.length * 2;
    }

    // Estimate remaining quota (5MB typical limit)
    const TYPICAL_QUOTA = 5 * 1024 * 1024;
    const remainingQuota = Math.max(0, TYPICAL_QUOTA - totalSize);

    // Find oldest and newest
    let oldestSession: string | undefined;
    let newestSession: string | undefined;

    if (index.summaries.length > 0) {
      const sorted = [...index.summaries].sort(
        (a, b) =>
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      );
      oldestSession = sorted[0].createdAt;
      newestSession = sorted[sorted.length - 1].createdAt;
    }

    return {
      sessionCount: index.summaries.length,
      totalSize,
      remainingQuota,
      oldestSession,
      newestSession,
    };
  }
}

// ============================================================================
// Singleton Instance
// ============================================================================

/**
 * Default session storage instance.
 * Use this for all session persistence operations.
 */
export const sessionStorage = new LocalStorageSessionStorage();

// ============================================================================
// Recovery Utilities
// ============================================================================

/**
 * Attempt to recover sessions from corrupted storage.
 * Scans all localStorage keys matching the session pattern and rebuilds the index.
 *
 * @returns Number of sessions recovered
 */
export async function recoverSessions(): Promise<number> {
  if (typeof window === "undefined") return 0;

  const recovered: SessionSummary[] = [];

  // Scan localStorage for session keys
  for (let i = 0; i < window.localStorage.length; i++) {
    const key = window.localStorage.key(i);
    if (!key?.startsWith(SESSION_KEY_PREFIX)) continue;

    try {
      const raw = window.localStorage.getItem(key);
      if (!raw) continue;

      const session = JSON.parse(raw) as Session;

      // Basic validation
      if (session.id && session.phase && session.createdAt) {
        recovered.push(createSummary(session));
      }
    } catch {
      console.warn(`Skipping corrupted session at ${key}`);
    }
  }

  // Rebuild index
  if (recovered.length > 0) {
    const index: StorageIndex = {
      version: STORAGE_VERSION,
      summaries: recovered.sort(
        (a, b) =>
          new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      ),
    };
    saveIndex(index);
  }

  return recovered.length;
}

/**
 * Estimate available storage space.
 * @returns Approximate bytes remaining
 */
export function estimateRemainingStorage(): number {
  if (typeof window === "undefined") return 0;

  // Calculate current usage
  let used = 0;
  for (let i = 0; i < window.localStorage.length; i++) {
    const key = window.localStorage.key(i);
    if (key) {
      const value = window.localStorage.getItem(key);
      if (value) {
        used += (key.length + value.length) * 2;
      }
    }
  }

  // Typical quota is 5MB
  const TYPICAL_QUOTA = 5 * 1024 * 1024;
  return Math.max(0, TYPICAL_QUOTA - used);
}

/**
 * Clean up old sessions to free space.
 * Removes sessions older than the specified number of days.
 *
 * @param daysOld Sessions older than this will be removed
 * @returns Number of sessions removed
 */
export async function cleanupOldSessions(daysOld: number = 30): Promise<number> {
  const storage = sessionStorage;
  const summaries = await storage.list();
  const cutoff = Date.now() - daysOld * 24 * 60 * 60 * 1000;

  let removed = 0;
  for (const summary of summaries) {
    if (new Date(summary.updatedAt).getTime() < cutoff) {
      await storage.delete(summary.id);
      removed++;
    }
  }

  return removed;
}

// ============================================================================
// Event Listeners for Cross-Tab Sync
// ============================================================================

/**
 * Callback type for storage change events.
 */
export type StorageChangeCallback = (
  event: "save" | "delete" | "clear",
  sessionId?: string
) => void;

const changeListeners = new Set<StorageChangeCallback>();

/**
 * Subscribe to storage changes (for cross-tab sync).
 */
export function onStorageChange(callback: StorageChangeCallback): () => void {
  changeListeners.add(callback);
  return () => changeListeners.delete(callback);
}

// Set up storage event listener for cross-tab sync
if (typeof window !== "undefined") {
  window.addEventListener("storage", (event) => {
    if (!event.key) {
      // Storage was cleared
      changeListeners.forEach((cb) => cb("clear"));
      return;
    }

    if (event.key === INDEX_KEY) {
      // Index changed, likely a save or delete
      if (event.newValue && event.oldValue) {
        try {
          const oldIndex = JSON.parse(event.oldValue) as StorageIndex;
          const newIndex = JSON.parse(event.newValue) as StorageIndex;

          // Find what changed
          const oldIds = new Set(oldIndex.summaries.map((s) => s.id));
          const newIds = new Set(newIndex.summaries.map((s) => s.id));

          // Deleted sessions
          oldIndex.summaries.forEach((s) => {
            if (!newIds.has(s.id)) {
              changeListeners.forEach((cb) => cb("delete", s.id));
            }
          });

          // New or updated sessions
          newIndex.summaries.forEach((s) => {
            if (!oldIds.has(s.id)) {
              changeListeners.forEach((cb) => cb("save", s.id));
            } else {
              // Check if updated
              const oldSummary = oldIndex.summaries.find((os) => os.id === s.id);
              if (
                oldSummary &&
                oldSummary.updatedAt !== s.updatedAt
              ) {
                changeListeners.forEach((cb) => cb("save", s.id));
              }
            }
          });
        } catch {
          // Ignore parse errors
        }
      }
    }
  });
}
