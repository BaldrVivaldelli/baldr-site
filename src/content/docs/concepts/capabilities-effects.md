---
title: Capabilities and effects
description: How Baldr calculates the effective permission of each invocation.
---

Selecting an agent does not automatically grant it the permissions of the
application that invoked it. Effective permission is an intersection:

```text
manifest capabilities
        ∩
effects allowed by the phase
        ∩
trusted workspace policy
        =
effective invocation
```

## Reading

Planning and review receive a reduced, disposable copy. It contains no Git
metadata, symlinks, special entries, or known generated directories. The agent
does not receive the original path.

## Writing

Implementation can receive the exact workspace when all these conditions hold:

1. the role requires writing;
2. the manifest declares `workspace.write`;
3. `effect_mode` is `workspace-write`;
4. the surface has already trusted the workspace;
5. Router preserves a single writer for the phase.

## Failures with different meanings

A canceled read leaves no changes and can be retried. An interrupted write may
have produced partial effects: state becomes `unknown` and requires
reconciliation instead of automatic repetition.
