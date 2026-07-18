---
title: "BALDR narrative progress"
description: "Baldr technical reference synchronized from v0.20.0."
editUrl: false
---

:::note[Canonical source · v0.20.0]
This page is generated from [`narrative-progress.md`](https://github.com/BaldrVivaldelli/baldr-router/blob/v0.20.0/docs/narrative-progress.md). Do not edit it in this repository.
Source digest: `672f25488e0c74f7b991629a10b0c9d703c4d5623918b405760bd819136084b7`.
:::
The console must let a person who knows nothing about agents, models, or
internal states quickly answer four questions:

1. What is BALDR doing now?
2. What has already finished?
3. What was the result?
4. Does it need anything from me?

The experience does not show a percentage or a fictional estimate. It is
reconstructed exclusively from durable steps, reports, and events.

## Information hierarchy

The view uses progressive disclosure:

```text
What is happening now
  -> title and explanation in everyday language
  -> latest durable activity

Stages
  -> Planning: what it understood and decided
  -> Execution: what it did and how it checked the work
  -> Review: what it verified and found

Result
  -> changes, checks, pending work, and next steps

Technical details
  -> profiles, attempts, commands, codes, and records
```

The active stage opens automatically. Completed stages retain their summary
and correction rounds; future stages explain what will happen. User-selected
expansion, focus, and scroll must survive state updates.

## Visible wording

| Activity | Title | Explanation |
| --- | --- | --- |
| Draft | Not started yet | The task is saved and ready to begin. |
| Work in progress | Working on the stage | BALDR does not yet have confirmed progress to show. |
| Planning | Organizing the work | BALDR is understanding your request and creating a plan. |
| Execution | Making the changes | BALDR is working according to the agreed plan. |
| Correction | Adjusting the result | BALDR is correcting what the review found. |
| Review | Checking the result | BALDR verifies that the changes satisfy your request and work correctly. |
| Publication | Saving the result | The work is finished and is being applied safely. |
| Completed | Work ready | The changes were made and reviewed. |
| Intervention | We need you to choose how to continue | The work is preserved; review the available options. |
| Canceled | Work canceled | BALDR stopped working on this task. |

Operational states such as `dispatching`, `running`, `succeeded`, `unknown`, or
`awaiting_reconciliation` are not product copy. Core projects them to semantic
states and the extension presents them in the selected language.

## Public contract

`WorkItemService.get()` adds `progress` without removing `phases`, `workflow`,
or `timeline` from the compatible surface. The projection has its own contract
and version:

```json
{
  "contract": "baldr-work-item-progress",
  "version": 1,
  "revision": 1783866960000001,
  "overall_state": "running",
  "activity": {
    "kind": "reviewing",
    "message": "...",
    "since": "..."
  },
  "active_stage": "review",
  "last_event_at": "...",
  "stages": [],
  "final_report": null,
  "attention": null,
  "milestones": [],
  "technical": {}
}
```

The three canonical stages are `planning`, `execution`, and `review`.
Additional rounds live in `history`; they do not create duplicate cards. Phase
execution state and semantic result are different: a review can execute
successfully and still request changes.

The projection is built by allowlist and applies text and list limits. It never
includes prompts, reasoning, stdout/stderr, sessions, leases, resume tokens,
private state paths, or raw events. Visible files must be workspace-contained
relative paths.

Current reports can provide explicit narrative sections, all bounded and
redacted before they cross the public boundary:

```text
interpretation          what BALDR understood
scope / approach        selected scope and approach
plan_steps              agreed steps
work_completed          completed work
work_next               work still pending
findings                review findings
corrections             corrections made
verification_evidence   observable checks and their reported results
```

They are additive: a historical task without these sections retains its
`summary` and previous lists. No section represents internal reasoning or an
analysis transcript.

## Durable stage deliverables

Each terminal Planning, Execution, and Review materializes a structured,
redacted deliverable linked to the task. It is not obtained by parsing logs and
does not expose prompts, reasoning, raw responses, participants, state paths,
or artifact identifiers. The deliverable survives restarts and cleanup of the
run that produced it.

The status view carries only recent descriptors and a `deliverable_index` with
`total`, `returned`, `truncated`, an opaque cursor, and a read action. When more
history exists, the console shows **View previous deliverables** and paginates
the index only on demand. All attempts and rounds remain inspectable without
turning every poll into a full-document load.

Public contracts have separate responsibilities:

- `baldr-work-item-progress` describes narrative state and selectors;
- `baldr-phase-deliverable-index-page` paginates historical descriptors;
- `baldr-phase-deliverable-page` paginates a deliverable's safe content;
- `baldr-phase-deliverable` represents the internal durable document and is not
  the facade response.

An invalid, missing, or oversized historical deliverable is declared
`summary_only` or `unavailable`; the interface never invents details. If the
summary was not preserved, the wording says so explicitly. Cursors and
responses are bound to workspace, task, digest, and request so a late response
cannot appear over another task.

## Live milestones

All providers produce a generic observation when a phase starts. When Runner
provides typed events during execution, BALDR reduces them to public categories:

```text
working
analyzing
researching
changing
verifying
```

`working` means only that the role or a command is active. A file event can
promote it to `changing`; only a typed test or check event can promote it to
`verifying`. Starting an implementer, starting a reviewer, running a generic
command, receiving the final SDK response, or observing `turn.completed` does
not by itself prove a change or verification.

Only category, state, stage, timestamp, and evidence level are persisted.
Reasoning text, commands, file content, and tool arguments are not retained.
Observations are deduplicated and bounded to prevent uncontrolled journal
growth, and they do not become completed milestones.

## Honest evidence

The UI implicitly distinguishes three sources:

- `reported`: the agent stated it in its structured report;
- `observed`: BALDR observed a Runner transition or activity;
- `verified`: BALDR obtained deterministic evidence, such as a validated
  publication or checkpoint.

A textual entry in `tests_run` means “the agent reported this check”; it must
not become “passed” when the contract does not preserve a verifiable result.

## Efficient updates

Visible polling uses `facade status --workbench-only`. This route reads durable
state and skips provider diagnostics, login, qualification, probes, and
lifecycle checks. The progress revision avoids rebuilding the DOM when nothing
changed. A hidden view does not poll, and an implementation can apply backoff
while the revision remains stable.

Full status remains the default for CLI and existing clients.

## Accessibility

- Current activity uses `aria-live="polite"`.
- An urgent decision uses `role="alert"`; normal changes do not.
- Accordions expose `aria-expanded` and work with the keyboard.
- The deliverable viewer is modal: it locks the background, traps focus, closes
  with `Escape`, and returns focus to the control that opened it.
- State and importance never depend on color alone.
- It must work without horizontal scrolling from 240 px, at 200% zoom, and in
  high-contrast themes.
- `prefers-reduced-motion` disables pulses and decorative transitions.

## Required scenarios

The test matrix covers draft, long execution, successful completion, review
with findings, correction and second review, human intervention, publication
conflict, retryable/non-retryable error, cancellation, archival, recovery after
restart, and incomplete legacy data. It also injects HTML, secrets, absolute
paths, and oversized reports to verify escaping, redaction, and limits; it
forces more than 256 deliverables, out-of-order pages, and task changes to
verify complete history and isolation.
