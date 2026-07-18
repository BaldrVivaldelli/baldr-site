---
title: "Codex"
description: "Baldr technical reference synchronized from v0.20.0."
editUrl: false
---

:::note[Canonical source · v0.20.0]
This page is generated from [`codex.md`](https://github.com/BaldrVivaldelli/baldr-router/blob/v0.20.0/docs/codex.md). Do not edit it in this repository.
Source digest: `4c8e42f039c17fa83b2c996c51bce52336731b2d619dca0119c2681ec1b38691`.
:::
Codex can participate in two different ways.

## Codex as a Baldr provider

This is the default implementation path:

```text
MCP client → Baldr Router → Codex CLI
```

Baldr uses `codex exec --json`, structured output, telemetry, and role-specific sandbox policy. Optional app-server and SDK runners remain experimental.

## Codex as an MCP client

Codex can also connect to Baldr Router itself. See:

```text
facades/generic-mcp/codex/config.toml.example
```

Avoid recursive topology in which a child Codex provider invokes Baldr Router again. Baldr marks child executions with anti-reentry environment metadata and providers should not self-delegate.
