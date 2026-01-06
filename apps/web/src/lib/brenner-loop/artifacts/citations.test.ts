import { describe, expect, it } from "vitest";
import {
  buildCitationIndex,
  buildTranscriptSectionHref,
  extractBrennerSectionIdsFromText,
  formatExternalCitation,
  parseBrennerSectionIds,
  renderCitationIndexSection,
  type ExternalCitation,
} from "./citations";

describe("citations", () => {
  describe("parseBrennerSectionIds", () => {
    it("parses single anchors and ranges", () => {
      expect(parseBrennerSectionIds(["§42", "§127-§129"])).toEqual([42, 127, 128, 129]);
      expect(parseBrennerSectionIds(["42", "127-129"])).toEqual([42, 127, 128, 129]);
    });

    it("parses reversed ranges", () => {
      expect(parseBrennerSectionIds(["§129-127"])).toEqual([127, 128, 129]);
    });
  });

  describe("extractBrennerSectionIdsFromText", () => {
    it("extracts anchors from running text", () => {
      const text = "See §42 and §127-§129 for the relevant principle.";
      expect(extractBrennerSectionIdsFromText(text)).toEqual([42, 127, 128, 129]);
    });

    it("handles en-dash ranges", () => {
      const text = "Compare §58–59 and §147.";
      expect(extractBrennerSectionIdsFromText(text)).toEqual([58, 59, 147]);
    });
  });

  describe("buildTranscriptSectionHref", () => {
    it("builds relative and absolute transcript links", () => {
      expect(buildTranscriptSectionHref(42)).toBe("/corpus/transcript#section-42");
      expect(buildTranscriptSectionHref(42, "https://brennerbot.org")).toBe(
        "https://brennerbot.org/corpus/transcript#section-42"
      );
    });
  });

  describe("formatExternalCitation", () => {
    it("formats external citations deterministically", () => {
      const citation: ExternalCitation = {
        id: "paper:smith-2023",
        type: "paper",
        title: "Social Media and Teen Mental Health",
        authors: "Smith et al.",
        year: 2023,
        doi: "10.1000/example",
        url: "https://example.com",
      };
      expect(formatExternalCitation(citation)).toContain("Smith et al.");
      expect(formatExternalCitation(citation)).toContain("(2023)");
      expect(formatExternalCitation(citation)).toContain("Social Media and Teen Mental Health");
      expect(formatExternalCitation(citation)).toContain("DOI: 10.1000/example");
      expect(formatExternalCitation(citation)).toContain("https://example.com");
    });
  });

  describe("renderCitationIndexSection", () => {
    it("renders a References section with links", () => {
      const external: ExternalCitation = { id: "obs:1", type: "observation", title: "Lab notebook observation" };
      const index = buildCitationIndex({ brennerCitations: ["§42", "§127-§129"], externalCitations: [external] });
      const markdown = renderCitationIndexSection(index).join("\n");

      expect(markdown).toContain("## References");
      expect(markdown).toContain("### Brenner Transcript");
      expect(markdown).toContain("[§42](/corpus/transcript#section-42)");
      expect(markdown).toContain("[§129](/corpus/transcript#section-129)");
      expect(markdown).toContain("### External Sources");
      expect(markdown).toContain("Lab notebook observation");
    });
  });
});

