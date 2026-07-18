---
title: Immutable identity
description: Why Baldr combines human-readable versions with verifiable digests.
---

A typical reference looks like this:

```text
local://personal/repository-report-writer@1.0.0
```

The `AgentRef` communicates owner, name, role, and version. The digest proves
the exact content declared by that version.

## Version and digest serve different purposes

- the **version** communicates evolution and intent to people;
- the **digest** detects any change for machines.

```text
1.0.0 + digest A -> first publication
1.0.0 + digest A -> idempotent repetition
1.0.0 + digest B -> rejected: different content
1.1.0 + digest B -> valid new release
```

## Why a path is not enough

A local path can change its content, depends on a checkout, and does not
represent a release. A published artifact is installed in a stable location,
but its identity remains `AgentRef + digest`; the path is only resolution data.

## Rollback

Returning to an earlier version reactivates an identity that was already built
and verified. It does not attempt to approximately reconstruct past state.
