---
title: Components
description: The responsibilities that make up the Baldr platform.
---

Every component has a deliberate boundary. This separation makes it possible
to add languages, surfaces, and executors without turning Router into a monolith.

| Component | Primary responsibility | Input | Output |
| --- | --- | --- | --- |
| [Router](./router/) | Coordinate durable work | intent + configuration | phases, decisions, and result |
| [Agent Manager](./agent-manager/) | Resolve identities | role + capabilities | `AgentRef + digest + location` |
| [Runner](./runner/) | Execute artifacts | verified invocation | private events + result |
| [Agent Builder](./agent-builder/) | Manage releases | project + driver | artifact + manifests |
| [SDKs](./sdks/) | Authoring API | team code | compatible agent |

## Dependency rule

```text
SDK <- agent code
Builder -> driver -> language toolchain
Router -> Manager -> Runner -> artifact
```

The SDK does not start Builder. Builder does not execute workflows. Agent
Manager does not load artifacts. Runner does not decide which agent fills a role.
