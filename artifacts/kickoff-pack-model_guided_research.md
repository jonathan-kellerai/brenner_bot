# Kickoff Pack: Model-Guided Research (Round 0)

Bead: `brenner_bot-5so.10.1.2`
Target repo: `/data/projects/model_guided_research`

## Research Question (Discriminative)

In Model-Guided Research, are the **11 exotic mathematical attention mechanisms** (tropical, quaternion, p-adic, simplicial, etc.) genuinely **mathematically distinct** from standard softmax attention, or do they **converge to equivalent behavior** under training? If distinct, what minimal experiments separate them?

### Working hypotheses (include third alternative)

- **H1 (Convergence):** Under gradient descent, all 11 mechanisms learn similar attention patterns—the exotic math is "washed out" by training. Any apparent differences are due to regularization effects or initialization variance.
- **H2 (Structural Divergence):** Different mathematical structures impose genuinely different inductive biases that persist after training. The exotic geometries (tropical semiring, quaternion algebra, p-adic ultrametrics) create attention patterns that standard softmax cannot replicate.
- **H3 (Implementation Artifact):** Observed differences are artifacts of implementation choices (initialization schemes, numerical precision, hyperparameter sensitivity)—not fundamental mathematical structure. Results won't replicate under controlled conditions.

## Ranked Discriminative Tests (Cheap → Expensive)

1. **Attention pattern similarity test:** Train 11+1 (exotic + vanilla) models on identical data with fixed seeds; extract attention matrices on held-out prompts; compute cosine similarity / JS divergence between mechanisms. If all converge to similar patterns → H1. If clusters emerge by mathematical family → H2.

2. **Learned-parameter invariant test:** For mechanisms with extra learnable structure (e.g., quaternion basis rotation, p-adic prime selection), freeze these post-training and compare to vanilla. If performance drops significantly → structure matters (H2). If equivalent → structure is cosmetic (H1).

3. **Synthetic discriminator task:** Design a toy task where one mathematical structure has a provable advantage (e.g., hierarchical data for ultrametric attention, cyclic patterns for quaternion). Measure gap between exotic mechanism and vanilla baseline.

4. **Gradient flow analysis:** Instrument gradient norms and directions through exotic vs vanilla attention during training. If gradients differ systematically → structural effect (H2). If gradients converge → convergent learning (H1).

5. **Cross-mechanism transfer test:** Train with mechanism A, evaluate with mechanism B (keeping other weights fixed). High transfer → mechanisms are equivalent (H1). Low transfer → mechanisms encode different structure (H2).

6. **Hyperparameter sensitivity audit:** Sweep learning rate, initialization scale, and precision (float16/32/64) for each mechanism. If results vary wildly by hyperparameters → H3. If robust → real effect.

## Excerpt (Brenner Anchors)

### Excerpt: Tags: third-alternative, conversation, exclusion, out-of-phase, productive-ignorance

> **§79**: "as 1958... the whole of DNA was still thought to be a flash in the pan, not right, you know, not known, not proven."
> — *"Fringe" period: ideas not yet socially validated*

> **§90**: "none of these proflavine mutants could be induced to revert by base analogues and none of the base analogue mutants could be induced to revert by proflavine."
> — *Spectrum separation: mutually exclusive classes reveal structure*

> **§103**: "And he said... 'Well,' he said, 'either model A is right or model B is right.' And I said, 'You've forgotten there's a third alternative'. He said, 'What's that?' I said, 'Both could be wrong', you see."
> — *Third-alternative guard: implementation artifacts vs theoretical claims*

> **§105**: "I think that is so necessary to continue, you know, almost hysterical conversation, just constitutive talking, because I think that brings things together that you don't actually see by... logical deduction."
> — *Non-deductive inference: patterns emerge from exploration*

> **§210**: "Routine work itself generates its important problems which you don't see."
> — *Systematic testing reveals hidden structure*

> **§215**: "You are doing surgery at the genetic level."
> — *Precise intervention: isolate mechanism from context*

> **§230**: "It is good to be ignorant about a new field and know a lot about the old ones, as you transit from the old to the new."
> — *Fresh eyes on exotic math: test without prejudice*

**Sections included**: §79, §90, §103, §105, §210, §215, §230

## Project Notes (Pointers)

- **Attention mechanisms**: `/data/projects/model_guided_research/nanochat/` contains PyTorch implementations of all 11 exotic attention types.
- **JAX demos**: Root directory `*.py` files provide standalone explorations of each mathematical framework.
- **CLI interface**: `mgr` command for running demos; `python -m nanochat.train` for training with different attention types.
- **Key comparison dimensions**:
  - Tropical attention: uses (max, +) semiring instead of (×, +)
  - Quaternion attention: 4D rotation algebra for attention weights
  - P-adic/ultrametric: hierarchical distance structure
  - Simplicial: higher-order interactions beyond pairwise attention
- **The README claims** these exotic structures provide different "inductive biases"—this kickoff tests whether those biases are measurably distinct from standard attention.
