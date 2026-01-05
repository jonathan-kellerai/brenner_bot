import { describe, expect, it, vi } from "vitest";
import { TimeoutError, withRetry, withTimeout } from "./errorRecovery";

describe("errorRecovery", () => {
  it("retries transient failures and eventually succeeds", async () => {
    let attempts = 0;

    const result = await withRetry(
      async () => {
        attempts += 1;
        if (attempts < 3) {
          throw new Error("Transient error");
        }
        return "ok";
      },
      { maxAttempts: 3, baseDelayMs: 0, maxDelayMs: 0, jitterRatio: 0 }
    );

    expect(result).toBe("ok");
    expect(attempts).toBe(3);
  });

  it("fails fast when timeout elapses", async () => {
    vi.useFakeTimers();

    const promise = withTimeout(
      new Promise(() => {
        // never resolves
      }),
      { timeoutMs: 50, timeoutMessage: "Timed out" }
    );

    const expectation = expect(promise).rejects.toBeInstanceOf(TimeoutError);
    await vi.runAllTimersAsync();
    await expectation;

    vi.useRealTimers();
  });
});
