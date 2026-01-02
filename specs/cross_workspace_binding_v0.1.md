# Cross-Workspace Target Binding v0.1 (Future)

> **Status**: Draft specification (future / optional)
> **Purpose**: Define how a session can reference a *different* target workspace without moving the Agent Mail thread
> **Depends on**: `agent_mail_contracts_v0.1.md`, `artifact_schema_v0.1.md`, `thread_subject_conventions_v0.1.md`

---

## Overview

A **session** (thread + compiled artifact) normally lives inside a single Agent Mail project keyed by
`project_key` (absolute directory). This spec defines an **optional** future mechanism to bind that
session to a *different* target workspace (e.g., a code repo or dataset directory) without splitting
conversation or violating the join-key contract.

**Key idea**: The thread and artifacts stay in one Agent Mail project, while the target workspace
is stored as **metadata** for context and optional advisory file reservations.

---

## Non-Goals

This spec does **not** introduce:

- Cross-project Agent Mail conversations or multiple thread homes
- Automatic code execution or sandboxing
- Mandatory cross-repo file reservations
- A global session registry spanning multiple repos

---

## v0 Decision (Current)

For Science Mode v0, **cross-workspace binding is not implemented**.

**Rule**: start sessions in the repo/folder being studied, and use that path as `project_key`.
This keeps messaging, reservations, and artifacts aligned with the work.

---

## When v1 Is Justified

Only introduce binding if we *need* one or more of these capabilities:

- A central session catalog that lives in a single repo
- A web UI that browses sessions across many target repos
- Research sessions spanning multiple repos or datasets in one thread

If none apply, remain on the v0 model.

---

## Data Model (V1)

```ts
interface SessionBinding {
  thread_id: string;
  session_project_key: string; // Where Agent Mail thread + artifacts live
  target_project_key: string;  // Workspace under study
  entry_point?: string;
  default_test_command?: string;
  target_branch?: string;
  target_remote?: string;
  results_path?: string;
}
```

### Required Fields

- `thread_id`: Join key (matches thread subject conventions)
- `session_project_key`: Absolute path to the Agent Mail project that owns the thread
- `target_project_key`: Absolute path to the workspace under study

### Optional Fields

- `entry_point`: Useful for quick navigation or tests
- `default_test_command`: Suggested operator command
- `target_branch` / `target_remote`: Metadata for provenance
- `results_path`: Preferred location for experiment outputs

---

## Persistence Rules

Binding metadata should be **durable and human-visible**:

1. **Kickoff message body**: Include a clear "Target Workspace" block
2. **Compiled artifact front matter**: Persist binding metadata for auditability

**No separate binding file** by default (avoid file sprawl).

---

## CLI/UX Surface (Future)

### CLI Flags (future)

- `session start` and `cockpit start` may accept:
  - `--target-repo <abs-path>` (required when binding is enabled)
  - `--target-branch <name>`
  - `--target-remote <name>`
  - `--entry-point <path>`
  - `--default-test-command <string>`
  - `--results-path <path>`

### Web UI (future)

- Display target workspace metadata in session header
- Read-only by default (editing requires explicit operator action)

---

## Agent Mail Behavior

- **Thread home**: Always in `session_project_key`
- **No split conversations**: Messages remain in the session project
- **Optional advisory reservations**: If enabled, reserve files in the *target* project
  by registering the same agent name in the target project and calling
  `file_reservation_paths(project_key=target_project_key, ...)`

**Failure mode**: If target reservations fail, warn and continue (fail-soft).

---

## Validation Rules

- `session_project_key` and `target_project_key` must be **absolute paths**
- `thread_id` must match thread ID conventions
- If binding is present, `target_project_key` may equal `session_project_key`
  (explicit is allowed, but redundant)

---

## Compatibility and Defaults

- If no binding metadata is present, treat the session as **single-workspace**
- Existing sessions remain valid; binding is an additive optional feature

---

## Acceptance Criteria (When/If V1 Is Implemented)

- Clear use cases that v0 cannot satisfy
- Binding metadata persisted in kickoff + artifact front matter
- CLI and web UI display binding information consistently
- Optional advisory file reservations are fail-soft

