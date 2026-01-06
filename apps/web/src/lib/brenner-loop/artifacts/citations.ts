/**
 * Citation Manager
 *
 * Helpers for representing and rendering citations used throughout Brenner Loop artifacts.
 *
 * @see brenner_bot-nu8g.3 (Build Citation Manager for Brenner References)
 */

import type { OperatorType } from "../operators/framework";

// ============================================================================
// Types
// ============================================================================

export interface BrennerCitation {
  section: number;
  anchor: string;
  href: string;
  quote?: string;
  context?: string;
  operatorRelevance?: OperatorType[];
}

export type ExternalCitationType =
  | "paper"
  | "article"
  | "book"
  | "dataset"
  | "observation"
  | "other";

export interface ExternalCitation {
  id: string;
  type: ExternalCitationType;
  title: string;
  authors?: string;
  year?: number;
  url?: string;
  doi?: string;
  notes?: string;
}

export interface CitationIndex {
  brennerTranscript: BrennerCitation[];
  externalSources: ExternalCitation[];
}

export interface CitationIndexRenderOptions {
  /** Include a top-level "References" heading. */
  includeHeading?: boolean;
  /**
   * Optional base URL (e.g., "https://brennerbot.org") for transcript links.
   * When omitted, links are relative (e.g., "/corpus/transcript#section-42").
   */
  baseUrl?: string;
  /** Whether to include inline quote snippets when available. */
  includeQuotes?: boolean;
}

// ============================================================================
// Brenner Transcript Citations
// ============================================================================

export function formatBrennerAnchor(section: number): string {
  return `§${section}`;
}

export function buildTranscriptSectionHref(section: number, baseUrl?: string): string {
  const normalizedBase = typeof baseUrl === "string" ? baseUrl.replace(/\/+$/, "") : "";
  return `${normalizedBase}/corpus/transcript#section-${section}`;
}

export function parseBrennerSectionIds(value: string | string[] | undefined): number[] {
  if (!value) return [];

  const items = Array.isArray(value) ? value : [value];
  const seen = new Set<number>();
  const results: number[] = [];

  for (const raw of items) {
    const text = raw.trim();
    if (!text) continue;

    // Try to parse explicit range forms first: "§42-§45" / "§42-45" / "42-45"
    const rangeMatch = text.match(/^§?\s*(\d+)\s*[-–—]\s*§?\s*(\d+)\s*$/);
    if (rangeMatch) {
      const a = parseInt(rangeMatch[1], 10);
      const b = parseInt(rangeMatch[2], 10);
      if (!Number.isFinite(a) || !Number.isFinite(b)) continue;

      const [start, end] = a <= b ? [a, b] : [b, a];
      for (let i = start; i <= end; i++) {
        if (seen.has(i)) continue;
        seen.add(i);
        results.push(i);
      }
      continue;
    }

    // Parse single "§42" (or any string that contains a §-prefixed number).
    const singleMatch = text.match(/§\s*(\d+)/);
    if (singleMatch) {
      const section = parseInt(singleMatch[1], 10);
      if (!Number.isFinite(section)) continue;
      if (seen.has(section)) continue;
      seen.add(section);
      results.push(section);
      continue;
    }

    // Fallback: allow bare "42" (avoids forcing callers to include § everywhere).
    const bareNumber = text.match(/^\s*(\d+)\s*$/);
    if (bareNumber) {
      const section = parseInt(bareNumber[1], 10);
      if (!Number.isFinite(section)) continue;
      if (seen.has(section)) continue;
      seen.add(section);
      results.push(section);
    }
  }

  return results.sort((a, b) => a - b);
}

export function extractBrennerSectionIdsFromText(text: string): number[] {
  const seen = new Set<number>();
  const results: number[] = [];

  const pattern = /§\s*(\d+)(?:\s*([-–—])\s*§?\s*(\d+))?/gu;
  let match: RegExpExecArray | null;

  while ((match = pattern.exec(text)) !== null) {
    const start = parseInt(match[1], 10);
    const end = match[3] ? parseInt(match[3], 10) : null;

    if (!Number.isFinite(start)) continue;

    if (end !== null && Number.isFinite(end)) {
      const [a, b] = start <= end ? [start, end] : [end, start];
      for (let i = a; i <= b; i++) {
        if (seen.has(i)) continue;
        seen.add(i);
        results.push(i);
      }
      continue;
    }

    if (seen.has(start)) continue;
    seen.add(start);
    results.push(start);
  }

  return results.sort((a, b) => a - b);
}

export function buildBrennerCitations(
  brennerCitations: string[] | undefined,
  options: { baseUrl?: string } = {}
): BrennerCitation[] {
  const ids = parseBrennerSectionIds(brennerCitations);
  return ids.map((section) => ({
    section,
    anchor: formatBrennerAnchor(section),
    href: buildTranscriptSectionHref(section, options.baseUrl),
  }));
}

// ============================================================================
// External Citations
// ============================================================================

export function formatExternalCitation(citation: ExternalCitation): string {
  const parts: string[] = [];

  if (citation.authors) {
    parts.push(citation.authors.trim());
  }

  if (typeof citation.year === "number" && Number.isFinite(citation.year)) {
    parts.push(`(${citation.year})`);
  }

  parts.push(citation.title.trim());

  if (citation.doi) {
    parts.push(`DOI: ${citation.doi.trim()}`);
  }

  if (citation.url) {
    parts.push(citation.url.trim());
  }

  if (citation.notes) {
    parts.push(`Notes: ${citation.notes.trim()}`);
  }

  return parts.join(" ");
}

// ============================================================================
// Index + Rendering
// ============================================================================

export function buildCitationIndex(input: {
  brennerCitations?: string[];
  externalCitations?: ExternalCitation[];
  baseUrl?: string;
}): CitationIndex {
  const brennerTranscript = buildBrennerCitations(input.brennerCitations, { baseUrl: input.baseUrl });
  const externalSources = [...(input.externalCitations ?? [])].sort((a, b) => a.title.localeCompare(b.title));

  return {
    brennerTranscript,
    externalSources,
  };
}

export function renderCitationIndexSection(
  index: CitationIndex,
  options: CitationIndexRenderOptions = {}
): string[] {
  const { includeHeading = true, baseUrl, includeQuotes = false } = options;
  const lines: string[] = [];

  const transcript = index.brennerTranscript;
  const external = index.externalSources;

  if (includeHeading) {
    lines.push("## References");
    lines.push("");
  }

  lines.push("### Brenner Transcript");
  if (transcript.length === 0) {
    lines.push("- _None yet._");
  } else {
    for (const cite of transcript) {
      const href = buildTranscriptSectionHref(cite.section, baseUrl);
      const quoteSuffix = includeQuotes && cite.quote ? ` — "${cite.quote}"` : "";
      lines.push(`- [${cite.anchor}](${href})${quoteSuffix}`);
    }
  }
  lines.push("");

  lines.push("### External Sources");
  if (external.length === 0) {
    lines.push("- _None yet._");
  } else {
    for (const cite of external) {
      lines.push(`- ${formatExternalCitation(cite)}`);
    }
  }

  return lines;
}
