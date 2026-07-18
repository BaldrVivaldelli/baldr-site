---
title: SDKs
description: Authoring APIs for Python and TypeScript agents.
---

An SDK is the only Baldr library imported by agent code. It exposes identity,
context, events, and the response contract; it does not include the publishing
toolchain.

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
    context.emit("verifying", "Review completed")
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
  context.emit("verifying", "Review completed");
  return { ok: true, final_report: { status: "approved" } };
});
```

Both languages produce the same manifest and invocation semantics.
