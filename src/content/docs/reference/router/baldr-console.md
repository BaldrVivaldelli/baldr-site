---
title: "Baldr Console and narrative progress — v0.20"
description: "Baldr technical reference synchronized from v0.20.0."
editUrl: false
---

:::note[Canonical source · v0.20.0]
This page is generated from [`baldr-console.md`](https://github.com/BaldrVivaldelli/baldr-router/blob/v0.20.0/docs/baldr-console.md). Do not edit it in this repository.
Source digest: `2cdb0962b617a4b2d5a67107442fc8224abbc5f743809ca2493515c3091f289b`.
:::
Baldr Console is the primary Baldr Router interface in VS Code. It lives in its
own Activity Bar section and avoids using Copilot Chat as the operational panel.

```text
Activity Bar
  -> Baldr
       -> durable task list
       -> narrative progress for the selected item
       -> fixed composer
       -> + menu
       -> protection, detail level, team, and additional-help chips
```

The console is a thin facade. It does not open SQLite or implement routing; it
uses the same versioned core intents:

```text
setup
status
run
```

## Daily use

Write directly in the composer:

```text
Fix token refresh and add tests
```

Baldr creates a durable work item and starts it with the workspace
configuration. The item remains available after closing VS Code, restarting
MCP, or updating the extension.

When the selected item has already finished, the next submitted text continues
the same conversation: Baldr adds a durable turn, preserves `work_item_id`, and
executes a new revision of the request. It carries only a structured, bounded
summary of the previous result; it does not copy transcripts, reasoning, or raw
output. `/resume` remains reserved for recovering an interrupted execution.

In a multi-root workspace, the console follows the active editor or the folder
explicitly selected through `+ -> Working folder`. If it cannot resolve a
folder unambiguously, it asks the user and does not select the first one by
default. Each request can add, within strict limits, the active file, selection,
document version and dirty state, an unsaved snapshot, and visible diagnostics.

The `@baldr` chat remains available as an optional shortcut, but Baldr Console
is the primary experience.

## `+` menu

The `+` button uses small Quick Picks instead of a form:

```text
New task for later
Open file
Selected text
Working folder
Change protection
Detail level
Baldr team
Create a team option
Additional help
Refresh status
Open logs
```

## Slash commands

Typing `/` opens autocomplete inside the composer:

```text
/new <task>
/run [task]
/status
/profile <fast|balanced|deep|custom>
/git <automatic|current|off>
/context <auto|on|off>
/roles
/cancel
/resume
/archive
/restore
/delete
/setup
/help
```

These are aliases for `setup`, `status`, and `run`; they do not expand the
public contract.

## Chips

Chips below the composer reflect persisted workspace configuration:

```text
Work directly
Standard
Standard team
Automatic help
```

Each chip opens a Quick Pick and saves the selection through core.

## Change protection

```text
Work directly
  recommended and default; modifies the selected folder without a per-task authorization pause.

Ask for authorization
  plans in read-only mode and asks before modifying files.

No protection
  modifies the folder directly without requiring Git or offering automatic recovery.
```

With **Ask for authorization**, architecture works in read-only mode. If the
plan needs to create or modify files, the session shows **Authorize changes and
retry** and **Do not authorize**. The first option records consent and lets
implementation write directly to the selected folder; the second closes the
run without writing. There is no later publication from a full copy, so other
workspace changes can coexist as in Codex/Kiro.

**No protection** requires explicit modal confirmation. It is then remembered
for that workspace as `intentional_non_git`; the exception applies only to that
folder and does not disable global policy. Task text is preserved if the user
cancels the confirmation.

New preferences use `current`. Tasks and preferences already stored as
`automatic`, `worktree`, `current`, or `non-git` retain their behavior and can
continue to resume without a silent migration.

## Per-phase profiles

`Fast`, `Balanced`, and `Deep` are presets. `Custom` selects profiles for:

```text
architecture:    1..N
implementation:  1..M
review:          1..L
```

A reusable profile is created step by step with Quick Picks and small inputs:
name, provider, model or agent, and effort. There is no separate form page.

## Narrative progress

The main view avoids internal states and answers four questions: what Baldr is
doing, what has finished, what the result was, and whether the person needs to act.

```text
Now
  Organizing the work | Making the changes | Checking the result

Planning
  summary, decisions, assumptions, risks, and criteria

Execution
  summary, reported files, checks, and pending work

Review
  conclusion, findings, corrections, and new review

Result
  changes, checks, pending work, and next steps
```

At completion, **Result** becomes the primary card and visibly shows any
available summary, completed work, files, tests, verification, blockers,
risks, and next steps. Only technical data remains in a closed disclosure. The
**Conversation** section preserves the original request and every continuation
in order.

The three stages are canonical accordions. Correction rounds remain inside
Execution and Review instead of duplicating cards. The active stage opens
automatically; panel selection, focus, and scroll survive updates. Durations
reflect observed timestamps, and invented percentages or estimates are never shown.

Agent reports are projected through the public `baldr-work-item-progress` v1
contract. The projection uses an allowlist, limits, and redaction: prompts,
reasoning, stdout/stderr, sessions, private roots, and raw events do not cross
the boundary. Provider, model, attempts, sanitized commands, and codes remain
closed under **Technical details**; logs are the final diagnostic level.

When Runner provides live activity, Baldr preserves only safe categories
(`working`, `analyzing`, `researching`, `changing`, `verifying`) and timestamps.
`working` is the honest state when a role or generic command starts; completing
a turn or receiving the SDK response is not presented as verification.
Reasoning, commands, and file content are never part of those observations.
After VS Code reloads, history is reconstructed from SQLite and durable artifacts.

Each report can include what Baldr understood, scope, approach, steps,
completed/next work, findings, corrections, and verification evidence. These
sections appear only after they are stored in a structured report; while a
round is active, the previous round's summary is not reused as new progress.

Every completed stage also retains a **Deliverable**. Its summary stays visible
on the card, and **View full deliverable** opens a protected, paginated viewer.
The viewer does not show logs or raw output: it presents only interpretation,
scope, plan, work, findings, corrections, and evidence already reduced by core.
Historical tasks state honestly whether only a summary exists or detail is no
longer available.

The 256 most recent descriptors travel in lightweight status. When more exist,
**View previous deliverables** appears and the console paginates the index on
demand; no attempt disappears, and polling does not hydrate large documents.
The viewer locks the background while open, supports keyboard and `Escape`,
preserves focus and scroll, and discards late responses for another task or deliverable.

The console calls `facade status --workbench-only`, avoiding repeated doctor,
login, qualification, and probes on every refresh. Polling backs off from 2.5
to 10 seconds while the revision is unchanged, stops when the view is hidden,
and does not rebuild unchanged content.

The complete specification is in [narrative-progress.md](../narrative-progress/).
Canonical contracts live in `contracts/work-item-progress-v1.schema.json`,
`contracts/phase-deliverable-page-v1.schema.json`, and
`contracts/phase-deliverable-index-page-v1.schema.json`.

## Actions

Actions depend on durable state:

```text
Run
Cancel
Archive
Restore
Delete permanently
Resolve
Open logs
```

History can filter active, completed, and archived sessions and search by
title. Archiving is reversible; an archived session can be restored or
permanently deleted after confirmation. Deletion removes Baldr's durable
history and deliverables without modifying workspace files.

When a write becomes uncertain or publication finds a conflict, **Review
options** offers only actions core proved safe for that state. In a shadow
workspace these can include:

```text
View protected copy               inspect_shadow
Continue from protected copy      continue_from_shadow
Apply protected changes           apply_shadow_changes
Discard protected copy            discard_shadow
```

All four do not always appear. They are also offered when a phase fails or
review requests changes, always over the latest verified checkpoint. **Apply**
publishes that checkpoint by explicit decision and closes the task as approved
only if review had already approved it; otherwise it remains `needs_changes`.
If publication applied part of the plan, **Discard** is hidden so changes in
the original are not abandoned; the copy can be inspected and **Apply** retried
from the idempotent journal. Changes in original paths outside Baldr's delta
are preserved. If another person or process changed one of the same paths,
Baldr shows the conflict and retains the copy. Legacy worktree actions
(`resume_from_checkpoint`, `accept_existing_changes`, and `discard_worktree`)
remain available for existing tasks when applicable. **Mark as failed**
preserves the journal and evidence.

When the plan requires creating, modifying, or deleting files, that need is
not presented as a failure. The session pauses and shows two direct decisions:
**Authorize changes and retry** resumes execution from the saved plan, and **Do
not authorize** cancels the session without publishing changes. The decision
is persisted and is also offered to earlier sessions that confused the
planning boundary with a blocker.

## Persistence

Core adds these tables through SQLite migrations:

```text
workspace_preferences
work_items
work_item_runs
work_item_turns
work_item_events
phase_deliverables
```

The full text and context of each request are stored as private artifacts;
`work_item_turns` links immutable turns to their revision and run. The
materialized row keeps metadata, state, references, and configuration. The
extension never accesses the database directly.

## Security

- VS Code Workspace Trust remains required.
- Planning does not turn missing write permission into an error: it asks for
  authorization before execution starts.
- Ask for authorization supports trusted folders without Git and requests
  permission before the first direct write.
- No protection requires explicit consent.
- The shadow workspace lives in Baldr's local durable state, not `/tmp`, and is
  removed only after successful publication and verification or a safe discard.
- `.git`, configured secrets, and generated artifacts are excluded from the
  copy; file, byte, depth, and link limits fail visibly.
- Context7 uses VS Code SecretStorage when the key is configured from the console.
- The UI escapes content before rendering it.
- Providers receive only workspaces authorized by core.
- Cancellation and reconciliation go through the durable state machine.

## Visible surface

```text
Activity Bar:
  Baldr

Command Palette:
  Baldr: Open

Optional chat:
  @baldr /setup
  @baldr /status
  @baldr /run <task>
```

No separate commands are added for every operation.
