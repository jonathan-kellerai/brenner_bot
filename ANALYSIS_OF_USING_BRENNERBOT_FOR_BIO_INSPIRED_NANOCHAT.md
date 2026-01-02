# Analysis: Using BrennerBot for Bio-Inspired Nanochat Research

**Date**: 2026-01-02
**Agent**: IvoryMoose (claude-opus-4-5-20251101)
**Target Project**: `/data/projects/bio_inspired_nanochat`
**Thread ID**: `RS-20260102-bio-nanochat-rrp`

---

## Executive Summary

This document reports the results of running the complete BrennerBot system end-to-end with the bio-inspired nanochat starter pack. The test evaluated whether the Brenner Protocol infrastructure can support structured research sessions.

**Overall Status**: ✅ Core functionality works, with minor issues in external tooling.

---

## Test Methodology

1. Ran `brenner.ts doctor` to verify system readiness
2. Registered agent identity via Agent Mail MCP
3. Started a research session with kickoff messages
4. Tested evidence pack creation and management
5. Ran experiment capture
6. Tested corpus search and excerpt building
7. Tested anomaly and critique systems

---

## Components Tested

### ✅ Agent Mail Integration

| Feature | Status | Notes |
|---------|--------|-------|
| `macro_start_session` | ✅ Working | Registered as IvoryMoose |
| `send_message` | ✅ Working | Kickoff messages delivered |
| `summarize_thread` | ✅ Working | Returns participants, key points |
| `health_check` | ✅ Working | Server running on port 8765 |

**Session Created**:
- Thread: `RS-20260102-bio-nanochat-rrp`
- Messages sent: 2 (to BlueLake, PurpleMountain)
- Project ID: 7

### ✅ Session Management

| Command | Status | Notes |
|---------|--------|-------|
| `session start` | ✅ Working | Successfully sends role-specific kickoffs |
| `session status` | ✅ Working | Shows phase, roles, stats |

**Output from `session status`**:
```
🟡 Thread: RS-20260102-bio-nanochat-rrp
Phase: awaiting responses | Round 0

Roles:
  ⏳ hypothesis_generator
  ⏳ test_designer
  ⏳ adversarial_critic

📊 Stats: 0 deltas, 0 critiques, 2 total messages
👥 Participants: IvoryMoose
```

### ✅ Evidence System

| Command | Status | Notes |
|---------|--------|-------|
| `evidence init` | ✅ Working | Created `evidence.json` |
| `evidence add` | ✅ Working | Added EV-001 |
| `evidence list` | ✅ Working | Returns JSON with full details |
| `evidence render` | ✅ Working | Markdown table output |

**Evidence Pack Location**: `/data/projects/bio_inspired_nanochat/artifacts/RS-20260102-bio-nanochat-rrp/evidence.json`

### ✅ Experiment Capture

| Command | Status | Notes |
|---------|--------|-------|
| `experiment run` | ✅ Working | Captures stdout, stderr, exit code, git state |

**Key Features**:
- Captures full git state (SHA, dirty status, porcelain)
- Records timing (start, end, duration_ms)
- Saves to structured JSON with unique result_id

**Example Result**:
```json
{
  "schema_version": "experiment_result_v0.1",
  "result_id": "167d401d-694b-41fa-aa50-777dc9635510",
  "thread_id": "RS-20260102-bio-nanochat-rrp",
  "test_id": "T1",
  "exit_code": 0,
  "duration_ms": 8,
  "git": { "sha": "69a47248...", "dirty": true }
}
```

### ✅ Corpus Search

| Command | Status | Notes |
|---------|--------|-------|
| `corpus search` | ✅ Working | Ranked hits with snippets |

**Query**: `"third alternative"`
**Results**: 3 hits including §103 quote and distillation references

### ✅ Excerpt Builder

| Command | Status | Notes |
|---------|--------|-------|
| `excerpt build` | ✅ Working | Generates themed excerpts |

**Tags tested**: `third-alternative, cheap-loop`
**Output**: 3 quotes (~308 words) with section anchors

### ✅ Anomaly System

| Command | Status | Notes |
|---------|--------|-------|
| `anomaly stats` | ✅ Working | Returns counts by status |

### ⚠️ Critique System

| Command | Status | Notes |
|---------|--------|-------|
| `critique list` | ✅ Working | Empty for new session |
| `critique create` | ⚠️ Confusing Error | Requires `H-001` not `H1` |

**Issue**: The `--target` flag requires format `H-XXX`, `T-XXX`, `A-XXX`, `framing`, or `methodology`. Using `H1` (common convention) returns a validation error. Error message could be clearer.

---

## Issues Found

### ✅ Bug 1: `ntm send` Called Invalid `cass robot` Command (FIXED)

**Severity**: Medium (was blocking cockpit workflow)
**Component**: ntm (Named Tmux Manager) - external tool
**Error**:
```
cass execution failed: exit status 2
error: unrecognized subcommand 'robot'
tip: a similar subcommand exists: 'robot-docs'
```

**Root Cause**: The installed ntm binary (`/home/ubuntu/.bun/bin/ntm`) was outdated. The source code at `/data/projects/ntm` had already been fixed.

**Resolution**: Rebuilt ntm from source:
```bash
cd /data/projects/ntm
go build -o /home/ubuntu/.bun/bin/ntm ./cmd/ntm
```

**Status**: ✅ FIXED - Cockpit workflow now works correctly

### ✅ Bug 2: `--with-memory` Fails Due to Same cass Issue (FIXED)

**Severity**: Low (optional feature)
**Command**: `cockpit start --with-memory` or `session start --with-memory`
**Error**: Same as Bug 1 - ntm internally calls invalid cass command

**Status**: ✅ FIXED - Same fix as Bug 1 (ntm rebuild)

### ⚠️ Issue 3: Python Not in PATH for Experiment Run

**Severity**: Low (environment-specific)
**Error**: `Executable not found in $PATH: "python"`

**Workaround**: Use `bash -c` wrapper or full path to python in venv:
```bash
./brenner.ts experiment run ... -- bash -c "source .venv/bin/activate && python script.py"
```

---

## Working Workflow (Without ntm)

The following workflow successfully runs a complete Brenner Protocol session:

```bash
# 1. Start session (sends kickoff messages)
./brenner.ts session start \
  --project-key /data/projects/bio_inspired_nanochat \
  --sender IvoryMoose \
  --to BlueLake,PurpleMountain \
  --thread-id RS-20260102-bio-nanochat-rrp \
  --excerpt-file artifacts/kickoff-pack-bio_inspired_nanochat.md \
  --question "Is RRP clamping distinguishable from frequency penalty?"

# 2. Check status
./brenner.ts session status \
  --project-key /data/projects/bio_inspired_nanochat \
  --thread-id RS-20260102-bio-nanochat-rrp

# 3. Initialize evidence pack
./brenner.ts evidence init \
  --thread-id RS-20260102-bio-nanochat-rrp \
  --project-key /data/projects/bio_inspired_nanochat

# 4. Run experiments
./brenner.ts experiment run \
  --thread-id RS-20260102-bio-nanochat-rrp \
  --test-id T1 \
  --timeout 60 \
  --cwd /data/projects/bio_inspired_nanochat \
  -- bash -c "echo 'Test output'"

# 5. Add evidence
./brenner.ts evidence add \
  --thread-id RS-20260102-bio-nanochat-rrp \
  --type experiment \
  --title "Matched-baseline equivalence test" \
  --source "synaptic.py" \
  --supports H-001 \
  --project-key /data/projects/bio_inspired_nanochat

# 6. Render evidence pack
./brenner.ts evidence render \
  --thread-id RS-20260102-bio-nanochat-rrp \
  --project-key /data/projects/bio_inspired_nanochat
```

---

## Recommendations

### Immediate (P1)
1. ~~**Fix ntm cass integration**~~ ✅ FIXED - Rebuilt ntm binary

### Short-term (P2)
2. **Improve critique target validation** - Accept `H1` as alias for `H-001` or provide clearer error message
3. **Document python PATH requirements** - Add note about venv activation in experiment run docs

### Nice-to-have (P3)
4. **Add experiment result summary** - Command to aggregate all T-* results for a thread
5. **Evidence pack export** - Export to PDF or structured markdown for sharing

---

## Viewing Agent Conversations

### Using Agent Mail CLI (brenner.ts)

View thread summary and messages:
```bash
# View thread summary with participants and key points
./brenner.ts mail thread --project-key /data/projects/bio_inspired_nanochat \
  --thread-id RS-20260102-bio-nanochat-rrp

# Check inbox for a specific agent
./brenner.ts mail inbox --project-key /data/projects/bio_inspired_nanochat \
  --agent BlueLake --threads
```

### Using ntm (Named Tmux Manager)

If agents are running in tmux panes, you can view and interact with them:
```bash
# List active sessions
ntm list

# View pane output for a session
ntm --robot-tail=RS-20260102-bio-nanochat-rrp --lines=50

# Send a message to all agent panes
ntm send RS-20260102-bio-nanochat-rrp --all "Please respond to the kickoff message"

# Get session state in JSON format
ntm --robot-status
```

### Using Agent Mail MCP Tools Directly

From within Claude Code or another MCP-enabled client:
```
# Get thread summary
mcp__mcp-agent-mail__summarize_thread(project_key, thread_id)

# Fetch inbox for an agent
mcp__mcp-agent-mail__fetch_inbox(project_key, agent_name)

# Search messages
mcp__mcp-agent-mail__search_messages(project_key, query)
```

---

## Sample Kickoff Message Sent

The following kickoff prompt was sent to agents BlueLake and PurpleMountain:

```markdown
# Kickoff Pack: Bio-Inspired Nanochat (Round 0)

Bead: `brenner_bot-5so.10.2.1`
Target repo: `/data/projects/bio_inspired_nanochat`

## Research Question (Discriminative)

In Bio-Inspired Nanochat, is **presynaptic vesicle depletion** (RRP clamping)
functionally distinguishable from an ordinary **frequency penalty / logit bias**?
If yes, what minimal experiments separate the two?

### Working hypotheses (include third alternative)

- **H1 (Equivalence):** RRP clamping is effectively a tuned frequency penalty;
  any apparent gains are regularization/cost tradeoffs.
- **H2 (Mechanistic):** RRP clamping creates *context-/edge-dependent fatigue*
  that changes attention dynamics in ways a token-count penalty can't reproduce.
- **H3 (Misspecification):** any "wins" are artifacts (metric confound,
  sampling/seed effects, compute/capacity mismatch, or evaluation leakage).

## Ranked Discriminative Tests (Cheap → Expensive)

1. **Matched-baseline equivalence test:** Replace RRP clamping with an explicit
   frequency penalty tuned to match *repetition rate*
2. **Context-sensitivity test:** Construct prompts with similar token-frequency
   but different attention structure
3. **Ablation matrix:** vanilla vs presynaptic-only vs vanilla+freq_penalty
4. **Mechanistic readout:** Instrument RRP mean/var over time
5. **Digital handle toy task:** Synthetic prompt requiring controlled repetition
6. **Failure-mode audit:** Look for over-fatigue pathologies

## Brenner Anchors (Selected)

> **§99**: "Well, I'll do a quickie." — *Pilot experiment to de-risk*
> **§103**: "You've forgotten there's a third alternative… 'Both could be wrong'"
> **§106**: "Occam's Broom… the minimum number of facts swept under the carpet"
```

### Thread Summary

| Field | Value |
|-------|-------|
| Thread ID | RS-20260102-bio-nanochat-rrp |
| Messages Sent | 2 |
| Participants | IvoryMoose (sender) |
| Recipients | BlueLake, PurpleMountain |
| Status | Awaiting responses |

---

## Conclusion

The BrennerBot system is **fully functional** for running structured research sessions. The core workflow of:

1. Session kickoff → 2. Evidence collection → 3. Experiment capture → 4. Corpus search

works end-to-end via `brenner.ts` CLI + Agent Mail MCP.

After rebuilding ntm from source, the full `cockpit start` command also works, enabling the "one command to spawn all agents" workflow.

**For bio-inspired nanochat research**, the system can:
- ✅ Send structured kickoff prompts with research questions and hypotheses
- ✅ Track evidence with supports/refutes/informs relationships
- ✅ Capture experiment results with full git state
- ✅ Build themed excerpts from the Brenner transcript
- ✅ Search corpus for relevant quotes and distillations

The kickoff pack at `artifacts/kickoff-pack-bio_inspired_nanochat.md` successfully provided context for a research session on RRP clamping vs frequency penalty equivalence.
