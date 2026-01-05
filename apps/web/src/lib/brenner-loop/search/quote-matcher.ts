/**
 * Quote matching helpers for Brenner semantic search.
 *
 * Converts embedded quote entries from `embeddings.json` into `Quote` objects
 * and provides lightweight helpers to build queries and filter candidates.
 */

import type { Quote } from "@/lib/quotebank-parser";
import { findSimilar, type EmbeddingEntry } from "./embeddings";

// ============================================================================
// Parsing / conversion
// ============================================================================

function parseEmbeddedQuoteText(text: string): Pick<Quote, "quote" | "context" | "tags"> {
  const tags: string[] = [];
  const tagsLine = text.match(/^Tags:\s*(.+)$/m)?.[1];
  if (tagsLine) {
    for (const match of tagsLine.matchAll(/`([^`]+)`/g)) {
      const tag = match[1]?.trim();
      if (tag && !tags.includes(tag)) tags.push(tag);
    }
  }

  const contextMatch = text.match(/(?:Takeaway|Why it matters):\s*([\s\S]*?)(?:\n\s*Tags:|$)/m);
  const context = contextMatch?.[1]?.trim().replace(/\s+/g, " ") ?? "";

  const quote = text
    .split(/\n(?:Takeaway|Why it matters):/i)[0]
    ?.trim()
    .replace(/\s+/g, " ") ?? "";

  return { quote, context, tags };
}

function titleCaseFromTag(tag: string): string {
  return tag
    .replace(/[_-]+/g, " ")
    .trim()
    .split(/\s+/)
    .map((word) => (word.length > 0 ? word[0]!.toUpperCase() + word.slice(1) : word))
    .join(" ");
}

export function embeddingEntryToQuote(entry: EmbeddingEntry): Quote {
  const sectionId = typeof entry.section === "number" ? `§${entry.section}` : "§?";
  const parsed = parseEmbeddedQuoteText(entry.text);
  const title = parsed.tags.length > 0 ? titleCaseFromTag(parsed.tags[0]!) : "Quote Bank";

  return {
    sectionId,
    title,
    quote: parsed.quote,
    context: parsed.context,
    tags: parsed.tags,
  };
}

// ============================================================================
// Query helpers
// ============================================================================

export function buildQuoteQueryText(parts: Array<string | undefined | null>): string {
  return parts
    .filter((value): value is string => typeof value === "string" && value.trim().length > 0)
    .join("\n");
}

export function filterQuoteEntriesByTags(entries: EmbeddingEntry[], tags: string[]): EmbeddingEntry[] {
  const normalizedTags = tags.map((tag) => tag.trim()).filter((tag) => tag.length > 0);
  if (normalizedTags.length === 0) return entries;

  const tagged = entries.filter((entry) =>
    normalizedTags.some((tag) => entry.text.includes(`\`${tag}\``))
  );

  return tagged.length > 0 ? tagged : entries;
}

export function findSimilarQuotes(query: string, entries: EmbeddingEntry[], topK: number = 3): Quote[] {
  return findSimilar(query, entries, topK).map(embeddingEntryToQuote);
}

