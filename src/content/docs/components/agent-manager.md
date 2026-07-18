---
title: Agent Manager
description: Catalog and resolution of immutable agent identities.
---

Agent Manager stores and resolves **releases**, not repositories. Its unit of
work is an exact identity paired with the manifest digest.

## What it stores

- versioned `AgentRef`;
- canonical manifest digest;
- capabilities and effect mode;
- transport and stable location;
- activation and health state;
- administrative events for audit and rollback.

## What it resolves

Router queries participants compatible with a role. Agent Manager can return
an active version or validate an explicitly pinned reference. The result is
frozen in the workflow snapshot.

```text
role.implementer + workspace.write
                 |
                 v
local://product/repository-writer@1.2.0
+ sha256:manifest
+ local-process target
```

Publishing the same content again is idempotent. Publishing different content
under the same version is rejected.

Next: [immutable identity](/baldr-site/concepts/identity/).
