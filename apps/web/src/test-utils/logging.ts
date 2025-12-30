/**
 * Test Logging Utilities
 *
 * Provides detailed, structured logging for debugging test failures.
 * Philosophy: NO suppression of logs - make failures easy to diagnose.
 */

import { afterEach, beforeEach } from "vitest";

export type LogLevel = "debug" | "info" | "warn" | "error";

export interface LogEntry {
  timestamp: string;
  level: LogLevel;
  context: string;
  message: string;
  data?: unknown;
}

const logBuffer: LogEntry[] = [];

function formatTimestamp(): string {
  return new Date().toISOString();
}

function formatLogEntry(entry: LogEntry): string {
  const prefix = `[${entry.timestamp}] [${entry.level.toUpperCase()}] [${entry.context}]`;
  const dataStr = entry.data !== undefined ? `\n  Data: ${JSON.stringify(entry.data, null, 2)}` : "";
  return `${prefix} ${entry.message}${dataStr}`;
}

/**
 * Create a scoped logger for a test context.
 *
 * Usage:
 * ```ts
 * const log = createTestLogger("delta-parser");
 * log.info("Parsing message", { body: messageBody });
 * log.debug("Found blocks", { count: blocks.length });
 * ```
 */
export function createTestLogger(context: string) {
  const log = (level: LogLevel, message: string, data?: unknown) => {
    const entry: LogEntry = {
      timestamp: formatTimestamp(),
      level,
      context,
      message,
      data,
    };
    logBuffer.push(entry);

    // Also write to console for immediate visibility
    const formatted = formatLogEntry(entry);
    switch (level) {
      case "error":
        console.error(formatted);
        break;
      case "warn":
        console.warn(formatted);
        break;
      case "info":
        console.info(formatted);
        break;
      case "debug":
        console.debug(formatted);
        break;
    }
  };

  return {
    debug: (message: string, data?: unknown) => log("debug", message, data),
    info: (message: string, data?: unknown) => log("info", message, data),
    warn: (message: string, data?: unknown) => log("warn", message, data),
    error: (message: string, data?: unknown) => log("error", message, data),
  };
}

/**
 * Get all log entries from the current test run.
 */
export function getLogBuffer(): readonly LogEntry[] {
  return logBuffer;
}

/**
 * Clear the log buffer (called between tests).
 */
export function clearLogBuffer(): void {
  logBuffer.length = 0;
}

/**
 * Format all log entries as a string for display on failure.
 */
export function formatLogBuffer(): string {
  return logBuffer.map(formatLogEntry).join("\n");
}

/**
 * Setup logging hooks for a test suite.
 * Clears buffer before each test and prints on failure.
 *
 * Usage:
 * ```ts
 * describe("MyTests", () => {
 *   setupTestLogging();
 *   // tests...
 * });
 * ```
 */
export function setupTestLogging(): void {
  beforeEach(() => {
    clearLogBuffer();
  });

  afterEach((context) => {
    if (context.task.result?.state === "fail") {
      console.log("\n=== Test Log Buffer ===");
      console.log(formatLogBuffer());
      console.log("======================\n");
    }
  });
}
