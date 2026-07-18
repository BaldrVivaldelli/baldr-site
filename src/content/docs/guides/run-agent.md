---
title: Run with Baldr
description: Test a release and assign it to a workflow coordinated by Router.
---

## Local agent smoke test

Before adding it to a team, execute the role through Runner:

```bash
baldr-agent run \
  --role implementer \
  --workspace /path/to/workspace \
  --request "Generate the requested result"
```

The operation builds and installs an ephemeral release, invokes the role while
respecting its declared effect, and cleans up the installation when finished.

## Select from a surface

VS Code and Kiro query the compatible catalog for each phase. The interface
shows a human-friendly name, version, status, and digest; the selection stores
the exact `AgentRef`.

You can also combine external agents and standard providers. For example:

```text
architect   -> Codex
implementer -> local://product/repository-writer@1.0.0
reviewer    -> Kiro
```

## What to observe

- the task preserves the selected team;
- each phase shows activity and deliverables;
- the result lists added, modified, and deleted files;
- an uncertain write requests reconciliation;
- an explicitly pinned missing version fails visibly.

For automation, see [CLI and MCP](/baldr-site/integrations/cli-mcp/).
