import { describe, it, expect } from "vitest";
import { loadBrennerOperatorPalette } from "./operators";

describe("operators", () => {
  it("loads the core operator palette from the operator library spec", async () => {
    const ops = await loadBrennerOperatorPalette();
    expect(ops).toHaveLength(14);

    for (const op of ops) {
      expect(op.canonicalTag.length).toBeGreaterThan(0);
      expect(op.symbol.length).toBeGreaterThan(0);
      expect(op.title.length).toBeGreaterThan(0);
      expect(op.supportingQuotes.length).toBeGreaterThan(0);

      for (const quote of op.supportingQuotes) {
        expect(quote.tags).toContain(op.canonicalTag);
        expect(op.quoteBankAnchors).toContain(quote.sectionId);
      }
    }
  });
});
