import { describe, expect, it } from "vitest";
import type { EmbeddingEntry } from "./embeddings";
import {
  buildQuoteQueryText,
  embeddingEntryToQuote,
  filterQuoteEntriesByTags,
} from "./quote-matcher";

describe("quote-matcher", () => {
  it("buildQuoteQueryText filters empty values", () => {
    expect(buildQuoteQueryText([" a ", "", "  ", null, undefined, "b"])).toBe(" a \nb");
  });

  it("embeddingEntryToQuote parses tags/takeaway and formats title", () => {
    const entry: EmbeddingEntry = {
      id: "q1",
      source: "quote",
      section: 89,
      embedding: [0, 1],
      text: [
        "Not merely unlikely—impossible if the alternative is true.",
        "Takeaway: Design tests that can rule you out.",
        "Tags: `exclusion-test`, `falsification`",
      ].join("\n"),
    };

    const quote = embeddingEntryToQuote(entry);

    expect(quote.sectionId).toBe("§89");
    expect(quote.title).toBe("Exclusion Test");
    expect(quote.quote).toContain("Not merely unlikely");
    expect(quote.context).toContain("Design tests");
    expect(quote.tags).toEqual(["exclusion-test", "falsification"]);
  });

  it("filterQuoteEntriesByTags selects tag matches or falls back to all", () => {
    const a: EmbeddingEntry = {
      id: "a",
      source: "quote",
      embedding: [0],
      text: "A\nTags: `mechanism`",
    };
    const b: EmbeddingEntry = {
      id: "b",
      source: "quote",
      embedding: [0],
      text: "B\nTags: `bias-to-experiment`",
    };

    expect(filterQuoteEntriesByTags([a, b], ["mechanism"]).map((e) => e.id)).toEqual(["a"]);
    expect(filterQuoteEntriesByTags([a, b], ["does-not-exist"]).map((e) => e.id)).toEqual(["a", "b"]);
    expect(filterQuoteEntriesByTags([a, b], ["", "  "]).map((e) => e.id)).toEqual(["a", "b"]);
  });
});

