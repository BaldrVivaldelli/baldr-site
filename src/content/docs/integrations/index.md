---
title: Available surfaces
description: Different ways to start and observe the same control plane.
---

Integrations do not implement their own orchestrator. They all map their native
experience to the same Router intents.

| Surface | Best for | Own boundary |
| --- | --- | --- |
| [VS Code](./vscode/) | daily repository work | extension, workspace trust, and UI |
| [Kiro](./kiro/) | chat, hooks, and Specs | Power and adapter |
| [CLI](./cli-mcp/) | automation and diagnostics | commands and structured output |
| [MCP](./cli-mcp/) | other compatible clients | `setup`, `status`, and `run` tools |

Standard Codex and Kiro remain available even if you have not installed Agent
Builder, SDKs, or external agents.
