---
title: CLI and MCP
description: Automation, diagnostics, and neutral clients.
---

Router provides an operational CLI and an MCP server. Both reach the same
domain implementation.

## Facade intents

```text
setup   -> preparation, configuration, and readiness
status  -> health and recent state
run     -> create, continue, or recover durable work
```

## CLI

The CLI adds administrative and diagnostic operations around those intents:
qualification, lifecycle, agent catalog, synchronization, and reconciliation.

```bash
baldr-router --help
baldr-router facade status --client cli
```

## MCP

Any compatible client can start the launcher with the `mcp` subcommand. Private
values are sent as process arguments or environment; runtime logs preserve flag
names, not their values.

Architecture reference: [facade contract](/baldr-site/reference/router/architecture/).
