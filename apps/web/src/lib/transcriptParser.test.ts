import { describe, expect, it } from "vitest";
import {
  getSectionByAnchor,
  getSectionByNumber,
  parseTranscript,
  searchSectionsByContent,
  searchSectionsByTitle,
  validateSections,
} from "./transcriptParser";

describe("transcriptParser", () => {
  it("parses sections and strips separator lines", () => {
    const content = [
      "## 1. First",
      "",
      "hello",
      "---",
      "world",
      "",
      "## 2. Second",
      "",
      "> quoted line",
      "*[Q] question*",
    ].join("\n");

    const result = parseTranscript(content);

    expect(result.sections).toHaveLength(2);
    const [firstSection, secondSection] = result.sections;
    expect(firstSection?.anchor).toBe("§1");
    expect(firstSection?.body).toContain("hello");
    expect(firstSection?.body).toContain("world");
    expect(firstSection?.body).not.toContain("---");
    expect(secondSection?.plainText).toContain("quoted line");
    expect(secondSection?.plainText).toContain("[Q]");

    // For a toy sample we should get an expected-count error
    expect(result.errors.some((e) => e.type === "error")).toBe(true);
  });

  it("finds sections by anchor/number and supports simple search", () => {
    const content = ["## 1. Alpha", "", "hello there", "", "## 2. Beta", "", "Brenner"].join("\n");
    const { sections } = parseTranscript(content);

    expect(getSectionByAnchor(sections, "§1")?.title).toBe("Alpha");
    expect(getSectionByNumber(sections, 2)?.title).toBe("Beta");

    expect(searchSectionsByTitle(sections, "alp")).toHaveLength(1);
    expect(searchSectionsByContent(sections, "brenner")).toHaveLength(1);
  });

  it("validateSections returns errors for malformed section arrays", () => {
    const content = ["## 1. Title", "", "body"].join("\n");
    const { sections } = parseTranscript(content);

    const errors = validateSections(sections);
    expect(errors.some((e) => e.type === "error")).toBe(true);

    const [firstSection] = sections;
    if (!firstSection) {
      throw new Error("Expected a parsed section for validation");
    }
    const mutated = [{ ...firstSection, title: "" }];
    const titleErrors = validateSections(mutated);
    expect(titleErrors.some((e) => /empty title/i.test(e.message))).toBe(true);
  });
});
