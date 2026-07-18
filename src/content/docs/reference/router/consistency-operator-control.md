---
title: "Consistency and Operator Control"
description: "Baldr technical reference synchronized from v0.20.0."
editUrl: false
---

:::note[Canonical source · v0.20.0]
This page is generated from [`consistency-operator-control.md`](https://github.com/BaldrVivaldelli/baldr-router/blob/v0.20.0/docs/consistency-operator-control.md). Do not edit it in this repository.
Source digest: `61322f9f5f59d1d3575b82d70f991b52aa33f3f1c8c4585bf3ab0bffff3fd92f`.
:::
Baldr Router v0.16 keeps the public contract frozen at `setup`, `status`, and `run`, while hardening the durable control plane so crashes, takeovers, cancellations, and retries do not produce contradictory states.

## 1. Fencing tokens

Each lease has an owner, expiration, and monotonic `lease_epoch`.

```text
worker A -> epoch 7
lease expires
worker B -> epoch 8
worker A attempts to persist -> lease_fence_rejected
```

Every operational mutation of runs, steps, participants, attempts, sessions, and checkpoints validates the token within the same SQLite transaction. Fencing cannot prevent an external effect from occurring immediately before the lease is lost; it prevents a stale worker from confirming that effect as current state. A new owner must reconcile it.

## 2. Request-bound idempotency

An `idempotency_key` does not identify just a name: it is bound to a stable fingerprint of:

- workspace and repository identity;
- workflow and version;
- task and context hashes;
- requested Context7 libraries;
- configuration and profile snapshot.

```text
same key + same fingerprint       -> same durable run
same key + different fingerprint  -> idempotency_conflict
```

The private input and run are created in a single transaction, preventing orphaned artifacts when a key already exists.

## 3. Strict resume

A durable run can be resumed only against:

- the original normalized path;
- in Git mode, the same common directory and roots/remotes fingerprint;
- in shadow mode, the same ownership, manifest, frozen policy, and durable location;
- a workspace that is still trusted.

Baldr rejects resume if the repository was replaced in the same folder, if shadow state was tampered with, or if a client attempts to move the run to another path.

## 4. Durable cancellation

Cancellation follows this sequence:

```text
running -> cancelling
persist cancel_requested_at + reason
terminate provider/process tree
attempts/participants/steps -> cancelled
workflow -> cancelled
```

The request is idempotent. If the client disappears after making it, recovery can complete the transition from SQLite.

## 5. Operable reconciliation

A write attempt that loses durable confirmation becomes `unknown`; the run moves to `awaiting_reconciliation`. Baldr never retries it blindly.

Actions are calculated from the checkpoint, manifest, and publication cursor. For a shadow workspace they can be:

```text
inspect_shadow
  returns path, manifests, delta, conflicts, and publication state without changing files

continue_from_shadow
  restores the last confirmed manifest and reruns the uncertain step

apply_shadow_changes
  resumes idempotent publication from the durable cursor after a new preflight

discard_shadow
  removes the copy only if publication could not have affected the original

mark_failed
  ends the workflow while preserving the journal and evidence
```

A shadow publication persists the plan and marks each operation inflight before modifying the filesystem, then advances the cursor. If the process crashes between those markers, recovery treats the original as potentially modified. In that state it does not offer `discard_shadow`: it permits only inspection or retrying `apply_shadow_changes`, which recognizes completed operations and continues the rest. A hash conflict also preserves the shadow; no uncertain write is retried without an operator decision.

Existing worktrees retain `resume_from_checkpoint`, `accept_existing_changes`, and `discard_worktree`. Legacy `non-git` mode offers only actions compatible with direct execution without a restorable checkpoint. `status` includes the diagnosis and exact list of safe actions; the UI does not invent capabilities from the mode name.

## 6. Worktrees and shadow workspaces

If a worktree disappears, Baldr verifies the original repository and recreates it from `checkpoint_commit` or `base_commit`. If it exists but HEAD, identity, or artifacts do not match, execution is blocked and reconciliation is required.

A shadow workspace is stored in Baldr's local state directory under `shadow-workspaces/<run-id>`, never in `/tmp`. `tree/` contains the copy and an auxiliary private Git repository; `control/` stores ownership, state, SHA-256 manifests, blobs, and one journal entry per event. The manifests are the recovery authority: private Git does not replace content verification.

For isolated runs created with the previous semantics, an exact clean Git root uses a worktree. A dirty or uncommitted Git root, a non-Git folder, and a selected subfolder inside a parent repository use a shadow; Baldr does not expand the scope to the parent or require a stash. The original remains unchanged until review approves or the user chooses to apply the verified checkpoint.

The following policy remains for explicit isolated worktree/shadow flows:

```toml
[workspace]
dirty_workspace_policy = "reject"
```

`automatic` is the default direct-write flow with prior per-task authorization. `current` and `in-place` preserve persistent direct consent and exactly the selected subfolder as cwd, even when Git lives in a parent. `non-git` corresponds to **No protection** and requires explicit consent. `worktree`, low-level `auto`, and shadows remain for existing isolated runs and advanced configuration.

Before creating a shadow, Baldr excludes `.git`, `.hg`, `.svn`, a non-replaceable minimum credential denylist, configured sensitive patterns, and generated artifacts. It enforces visible limits for entries (including directories), total bytes, individual size, depth, and links. Only relative symlinks that remain in scope are accepted; non-portable paths and unsupported reparse points are rejected. POSIX modes are preserved where supported by the filesystem; Windows uses best-effort permission semantics and fails explicitly if it cannot recreate a link.

A cwd is not considered a boundary. In protected modes, `advisory` adapters, the Codex SDK without a provable cwd, and unrestricted sandboxes are blocked before execution; only `read-only` or `workspace-write` with real enforcement are accepted.

## 7. SQLite health and maintenance

Baldr runs:

```text
PRAGMA quick_check / integrity_check
PRAGMA foreign_key_check
transactional backup before migrations
terminal run retention
safe retention and cleanup of shadow workspaces
GC of unreferenced artifacts
provider session expiration
WAL checkpoint
```

Full maintenance also creates a verifiable backup. The database and shadows must live on the runtime's local filesystem, especially inside WSL.

By default, a published and verified shadow is removed immediately; a failed one is retained for 30 days and one with a terminal conflict for 90 days. `cleanup_successful_shadow_workspaces`, `retain_failed_shadow_workspaces`, `shadow_success_retention_hours`, `shadow_failed_retention_days`, and `shadow_conflict_retention_days` tune that behavior. If `cleanup_successful_shadow_workspaces=false`, maintenance does not automatically remove approved shadows either. A non-terminal conflict remains retained until a safe decision. Maintenance validates ownership, terminal state, and recoverability before deletion.

## 8. Session lifecycle

Session keys include scope, workspace/run, role, provider, profile, and model/agent. They are also invalidated by:

- TTL;
- maximum turn count;
- repository identity change;
- provider version change;
- model change, which produces a different key.

Structured artifacts remain the contract between phases; session memory is an optimization, not the source of truth.

## 9. Deterministic reducers

A phase may have N/M/L participants. Baldr consolidates structured outputs without invoking another model.

Architecture:

```text
primary-with-advisors
unanimous
conflict-blocks
```

Review:

```text
any-blocker
all-approved
quorum
conflict-blocks
```

Conflicts remain explicit in `resolution.conflicts`; write roles continue to prohibit multiple concurrent writers.

## 10. Consistency tests

The suite covers:

- two owners competing for a lease;
- a stale worker attempting to write after a takeover;
- idempotency fingerprint conflict;
- resume against a different path or repository;
- idempotent, materialized cancellation;
- safe reconciliation actions calculated by mode and state;
- worktree reconstruction;
- creation and durable checkpointing of shadow workspaces;
- hash preflight and idempotent shadow publication;
- crash during an operation and recovery from the durable cursor;
- original-workspace conflict and blocked discard after partial publication;
- limits, exclusions, permissions, symlinks, and nested repositories;
- integrity, backup, WAL, GC, and session expiry;
- reducers with conflict and quorum;
- random walks of the state machine;
- crash/restart at the durable boundaries of architecture, implementation, and review.

Synthetic tests do not replace real E2E runs on Windows/WSL, Remote WSL, Kiro, and authenticated providers. The runbooks remain under `e2e/` and must be run three consecutive times from clean states.
