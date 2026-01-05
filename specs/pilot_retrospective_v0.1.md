# Brenner Protocol: Pilot Retrospective v0.1

> **Status**: Working memo (5so.10.3)
> **Purpose**: Capture what worked/failed in real pilot sessions and propose concrete protocol/kernel improvements
> **Inputs reviewed**:
> - `ANALYSIS_OF_USING_BRENNERBOT_FOR_BIO_INSPIRED_NANOCHAT.md` (Round 0)
> - `ANALYSIS_OF_USING_BRENNERBOT_FOR_BIO_INSPIRED_NANOCHAT_ROUND_2.md` (Round 2; full pipeline)
> - `artifacts/RS-20251230-role-prompting.md` (role prompting experiment)
> - `artifacts/RS-20260101-cell-fate/artifact.md` (evidence-pack pilot artifact)

---

## 1) What Worked (keep / amplify)

### A) Role-separated prompting + operator framing
- Role separation (Hypothesis Generator / Test Designer / Adversarial Critic) reliably produced *complementary* deltas (hypotheses, tests, critiques) instead of homogenized “consensus chat”.
- The “triangulated kernel” framing (axioms + objective + operator algebra) is a good invariant backbone; it makes the session feel like a *method* rather than a vibe.

### B) Structured deltas as the “mechanics layer”
- When agents actually used fenced ```delta JSON blocks, the system produced deterministic compilation and linting.
- Round 2 shows the intended happy path: multi-agent discourse → deltas → compile → lint (0 errors) → UI review.

### C) Evidence anchors + explicit inference labeling
- Evidence refs (`EV-…`) and transcript anchors (`§n`) materially reduce confabulation risk.
- Explicit `[inference]` labeling creates a legible boundary between grounded claims and reasoning.

---

## 2) What Failed / Friction (fix next)

### A) “Inline deltas” are a high-frequency, high-impact failure mode
Observed in pilots (Round 2 explicitly calls this out as “format evolution”):
- Agents sometimes post inline JSON that *looks* like a delta but is not wrapped in a fenced `delta` code block.
- The delta parser then extracts **0 blocks**, and compilation silently drops the intended update (or produces an incomplete artifact).

This is not a “doc polish” issue — it is a *protocol robustness* issue because it breaks the mechanistic handshake between agents and compiler.

---

## 3) Proposed Protocol/Kernel Changes (concrete)

### Change 1: Fail-fast on DELTA messages with 0 parsed delta blocks
**Why**: silent drops destroy operator trust; the system must be noisy when the handshake fails.

**Implementation**: see bead `brenner_bot-a3z4`.

### Change 2: Make delta-format failure modes impossible to miss in specs
**Why**: “delta blocks” are the protocol’s machine language; the spec must be brutally explicit about common mistakes and remediation.

**Implementation**: see bead `brenner_bot-1fvd`.

### Change 3: Add a CLI “diagnose deltas” command
**Why**: operators need a fast, deterministic preflight that says “these messages will/won’t compile and why.”

**Implementation**: see bead `brenner_bot-evjo`.

---

## 4) Discovered Work (Beads)

Created from this retrospective (all `discovered-from:brenner_bot-5so.10.3`):
- `brenner_bot-a3z4` — Bug: compile should surface missing delta code fences (inline deltas)
- `brenner_bot-1fvd` — Spec: delta formatting failure modes + remediation template
- `brenner_bot-evjo` — Feature: CLI session diagnose delta parsing failures

