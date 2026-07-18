---
title: Durable workflows
description: State, retries, and recovery beyond the lifetime of an interface.
---

A task is not a single model call. It is versioned state that preserves what
was attempted, who participated, and which result can be asserted.

## Initial snapshot

At startup, Router pins:

- workflow version;
- providers, models, agents, and profiles;
- workspace permissions and mode;
- round limits;
- allowed public context.

Recovery does not silently adopt a later configuration.

## Durable state

```text
work item
  └─ run
      ├─ planning step
      ├─ implementation step
      └─ review step
          └─ participants -> attempts -> evidence
```

Attempts, leases, idempotency keys, checkpoints, and events distinguish a safe
retry from an execution whose effect is uncertain.

## Public progress

The interface receives a bounded projection: stage, activity, deliverables,
result, changed files, and required decisions. Prompts, reasoning, private
roots, and raw stdout/stderr do not cross that boundary.

## Continuations

A conversation can add a request to the same work item. Baldr creates a new
revision and carries forward only allowed fields from the previous result plus
the new private context.
