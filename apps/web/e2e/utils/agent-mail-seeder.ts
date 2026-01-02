/**
 * E2E Agent Mail Seeder
 *
 * Utilities for seeding test sessions with Agent Mail test data.
 * Uses the AgentMailTestServer for isolated, deterministic E2E tests.
 *
 * @see brenner_bot-59rs (E2E Full Session Lifecycle)
 * @see brenner_bot-h909 (Agent Mail Test Server)
 */

import { AgentMailTestServer } from "../../src/test-utils/agent-mail-test-server";

// ============================================================================
// Types
// ============================================================================

export interface SessionConfig {
  /** Thread ID for the session */
  threadId: string;
  /** Operator/human who created the session */
  operator?: string;
  /** Messages to seed in the thread */
  messages?: SeededMessage[];
  /** Whether the session has a compiled artifact */
  hasArtifact?: boolean;
  /** Agents to register */
  agents?: SeededAgent[];
}

export interface SeededMessage {
  from: string;
  subject: string;
  body: string;
  type?: "KICKOFF" | "DELTA" | "CRITIQUE" | "ACK" | "EVIDENCE" | "RESULT" | "ADMIN" | "COMPILE" | "PUBLISH";
  to?: string[];
}

export interface SeededAgent {
  name: string;
  role: "hypothesis_generator" | "test_designer" | "adversarial_critic" | "orchestrator";
  program?: string;
  model?: string;
}

// ============================================================================
// Test Server Singleton
// ============================================================================

let testServer: AgentMailTestServer | null = null;
let serverPort: number = 0;

/**
 * Get or create the test server singleton.
 */
export async function getTestServer(): Promise<AgentMailTestServer> {
  if (!testServer) {
    testServer = new AgentMailTestServer();
    serverPort = await testServer.start(0); // Let OS pick a port
  }
  return testServer;
}

/**
 * Get the test server URL.
 */
export function getTestServerUrl(): string {
  if (!testServer || !serverPort) {
    throw new Error("Test server not started. Call getTestServer() first.");
  }
  return `http://127.0.0.1:${serverPort}`;
}

/**
 * Stop the test server.
 */
export async function stopTestServer(): Promise<void> {
  if (testServer) {
    await testServer.stop();
    testServer = null;
    serverPort = 0;
  }
}

/**
 * Reset test server state (between tests).
 */
export function resetTestServer(): void {
  if (testServer) {
    testServer.reset();
  }
}

// ============================================================================
// Session Seeding
// ============================================================================

/**
 * Seed a test session with messages and agents.
 */
export async function seedTestSession(config: SessionConfig): Promise<void> {
  // Ensure test server is running (we don't need the return value)
  await getTestServer();
  const projectKey = "/data/projects/brenner_bot";

  // Register the orchestrator first
  const orchestratorName = config.operator || "TestOrchestrator";
  await callTestServer("register_agent", {
    project_key: projectKey,
    name: orchestratorName,
    program: "e2e-test",
    model: "test-model",
    task_description: `E2E test session: ${config.threadId}`,
  });

  // Register additional agents
  for (const agent of config.agents || []) {
    await callTestServer("register_agent", {
      project_key: projectKey,
      name: agent.name,
      program: agent.program || "e2e-test",
      model: agent.model || "test-model",
      task_description: `Role: ${agent.role}`,
    });
  }

  // Send seeded messages
  for (const msg of config.messages || []) {
    const recipients = msg.to || ["AllAgents"];
    await callTestServer("send_message", {
      project_key: projectKey,
      sender_name: msg.from,
      to: recipients,
      subject: msg.subject,
      body_md: msg.body,
      thread_id: config.threadId,
    });
  }
}

/**
 * Clean up a test session.
 */
export async function cleanupTestSession(threadId: string): Promise<void> {
  // Test server is in-memory, so cleanup is just for consistency
  // The reset() call between tests handles actual cleanup
  void threadId;
}

// ============================================================================
// Helpers
// ============================================================================

async function callTestServer(
  tool: string,
  args: Record<string, unknown>
): Promise<unknown> {
  const url = getTestServerUrl();
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      jsonrpc: "2.0",
      id: Date.now().toString(),
      method: "tools/call",
      params: { name: tool, arguments: args },
    }),
  });

  if (!response.ok) {
    throw new Error(`Test server error: ${response.status}`);
  }

  const result = await response.json();
  if (result.error) {
    throw new Error(`Tool error: ${result.error.message}`);
  }

  return result.result;
}

// ============================================================================
// Pre-built Test Fixtures
// ============================================================================

/**
 * Create a basic kickoff-only session.
 */
export function createKickoffSession(threadId: string): SessionConfig {
  return {
    threadId,
    operator: "TestOperator",
    agents: [
      { name: "HypothesisAgent", role: "hypothesis_generator" },
      { name: "TestDesigner", role: "test_designer" },
      { name: "Critic", role: "adversarial_critic" },
    ],
    messages: [
      {
        from: "TestOperator",
        subject: `[${threadId}] KICKOFF: Test Research Session`,
        body: `# Research Session: ${threadId}

## Excerpt
> §42: This is a test excerpt for E2E testing purposes.

## Research Question
What are the key factors that influence test reliability?

## Session Protocol
1. Generate hypotheses
2. Design discriminative tests
3. Critique and refine
`,
        type: "KICKOFF",
        to: ["HypothesisAgent", "TestDesigner", "Critic"],
      },
    ],
  };
}

/**
 * Create a session with agent responses (deltas).
 */
export function createSessionWithDeltas(threadId: string): SessionConfig {
  const base = createKickoffSession(threadId);
  return {
    ...base,
    messages: [
      ...base.messages!,
      {
        from: "HypothesisAgent",
        subject: `Re: [${threadId}] KICKOFF: Test Research Session`,
        body: `\`\`\`delta
ADD hypothesis H1
statement: Test reliability depends primarily on isolation of test cases.
mechanism: Independent test cases reduce flaky failures from shared state.
anchors: [software engineering best practices]
confidence: high
\`\`\``,
        type: "DELTA",
        to: ["TestOperator"],
      },
      {
        from: "TestDesigner",
        subject: `Re: [${threadId}] KICKOFF: Test Research Session`,
        body: `\`\`\`delta
ADD test T1
hypothesis: H1
design: Run 100 iterations of the same test suite with and without shared state.
discriminates: H1 (isolation) vs null hypothesis (no effect)
evidence_required: Pass rate comparison
\`\`\``,
        type: "DELTA",
        to: ["TestOperator"],
      },
      {
        from: "Critic",
        subject: `Re: [${threadId}] KICKOFF: Test Research Session`,
        body: `\`\`\`delta
ADD critique C1
target: H1
type: missing_assumption
content: H1 assumes that shared state is the primary cause of flakiness, but network latency and timing issues may be more significant.
\`\`\``,
        type: "DELTA",
        to: ["TestOperator"],
      },
    ],
  };
}

/**
 * Create a session with a compiled artifact.
 */
export function createSessionWithArtifact(threadId: string): SessionConfig {
  const base = createSessionWithDeltas(threadId);
  return {
    ...base,
    hasArtifact: true,
    messages: [
      ...base.messages!,
      {
        from: "TestOperator",
        subject: `[${threadId}] COMPILED: Artifact v1`,
        body: `# Research Artifact: ${threadId}

## Hypothesis Slate

### H1: Test Isolation
**Statement**: Test reliability depends primarily on isolation of test cases.

## Tests

### T1: Isolation Comparison
**Design**: Run 100 iterations with and without shared state.

## Critiques

### C1: Missing Assumption
**Target**: H1
**Content**: Assumes shared state is primary cause of flakiness.
`,
        type: "COMPILE",
        to: ["HypothesisAgent", "TestDesigner", "Critic"],
      },
    ],
  };
}
