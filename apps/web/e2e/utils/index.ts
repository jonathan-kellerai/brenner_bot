/**
 * E2E Test Utilities
 *
 * Re-exports all utilities for easy importing.
 */

// Enhanced test fixtures with logging
export { test, expect, type TestSessionFixture } from "./test-fixtures";

// Navigation and interaction helpers
export {
  navigateTo,
  waitForContent,
  clickElement,
  fillInput,
  takeScreenshot,
  assertTextContent,
  assertElementCount,
  assertUrl,
  waitForNetworkIdle,
  assertPageHasContent,
} from "./test-fixtures";

// Logging utilities
export {
  createE2ELogger,
  withStep,
  log,
  getTestLogs,
  formatLogsAsJson,
  formatLogsAsText,
  type E2ELogLevel,
  type E2ELogEntry,
} from "./e2e-logging";

// Network logging and performance utilities
export {
  setupNetworkLogging,
  collectPerformanceTiming,
  getNetworkLogs,
  getPerformanceTiming,
  formatNetworkLogsAsText,
  attachNetworkLogsToTest,
  clearNetworkContext,
  type NetworkRequestLog,
  type PerformanceTimingData,
} from "./network-logging";

// Accessibility (axe-core)
export {
  checkAccessibility,
  filterViolationsByImpact,
  formatViolations,
} from "./a11y-testing";

// Agent Mail test seeding
export {
  getTestServer,
  getTestServerUrl,
  stopTestServer,
  resetTestServer,
  seedTestSession,
  cleanupTestSession,
  createKickoffSession,
  createSessionWithDeltas,
  createSessionWithArtifact,
  type SessionConfig,
  type SeededMessage,
  type SeededAgent,
} from "./agent-mail-seeder";
