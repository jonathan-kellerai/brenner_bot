/**
 * Unit tests for Research Brief Template
 *
 * @see @/lib/brenner-loop/artifacts/research-brief-template
 */

import { describe, expect, it } from "vitest";
import {
  renderResearchBriefTemplate,
  createResearchBriefTemplate,
  RESEARCH_BRIEF_TEMPLATE_VERSION,
  type ResearchBriefTemplateInput,
} from "./research-brief-template";

describe("renderResearchBriefTemplate", () => {
  it("renders a minimal template with defaults when no input provided", () => {
    const result = renderResearchBriefTemplate();
    expect(result).toContain("type: research_brief");
    expect(result).toContain(`version: ${RESEARCH_BRIEF_TEMPLATE_VERSION}`);
    expect(result).toContain("session_id: unknown");
    expect(result).toContain("hypothesis_id: unknown");
    expect(result).toContain("status: draft");
    expect(result).toContain("final_confidence: unknown");
    expect(result).toContain("# Research Brief");
  });

  it("renders custom metadata values", () => {
    const input: ResearchBriefTemplateInput = {
      metadata: {
        sessionId: "SESSION-123",
        hypothesisId: "HYP-456",
        createdAt: "2026-01-01T00:00:00Z",
        finalConfidence: 75,
        status: "supported",
        operatorsApplied: ["Scale-Check", "Level-Split"],
        agentsConsulted: ["DevilBot", "StatBot"],
        testsIdentified: 5,
        testsCompleted: 3,
        brennerCitations: ["§1.2", "§3.4"],
      },
    };

    const result = renderResearchBriefTemplate(input);
    expect(result).toContain("session_id: SESSION-123");
    expect(result).toContain("hypothesis_id: HYP-456");
    expect(result).toContain("final_confidence: 75%");
    expect(result).toContain("status: supported");
    expect(result).toContain("  - Scale-Check");
    expect(result).toContain("  - Level-Split");
    expect(result).toContain("  - DevilBot");
    expect(result).toContain("tests_identified: 5");
    expect(result).toContain("tests_completed: 3");
  });

  it("renders executive summary with custom content", () => {
    const input: ResearchBriefTemplateInput = {
      executiveSummary: "This hypothesis is well supported by evidence.",
    };

    const result = renderResearchBriefTemplate(input);
    expect(result).toContain("## Executive Summary");
    expect(result).toContain("This hypothesis is well supported by evidence.");
  });

  it("renders fallback for empty executive summary", () => {
    const input: ResearchBriefTemplateInput = {
      executiveSummary: "",
    };

    const result = renderResearchBriefTemplate(input);
    expect(result).toContain("_Summarize the hypothesis, key finding, and recommendation._");
  });

  it("renders hypothesis statement fields", () => {
    const input: ResearchBriefTemplateInput = {
      hypothesisStatement: {
        statement: "X causes Y",
        mechanism: "Through pathway Z",
        domain: ["biology", "medicine"],
      },
    };

    const result = renderResearchBriefTemplate(input);
    expect(result).toContain("- **Statement:** X causes Y");
    expect(result).toContain("- **Mechanism:** Through pathway Z");
    expect(result).toContain("- **Domain:** biology, medicine");
  });

  it("renders fallback for empty domain list", () => {
    const input: ResearchBriefTemplateInput = {
      hypothesisStatement: {
        statement: "X causes Y",
        domain: [],
      },
    };

    const result = renderResearchBriefTemplate(input);
    expect(result).toContain("- **Domain:** unknown");
  });

  it("renders hypothesis evolution section", () => {
    const input: ResearchBriefTemplateInput = {
      hypothesisEvolution: {
        summary: "The hypothesis evolved significantly.",
        changes: ["Added mechanism detail", "Narrowed scope"],
        triggers: ["Evidence from Test A", "Critique from Devil's Advocate"],
        diagram: "flowchart.png",
      },
    };

    const result = renderResearchBriefTemplate(input);
    expect(result).toContain("The hypothesis evolved significantly.");
    expect(result).toContain("- **Evolution steps:**");
    expect(result).toContain("  - Added mechanism detail");
    expect(result).toContain("- **Triggers:**");
    expect(result).toContain("  - Evidence from Test A");
    expect(result).toContain("- **Diagram / sketch:** flowchart.png");
  });

  it("renders discriminative structure", () => {
    const input: ResearchBriefTemplateInput = {
      discriminativeStructure: {
        predictionsIfTrue: ["Prediction 1", "Prediction 2"],
        predictionsIfFalse: ["Counter-prediction 1"],
        falsificationConditions: ["If X < 0, hypothesis is false"],
      },
    };

    const result = renderResearchBriefTemplate(input);
    expect(result).toContain("- **Predictions if true:**");
    expect(result).toContain("  - Prediction 1");
    expect(result).toContain("- **Predictions if false:**");
    expect(result).toContain("  - Counter-prediction 1");
    expect(result).toContain("- **Falsification conditions:**");
  });

  it("renders operators applied section with entries", () => {
    const input: ResearchBriefTemplateInput = {
      operatorsApplied: [
        {
          operator: "Scale-Check",
          discoveries: ["Discovery 1"],
          outputs: ["Output 1", "Output 2"],
        },
        {
          operator: "Level-Split",
          discoveries: [],
          outputs: ["Split result"],
        },
      ],
    };

    const result = renderResearchBriefTemplate(input);
    expect(result).toContain("### Scale-Check");
    expect(result).toContain("- **Discoveries:**");
    expect(result).toContain("  - Discovery 1");
    expect(result).toContain("- **Key outputs:**");
    expect(result).toContain("  - Output 1");
    expect(result).toContain("### Level-Split");
  });

  it("renders fallback when no operators applied", () => {
    const input: ResearchBriefTemplateInput = {
      operatorsApplied: [],
    };

    const result = renderResearchBriefTemplate(input);
    expect(result).toContain("- _No operators recorded yet._");
  });

  it("renders agent analysis section", () => {
    const input: ResearchBriefTemplateInput = {
      agentAnalysis: {
        devilsAdvocate: ["Challenge 1", "Challenge 2"],
        experimentDesigner: ["Test design 1"],
        statistician: ["Statistical concern 1"],
        brennerChanneler: ["Brenner principle applied"],
        consensus: ["Agreed on X"],
        conflicts: ["Disagreed on Y"],
      },
    };

    const result = renderResearchBriefTemplate(input);
    expect(result).toContain("- **Devil's Advocate:**");
    expect(result).toContain("  - Challenge 1");
    expect(result).toContain("- **Experiment Designer:**");
    expect(result).toContain("- **Statistician:**");
    expect(result).toContain("- **Brenner Channeler:**");
    expect(result).toContain("- **Consensus:**");
    expect(result).toContain("- **Conflicts:**");
  });

  it("renders empty objection register", () => {
    const input: ResearchBriefTemplateInput = {
      objectionRegister: {
        objections: [],
      },
    };

    const result = renderResearchBriefTemplate(input);
    expect(result).toContain("- _No objections recorded yet._");
  });

  it("renders objection register with objections", () => {
    const input: ResearchBriefTemplateInput = {
      objectionRegister: {
        objections: [
          {
            id: "obj-1",
            type: "reverse_causation",
            severity: "serious",
            status: "open",
            summary: "Y might cause X instead",
            source: {
              agentName: "DevilBot",
              role: "devils_advocate",
              messageId: 123,
            },
          },
          {
            id: "obj-2",
            type: "confound_identified",
            severity: "moderate",
            status: "addressed",
            summary: "Z is a confound",
            response: "Added control for Z",
          },
        ],
        note: "Review needed before publication",
      },
    };

    const result = renderResearchBriefTemplate(input);
    expect(result).toContain("- **Total objections:** 2");
    expect(result).toContain("- **Unresolved objections:** 1");
    expect(result).toContain("- **Note:** Review needed before publication");
    expect(result).toContain("[Open] (Serious) reverse causation: Y might cause X instead");
    expect(result).toContain("devils_advocate (msg 123)");
    expect(result).toContain("[Addressed] (Moderate) confound identified: Z is a confound");
    expect(result).toContain("- Response: Added control for Z");
  });

  it("renders objection with only messageId source", () => {
    const input: ResearchBriefTemplateInput = {
      objectionRegister: {
        objections: [
          {
            id: "obj-1",
            type: "other",
            severity: "minor",
            status: "dismissed",
            summary: "Minor issue",
            source: {
              messageId: 456,
            },
          },
        ],
      },
    };

    const result = renderResearchBriefTemplate(input);
    expect(result).toContain("msg 456");
  });

  it("renders objection with only agentName source (no role)", () => {
    const input: ResearchBriefTemplateInput = {
      objectionRegister: {
        objections: [
          {
            id: "obj-1",
            type: "other",
            severity: "minor",
            status: "testing",
            summary: "Testing objection",
            source: {
              agentName: "SomeAgent",
            },
          },
        ],
      },
    };

    const result = renderResearchBriefTemplate(input);
    expect(result).toContain("SomeAgent");
  });

  it("renders objection with no source info", () => {
    const input: ResearchBriefTemplateInput = {
      objectionRegister: {
        objections: [
          {
            id: "obj-1",
            type: "logic_error",
            severity: "fatal",
            status: "accepted",
            summary: "Logic is flawed",
          },
        ],
      },
    };

    const result = renderResearchBriefTemplate(input);
    expect(result).toContain("[Accepted] (Fatal) logic error: Logic is flawed");
    expect(result).not.toContain("— ");
  });

  it("renders evidence summary section", () => {
    const input: ResearchBriefTemplateInput = {
      evidenceSummary: {
        testsRun: ["Test A", "Test B"],
        results: ["Result 1: Positive", "Result 2: Negative"],
        confidenceTrajectory: ["Started at 50%", "Rose to 75%", "Final: 80%"],
      },
    };

    const result = renderResearchBriefTemplate(input);
    expect(result).toContain("- **Tests run:**");
    expect(result).toContain("  - Test A");
    expect(result).toContain("- **Results:**");
    expect(result).toContain("  - Result 1: Positive");
    expect(result).toContain("- **Confidence trajectory:**");
  });

  it("renders brenner principles section", () => {
    const input: ResearchBriefTemplateInput = {
      brennerPrinciples: ["§1.2 - Scale matters", "§3.4 - Test everything"],
    };

    const result = renderResearchBriefTemplate(input);
    expect(result).toContain("- **Relevant sections:**");
    expect(result).toContain("  - §1.2 - Scale matters");
  });

  it("renders recommended next steps as ordered list", () => {
    const input: ResearchBriefTemplateInput = {
      recommendedNextSteps: ["Run discriminative test", "Consult statistician", "Update hypothesis"],
    };

    const result = renderResearchBriefTemplate(input);
    expect(result).toContain("1. Run discriminative test");
    expect(result).toContain("2. Consult statistician");
    expect(result).toContain("3. Update hypothesis");
  });

  it("renders fallback for empty next steps", () => {
    const input: ResearchBriefTemplateInput = {
      recommendedNextSteps: [],
    };

    const result = renderResearchBriefTemplate(input);
    expect(result).toContain("1. _Identify the most discriminative test to run next._");
  });

  it("handles all objection statuses correctly", () => {
    const statuses = ["open", "acknowledged", "testing", "addressed", "accepted", "dismissed"] as const;
    const statusLabels = ["Open", "Acknowledged", "Testing", "Addressed", "Accepted", "Dismissed"];

    statuses.forEach((status, idx) => {
      const input: ResearchBriefTemplateInput = {
        objectionRegister: {
          objections: [
            {
              id: `obj-${idx}`,
              type: "other",
              severity: "moderate",
              status,
              summary: `Status is ${status}`,
            },
          ],
        },
      };

      const result = renderResearchBriefTemplate(input);
      expect(result).toContain(`[${statusLabels[idx]}]`);
    });
  });

  it("handles null finalConfidence", () => {
    const input: ResearchBriefTemplateInput = {
      metadata: {
        finalConfidence: undefined,
      },
    };

    const result = renderResearchBriefTemplate(input);
    expect(result).toContain("final_confidence: unknown");
  });

  it("rounds finalConfidence to integer", () => {
    const input: ResearchBriefTemplateInput = {
      metadata: {
        finalConfidence: 73.7,
      },
    };

    const result = renderResearchBriefTemplate(input);
    expect(result).toContain("final_confidence: 74%");
  });
});

describe("createResearchBriefTemplate alias", () => {
  it("is the same function as renderResearchBriefTemplate", () => {
    expect(createResearchBriefTemplate).toBe(renderResearchBriefTemplate);
  });
});

describe("formatObjectionSource edge cases", () => {
  it("handles source with only role (no agentName)", () => {
    const input: ResearchBriefTemplateInput = {
      objectionRegister: {
        objections: [
          {
            id: "obj-1",
            type: "other",
            severity: "minor",
            status: "open",
            summary: "Test",
            source: {
              role: "statistician",
              agentName: null,
            },
          },
        ],
      },
    };

    const result = renderResearchBriefTemplate(input);
    expect(result).toContain("statistician");
  });

  it("handles source with empty strings", () => {
    const input: ResearchBriefTemplateInput = {
      objectionRegister: {
        objections: [
          {
            id: "obj-1",
            type: "other",
            severity: "minor",
            status: "open",
            summary: "Test",
            source: {
              role: "   ",
              agentName: "   ",
              messageId: undefined,
            },
          },
        ],
      },
    };

    const result = renderResearchBriefTemplate(input);
    // Should not have source suffix since all fields are empty/whitespace
    expect(result).toMatch(/Test$/m);
  });

  it("handles objection register note with only whitespace", () => {
    const input: ResearchBriefTemplateInput = {
      objectionRegister: {
        objections: [
          {
            id: "obj-1",
            type: "other",
            severity: "minor",
            status: "open",
            summary: "Test",
          },
        ],
        note: "   ",
      },
    };

    const result = renderResearchBriefTemplate(input);
    expect(result).not.toContain("- **Note:**");
  });

  it("handles objection response with only whitespace", () => {
    const input: ResearchBriefTemplateInput = {
      objectionRegister: {
        objections: [
          {
            id: "obj-1",
            type: "other",
            severity: "minor",
            status: "addressed",
            summary: "Test",
            response: "   ",
          },
        ],
      },
    };

    const result = renderResearchBriefTemplate(input);
    expect(result).not.toContain("- Response:");
  });
});

describe("formatList edge cases", () => {
  it("handles undefined list items", () => {
    const input: ResearchBriefTemplateInput = {
      discriminativeStructure: {
        predictionsIfTrue: undefined,
      },
    };

    const result = renderResearchBriefTemplate(input);
    expect(result).toContain("- **Predictions if true:** _Not provided yet._");
  });
});

describe("formatField edge cases", () => {
  it("handles whitespace-only field values", () => {
    const input: ResearchBriefTemplateInput = {
      hypothesisStatement: {
        statement: "   ",
        mechanism: "",
      },
    };

    const result = renderResearchBriefTemplate(input);
    expect(result).toContain("- **Statement:** _Not provided yet._");
    expect(result).toContain("- **Mechanism:** _Not provided yet._");
  });
});
