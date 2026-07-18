---
title: Agent Runner
description: The local data plane that verifies and executes external agents.
---

Runner executes the artifact **outside the Router process**. It receives an
already resolved invocation and applies the operational boundary immediately
before starting the process.

## Preflight checks

1. Identity and digest match the pinned manifest.
2. The artifact is a regular file, not a symlink.
3. Its SHA-256 matches the published value.
4. Role, capabilities, and requested effect are compatible.
5. Time, input, output, and environment are bounded.

## Two workspace modes

- `read-only`: disposable copy without Git metadata, generated dependencies,
  symlinks, or write permissions;
- `workspace-write`: the exact workspace, only when the phase and manifest
  declare writing and Router preserves a single writer.

A canceled read can be retried. An interrupted write may have left partial
effects and is marked `unknown` until it is reconciled.

Next: [capabilities and effects](/baldr-site/concepts/capabilities-effects/).
