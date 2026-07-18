---
title: VS Code
description: Native extension, private runtime, and durable Baldr console.
---

The extension registers MCP programmatically and prepares a private, versioned
Python runtime. The daily experience lives in Baldr's Activity Bar.

## What the facade handles

- Workspace Trust and root selection;
- bounded editor, selection, and diagnostic context;
- runtime installation and updates;
- presentation of sessions, stages, and changed files;
- safe opening of files inside the workspace;
- selection of compatible providers and agents.

## What it delegates

Providers, workflows, recovery, and policies remain in Router. The extension
does not duplicate those decisions.

For `local-process` agents, the runtime must also be able to find
`baldr-agent-runner` in `PATH` or through `BALDR_AGENT_RUNNER_COMMAND`.

Exact reference: [VS Code](/baldr-site/reference/router/vscode/).
