---
title: Kiro
description: Power, adapter, and MCP access to the same Router.
---

Kiro uses two deliberately thin pieces:

```text
Kiro Power -> baldr-kiro-adapter -> baldr-router MCP
```

Power provides the Kiro experience and can translate Spec tasks. The adapter
materializes hooks and specific compatibility idempotently. The real workflow
remains in Router.

## MCP configuration

An installation can expose the launcher as the `baldr-router` server. The exact
path depends on the host/WSL environment and how the runtime was distributed.

## External agents

Kiro queries the same published participants as VS Code. Selecting an agent
stores an immutable reference; it does not copy the agent's configuration file
into Power.

Exact reference: [Kiro](/baldr-site/reference/router/kiro/).
