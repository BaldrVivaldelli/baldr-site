---
title: Technical documentation
description: Canonical specifications synchronized from a pinned baldr-router version.
---

Pages under **Router reference** are not maintained manually in this repository.
They are generated from the tag pinned in `router-docs.json`.

```json
{
  "repository": "https://github.com/BaldrVivaldelli/baldr-router",
  "ref": "v0.20.0"
}
```

## Synchronization guarantee

1. CI fetches the exact configured tag.
2. `npm run sync:check` regenerates each document in memory.
3. The job fails if a copy changed, is missing, or should not exist.
4. Every page displays its source tag, canonical link, and digest.

To update the reference, change the tag and run:

```bash
BALDR_ROUTER_SOURCE=../baldr-router npm run sync:router-docs
npm run check
```

## Recommended entry points

- [Architecture](/baldr-site/reference/router/architecture/)
- [External Agent Runtime](/baldr-site/reference/router/external-agent-runtime/)
- [Builder Protocol](/baldr-site/reference/router/builder-protocol/)
- [Durable orchestration](/baldr-site/reference/router/durable-orchestration/)
- [Operating Agent Manager](/baldr-site/reference/router/agent-manager-operations/)
