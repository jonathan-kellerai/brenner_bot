/**
 * Network Request Logging and Performance Timing for E2E Tests
 *
 * Provides detailed network request logging and performance metrics collection.
 * Philosophy: Make network issues easy to diagnose.
 */

import type { Page, Request, Response, TestInfo } from "@playwright/test";

// ============================================================================
// Types
// ============================================================================

export interface NetworkRequestLog {
  timestamp: string;
  method: string;
  url: string;
  resourceType: string;
  status?: number;
  statusText?: string;
  duration?: number;
  failure?: string;
}

export interface PerformanceTimingData {
  startTime: number;
  domContentLoaded?: number;
  load?: number;
  firstContentfulPaint?: number;
  largestContentfulPaint?: number;
}

export interface NetworkContext {
  testTitle: string;
  networkLogs: NetworkRequestLog[];
  performanceTiming: PerformanceTimingData;
}

// ============================================================================
// State
// ============================================================================

const networkContexts = new Map<string, NetworkContext>();
const pendingRequests = new Map<string, { startTime: number; url: string }>();

function getTimestamp(): string {
  return new Date().toISOString();
}

function formatDuration(ms: number): string {
  if (ms < 1000) return `${ms}ms`;
  return `${(ms / 1000).toFixed(2)}s`;
}

// ============================================================================
// Context Management
// ============================================================================

export function createNetworkContext(testTitle: string): NetworkContext {
  const context: NetworkContext = {
    testTitle,
    networkLogs: [],
    performanceTiming: { startTime: Date.now() },
  };
  networkContexts.set(testTitle, context);
  return context;
}

export function getNetworkContext(testTitle: string): NetworkContext {
  let context = networkContexts.get(testTitle);
  if (!context) {
    context = createNetworkContext(testTitle);
  }
  return context;
}

export function clearNetworkContext(testTitle: string): void {
  networkContexts.delete(testTitle);
}

// ============================================================================
// Network Request Logging
// ============================================================================

export function logNetworkRequest(testTitle: string, request: Request): void {
  const requestId = `${request.method()}-${request.url()}-${Date.now()}`;
  pendingRequests.set(requestId, { startTime: Date.now(), url: request.url() });

  console.log(`\x1b[90m  -> ${request.method()} ${request.url().slice(0, 80)}...\x1b[0m`);
}

export function logNetworkResponse(testTitle: string, response: Response): void {
  const request = response.request();
  const url = request.url();
  const context = getNetworkContext(testTitle);

  // Find matching pending request
  let duration: number | undefined;
  const entries = Array.from(pendingRequests.entries());
  for (let i = 0; i < entries.length; i++) {
    const entry = entries[i];
    if (entry[1].url === url) {
      duration = Date.now() - entry[1].startTime;
      pendingRequests.delete(entry[0]);
      break;
    }
  }

  const networkLog: NetworkRequestLog = {
    timestamp: getTimestamp(),
    method: request.method(),
    url: url,
    resourceType: request.resourceType(),
    status: response.status(),
    statusText: response.statusText(),
    duration,
  };
  context.networkLogs.push(networkLog);

  // Log to console with color based on status
  const statusColor = response.status() >= 400 ? "\x1b[31m" : response.status() >= 300 ? "\x1b[33m" : "\x1b[32m";
  const durationStr = duration ? ` [${formatDuration(duration)}]` : "";
  console.log(`\x1b[90m  <- ${statusColor}${response.status()}\x1b[0m ${request.method()} ${url.slice(0, 60)}...${durationStr}`);
}

export function logNetworkFailure(testTitle: string, request: Request, failure: string): void {
  const context = getNetworkContext(testTitle);
  const networkLog: NetworkRequestLog = {
    timestamp: getTimestamp(),
    method: request.method(),
    url: request.url(),
    resourceType: request.resourceType(),
    failure,
  };
  context.networkLogs.push(networkLog);

  console.log(`\x1b[31m  X ${request.method()} ${request.url().slice(0, 60)}... FAILED: ${failure}\x1b[0m`);
}

export function setupNetworkLogging(page: Page, testTitle: string): void {
  // Create context if not exists
  getNetworkContext(testTitle);

  page.on("request", (request) => {
    const type = request.resourceType();
    if (["document", "fetch", "xhr", "script", "stylesheet"].includes(type)) {
      logNetworkRequest(testTitle, request);
    }
  });

  page.on("response", (response) => {
    const type = response.request().resourceType();
    if (["document", "fetch", "xhr", "script", "stylesheet"].includes(type)) {
      logNetworkResponse(testTitle, response);
    }
  });

  page.on("requestfailed", (request) => {
    const failure = request.failure()?.errorText || "Unknown error";
    logNetworkFailure(testTitle, request, failure);
  });
}

// ============================================================================
// Performance Timing
// ============================================================================

export async function collectPerformanceTiming(page: Page, testTitle: string): Promise<PerformanceTimingData> {
  const context = getNetworkContext(testTitle);

  try {
    const timing = await page.evaluate(() => {
      const perf = window.performance;
      const navigation = perf.getEntriesByType("navigation")[0] as PerformanceNavigationTiming | undefined;
      const paint = perf.getEntriesByType("paint");

      const fcp = paint.find((p) => p.name === "first-contentful-paint");

      return {
        startTime: navigation?.startTime || 0,
        domContentLoaded: navigation?.domContentLoadedEventEnd || undefined,
        load: navigation?.loadEventEnd || undefined,
        firstContentfulPaint: fcp?.startTime || undefined,
      };
    });

    // Try to get LCP
    const lcp = await page.evaluate(() => {
      return new Promise<number | undefined>((resolve) => {
        const observer = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const lastEntry = entries[entries.length - 1];
          resolve(lastEntry?.startTime);
          observer.disconnect();
        });

        try {
          observer.observe({ type: "largest-contentful-paint", buffered: true });
        } catch {
          resolve(undefined);
        }

        setTimeout(() => resolve(undefined), 100);
      });
    }).catch(() => undefined);

    const performanceData: PerformanceTimingData = {
      ...timing,
      largestContentfulPaint: lcp,
    };

    context.performanceTiming = performanceData;
    console.log(`\x1b[32m  Performance: FCP=${timing.firstContentfulPaint?.toFixed(0) || "N/A"}ms, Load=${timing.load?.toFixed(0) || "N/A"}ms\x1b[0m`);

    return performanceData;
  } catch {
    return context.performanceTiming;
  }
}

// ============================================================================
// Getters and Formatters
// ============================================================================

export function getNetworkLogs(testTitle: string): NetworkRequestLog[] {
  return getNetworkContext(testTitle).networkLogs;
}

export function getPerformanceTiming(testTitle: string): PerformanceTimingData {
  return getNetworkContext(testTitle).performanceTiming;
}

export function formatNetworkLogsAsText(testTitle: string): string {
  const context = getNetworkContext(testTitle);
  const header = `\n${"=".repeat(60)}\nNetwork Requests: ${testTitle}\nTotal: ${context.networkLogs.length}\n${"=".repeat(60)}\n`;

  const logLines = context.networkLogs.map((entry) => {
    const statusStr = entry.status ? `${entry.status} ${entry.statusText || ""}` : entry.failure || "pending";
    const durationStr = entry.duration ? ` [${formatDuration(entry.duration)}]` : "";
    return `${entry.timestamp.slice(11, 23)} ${entry.method.padEnd(6)} ${statusStr.padEnd(12)} ${entry.url.slice(0, 60)}${durationStr}`;
  });

  return header + logLines.join("\n");
}

export async function attachNetworkLogsToTest(testInfo: TestInfo, testTitle: string): Promise<void> {
  const context = getNetworkContext(testTitle);

  if (context.networkLogs.length > 0) {
    await testInfo.attach("network-logs.json", {
      body: JSON.stringify(context.networkLogs, null, 2),
      contentType: "application/json",
    });

    await testInfo.attach("network-logs.txt", {
      body: formatNetworkLogsAsText(testTitle),
      contentType: "text/plain",
    });
  }

  await testInfo.attach("performance-timing.json", {
    body: JSON.stringify(context.performanceTiming, null, 2),
    contentType: "application/json",
  });
}
