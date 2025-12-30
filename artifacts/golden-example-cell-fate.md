---
session_id: "GOLDEN-EXAMPLE-CELL-FATE"
created_at: "2025-12-30T05:30:00Z"
updated_at: "2025-12-30T05:30:00Z"
version: 1
contributors:
  - agent: "PinkSnow"
    program: "claude-code"
    model: "opus-4.5"
  - agent: "BlueLake"
    program: "codex-cli"
    model: "gpt-5.2"
  - agent: "GreenMountain"
    program: "gemini-cli"
    model: "gemini-3"
status: "active"
---

# Brenner Protocol Artifact: GOLDEN-EXAMPLE-CELL-FATE

> **Purpose**: This is a golden example artifact demonstrating the full Brenner Protocol schema with real transcript citations, potency checks, scale constraints, and the mandatory third alternative.

## 1. Research Thread

**RT**: How does the C. elegans embryo determine cell fate — through lineage-based computation (tracking ancestry) or gradient-based spatial computation (reading positional signals)?

**Context**: C. elegans has an invariant cell lineage where every wild-type embryo follows identical division patterns. Yet some cell fates appear position-dependent. Brenner framed this as the "European plan vs American plan" — ancestry-based identity versus neighbour-based identity (§161).

**Why it matters**: The coordinate system choice determines which perturbations are informative, which experimental objects are tractable, and what computational model describes development. Getting this wrong means designing experiments that cannot discriminate between mechanisms.

**Anchors**: §150, §155, §161, §162

## 2. Hypothesis Slate

### H1: Lineage-based computation (European plan)
**Claim**: Cell fate is primarily determined by tracking lineage history — cells are what they are because of their ancestry.
**Mechanism**: Each cell maintains internal state that updates asymmetrically at division. Fate determinants are partitioned during mitosis, creating a digital computation where "you are what you are because this is the way you got there" (§161).
**Anchors**: §150 ("completely isogenic, because each animal would have a uniform genetic constitution"), §161 ("the most important thing is who were your ancestors")

### H2: Gradient-based computation (American plan)
**Claim**: Cell fate is primarily determined by reading positional morphogen gradients — cells compute identity from spatial context.
**Mechanism**: Cells integrate concentration fields from signalling molecules to determine position and fate. "If you wish to know what you are, you investigated who your neighbours were" (§161). Lewis Wolpert's gradient theory: "cells took up their characteristics from their positions in a gradient field" (§155).
**Anchors**: §155 ("cells took up their characteristics from their positions in a gradient field"), §161 ("the American plan, which is you don't give a damn who your ancestors are, what's most important is who are your neighbours")

### H3: Third Alternative
**Claim**: Both hypotheses are wrong, or the dichotomy is false — fate determination uses a mechanism that doesn't fit either category.
**How this could be true**: The lineage/gradient framing may be an artifact of available assays. Actual mechanism could involve: (a) epigenetic memory independent of division counting, (b) mechanical forces and tissue geometry, (c) stochastic commitment followed by sorting, or (d) context-switching between modes at different developmental stages. As Brenner warned: "You've forgotten there's a third alternative... Both could be wrong" (§103).
**Anchors**: §103 ("Both could be wrong")

### H4: Hybrid computation with context-switching
**Claim**: Cells use lineage for some decisions and gradients for others, switching mode based on developmental stage.
**Mechanism**: Early divisions follow lineage-based rules (before morphogen fields establish); later decisions integrate spatial information. The invariant lineage provides the scaffold; gradients provide refinement.
**Anchors**: [inference] — not directly supported by transcript, but consistent with C. elegans data showing both invariant lineage and regulative capacity

## 3. Predictions Table

| ID | Observation/Condition | H1 (lineage) | H2 (gradient) | H3 (third alt) | H4 (hybrid) |
|----|----------------------|--------------|---------------|----------------|-------------|
| P1 | Early transplant (4-8 cell stage) | Fate unchanged | Fate changes to match new position | indeterminate | Fate unchanged (early = lineage mode) |
| P2 | Late transplant (gastrulation) | Fate unchanged | Fate changes to match new position | indeterminate | Fate changes (late = gradient mode) |
| P3 | Ablate signalling neighbours | No effect on fate | Fate changes or fails | indeterminate | Stage-dependent |
| P4 | Block cell division (polyploidy) | Fate determination fails | Fate proceeds normally | indeterminate | Mixed outcome |
| P5 | Remove morphogen source | No effect | Fate specification fails | indeterminate | Late fates fail, early fates normal |

## 4. Discriminative Tests

### T1: Stage-dependent transplantation assay in C. elegans (Score: 10/12)
**Procedure**: Transplant identified cells at multiple developmental stages (2-cell, 4-cell, 8-cell, 16-cell, gastrulation) to ectopic positions. Score terminal cell fate using lineage-specific markers.
**Discriminates**: H1 vs H2, and critically tests H4 (stage-dependent switching)
**Expected outcomes**:
- If H1: Fate unchanged at all stages
- If H2: Fate changes at all stages
- If H4: Early transplants show no change; late transplants show position-dependent fate
**Potency check**: Include late-stage transplants where all hypotheses predict fate is already committed (positive control for detecting change when it occurs). Also transplant to positions where source and destination predict same fate (negative control).
**Feasibility**: Requires C. elegans micromanipulation expertise. "The toothpick method of picking up nematodes" (§153) enables handling. Moderate difficulty — established technique.
**Evidence-per-week score**:
- Likelihood ratio: 3 (>100:1 — binary cell type outcomes)
- Cost: 2 ($5K for equipment, strain maintenance)
- Speed: 2 (1-2 weeks per experimental series)
- Ambiguity: 3 (digital readout — cell expresses marker or doesn't)

### T2: Division block + fate scoring (Score: 8/12)
**Procedure**: Chemically or genetically block cell division using hydroxyurea or cdk mutants. Score whether fate determination proceeds in arrested cells.
**Discriminates**: H1 vs H2
**Expected outcomes**:
- If H1: Fate determination fails (no lineage history to count)
- If H2: Fate determination proceeds (gradient reading doesn't require division)
**Potency check**: Verify division block by DNA content measurement (cells should be polyploid if block worked). Include known division-independent fate decisions as positive control.
**Feasibility**: Standard reagents and tools. Easy technical execution.
**Evidence-per-week score**:
- Likelihood ratio: 2 (10-100:1 — some confounding toxicity effects)
- Cost: 3 (<$1K)
- Speed: 2 (1 week)
- Ambiguity: 1 (confounds: drug toxicity, off-target effects)

### T3: Morphogen source ablation with gradient reporter (Score: 9/12)
**Procedure**: Laser-ablate cells that produce candidate morphogens (e.g., Wnt sources). Monitor gradient shape with fluorescent reporters and score downstream cell fates.
**Discriminates**: H2 vs H1/H4
**Expected outcomes**:
- If H1: Fates normal (gradient irrelevant)
- If H2: Fates disrupted proportionally to gradient disruption
**Potency check**: Verify gradient disruption via reporter imaging before scoring fates. Must confirm ablation killed source cells (PI staining).
**Feasibility**: Requires laser ablation setup and reporter strains. Established in C. elegans labs.
**Evidence-per-week score**:
- Likelihood ratio: 3 (can observe gradient shape and fate simultaneously)
- Cost: 2 ($5-10K for laser setup if not available)
- Speed: 2 (1-2 weeks)
- Ambiguity: 2 (some confounds from cell death signalling)

### T4: Single-cell transcriptomics across lineage branches (Score: 7/12)
**Procedure**: Perform scRNA-seq on embryos at multiple stages. Cluster cells and ask whether clusters correspond to lineage clades or spatial domains.
**Discriminates**: H1 vs H2 vs H4
**Expected outcomes**:
- If H1: Transcriptome clusters map to lineage tree branches
- If H2: Clusters map to spatial position regardless of lineage
- If H4: Early clusters follow lineage; late clusters follow position
**Potency check**: Include known lineage-specific and position-specific markers as internal controls.
**Feasibility**: Standard scRNA-seq pipeline. Moderate cost.
**Evidence-per-week score**:
- Likelihood ratio: 2 (correlational, not causal)
- Cost: 1 ($50K for comprehensive analysis)
- Speed: 2 (2-4 weeks including bioinformatics)
- Ambiguity: 2 (cluster interpretation requires assumptions)

## 5. Assumption Ledger

### A1: Invariant lineage is reproducible across individuals
**Statement**: Every wild-type C. elegans embryo follows the same cell division pattern and timing.
**Load**: If wrong, transplant results aren't generalizable — what we observe in one embryo may not apply to others.
**Test**: Lineage tracing in N>10 embryos, quantify deviation from canonical lineage.
**Status**: verified (well-established in Sulston et al. 1983; see also §150 "completely isogenic")

### A2: Cell identity is stable post-commitment
**Statement**: Once a cell commits to a fate, it doesn't change under normal conditions.
**Load**: If wrong, transplant assays (T1) become uninterpretable — observed position effects could be transient.
**Test**: Lineage tracing of fate-committed cells through subsequent divisions.
**Status**: unchecked — most data is endpoint, not time-course

### A3: Morphogen gradients are stable on developmental timescales
**Statement**: If gradients exist, they persist long enough for cells to read them.
**Load**: If wrong, H2 becomes implausible for rapid fate decisions.
**Test**: Live imaging of gradient reporters during fate specification windows.
**Status**: unchecked

### A4: Scale check — diffusion time vs cell cycle
**Statement**: Morphogen diffusion must be fast enough relative to cell cycle for gradient-based computation to work.
**Calculation**: D ≈ 10 μm²/s (typical morphogen), embryo width ≈ 50 μm → τ = L²/D ≈ 250s ≈ 4 min. C. elegans early cell cycle ≈ 15-30 min. Gradient can re-establish between divisions.
**Implication**: Gradient-based signalling is physically plausible at this scale. Does not rule out H2. Francis Crick "began to do calculations on this" (§155) and found "the sizes of things were scaled about to what you would expect from a diffusion gradient."
**Anchors**: §155, §156

### A5: Scale check — information capacity of lineage counting
**Statement**: How many bits of information can lineage encode?
**Calculation**: C. elegans has ~10 divisions to reach terminal fate. With 2 daughter types per division, maximum 2^10 = 1024 distinct fates. C. elegans has 959 somatic cells, 302 neurons. Lineage counting is sufficient in principle.
**Implication**: H1 is informationally plausible. Does not rule out H1.

### A6: Transplanted cells survive and integrate
**Statement**: Transplanted cells must survive, integrate into host tissue, and receive normal signals.
**Load**: If cells die or fail to integrate, all transplant experiments (T1, T3) are uninterpretable.
**Test**: Include viability controls (vital dye exclusion), integration controls (cell-cell contacts).
**Status**: unchecked — must verify in each experiment

## 6. Anomaly Register

### X1: The EMS lineage shows mixed behaviour
**Observation**: In C. elegans, most AB lineage fates appear more position-dependent (consistent with H2), while some EMS lineage fates appear more lineage-dependent (consistent with H1). The same embryo may use both strategies.
**Conflicts with**: Pure H1 (some cells aren't lineage-determined) and pure H2 (some cells aren't gradient-determined)
**Quarantine status**: active
**Resolution plan**: May support H4 (hybrid mechanism). Track lineage-vs-position correlation systematically across all cell types before concluding.

### X2: Regulative capacity in a "mosaic" embryo
**Observation**: C. elegans embryos can compensate for some ablations (regulative behaviour) despite being considered "mosaic." Complete ablation of some blastomeres leads to neighbour cells changing fate.
**Conflicts with**: Strong H1 (regulative behaviour suggests cells can "sense" context)
**Quarantine status**: active
**Resolution plan**: Map regulative capacity stage-by-stage. May define the lineage-to-gradient transition point for H4.

### X3: Non-autonomous gene effects
**Observation**: Some mutants affect cell fate non-autonomously (the mutant cell's neighbours change fate, not the mutant cell itself).
**Conflicts with**: Strong H1 (fate should depend only on intrinsic lineage if H1 is true)
**Quarantine status**: active
**Resolution plan**: Classify mutants by autonomous vs non-autonomous effects. Non-autonomous effects support signalling (H2/H4), autonomous effects support lineage (H1).

## 7. Adversarial Critique

### C1: The dichotomy is anachronistic
**Attack**: The lineage-vs-gradient distinction was formulated before single-cell transcriptomics and live imaging. Modern data may reveal that neither "lineage" nor "gradient" captures what cells actually compute. The categories may be artefacts of 1970s-80s experimental limitations.
**Evidence that would confirm this**: Single-cell trajectory analysis shows fate decision boundaries that don't align with either lineage clades or spatial domains; instead, clusters form around novel axes (e.g., metabolic state, chromatin accessibility).
**Current status**: Moderate concern. Should review recent scRNA-seq literature on C. elegans embryogenesis before committing to H1/H2 framing.

### C2: Epigenetic memory as the real third alternative
**Attack**: Cells may use chromatin states inherited through division — neither "counting divisions" (H1) nor "reading gradients" (H2). Epigenetic marks (histone modifications, DNA methylation) could encode positional memory independent of both mechanisms.
**Why it might be right**: Epigenetic inheritance is well-documented; this would explain why transplants sometimes show "partial" fate changes depending on timing. Chromatin state could provide a third axis of information orthogonal to lineage and position.
**Current status**: High priority for investigation. Would require chromatin profiling across lineage and space.

### C3: The experiment designed the hypothesis
**Attack**: The "lineage vs gradient" framing emerged from the experimental systems available (transplantation, ablation). These techniques may not probe what cells actually compute. As Brenner noted, "if you can't compute it you can't understand it" (§160) — but our experiments may not reveal the actual computation.
**Evidence that would confirm this**: A computational model of C. elegans development that uses neither lineage counting nor gradient reading but still reproduces observed fates. Such a model would expose our mechanistic intuitions as epiphenomenal.
**Current status**: Low immediate concern but philosophically important. Should attempt computational modelling.

### C4: "Loose gangs" dynamics matter
**Attack**: Brenner described the lab organisation as "loose gangs" (§157) — informal groups pursuing problems. The same may apply to cells: fate may emerge from transient, context-dependent cell-cell interactions rather than fixed programs (lineage) or smooth fields (gradients).
**Why it might be right**: Cell behaviour often involves stochastic gene expression, lateral inhibition, and dynamic contacts. These don't fit clean lineage or gradient models.
**Current status**: Worth considering. Would require live imaging of fate dynamics.

---

## Validation Checklist

- [x] All 7 required sections present
- [x] Metadata header present with required fields
- [x] At least 3 hypotheses (4 including H4)
- [x] Third alternative explicitly labeled (H3)
- [x] At least 3 predictions in table (5 present)
- [x] At least 2 discriminative tests (4 present)
- [x] Tests ranked by score (T1: 10/12, T3: 9/12, T2: 8/12, T4: 7/12)
- [x] All tests have potency checks
- [x] At least 3 assumptions (6 present)
- [x] At least 1 scale check (2 present: A4, A5)
- [x] Anomaly register present (3 anomalies)
- [x] At least 2 adversarial critiques (4 present)
- [x] All item IDs follow naming convention
- [x] Citations use §n anchor format
- [x] Inferences marked as [inference]

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1 | 2025-12-30 | Initial golden example with full Brenner transcript citations |
