# Experiment Result Encoding Specification v0.1

Version: v0.1 (2025-12-31)

## Goal

Define a strict, deterministic contract for how `ExperimentResult` JSON (from `experiment run/record`) attaches to the canonical artifact. This is **encoding**, not interpretation.

## Non-goals (v0)

- **Interpretation**: This spec does NOT decide what results "mean" for hypotheses
- **Automatic hypothesis updates**: No auto-killing, no confidence changes
- **Multiple results**: v0 tracks "most recent run" only; history is in artifact files

## Where Run Records Live

Experiment results are attached to **discriminative test items** (Section 4) via optional fields.

### Extended DiscriminativeTest Schema

```typescript
interface DiscriminativeTest {
  // Existing fields
  id: string;                                    // e.g., "T1"
  name: string;
  procedure?: string;
  discriminates: string;
  expected_outcomes: Record<string, string>;
  potency_check?: string;
  feasibility?: string;
  score?: {
    likelihood_ratio?: number;
    cost?: number;
    speed?: number;
    ambiguity?: number;
  };

  // NEW: Experiment result fields (optional)
  test_id?: string;                              // Stable reference ID for matching
  last_run?: {
    result_id: string;                           // UUID of the result
    result_path: string;                         // Relative path to result JSON
    run_at: string;                              // ISO timestamp
    exit_code: number;
    timed_out: boolean;
    duration_ms?: number;
    summary?: string;                            // Short status line
  };
  status?: "untested" | "passed" | "failed" | "blocked" | "error";
  actual_outcomes?: Record<string, string>;      // What actually happened per hypothesis
}
```

### Design Decisions

**Why extend discriminative_tests items?**
- Tests are the natural home for test results
- Avoids creating a new artifact section
- Keeps the artifact structure flat and queryable

**Why minimal fields?**
- Full stdout/stderr stays in result JSON file
- Artifact has summary + path reference only
- Prevents artifact bloat

**Why `test_id` field?**
- Explicit matching between result JSON and artifact test
- More robust than name prefix matching
- Supports test renaming without breaking linkage

## Mapping Rules

### From ExperimentResult to DELTA

Given an `ExperimentResult` JSON file and a `test_id`:

```
1. Locate the test in artifact by matching `test_id`
2. Generate EDIT delta for the matched test
3. Set `last_run` fields from ExperimentResult
4. Set `status` based on exit_code:
   - exit_code == 0 → "passed" (provisional)
   - exit_code != 0 → "failed" or "error" (requires interpretation)
   - timed_out → "blocked"
```

### DELTA Block Format

```json
{
  "operation": "EDIT",
  "section": "discriminative_tests",
  "target_id": "T1",
  "payload": {
    "test_id": "T1",
    "last_run": {
      "result_id": "abc123...",
      "result_path": "artifacts/RS-.../experiments/T1/20251231T040000Z_abc123.json",
      "run_at": "2025-12-31T04:00:00.000Z",
      "exit_code": 0,
      "timed_out": false,
      "duration_ms": 5123,
      "summary": "Test completed: exit 0 in 5.1s"
    },
    "status": "passed"
  },
  "rationale": "Recording result of experiment run abc123 for T1"
}
```

### Provenance Requirements

Every encoded delta MUST include:

| Field | Source | Required |
|-------|--------|----------|
| `result_id` | ExperimentResult.result_id | YES |
| `result_path` | Computed from output file location | YES |
| `run_at` | ExperimentResult.started_at or created_at | YES |
| `exit_code` | ExperimentResult.exit_code | YES |
| `timed_out` | ExperimentResult.timed_out | YES |
| `duration_ms` | ExperimentResult.duration_ms | NO (null for record mode) |
| `summary` | Generated from result fields | YES |

### Summary Generation

```
If timed_out: "Test blocked: timed out after {timeout_seconds}s"
Else if exit_code == 0: "Test completed: exit 0 in {duration_ms/1000:.1f}s"
Else: "Test completed: exit {exit_code} in {duration_ms/1000:.1f}s"
```

## Status Field Semantics

| Status | Meaning | Encoder Rule |
|--------|---------|--------------|
| `untested` | No runs recorded | Default if no `last_run` |
| `passed` | Last run exit 0 | Set automatically by encoder |
| `failed` | Last run exit != 0 | Set automatically by encoder |
| `blocked` | Last run timed out | Set automatically by encoder |
| `error` | Test could not complete | Requires manual classification |

**Important**: "passed"/"failed" are exit-code-based only. **Interpretation** (does this confirm/refute a hypothesis?) is a separate step defined in brenner_bot-1es5.

## Path Conventions

### Result Path Format

Result paths in artifacts use **project-relative** paths:

```
artifacts/<thread_id>/experiments/<test_id>/<timestamp>_<result_id>.json
```

Example:
```
artifacts/RS-20251231-bio-rrp/experiments/T1/20251231T040000Z_abc12345.json
```

### Test ID Matching

1. **Exact match**: `test_id` in result JSON matches `test_id` field on test item
2. **Fallback**: If no `test_id` field, try matching `T{n}` prefix in test name
3. **Failure**: If no match found, encoder fails with clear error

## Examples

### Example 1: Successful Run

**ExperimentResult** (from `experiment run`):
```json
{
  "schema_version": "experiment_result_v0.1",
  "result_id": "550e8400-e29b-41d4-a716-446655440000",
  "capture_mode": "run",
  "thread_id": "RS-20251231-bio-rrp",
  "test_id": "T1",
  "created_at": "2025-12-31T04:00:00.000Z",
  "started_at": "2025-12-31T04:00:00.000Z",
  "finished_at": "2025-12-31T04:00:05.123Z",
  "duration_ms": 5123,
  "exit_code": 0,
  "timed_out": false,
  "stdout": "All tests passed\n",
  "stderr": ""
}
```

**Generated DELTA**:
```json
{
  "operation": "EDIT",
  "section": "discriminative_tests",
  "target_id": "T1",
  "payload": {
    "test_id": "T1",
    "last_run": {
      "result_id": "550e8400-e29b-41d4-a716-446655440000",
      "result_path": "artifacts/RS-20251231-bio-rrp/experiments/T1/20251231T040000Z_550e8400.json",
      "run_at": "2025-12-31T04:00:00.000Z",
      "exit_code": 0,
      "timed_out": false,
      "duration_ms": 5123,
      "summary": "Test completed: exit 0 in 5.1s"
    },
    "status": "passed"
  },
  "rationale": "Recording result of experiment run 550e8400 for T1"
}
```

### Example 2: Failed Run

**ExperimentResult**:
```json
{
  "result_id": "661f9511-f30c-52e5-b827-557766551111",
  "test_id": "T2",
  "exit_code": 1,
  "timed_out": false,
  "duration_ms": 3500,
  "stderr": "AssertionError: expected True"
}
```

**Generated DELTA**:
```json
{
  "operation": "EDIT",
  "section": "discriminative_tests",
  "target_id": "T2",
  "payload": {
    "test_id": "T2",
    "last_run": {
      "result_id": "661f9511-f30c-52e5-b827-557766551111",
      "result_path": "artifacts/RS-.../experiments/T2/...",
      "run_at": "...",
      "exit_code": 1,
      "timed_out": false,
      "duration_ms": 3500,
      "summary": "Test completed: exit 1 in 3.5s"
    },
    "status": "failed"
  },
  "rationale": "Recording result of experiment run 661f9511 for T2"
}
```

### Example 3: Timeout

**ExperimentResult**:
```json
{
  "result_id": "772f0622-g41d-63f6-c938-668877662222",
  "test_id": "T3",
  "exit_code": 143,
  "timed_out": true,
  "timeout_seconds": 60,
  "duration_ms": 60000
}
```

**Generated DELTA**:
```json
{
  "operation": "EDIT",
  "section": "discriminative_tests",
  "target_id": "T3",
  "payload": {
    "test_id": "T3",
    "last_run": {
      "result_id": "772f0622-g41d-63f6-c938-668877662222",
      "result_path": "artifacts/RS-.../experiments/T3/...",
      "run_at": "...",
      "exit_code": 143,
      "timed_out": true,
      "duration_ms": 60000,
      "summary": "Test blocked: timed out after 60s"
    },
    "status": "blocked"
  },
  "rationale": "Recording result of experiment run 772f0622 for T3"
}
```

## Error Cases

### Missing Test Match

If `test_id` doesn't match any artifact test:
```
Error: Cannot find test "T5" in artifact discriminative_tests.
Available tests: T1, T2, T3, T4
Hint: Add test_id field to your test or check spelling.
```

### Missing Required Fields

If ExperimentResult is missing required fields:
```
Error: ExperimentResult missing required fields: result_id, test_id
```

## Relationship to Interpretation

This encoding spec produces a **raw attachment**: the result is linked to the test, and a simple status is set based on exit code.

**Interpretation** (defined in brenner_bot-1es5) happens afterward:
1. Operator reviews the result
2. Classifies it (pass/fail/error/metrics/observation/anomaly)
3. Decides what it means for hypotheses
4. Creates additional DELTAs to update hypotheses/predictions

The separation ensures:
- Raw data is preserved without judgment
- Exit code != hypothesis confirmation
- Operators control what results "mean"

## Acceptance Criteria

- [x] Extended DiscriminativeTest schema documented
- [x] Clear mapping from ExperimentResult → artifact fields
- [x] Provenance rule: always includes result_id, result_path, run_at, exit_code, timed_out
- [x] Examples for success, failure, and timeout cases
- [x] Error cases documented
- [x] Relationship to interpretation clarified
