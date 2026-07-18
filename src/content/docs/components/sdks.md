---
title: SDKs
description: APIs de autoría para agentes Python y TypeScript.
---

Un SDK es la única biblioteca de Baldr que importa el código del agente. Expone
identidad, contexto, eventos y el contrato de respuesta; no incluye la
toolchain de publicación.

## Python

```python
from baldr_agent_sdk import Agent

agent = Agent(
    ref="local://product/reviewer@1.0.0",
    owner="product-team",
    capabilities=("workspace.read", "role.reviewer"),
)

@agent.invoke
def review(request, context):
    context.emit("verifying", "Revisión completada")
    return {"ok": True, "final_report": {"status": "approved"}}
```

## TypeScript

```ts
import { Agent } from "@baldr/agent-sdk";

const agent = new Agent({
  ref: process.env.BALDR_AGENT_REF!,
  owner: "product-team",
  capabilities: ["workspace.read", "role.reviewer"],
});

agent.invoke((_request, context) => {
  context.emit("verifying", "Revisión completada");
  return { ok: true, final_report: { status: "approved" } };
});
```

Ambos lenguajes producen la misma semántica de manifiesto e invocación.
