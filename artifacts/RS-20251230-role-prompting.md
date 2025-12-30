---
session_id: "RS-20251230-role-prompting"
created_at: "2025-12-30T22:32:31.747Z"
updated_at: "2025-12-30T22:32:31.747Z"
version: 1
contributors:
  - agent: "BlackCastle"
    contributed_at: "2025-12-30T22:30:24.135064+00:00"
status: "active"
---

# Brenner Protocol Artifact: RS-20251230-role-prompting

## 1. Research Thread

**RT**: Does role-separated prompting (Hypothesis Generator / Test Designer / Adversarial Critic) outperform a unified prompt in producing Brenner-style artifacts?

**Context**: We are investigating whether structuring multi-agent research sessions with explicit cognitive roles produces higher-quality artifacts (fewer linter errors, more discriminative tests, explicit third alternatives) compared to giving all agents the same unified research prompt.

**Why it matters**: If role separation improves artifact quality, this validates the 3-role Brenner Protocol design. If not, we should simplify to unified prompts or investigate alternative structures.

**Anchors**: §105, §103, inference

## 2. Hypothesis Slate

### H1: Role-Separation Improves Quality
**Claim**: Explicitly assigning cognitive roles (generator, tester, critic) produces artifacts with fewer errors and more discriminative content than unified prompts
**Mechanism**: Role separation creates productive ignorance (§230) - each agent focuses on their specialty without being biased by other concerns. This mimics Brenner's observation that 'it is good to be ignorant about a new field' when transiting between modes of thinking.
**Anchors**: §230, §105, inference

### H2: Unified Prompts Are Sufficient
**Claim**: Role separation adds coordination overhead without improving artifact quality; a well-crafted unified prompt achieves the same results
**Mechanism**: Modern LLMs can context-switch between generator/tester/critic modes internally. The explicit role separation may actually REDUCE quality by preventing productive cross-talk between modes.
**Anchors**: inference

### H3: Both Wrong: Structure vs Content Confusion (Third Alternative)
**Claim**: Neither role separation NOR unified prompts matter - artifact quality depends on excerpt selection and research question quality, not prompt structure
**Mechanism**: We're measuring the wrong thing. Per §210, 'routine work generates its important problems' - the quality comes from the INPUT (excerpts, research question) not the PROCESSING (prompt structure). We may be optimizing a second-order variable.
**Anchors**: §103, §210, inference
**Third alternative**: true

## 3. Predictions Table

| ID | Observation/Condition | H1 | H2 | H3 |
| --- | --- | --- | --- | --- |
| P1 |  | — | — | — |
| P2 |  | — | — | — |
| P3 |  | — | — | — |
| P4 |  | — | — | — |

## 4. Discriminative Tests

### T1: Linter Error Count Comparison (Score: 9/12)
**Procedure**: Run 10 sessions with role-separated prompts (3 agents × 1 role each) and 10 with unified prompts (3 agents × same unified prompt). Compare artifact linter output (errors + warnings).
**Discriminates**: H1-roles-help vs H2-roles-neutral
**Expected outcomes**:
- H1-roles-help: Role-separated artifacts have fewer errors (p < 0.05)
- H2-roles-neutral: No significant difference in error counts
**Potency check**: Both conditions produce parseable artifacts (compilation success rate > 90%)
**Feasibility**: Can run with existing linter in apps/web/src/lib/artifact-linter.ts
**Evidence-per-week score**: LR=2, Cost=3, Speed=3, Ambiguity=1

### T2: Turn-Count Control (Spectrum Separation) (Score: 7/12)
**Procedure**: Add a third condition: unified prompt BUT with 3× more agent turns. If improvement comes from role separation specifically (not just 'more processing'), the 3× unified should NOT match role-separated quality.
**Discriminates**: H1-roles-specifically vs H3-more-turns-sufficient
**Expected outcomes**:
- H1-roles-specifically: Role-separated outperforms 3× unified despite equal total tokens
- H3-more-turns-sufficient: 3× unified matches or exceeds role-separated
**Potency check**: Total tokens per condition are tracked and comparable
**Feasibility**: Requires additional experiment arm; medium complexity
**Evidence-per-week score**: LR=2, Cost=2, Speed=2, Ambiguity=1

### T3: Third-Alternative Detection Rate (Score: 10/12)
**Procedure**: Count explicit third alternatives in each artifact's hypothesis_slate. Role separation should increase 'both wrong' framings if it enables Brenner-style thinking (§103).
**Discriminates**: H1-roles-enable-third-alt vs H2-no-effect
**Expected outcomes**:
- H1-roles-enable-third-alt: >50% of role-separated artifacts contain explicit third alternatives
- H2-no-effect: Third alternative rate is similar across conditions
**Potency check**: At least one hypothesis_slate entry exists per artifact (assay sensitivity)
**Feasibility**: Can grep for 'third_alternative: true' or textual markers
**Evidence-per-week score**: LR=2, Cost=3, Speed=3, Ambiguity=2

## 5. Assumption Ledger

### A1: Agents are comparable across conditions
**Statement**: We assume the same models (GPT-5.2, Opus 4.5, Gemini 3) can be compared fairly across role-separated and unified conditions
**Load**: If models have different 'natural' tendencies regardless of prompting, comparison is confounded
**Test**: 
**Status**: needs-test

### A2: Scale check: prompt tokens vs quality correlation
**Statement**: We assume that prompt structure effects are detectable within the token budgets we're using (~10K tokens per agent)
**Load**: Effect may exist but be below detection threshold at our scale
**Test**: 
**Status**: needs-test
**Scale check**: true
**Calculation**: Typical session = 3 agents × ~10K tokens/agent = ~30K input tokens. If effect size requires >100K tokens to manifest, we won't detect it.

### A3: Linter is valid quality proxy
**Statement**: We assume the artifact linter (apps/web/src/lib/artifact-linter.ts) measures 'Brenner-style quality' and not just schema compliance
**Load**: If linter only checks structure, passing artifacts may still be intellectually empty
**Test**: 
**Status**: needs-test

## 6. Anomaly Register

None registered.

## 7. Adversarial Critique

### C1: Confounding: Model Capability Differences
**Attack**: We're comparing role-separated (different models) vs unified (same models). If GPT-5.2 is naturally better at hypothesis generation than Opus, role separation benefits may be entirely due to model selection, not role structure.
**Evidence**: If single-model role-separated (all Opus with different roles) performs similarly to multi-model role-separated, model differences explain nothing
**Current status**: Unresolved - need controlled experiment
**Real third alternative**: true

### C2: Premature Optimization Warning
**Attack**: We're designing experiments to compare prompting strategies before we have a single 'golden artifact' that demonstrates the Brenner Protocol works AT ALL. This is optimizing step 2 before validating step 1.
**Evidence**: If we can't produce a high-quality artifact with ANY prompt structure, the comparison is moot
**Current status**: Acknowledged - this session is partly exploratory
