---
title: Create an agent
description: Initialize a Python or TypeScript agent with Baldr's authoring API.
---

## Requirements

- Python 3.11 or later and `uv` for the toolchain;
- Node.js 20 or later for TypeScript agents;
- `baldr-agent` and the language driver available.

## Initialize

### Python

```bash
baldr-agent init ./my-agent \
  --name my-agent \
  --owner my-team \
  --namespace product \
  --language python
```

### TypeScript

```bash
baldr-agent init ./my-agent \
  --name my-agent \
  --owner my-team \
  --namespace product \
  --language typescript
```

## Declare roles

`baldr-agent.toml` defines identity, language, entrypoint, and one or more roles:

```toml
schema_version = 2
name = "repository-report"
owner = "my-team"
namespace = "product"
version = "1.0.0"
language = "typescript"
entrypoint = "src/agent.ts"
driver = "baldr.typescript"

[[roles]]
name = "writer"
capabilities = ["workspace.read", "workspace.write", "role.implementer"]
effect_mode = "workspace-write"
```

## Test before building

```bash
cd my-agent
baldr-agent test
baldr-agent driver doctor baldr.typescript
baldr-agent driver conformance baldr.typescript
```

Conformance verifies the real project, not merely that the driver executable responds.

Next: [publish a version](../publish-agent/).
