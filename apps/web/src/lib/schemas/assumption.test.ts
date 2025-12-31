import { describe, it, expect } from "vitest";
import {
  AssumptionSchema,
  AssumptionTypeSchema,
  AssumptionStatusSchema,
  AssumptionLoadSchema,
  ScaleCalculationSchema,
  warnMissingCalculation,
  evaluateScaleRigor,
  validateScaleAssumptionPresence,
  getAffectedByFalsification,
  generateAssumptionId,
  isValidAssumptionId,
  isValidAnchor,
  createAssumption,
  createScaleAssumption,
  type Assumption,
  type ScaleCalculation,
} from "./assumption";

describe("AssumptionSchema", () => {
  const validAssumption = {
    id: "A-RS20251230-001",
    statement: "Diffusion is the dominant transport mechanism at this scale.",
    type: "scale_physics" as const,
    status: "unchecked" as const,
    load: {
      affectedHypotheses: ["H-RS20251230-001"],
      affectedTests: ["T-RS20251230-001"],
      description: "All gradient-based hypotheses depend on this.",
    },
    testMethod: "Measure diffusion coefficients and compare with convection rates.",
    calculation: {
      quantities: "D ≈ 10 μm²/s, L ≈ 100 μm",
      result: "τ ≈ L²/D ≈ 1000s ≈ 17 min",
      units: "seconds, micrometers",
      implication: "Gradient-based signaling is physically plausible",
      whatItRulesOut: "Rules out H3 if τ > cell cycle",
    },
    anchors: ["§58", "§147"],
    sessionId: "RS20251230",
    recordedBy: "GreenCastle",
    createdAt: "2025-12-30T19:00:00Z",
    updatedAt: "2025-12-30T19:00:00Z",
    notes: "From Brenner transcript discussion of scale constraints.",
  };

  it("parses a valid assumption", () => {
    const result = AssumptionSchema.safeParse(validAssumption);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.id).toBe("A-RS20251230-001");
      expect(result.data.type).toBe("scale_physics");
      expect(result.data.status).toBe("unchecked");
    }
  });

  it("rejects invalid assumption ID format", () => {
    const invalid = { ...validAssumption, id: "invalid-id" };
    const result = AssumptionSchema.safeParse(invalid);
    expect(result.success).toBe(false);
  });

  it("rejects assumption ID without proper sequence", () => {
    const invalid = { ...validAssumption, id: "A-RS20251230-1" }; // needs 3 digits
    const result = AssumptionSchema.safeParse(invalid);
    expect(result.success).toBe(false);
  });

  it("accepts alternative valid ID formats", () => {
    const variations = [
      "A-CELL-FATE-001-001",
      "A-test-session-999",
      "A-ABC123-001",
    ];
    for (const id of variations) {
      const data = { ...validAssumption, id };
      const result = AssumptionSchema.safeParse(data);
      expect(result.success, `Expected ${id} to be valid`).toBe(true);
    }
  });

  it("rejects statement that is too short", () => {
    const invalid = { ...validAssumption, statement: "Short" };
    const result = AssumptionSchema.safeParse(invalid);
    expect(result.success).toBe(false);
  });

  it("validates anchor format", () => {
    const validAnchors = ["§1", "§123", "§45-50", "§1-999"];
    const invalidAnchors = ["#1", "S1", "§", "§-1", "1"];

    for (const anchor of validAnchors) {
      const data = { ...validAssumption, anchors: [anchor] };
      const result = AssumptionSchema.safeParse(data);
      expect(result.success, `Expected ${anchor} to be valid`).toBe(true);
    }

    for (const anchor of invalidAnchors) {
      const data = { ...validAssumption, anchors: [anchor] };
      const result = AssumptionSchema.safeParse(data);
      expect(result.success, `Expected ${anchor} to be invalid`).toBe(false);
    }
  });

  it("accepts assumption without optional fields", () => {
    const minimal = {
      id: "A-RS20251230-001",
      statement: "This is a minimal assumption statement.",
      type: "background" as const,
      status: "unchecked" as const,
      load: {
        affectedHypotheses: [],
        affectedTests: [],
        description: "No dependencies yet.",
      },
      sessionId: "RS20251230",
      createdAt: "2025-12-30T19:00:00Z",
      updatedAt: "2025-12-30T19:00:00Z",
    };
    const result = AssumptionSchema.safeParse(minimal);
    expect(result.success).toBe(true);
  });

  it("requires load field", () => {
    const withoutLoad = { ...validAssumption };
    delete (withoutLoad as Record<string, unknown>).load;
    const result = AssumptionSchema.safeParse(withoutLoad);
    expect(result.success).toBe(false);
  });

  it("validates load.affectedHypotheses format", () => {
    const invalidLoad = {
      ...validAssumption,
      load: {
        ...validAssumption.load,
        affectedHypotheses: ["invalid-id"],
      },
    };
    const result = AssumptionSchema.safeParse(invalidLoad);
    expect(result.success).toBe(false);
  });

  it("validates load.affectedTests format", () => {
    const invalidLoad = {
      ...validAssumption,
      load: {
        ...validAssumption.load,
        affectedTests: ["invalid-id"],
      },
    };
    const result = AssumptionSchema.safeParse(invalidLoad);
    expect(result.success).toBe(false);
  });
});

describe("Enum schemas", () => {
  it("validates assumption types", () => {
    expect(AssumptionTypeSchema.safeParse("background").success).toBe(true);
    expect(AssumptionTypeSchema.safeParse("methodological").success).toBe(true);
    expect(AssumptionTypeSchema.safeParse("boundary").success).toBe(true);
    expect(AssumptionTypeSchema.safeParse("scale_physics").success).toBe(true);
    expect(AssumptionTypeSchema.safeParse("unknown").success).toBe(false);
  });

  it("validates status types", () => {
    expect(AssumptionStatusSchema.safeParse("unchecked").success).toBe(true);
    expect(AssumptionStatusSchema.safeParse("challenged").success).toBe(true);
    expect(AssumptionStatusSchema.safeParse("verified").success).toBe(true);
    expect(AssumptionStatusSchema.safeParse("falsified").success).toBe(true);
    expect(AssumptionStatusSchema.safeParse("invalid").success).toBe(false);
  });
});

describe("AssumptionLoadSchema", () => {
  it("validates a complete load object", () => {
    const load = {
      affectedHypotheses: ["H-RS20251230-001", "H-RS20251230-002"],
      affectedTests: ["T-RS20251230-001"],
      description: "Gradient hypotheses depend on this.",
    };
    const result = AssumptionLoadSchema.safeParse(load);
    expect(result.success).toBe(true);
  });

  it("accepts empty arrays for hypotheses and tests", () => {
    const load = {
      affectedHypotheses: [],
      affectedTests: [],
      description: "No dependencies yet.",
    };
    const result = AssumptionLoadSchema.safeParse(load);
    expect(result.success).toBe(true);
  });

  it("rejects empty description", () => {
    const load = {
      affectedHypotheses: [],
      affectedTests: [],
      description: "",
    };
    const result = AssumptionLoadSchema.safeParse(load);
    expect(result.success).toBe(false);
  });
});

describe("ScaleCalculationSchema", () => {
  it("validates a complete calculation", () => {
    const calculation = {
      quantities: "D ≈ 10 μm²/s, L ≈ 100 μm",
      result: "τ ≈ L²/D ≈ 1000s",
      units: "seconds, micrometers",
      implication: "Gradient-based signaling is plausible",
      whatItRulesOut: "Rules out fast transport",
    };
    const result = ScaleCalculationSchema.safeParse(calculation);
    expect(result.success).toBe(true);
  });

  it("accepts calculation without whatItRulesOut", () => {
    const calculation = {
      quantities: "D ≈ 10 μm²/s",
      result: "τ ≈ 1000s",
      units: "seconds",
      implication: "Gradient-based signaling is plausible",
    };
    const result = ScaleCalculationSchema.safeParse(calculation);
    expect(result.success).toBe(true);
  });

  it("rejects calculation without required fields", () => {
    const missingQuantities = {
      result: "τ ≈ 1000s",
      units: "seconds",
      implication: "Gradient-based signaling is plausible",
    };
    expect(ScaleCalculationSchema.safeParse(missingQuantities).success).toBe(false);

    const missingResult = {
      quantities: "D ≈ 10 μm²/s",
      units: "seconds",
      implication: "Gradient-based signaling is plausible",
    };
    expect(ScaleCalculationSchema.safeParse(missingResult).success).toBe(false);
  });
});

describe("warnMissingCalculation", () => {
  const baseAssumption = (overrides: Partial<Assumption>): Assumption => ({
    id: "A-TEST-001",
    statement: "Test statement for assumption.",
    type: "scale_physics",
    status: "unchecked",
    load: {
      affectedHypotheses: [],
      affectedTests: [],
      description: "No dependencies.",
    },
    sessionId: "TEST",
    createdAt: "2025-12-30T19:00:00Z",
    updatedAt: "2025-12-30T19:00:00Z",
    ...overrides,
  });

  it("returns warning for scale_physics without calculation", () => {
    const assumption = baseAssumption({ type: "scale_physics", calculation: undefined });
    const warning = warnMissingCalculation(assumption);
    expect(warning).not.toBeNull();
    expect(warning).toContain("should include a calculation");
  });

  it("returns null for scale_physics with calculation", () => {
    const assumption = baseAssumption({
      type: "scale_physics",
      calculation: {
        quantities: "D ≈ 10 μm²/s",
        result: "τ ≈ 1000s",
        units: "seconds",
        implication: "Gradient signaling plausible",
      },
    });
    const warning = warnMissingCalculation(assumption);
    expect(warning).toBeNull();
  });

  it("returns null for non-scale_physics without calculation", () => {
    const assumption = baseAssumption({ type: "background", calculation: undefined });
    const warning = warnMissingCalculation(assumption);
    expect(warning).toBeNull();
  });
});

describe("evaluateScaleRigor", () => {
  it("returns 0 for no calculation", () => {
    expect(evaluateScaleRigor(undefined)).toBe(0);
  });

  it("returns 1 for incomplete calculation", () => {
    const incomplete: ScaleCalculation = {
      quantities: "D ≈ 10 μm²/s",
      result: "",
      units: "",
      implication: "",
    };
    expect(evaluateScaleRigor(incomplete)).toBe(1);
  });

  it("returns 2 for calculation missing implication", () => {
    const missingImplication: ScaleCalculation = {
      quantities: "D ≈ 10 μm²/s",
      result: "τ ≈ 1000s",
      units: "seconds",
      implication: "",
    };
    expect(evaluateScaleRigor(missingImplication)).toBe(2);
  });

  it("returns 3 for complete calculation", () => {
    const complete: ScaleCalculation = {
      quantities: "D ≈ 10 μm²/s",
      result: "τ ≈ 1000s",
      units: "seconds",
      implication: "Gradient signaling is plausible",
    };
    expect(evaluateScaleRigor(complete)).toBe(3);
  });
});

describe("validateScaleAssumptionPresence", () => {
  const baseAssumption = (overrides: Partial<Assumption>): Assumption => ({
    id: "A-TEST-001",
    statement: "Test statement for assumption.",
    type: "background",
    status: "unchecked",
    load: {
      affectedHypotheses: [],
      affectedTests: [],
      description: "No dependencies.",
    },
    sessionId: "TEST",
    createdAt: "2025-12-30T19:00:00Z",
    updatedAt: "2025-12-30T19:00:00Z",
    ...overrides,
  });

  it("returns present=false when no scale_physics assumption", () => {
    const assumptions = [
      baseAssumption({ id: "A-TEST-001", type: "background" }),
      baseAssumption({ id: "A-TEST-002", type: "methodological" }),
    ];
    const result = validateScaleAssumptionPresence(assumptions);
    expect(result.present).toBe(false);
    expect(result.count).toBe(0);
    expect(result.message).toContain("MUST have at least one");
  });

  it("returns present=true with rigor levels for scale_physics assumptions", () => {
    const assumptions = [
      baseAssumption({
        id: "A-TEST-001",
        type: "scale_physics",
        calculation: {
          quantities: "D ≈ 10 μm²/s",
          result: "τ ≈ 1000s",
          units: "seconds",
          implication: "Gradient signaling plausible",
        },
      }),
    ];
    const result = validateScaleAssumptionPresence(assumptions);
    expect(result.present).toBe(true);
    expect(result.count).toBe(1);
    expect(result.rigorLevels).toContain(3);
  });

  it("handles multiple scale_physics assumptions", () => {
    const assumptions = [
      baseAssumption({
        id: "A-TEST-001",
        type: "scale_physics",
        calculation: undefined,
      }),
      baseAssumption({
        id: "A-TEST-002",
        type: "scale_physics",
        calculation: {
          quantities: "D ≈ 10 μm²/s",
          result: "τ ≈ 1000s",
          units: "seconds",
          implication: "Gradient signaling plausible",
        },
      }),
    ];
    const result = validateScaleAssumptionPresence(assumptions);
    expect(result.present).toBe(true);
    expect(result.count).toBe(2);
    expect(result.rigorLevels).toContain(0);
    expect(result.rigorLevels).toContain(3);
  });
});

describe("getAffectedByFalsification", () => {
  it("returns linked hypotheses and tests", () => {
    const assumption: Assumption = {
      id: "A-TEST-001",
      statement: "Test assumption.",
      type: "background",
      status: "unchecked",
      load: {
        affectedHypotheses: ["H-TEST-001", "H-TEST-002"],
        affectedTests: ["T-TEST-001"],
        description: "Dependencies.",
      },
      sessionId: "TEST",
      createdAt: "2025-12-30T19:00:00Z",
      updatedAt: "2025-12-30T19:00:00Z",
    };

    const affected = getAffectedByFalsification(assumption);
    expect(affected.hypotheses).toEqual(["H-TEST-001", "H-TEST-002"]);
    expect(affected.tests).toEqual(["T-TEST-001"]);
  });
});

describe("generateAssumptionId", () => {
  it("generates first ID for empty session", () => {
    const id = generateAssumptionId("RS20251230", []);
    expect(id).toBe("A-RS20251230-001");
  });

  it("generates sequential IDs", () => {
    const existing = ["A-RS20251230-001", "A-RS20251230-002"];
    const id = generateAssumptionId("RS20251230", existing);
    expect(id).toBe("A-RS20251230-003");
  });

  it("handles gaps in sequence", () => {
    const existing = ["A-RS20251230-001", "A-RS20251230-005"];
    const id = generateAssumptionId("RS20251230", existing);
    expect(id).toBe("A-RS20251230-006");
  });

  it("ignores IDs from other sessions", () => {
    const existing = ["A-OTHER-001", "A-OTHER-002"];
    const id = generateAssumptionId("RS20251230", existing);
    expect(id).toBe("A-RS20251230-001");
  });

  it("pads sequence to 3 digits", () => {
    const id = generateAssumptionId("TEST", []);
    expect(id).toMatch(/-\d{3}$/);
  });

  it("throws error on sequence overflow (>999)", () => {
    const existing = ["A-TEST-999"];
    expect(() => generateAssumptionId("TEST", existing)).toThrow(
      /sequence overflow/i
    );
  });

  it("handles sequence 999 as valid (boundary case)", () => {
    const existing = ["A-TEST-998"];
    const id = generateAssumptionId("TEST", existing);
    expect(id).toBe("A-TEST-999");
  });
});

describe("isValidAssumptionId", () => {
  it("validates correct IDs", () => {
    expect(isValidAssumptionId("A-RS20251230-001")).toBe(true);
    expect(isValidAssumptionId("A-test-999")).toBe(true);
    expect(isValidAssumptionId("A-ABC-123-456")).toBe(true);
  });

  it("rejects invalid IDs", () => {
    expect(isValidAssumptionId("invalid")).toBe(false);
    expect(isValidAssumptionId("A-test")).toBe(false);
    expect(isValidAssumptionId("A-test-1")).toBe(false);
    expect(isValidAssumptionId("H-test-001")).toBe(false);
  });
});

describe("isValidAnchor", () => {
  it("validates correct anchors", () => {
    expect(isValidAnchor("§1")).toBe(true);
    expect(isValidAnchor("§123")).toBe(true);
    expect(isValidAnchor("§1-5")).toBe(true);
    expect(isValidAnchor("§100-200")).toBe(true);
  });

  it("rejects invalid anchors", () => {
    expect(isValidAnchor("1")).toBe(false);
    expect(isValidAnchor("#1")).toBe(false);
    expect(isValidAnchor("§")).toBe(false);
    expect(isValidAnchor("section 1")).toBe(false);
  });
});

describe("createAssumption", () => {
  it("creates a valid assumption with defaults", () => {
    const assumption = createAssumption({
      id: "A-TEST-001",
      statement: "This is a test assumption for validation.",
      type: "background",
      sessionId: "TEST",
      load: {
        affectedHypotheses: [],
        affectedTests: [],
        description: "No dependencies.",
      },
    });

    expect(assumption.id).toBe("A-TEST-001");
    expect(assumption.type).toBe("background");
    expect(assumption.status).toBe("unchecked");
    expect(assumption.createdAt).toBeDefined();
    expect(assumption.updatedAt).toBeDefined();
  });

  it("accepts optional fields", () => {
    const assumption = createAssumption({
      id: "A-TEST-001",
      statement: "This is a test assumption for validation.",
      type: "scale_physics",
      sessionId: "TEST",
      load: {
        affectedHypotheses: ["H-TEST-001"],
        affectedTests: [],
        description: "Hypothesis H-TEST-001 depends on this.",
      },
      calculation: {
        quantities: "D ≈ 10 μm²/s",
        result: "τ ≈ 1000s",
        units: "seconds",
        implication: "Gradient signaling plausible",
      },
      testMethod: "Measure diffusion coefficients.",
      recordedBy: "GreenCastle",
    });

    expect(assumption.calculation).toBeDefined();
    expect(assumption.testMethod).toBe("Measure diffusion coefficients.");
    expect(assumption.recordedBy).toBe("GreenCastle");
  });
});

describe("createScaleAssumption", () => {
  it("creates a scale_physics assumption with correct type", () => {
    const assumption = createScaleAssumption({
      id: "A-TEST-001",
      statement: "Diffusion is dominant at this scale.",
      sessionId: "TEST",
      load: {
        affectedHypotheses: [],
        affectedTests: [],
        description: "No dependencies yet.",
      },
      calculation: {
        quantities: "D ≈ 10 μm²/s, L ≈ 100 μm",
        result: "τ ≈ 1000s",
        units: "seconds, micrometers",
        implication: "Gradient-based signaling is plausible",
      },
    });

    expect(assumption.type).toBe("scale_physics");
    expect(assumption.status).toBe("unchecked");
    expect(assumption.calculation).toBeDefined();
  });
});
