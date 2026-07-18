---
title: "Durable Baldr-led Orchestration"
description: "Baldr technical reference synchronized from v0.20.0."
editUrl: false
---

:::note[Canonical source · v0.20.0]
This page is generated from [`durable-orchestration.md`](https://github.com/BaldrVivaldelli/baldr-router/blob/v0.20.0/docs/durable-orchestration.md). Do not edit it in this repository.
Source digest: `813483b4b2661bbc60d5e23e05fc400ab494df5b9e01d0a1ecac1b26c6d47c06`.
:::
Baldr v0.16 turns the frozen `architect-implement-review` workflow into a durable state machine. Models or agents provide reasoning; Baldr retains operational control.

```text
MCP client
  -> Baldr durable workflow engine
      -> architecture phase
      -> implementation phase
      -> review phase
      -> bounded fix/review rounds
```

Participants are not invoked directly. Baldr selects profiles, persists each transition, transmits structured artifacts, and decides when to retry, pause, reconcile, or complete.

## Abstract execution profiles

Baldr does not hardcode specific model names. A profile describes how to execute a participation:

```toml
[execution_profiles.shared]
provider = "codex"
model = ""
reasoning_effort = ""
session_scope = "workspace"
```

Empty fields inherit provider defaults. The same profile can back all three phases:

```toml
[roles.architect]
profiles = ["shared"]

[roles.implementer]
profiles = ["shared"]

[roles.reviewer]
profiles = ["shared"]
```

An independent number of profiles per phase is also supported: `n` for architecture, `m` for implementation, and `l` for review.

```toml
[execution_profiles.architecture-primary]
provider = "codex"
model = "architecture-model"
reasoning_effort = "high"
session_scope = "workspace"

[execution_profiles.architecture-fallback]
provider = "kiro-cli"
agent = "architecture-agent"
effort = "high"

[execution_profiles.implementation]
provider = "codex"
model = "implementation-model"
reasoning_effort = "medium"
session_scope = "workspace"

[execution_profiles.review-a]
provider = "codex"
model = "review-model-a"
reasoning_effort = "high"

[execution_profiles.review-b]
provider = "kiro-cli"
agent = "review-agent-b"
effort = "high"

[roles.architect]
profiles = ["architecture-primary", "architecture-fallback"]
strategy = "first-success"
min_successes = 1
can_write = false
sandbox = "read-only"

[roles.implementer]
profiles = ["implementation"]
strategy = "first-success"
min_successes = 1
can_write = true
sandbox = "workspace-write"

[roles.reviewer]
profiles = ["review-a", "review-b"]
strategy = "all"
min_successes = 2
min_approvals = 2
max_concurrency = 2
can_write = false
sandbox = "read-only"

[workflows.architect-implement-review]
max_parallel_participants = 4
max_participants_per_phase = 8
max_total_participant_attempts = 24
```

Rules:

- `first-success` tries profiles in order until it obtains a valid result;
- `all` runs read-only profiles in parallel with bounded concurrency and consolidates their results in configured order;
- a write phase must resolve to exactly one participant, regardless of strategy;
- `max_participants_per_phase` bounds fan-out and `max_total_participant_attempts` includes fallbacks, rounds, and durable retries;
- if a read participant fails, the others may satisfy `min_successes`/`min_approvals`; the failure is persisted as evidence;
- cancellation is checked while Baldr waits for parallel participants, terminates child processes, and finishes the run with durable fencing;
- precedence is execution override, role profile, then provider default;
- the resolved snapshot is frozen when the workflow is created, so a configuration upgrade does not change an already-started execution.

The frozen policy implements [`orchestration-policy-v1.schema.json`](https://github.com/BaldrVivaldelli/baldr-router/blob/v0.20.0/contracts/orchestration-policy-v1.schema.json) and declares limits, per-role cardinality, and the `exactly-one-per-write-phase` rule.

## Three durability planes

```text
Control plane
  SQLite

Code plane
  Git worktree or shadow workspace + checkpoints + idempotent publication

Artifact plane
  content-addressed outputs/evidence
```

### SQLite

Default path:

```text
Linux/WSL:
  ~/.local/state/baldr-router/baldr.sqlite3

Native Windows:
  Baldr local state directory
```

The database must live on the runtime's local filesystem, not a network path or `/mnt/c` when Baldr runs inside WSL.

Configuration:

```toml
[durability]
enabled = true
journal_mode = "WAL"
synchronous = "FULL"
busy_timeout_ms = 5000
lease_seconds = 45
heartbeat_seconds = 5
recovery_on_start = true
artifact_inline_limit_bytes = 32768
retain_terminal_days = 90
```

SQLite maintains:

- materialized state for runs, steps, participants, and attempts;
- append-only event journal;
- leases and heartbeats;
- provider sessions;
- workspace checkpoints;
- artifact and evidence references;
- immutable snapshot of the resolved configuration.

Migrations are monotonic and checksummed. Modifying an already-applied migration causes startup to fail instead of silently altering history.

## State machine

Relevant workflow states:

```text
pending
running
recovering
interrupted
unknown
awaiting_reconciliation
approved
needs_changes
blocked
failed
cancelled
```

Each transition updates materialized state and appends an event within the same SQLite transaction.

External effects cannot be part of that transaction. Baldr therefore does not promise `exactly once`; it implements:

```text
controlled at-least-once
+ idempotency keys
+ reconciliation
+ verifiable checkpoints
```

`unknown` means that an external process may have produced effects before durable confirmation was lost.

## Leases, heartbeat, and recovery

Each active workflow has an owner, expiration, and monotonic `lease_epoch`. While a provider runs, Baldr renews both workflow and attempt leases. Each takeover increments the epoch; every later mutation requires the same owner/epoch within the transaction, so a stale worker cannot confirm a result after losing the lease.

At startup Baldr:

1. finds expired leases;
2. classifies active steps;
3. moves a read-only step to `interrupted`, where it may be retried;
4. moves a write step to `unknown`;
5. moves a workflow with uncertain write effects to `awaiting_reconciliation` and does not retry it blindly.

A resumed execution uses the original snapshot of profiles, limits, sandbox, and workflow version even if the current configuration changed. Resume is also bound to the original path and, depending on mode, the Git identity or the shadow workspace manifest and policy. Moving the run, replacing the repository, or altering durable state is rejected.

## Persistent sessions per profile

Sessions are not shared indiscriminately. The key includes:

```text
scope + workspace/run + role + provider + model/agent + profile
```

For example, architecture and implementation can use the same provider while retaining different threads. Under `workspace` scope, a later workflow can resume the corresponding thread for the same role/model/profile.

Structured results, not implicit thread memory, are the contract between phases:

```text
architecture artifact
implementation report
review report
```

## Authorized writing and compatible isolation

**Work directly** (`current`) is the recommended and default mode. Baldr preserves exactly the scope selected by the user:

```text
read-only architecture over the selected folder
  -> direct implementation with workspace-write
  -> review of the diff and verifications
```

There is no later publication from a complete copy. Every change appears directly in the active workspace, as in Codex/Kiro, without a per-task authorization pause. The user's independent changes can coexist with execution; Git, checkpoints, and the journal record observed effects. If a write attempt is interrupted before confirming its result, Baldr leaves it `unknown` and requires reconciliation instead of repeating it.

`automatic` preserves the optional flow that asks for permission before the first write. `non-git` allows direct writing in a trusted folder without requiring Git and retains its explicit confirmation. Architecture keeps a `read-only` sandbox; implementation and fixes receive `workspace-write` only when the mode already authorizes it.

### Compatible worktrees and shadow workspaces

Isolated sessions created by previous versions preserve their snapshot and resume with their original semantics:

```text
exact root of a clean committed Git repository
  -> detached worktree managed by Baldr

dirty/uncommitted Git, non-Git folder, or subfolder inside another repository
  -> durable shadow workspace managed by Baldr
```

Baldr does not expand a selected subfolder to the Git root of a parent directory. In these isolated runs, a Git root must have a commit and be clean to receive worktree isolation; if it is dirty or has no commit yet, the legacy `auto` snapshot captures that state as a shadow baseline instead of blocking, stashing, or writing directly.

### Exact Git root

For a clean Git repository with `write_isolation = "auto"`, Baldr creates a detached worktree under its state directory.

```text
original repository
  <- patch publication
Baldr worktree
  <- checkpoint commit after each write step
```

Each checkpoint records:

- base commit;
- checkpoint commit;
- diff hash;
- binary patch;
- step that produced the change;
- `prepared`, `checkpointed`, or `published` state.

Publication is idempotent: if Baldr crashes after applying the patch but before persisting `published`, the next attempt detects that the same patch is already present and reconciles without applying it twice.

### Non-Git folder or partial scope

For a non-Git folder—or a selected subfolder inside a parent repository—a legacy isolated snapshot creates:

```text
<baldr-local-state>/shadow-workspaces/<run-id>/
  tree/                 copy used by agents
    .git/               auxiliary private Git repository
  control/
    state.json          durable state and selected manifests
    journal/            preparation, checkpoint, and publication events
    manifests/          immutable content-addressed manifests
    blobs/              immutable content identified by SHA-256
```

This location belongs to Baldr's durable state; it does not use `/tmp` and can be opened again after restarting VS Code, the router, or the machine. Private Git in `tree/` supports inspection and local checkpoints, but it is not the source of truth: the portable authority is the hash-identified manifests and blobs.

Baldr takes an initial manifest, materializes the copy, rescans the source, and verifies that both hashes match before running a provider. Architecture, implementation, review, and corrections receive `tree/` as their workspace. An `advisory` adapter, a Codex SDK that cannot prove cwd, or an unrestricted sandbox is blocked before invocation; the user can explicitly choose a direct mode if they accept that reduced guarantee. The original folder remains intact until review approves the result or the user decides to apply the verified checkpoint.

Another manifest is created after every write phase. The delta includes added, modified, and removed files, type changes, and mode changes. Before touching the original, Baldr recalculates its hashes. Every path Baldr changed must still match the initial manifest or already match the expected result. Paths outside the delta keep their current state, so independent work can continue while Baldr operates on the protected copy. If the same path changed on both sides, publication stops with a conflict before applying the plan.

Publication first stores its plan and cursor in SQLite and the shadow workspace journal. Every delete, create, replace, or mode-change operation is recorded before and after the effect together with a guard over the content/identity of the target and its parents. The guard is revalidated after recording the intent and immediately before the effect, closing the window for changes after preflight. A retry can therefore skip already-applied paths and continue the remaining ones without duplication. If a crash occurs during an operation, the state is classified as partial publication: the copy is preserved and no discard is offered that could leave effects unreconciled.

Visible actions are calculated from durable state; not all actions are available in every state:

```text
View protected copy      inspect_shadow
Continue from copy       continue_from_shadow
Apply protected changes  apply_shadow_changes
Discard protected copy   discard_shadow
```

`Discard` is offered only if publication could not yet have modified the original, or if a verified rollback exists. The same options appear after a phase failure or a review with pending changes. `Apply` publishes the latest verified checkpoint by explicit decision; it restores `approved` only when review had already approved it. On conflict or partial publication, the safe option is to inspect and, when preflight permits, retry the idempotent application. The run can also be marked failed while retaining its journal and evidence.

### Exclusions, limits, and portability

The snapshot never follows symbolic links. It accepts only relative links whose target stays within the workspace; absolute links, external targets, special files, and unsupported Windows reparse points are rejected. Manifests record each link target and file/directory modes. POSIX modes are restored on Linux and macOS; on Windows, executable/read-only state is best effort, and a system that cannot create the link returns an explicit error. Non-portable names, case-insensitive collisions, and reserved Windows paths are also rejected before agents run.

Hard rules exclude `.git`, `.hg`, and `.svn` metadata at any depth. A nested repository is therefore copied as normal content, but its control metadata is never exposed. Generated directories such as `node_modules`, `.venv`, caches, `dist`, `build`, and `target`, as well as intermediate binary patterns, are also excluded by default. A non-replaceable floor covers `.ssh`, `.aws`, `.gnupg`, `.npmrc`, `.netrc`, private keys, `.env`, and credentials; configuration can only add patterns unless there is an explicit inclusion. If an agent attempts to create an equivalent sensitive path, the checkpoint fails visibly. Templates such as `.env.example` are allowed. Excluded content is never inferred as deleted and blocks removing a parent if that content could be lost.

The isolated policy is frozen in those runs and retains these `[workspace]` fields:

```toml
write_isolation = "auto"
shadow_max_files = 100000
shadow_max_total_bytes = 5368709120
shadow_max_single_file_bytes = 536870912
shadow_max_depth = 64
shadow_max_symlinks = 10000
shadow_exclude_generated = true
shadow_generated_directories = ["node_modules", ".venv", "venv", "__pycache__", ".pytest_cache", ".mypy_cache", ".ruff_cache", ".tox", ".gradle", "target", "dist", "build"]
shadow_secret_patterns = [".env", ".env.*", "*.pem", "*.key", "*.p12", "*.pfx", "credentials.json", "secrets.toml"]
shadow_exclude_patterns = []
shadow_include_patterns = []
```

`shadow_max_files` limits all managed entries, including directories. Internal generated patterns also exclude intermediate extensions such as `*.pyc`, `*.class`, and `*.obj`. `.git`, `.hg`, and `.svn` cannot be reintroduced with `shadow_include_patterns`. If a limit is exceeded, Baldr fails before starting the provider and reports which limit was hit; it never silently falls back to direct writing.

### Cleanup, retention, and compatibility

After verified publication, the default behavior removes the shadow workspace immediately. If cleanup fails, the checkpoint remains `cleanup_pending` so maintenance can retry without changing the approved result. Retention is configurable:

```toml
cleanup_successful_shadow_workspaces = true
retain_failed_shadow_workspaces = true
shadow_success_retention_hours = 0
shadow_failed_retention_days = 30
shadow_conflict_retention_days = 90
```

Maintenance validates ownership and terminal state before removing a copy; it never deletes a still-recoverable shadow based on age alone. `cleanup_successful_shadow_workspaces=false` also keeps approved shadows regardless of successful retention settings.

New work items use `automatic`, which resolves to `in-place` writing only after per-task authorization. Existing stored values preserve their semantics: `worktree` remains legacy isolated Git mode; a historical snapshot with `write_isolation = "auto"` may resolve to worktree or shadow; `current` works directly on a Git repository, and `non-git` is the explicit **No protection** option with confirmation and no automatic rollback.

## Idempotency

A caller may send `idempotency_key` to `run`. The key is bound to a request fingerprint comprising workspace/repository identity, workflow version, task/context hashes, and configuration snapshot. The same key with the same fingerprint retrieves the workflow; a different request returns `idempotency_conflict`.

Each provider attempt also has a key derived from:

```text
run + step + profile + attempt number
```

This prevents duplication of an already-confirmed attempt. An `unknown` write attempt is never repeated automatically.

## Durable cancellation and reconciliation

Cancellation is materialized before processes are terminated:

```text
running -> cancelling -> cancelled
```

Baldr persists timestamp/reason, terminates the run's process tree, and marks attempts, participants, and steps as `cancelled`. A repeated request is idempotent, and recovery can complete it if the client disappears.

A write attempt with uncertain effects remains `unknown` and the workflow moves to `awaiting_reconciliation`. The operator can continue using the same `run` intent with an action enabled by the core for that state:

```text
authorization: authorize_changes | decline_changes
shadow:   inspect_shadow | continue_from_shadow | apply_shadow_changes | discard_shadow
worktree: resume_from_checkpoint | accept_existing_changes | discard_worktree
mark_failed
```

Baldr inspects shadow ownership, manifests, cursor, and conflicts—or worktree identity, HEAD, and patch—before offering actions. No uncertain write is retried automatically, and `discard_shadow` is omitted when partial publication may have modified the original.

## Maintenance, sessions, and reducers

The control plane runs integrity/foreign-key checks, pre-migration backups, run/artifact GC, session expiration, and WAL checkpoints. Sessions are invalidated by TTL, turn count, repository identity, or provider version.

When a phase has multiple participants, Baldr applies deterministic reducers to structured reports. Architecture supports `primary-with-advisors`, `unanimous`, and `conflict-blocks`; review supports `any-blocker`, `all-approved`, `quorum`, and `conflict-blocks`. No additional model is invoked for consolidation.

## Evidence from SQLite

When a workflow ends, Baldr generates evidence from the journal and durable state, not ephemeral memory.

```text
~/.local/state/baldr-router/evidence/workflow-<run-id>/
  summary.md
  workflow-state.json
  workflow-events.json
  schema.json
  artifact-hashes.json
  manifest.json
```

The bundle does not contain API keys, raw prompts, or workspace code. Private artifacts remain referenced and redacted according to their level.

## Frozen public surface

Durability adds no product intents:

```text
setup
status
run
```

- `setup` prepares configuration, trust, probing, and verification;
- `status` shows schema, non-terminal runs, recovery, and resolved profiles;
- `run` creates or resumes the durable workflow.

Existing MCP tools optionally accept `idempotency_key` and `resume_run_id` without changing the frozen workflow, roles, or providers.

## Crash and upgrade tests

The suite covers:

- crashes before and after every durable workflow boundary;
- safe read-only retry;
- write side effects converted to `unknown`;
- configuration snapshot preserved after an upgrade;
- persistent sessions separated by role/model/profile;
- SQLite migrations and checksums;
- consistent journal and materialized state;
- idempotent Git publication;
- idempotent shadow copying, checkpointing, and publication;
- hash conflict and crash during partial publication;
- limits, exclusions, modes, symlinks, and nested repositories;
- evidence rebuilt from SQLite.

Synthetic tests do not replace the real E2E matrix for VS Code, WSL, and Kiro, but they make process failures deterministically reproducible.
