---
title: Conceptual model
description: The stable vocabulary Baldr uses to coordinate agents and providers.
---

Baldr distinguishes concepts that prototypes often blur together.

| Concept | Meaning |
| --- | --- |
| Role | Responsibility in a phase: architect, implementer, or reviewer |
| AgentRef | Versioned identity of an external participant |
| Digest | Proof of the canonical content of a manifest or artifact |
| Capability | Action an agent declares it can perform |
| Effect | Effective operational boundary, such as reading or writing |
| Driver | Build implementation for a language |
| Release | Immutable definition, artifact, and manifests |
| Snapshot | Configuration and team frozen for a workflow |

## Important relationships

```text
role + required capabilities
            |
            v
AgentRef + digest + effect_mode
            |
            v
durable workflow participant
```

A human-friendly name helps with selection. An exact identity makes work
repeatable, auditable, and reversible.

## Learn more

- [Immutable identity](./identity/)
- [Capabilities and effects](./capabilities-effects/)
- [Durable workflows](./durable-workflows/)
