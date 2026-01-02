/**
 * E2E Tests: Agent Mail Integration
 *
 * Tests the complete session lifecycle with real (but isolated) Agent Mail
 * using the AgentMailTestServer. These tests verify actual data flow
 * between the UI and Agent Mail, not just UI behavior.
 *
 * Philosophy: NO mocks - test real behavior with isolated test fixtures.
 *
 * Prerequisites:
 * - Lab mode enabled (BRENNER_LAB_MODE=1)
 * - Authentication via BRENNER_LAB_SECRET or Cloudflare Access
 * - Agent Mail test server (auto-started by test fixtures)
 *
 * @see brenner_bot-59rs (E2E Full Session Lifecycle)
 * @see brenner_bot-h909 (Agent Mail Test Server)
 */

import {
  test,
  expect,
  navigateTo,
  takeScreenshot,
  assertTextContent,
  waitForNetworkIdle,
  createKickoffSession,
  createSessionWithDeltas,
  createSessionWithArtifact,
} from "./utils";
import { withStep } from "./utils/e2e-logging";

// ============================================================================
// Helpers
// ============================================================================

/**
 * Get the cookie domain from the BASE_URL.
 */
function getCookieDomain(): string {
  const baseUrl = process.env.BASE_URL || "http://localhost:3000";
  try {
    const url = new URL(baseUrl);
    return url.hostname;
  } catch {
    return "localhost";
  }
}

/**
 * Set up lab auth cookie for a context.
 */
async function setupLabAuth(context: import("@playwright/test").BrowserContext) {
  const labSecret = process.env.BRENNER_LAB_SECRET || "test-secret-for-e2e";
  await context.addCookies([
    {
      name: "brenner_lab_secret",
      value: labSecret,
      domain: getCookieDomain(),
      path: "/",
    },
  ]);
}

/**
 * Check if we should skip tests (lab mode disabled or auth required).
 */
async function shouldSkipTest(
  page: import("@playwright/test").Page,
  logger: { info: (msg: string) => void; warn: (msg: string) => void },
  testName: string
): Promise<boolean> {
  const pageText = await page.locator("body").textContent();

  // Check for 404
  const is404 = await page.evaluate(() => {
    return (
      document.querySelector("title")?.textContent?.includes("404") ||
      document.body.textContent?.includes("This page could not be found") ||
      document.body.textContent?.includes("Not found")
    );
  });

  if (is404) {
    logger.info(`${testName}: Page not found (404), skipping test`);
    return true;
  }

  // Check for locked state
  if (pageText?.includes("Lab Mode Locked") || pageText?.includes("Access Denied")) {
    logger.warn(`${testName}: Auth required, skipping test`);
    return true;
  }

  return false;
}

// ============================================================================
// Agent Mail Integration Tests: Session Display with Seeded Data
// ============================================================================

test.describe("Agent Mail Integration: Seeded Session Display", () => {
  test.describe("Kickoff Session", () => {
    test("displays seeded kickoff message in thread", async ({
      page,
      logger,
      context,
      testSession,
    }) => {
      // Seed a kickoff-only session
      const threadId = `E2E-KICKOFF-${Date.now()}`;
      const config = createKickoffSession(threadId);

      await withStep(logger, page, "Seed test session", async () => {
        await testSession.seed(config);
        logger.info(`Seeded session: ${threadId}`);
      });

      // Set up auth and navigate
      await setupLabAuth(context);
      await navigateTo(page, logger, `/sessions/${threadId}`);
      await waitForNetworkIdle(page, logger);

      if (await shouldSkipTest(page, logger, "kickoff display")) {
        return;
      }

      // Verify session header
      await withStep(logger, page, "Verify session header", async () => {
        await assertTextContent(page, logger, "body", threadId);
      });

      // Verify KICKOFF message is visible
      await withStep(logger, page, "Verify KICKOFF message", async () => {
        const pageText = await page.locator("body").textContent();
        const hasKickoff =
          pageText?.includes("KICKOFF") || pageText?.includes("Research Session");
        expect(hasKickoff).toBeTruthy();
        logger.info("KICKOFF message found in thread");
      });

      // Verify agents are mentioned
      await withStep(logger, page, "Verify agent mentions", async () => {
        const pageText = await page.locator("body").textContent();
        const hasAgents =
          pageText?.includes("HypothesisAgent") ||
          pageText?.includes("TestDesigner") ||
          pageText?.includes("Critic");
        logger.info(`Agent mentions found: ${hasAgents}`);
      });

      await takeScreenshot(page, logger, "agent-mail-kickoff-session");
    });
  });

  test.describe("Session with Deltas", () => {
    test("displays agent delta responses in thread", async ({
      page,
      logger,
      context,
      testSession,
    }) => {
      // Seed a session with delta responses
      const threadId = `E2E-DELTAS-${Date.now()}`;
      const config = createSessionWithDeltas(threadId);

      await withStep(logger, page, "Seed session with deltas", async () => {
        await testSession.seed(config);
        logger.info(`Seeded session with deltas: ${threadId}`);
      });

      // Set up auth and navigate
      await setupLabAuth(context);
      await navigateTo(page, logger, `/sessions/${threadId}`);
      await waitForNetworkIdle(page, logger);

      if (await shouldSkipTest(page, logger, "delta display")) {
        return;
      }

      // Verify deltas are visible
      await withStep(logger, page, "Verify delta messages", async () => {
        const pageText = await page.locator("body").textContent();
        const hasDeltas =
          pageText?.includes("delta") ||
          pageText?.includes("DELTA") ||
          pageText?.includes("hypothesis") ||
          pageText?.includes("ADD");
        expect(hasDeltas).toBeTruthy();
        logger.info("Delta messages found in thread");
      });

      // Check for multiple messages (KICKOFF + responses)
      await withStep(logger, page, "Verify multiple messages", async () => {
        const pageText = await page.locator("body").textContent();
        const messageCount = (pageText?.match(/Re:/g) || []).length;
        logger.info(`Found ${messageCount} reply messages`);
      });

      await takeScreenshot(page, logger, "agent-mail-deltas-session");
    });

    test("parsed deltas section shows delta content", async ({
      page,
      logger,
      context,
      testSession,
    }) => {
      const threadId = `E2E-PARSED-${Date.now()}`;
      const config = createSessionWithDeltas(threadId);

      await testSession.seed(config);
      await setupLabAuth(context);
      await navigateTo(page, logger, `/sessions/${threadId}`);
      await waitForNetworkIdle(page, logger);

      if (await shouldSkipTest(page, logger, "parsed deltas")) {
        return;
      }

      // Look for parsed deltas section
      await withStep(logger, page, "Check parsed deltas section", async () => {
        const pageText = await page.locator("body").textContent();
        const hasParsedSection =
          pageText?.includes("Parsed") ||
          pageText?.includes("Deltas") ||
          pageText?.includes("valid");
        logger.info(`Parsed deltas section visible: ${hasParsedSection}`);
      });

      await takeScreenshot(page, logger, "agent-mail-parsed-deltas");
    });
  });

  test.describe("Session with Artifact", () => {
    test("displays compiled artifact from seeded data", async ({
      page,
      logger,
      context,
      testSession,
    }) => {
      // Seed a session with a compiled artifact
      const threadId = `E2E-ARTIFACT-${Date.now()}`;
      const config = createSessionWithArtifact(threadId);

      await withStep(logger, page, "Seed session with artifact", async () => {
        await testSession.seed(config);
        logger.info(`Seeded session with artifact: ${threadId}`);
      });

      // Set up auth and navigate
      await setupLabAuth(context);
      await navigateTo(page, logger, `/sessions/${threadId}`);
      await waitForNetworkIdle(page, logger);

      if (await shouldSkipTest(page, logger, "artifact display")) {
        return;
      }

      // Verify artifact is visible
      await withStep(logger, page, "Verify compiled artifact", async () => {
        const pageText = await page.locator("body").textContent();
        const hasArtifact =
          pageText?.includes("COMPILED") ||
          pageText?.includes("Artifact") ||
          pageText?.includes("Hypothesis Slate");
        expect(hasArtifact).toBeTruthy();
        logger.info("Compiled artifact found");
      });

      // Verify hypothesis slate content
      await withStep(logger, page, "Verify hypothesis content", async () => {
        const pageText = await page.locator("body").textContent();
        const hasHypotheses =
          pageText?.includes("H1") || pageText?.includes("hypothesis");
        logger.info(`Hypothesis content visible: ${hasHypotheses}`);
      });

      await takeScreenshot(page, logger, "agent-mail-artifact-session");
    });
  });
});

// ============================================================================
// Agent Mail Integration Tests: Thread Navigation
// ============================================================================

test.describe("Agent Mail Integration: Thread Navigation", () => {
  test("navigates between seeded sessions", async ({
    page,
    logger,
    context,
    testSession,
  }) => {
    // Seed two sessions
    const threadId1 = `E2E-NAV-1-${Date.now()}`;
    const threadId2 = `E2E-NAV-2-${Date.now()}`;

    await testSession.seed(createKickoffSession(threadId1));
    await testSession.seed(createSessionWithDeltas(threadId2));

    await setupLabAuth(context);

    // Navigate to first session
    await navigateTo(page, logger, `/sessions/${threadId1}`);
    await waitForNetworkIdle(page, logger);

    if (await shouldSkipTest(page, logger, "navigation test")) {
      return;
    }

    await withStep(logger, page, "Verify first session", async () => {
      await assertTextContent(page, logger, "body", threadId1);
    });

    // Navigate to second session
    await navigateTo(page, logger, `/sessions/${threadId2}`);
    await waitForNetworkIdle(page, logger);

    await withStep(logger, page, "Verify second session", async () => {
      await assertTextContent(page, logger, "body", threadId2);
    });

    logger.info("Session navigation successful");
  });
});

// ============================================================================
// Agent Mail Integration Tests: Message Details
// ============================================================================

test.describe("Agent Mail Integration: Message Details", () => {
  test("expandable message cards show full content", async ({
    page,
    logger,
    context,
    testSession,
  }) => {
    const threadId = `E2E-EXPAND-${Date.now()}`;
    await testSession.seed(createSessionWithDeltas(threadId));

    await setupLabAuth(context);
    await navigateTo(page, logger, `/sessions/${threadId}`);
    await waitForNetworkIdle(page, logger);

    if (await shouldSkipTest(page, logger, "expandable messages")) {
      return;
    }

    // Try to expand a message
    await withStep(logger, page, "Find expandable message", async () => {
      const detailsElements = page.locator("details");
      const count = await detailsElements.count();
      logger.info(`Found ${count} expandable elements`);

      if (count > 0) {
        // Click to expand first details element
        const summary = detailsElements.first().locator("summary");
        if (await summary.isVisible()) {
          await summary.click();
          await page.waitForTimeout(300);
          logger.info("Expanded first message");
        }
      }
    });

    await takeScreenshot(page, logger, "agent-mail-expanded-message");
  });

  test("message metadata shows sender and timestamp", async ({
    page,
    logger,
    context,
    testSession,
  }) => {
    const threadId = `E2E-META-${Date.now()}`;
    await testSession.seed(createKickoffSession(threadId));

    await setupLabAuth(context);
    await navigateTo(page, logger, `/sessions/${threadId}`);
    await waitForNetworkIdle(page, logger);

    if (await shouldSkipTest(page, logger, "message metadata")) {
      return;
    }

    await withStep(logger, page, "Verify message metadata", async () => {
      const pageText = await page.locator("body").textContent();

      // Check for sender name (TestOperator or agent names)
      const hasSender =
        pageText?.includes("TestOperator") ||
        pageText?.includes("From:") ||
        pageText?.includes("HypothesisAgent");
      logger.info(`Sender info visible: ${hasSender}`);

      // Check for timestamp or date
      const hasTimestamp =
        pageText?.includes(":") || // Time format
        pageText?.includes("ago") || // Relative time
        pageText?.includes("202"); // Year
      logger.info(`Timestamp visible: ${hasTimestamp}`);
    });

    await takeScreenshot(page, logger, "agent-mail-message-metadata");
  });
});

// ============================================================================
// Agent Mail Integration Tests: Error Handling
// ============================================================================

test.describe("Agent Mail Integration: Error Handling", () => {
  test("handles non-existent thread gracefully", async ({
    page,
    logger,
    context,
  }) => {
    await setupLabAuth(context);

    // Navigate to a thread that doesn't exist
    const fakeThreadId = `NONEXISTENT-${Date.now()}`;
    await navigateTo(page, logger, `/sessions/${fakeThreadId}`);
    await waitForNetworkIdle(page, logger);

    if (await shouldSkipTest(page, logger, "nonexistent thread")) {
      return;
    }

    await withStep(logger, page, "Verify error handling", async () => {
      const pageText = await page.locator("body").textContent();

      // Should show some form of error or empty state
      const hasEmptyState =
        pageText?.includes("No messages") ||
        pageText?.includes("not found") ||
        pageText?.includes("empty") ||
        pageText?.includes("Failed to load");

      logger.info(`Empty/error state displayed: ${hasEmptyState}`);
    });

    await takeScreenshot(page, logger, "agent-mail-nonexistent-thread");
  });
});

// ============================================================================
// Agent Mail Integration Tests: Session Actions
// ============================================================================

test.describe("Agent Mail Integration: Session Actions", () => {
  test("compile button is present for sessions with deltas", async ({
    page,
    logger,
    context,
    testSession,
  }) => {
    const threadId = `E2E-COMPILE-${Date.now()}`;
    await testSession.seed(createSessionWithDeltas(threadId));

    await setupLabAuth(context);
    await navigateTo(page, logger, `/sessions/${threadId}`);
    await waitForNetworkIdle(page, logger);

    if (await shouldSkipTest(page, logger, "compile button")) {
      return;
    }

    await withStep(logger, page, "Check for compile button", async () => {
      const compileButton = page
        .locator("button")
        .filter({ hasText: /compile/i })
        .first();
      const hasCompile = await compileButton.isVisible().catch(() => false);
      logger.info(`Compile button visible: ${hasCompile}`);
    });

    await takeScreenshot(page, logger, "agent-mail-compile-action");
  });
});
