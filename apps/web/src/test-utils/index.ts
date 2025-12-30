/**
 * Test Utilities
 *
 * Shared utilities for unit and E2E testing.
 * Philosophy: NO mocks - test real behavior with real fixtures.
 */

// Logging utilities
export {
  createTestLogger,
  getLogBuffer,
  clearLogBuffer,
  formatLogBuffer,
  setupTestLogging,
  type LogLevel,
  type LogEntry,
} from "./logging";

// Fixtures
export {
  loadFixtureFile,
  loadJsonFixture,
  getTranscriptPath,
  loadTranscriptSection,
  SAMPLE_EXCERPT,
  SAMPLE_DELTA_MESSAGE,
  MALFORMED_DELTA_MESSAGE,
  SAMPLE_ARTIFACT_FIXTURE,
} from "./fixtures";

// Assertions
export {
  assertValidDelta,
  assertInvalidDelta,
  assertDeltaOperation,
  assertDeltaSection,
  assertDeltaPayload,
  assertLength,
  assertContains,
  assertDefined,
  assertDeepEqual,
  assertValidAnchor,
  assertValidAnchors,
  assertValidHypothesis,
  assertValidTest,
  assertValidScore,
} from "./assertions";
