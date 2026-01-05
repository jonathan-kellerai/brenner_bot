import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  addExclusionTestsToQueue,
  getTestQueueStats,
  loadTestQueue,
  lockQueueItemPredictions,
  priorityFromPower,
  updateQueueItem,
} from "./test-queue";
import type { ExclusionTest } from "./operators/exclusion-test";

// ============================================================================//
// Mock localStorage
// ============================================================================//

const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] ?? null,
    setItem: (key: string, value: string) => {
      store[key] = value;
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
    get length() {
      return Object.keys(store).length;
    },
    key: (index: number) => Object.keys(store)[index] ?? null,
  };
})();

Object.defineProperty(global, "window", {
  value: {
    localStorage: localStorageMock,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  },
});

// ============================================================================//
// Fixtures
// ============================================================================//

function makeExclusionTest(overrides: Partial<ExclusionTest>): ExclusionTest {
  return {
    id: overrides.id ?? "ET-test-1",
    name: overrides.name ?? "Natural experiment: policy change",
    description: overrides.description ?? "Observe outcome before/after a policy shift.",
    category: overrides.category ?? "natural_experiment",
    discriminativePower: overrides.discriminativePower ?? 5,
    falsificationCondition: overrides.falsificationCondition ?? "No measurable change in outcome.",
    supportCondition: overrides.supportCondition ?? "Large change consistent with mechanism.",
    rationale: overrides.rationale ?? "High leverage because it’s quasi-random.",
    feasibility: overrides.feasibility ?? "high",
    feasibilityNotes: overrides.feasibilityNotes,
    selected: overrides.selected,
    isCustom: overrides.isCustom,
  };
}

// ============================================================================//
// Tests
// ============================================================================//

describe("test-queue", () => {
  const sessionId = "THREAD-TEST-001";
  const hypothesisId = "HC-THREAD-TEST-001-001-v1";

  beforeEach(() => {
    localStorageMock.clear();
  });

  it("maps discriminative power to priority", () => {
    expect(priorityFromPower(5)).toBe("urgent");
    expect(priorityFromPower(4)).toBe("high");
    expect(priorityFromPower(3)).toBe("medium");
    expect(priorityFromPower(2)).toBe("low");
    expect(priorityFromPower(1)).toBe("someday");
  });

  it("adds exclusion tests to queue and de-duplicates by stable ID", () => {
    const tests = [
      makeExclusionTest({ id: "ET-a", discriminativePower: 5 }),
      makeExclusionTest({ id: "ET-b", discriminativePower: 3 }),
    ];

    const first = addExclusionTestsToQueue({
      sessionId,
      hypothesisId,
      tests,
      source: "exclusion_test",
    });
    expect(first).toHaveLength(2);

    const second = addExclusionTestsToQueue({
      sessionId,
      hypothesisId,
      tests,
      source: "exclusion_test",
    });
    expect(second).toHaveLength(2);

    const loaded = loadTestQueue(sessionId);
    expect(loaded).toHaveLength(2);
  });

  it("locks predictions and prevents post-hoc edits", () => {
    const tests = [makeExclusionTest({ id: "ET-lock", discriminativePower: 4 })];

    const items = addExclusionTestsToQueue({
      sessionId,
      hypothesisId,
      tests,
      source: "exclusion_test",
    });

    const item = items[0];
    expect(item.predictionsLockedAt).toBeUndefined();

    const locked = lockQueueItemPredictions(sessionId, item.id);
    const lockedItem = locked.find((i) => i.id === item.id);
    expect(lockedItem?.predictionsLockedAt).toBeTruthy();

    const attempted = updateQueueItem(sessionId, item.id, {
      predictionIfTrue: "edited",
      predictionIfFalse: "edited",
    });
    const after = attempted.find((i) => i.id === item.id);
    expect(after?.predictionIfTrue).not.toBe("edited");
    expect(after?.predictionIfFalse).not.toBe("edited");
  });

  it("computes stats", () => {
    addExclusionTestsToQueue({
      sessionId,
      hypothesisId,
      tests: [
        makeExclusionTest({ id: "ET-1", discriminativePower: 5 }),
        makeExclusionTest({ id: "ET-2", discriminativePower: 2 }),
      ],
      source: "exclusion_test",
    });

    const items = loadTestQueue(sessionId);
    const stats = getTestQueueStats(items);
    expect(stats.total).toBe(2);
    expect(stats.byPriority.urgent).toBe(1);
    expect(stats.byPriority.low).toBe(1);
  });
});

