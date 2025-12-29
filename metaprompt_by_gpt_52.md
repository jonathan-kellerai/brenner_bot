## METAPROMPT (v0.2): Extract + Operationalize “The Brenner Approach” from Transcript Evidence

You are analyzing *Sydney Brenner’s scientific method* from primary-source transcripts.
Your job is NOT to summarize. Your job is to extract **repeatable cognitive moves** and turn them into **actionable research protocols** that a multi-agent team can run.

### Inputs (I will paste these)
- **TRANSCRIPT EXCERPT(S)**: selected sections of Sydney Brenner transcripts (with headings / section numbers if present).
- (Optional) **FOCUS THEME**: e.g., “problem selection”, “decision experiments”, “working out of phase”, “HAL biology”, “inversion”, “digital readouts”.
- (Optional) **TARGET RESEARCH DOMAIN**: e.g., biology, ML, materials, climate, robotics.
- (Optional) **CURRENT RESEARCH QUESTION**: a real question we want to make progress on using the Brenner approach.

### Hard constraints (do not violate)
- **No quote fabrication.** Only quote what appears in the excerpt I provide.
- **Evidence-first.** Every major claim must cite ≥1 quote (or explicitly mark as inference).
- **Avoid generic advice.** Everything must be tied to Brenner-specific moves and transcript evidence.
- **Prefer discriminative leverage.** Optimize for actions that collapse hypothesis space quickly.

---

## Your mission
Produce a “Brenner Approach” playbook that is:
1) grounded in transcript evidence,
2) internally coherent (moves reinforce each other),
3) operational (can be executed as a workflow),
4) robust against the “third alternative” (both models wrong).

---

## Output format (follow exactly)

### 0) Executive summary (10 lines max)
- 3–5 bullet “headline” principles (high novelty, high leverage).
- 1 paragraph: what makes this *distinctly Brenner*, not generic “good science”.

### 1) Quote bank (high-signal, minimum 12 quotes)
Create a table:

| ID | Quote (verbatim) | Section/Heading | Why it matters (1 sentence) | Tags |
|---|---|---|---|---|

Tags are drawn from: `problem-choice`, `representation-change`, `inversion`, `HAL`, `digital-handle`, `exclusion`, `paradox`, `assumption-ledger`, `ruthless-kill`, `out-of-phase`, `organism-selection`, `cheap-loop`, `topology/algebra`, `bayesian-ish`.

### 2) Brenner Moves (8–12 items, each evidence-backed)
For each move, produce this exact structure:

#### Move N — <NAME> (one line definition)
- **What it does**: (2–3 sentences)
- **What it optimizes for**: (e.g., time-to-discrimination, likelihood ratio, loop time)
- **When it fails / anti-pattern**: (1–2 failure modes)
- **Transcript anchors**: (list 2–4 Quote IDs)
- **Modern translation**: (how this looks in 2025 research practice)
- **Micro-drills**: (2 exercises to train this move)

Moves must be specific (e.g., “Hunt paradoxes as beacons”, “Turn the problem into a decision procedure”, “Pick the experimental object”, “Prefer digital handles”, “Inversion as a generator”, “Occam’s broom as a warning sign”, “Work out of phase”, “Ruthless theory-killing”, etc.).

### 3) The “Brenner Loop” (a runnable protocol)
Define an explicit loop a research group can run in 30–90 minutes:

- **Step A — Problem selection**
- **Step B — Hypothesis slate (explicit enumeration)**
- **Step C — Third-alternative guard**
- **Step D — Discriminative tests / decision experiments**
- **Step E — Assumption ledger**
- **Step F — Next actions + stopping rule**

For each step, include:
- **Inputs**
- **Outputs (artifacts)**
- **Quality bar (what “good” looks like)**
- **Common failure mode**

### 4) Prompt templates (ready to copy/paste)
Create 6 prompt templates (each ≤ 250 lines) that implement the loop steps above.
Each template must include:
- **Role**
- **Goal**
- **Inputs**
- **Output schema**
- **Self-check rubric**

Templates to include:
1. Problem selection + “work out of phase” scan
2. Hypothesis slate + explicit priors (lightweight)
3. “Third alternative” adversarial critique
4. Decision experiments ranked by expected discrimination
5. Assumption ledger + break-tests
6. Synthesis memo (what we now believe, why, and what would change it)

### 5) Demonstration on a concrete question (if provided)
If I provide a CURRENT RESEARCH QUESTION:
- Run the Brenner Loop once.
- Produce the artifacts.
- Explicitly show where a “Brenner move” was used.

If I do NOT provide a question:
- Propose 3 candidate questions (in the chosen domain or general science) that are well-suited to the Brenner approach and explain why.

### 6) Calibration & falsification
- **What would convince you this playbook is wrong or incomplete?**
- **Which “Brenner moves” are most at risk of being mythology vs grounded method?**
- **What evidence would you want next from the transcripts?** (specific kinds of sections/episodes to locate)

---

## Style requirements
- Be crisp, funny when appropriate, and precise.
- Prefer “this implies…” over “it seems…”.
- When you infer beyond quotes, label it explicitly: **(Inference)**.
- Keep the tone like a top lab’s internal methods memo, not self-help.

### Begin when the transcript excerpt is provided.