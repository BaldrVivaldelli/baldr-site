---
title: Publish an agent
description: Build a reproducible artifact and publish an immutable version.
---

## Build

```bash
baldr-agent build
```

Builder inventories sources, calculates their digest, and selects an exact
driver. The result must be portable and must not retain paths to the checkout,
virtual environments, or local `node_modules`.

## Publish

```bash
baldr-agent publish
baldr-agent doctor
```

Publishing installs the artifact at a stable path, generates one manifest per
role, and activates the identities in the local catalog. For Agent Manager:

```bash
baldr-agent publish --catalog manager
```

## Evolve

If sources, capabilities, roles, ownership, or metadata change, increment
`version` in `baldr-agent.toml`. The previous version remains available.

```bash
baldr-agent rollback 1.0.0
```

Rollback reactivates a known release; it does not rewrite its content.

Next: [run the agent](../run-agent/).
