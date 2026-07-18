---
title: "Kiro"
description: "Referencia técnica de Baldr sincronizada desde v0.20.0."
editUrl: false
---

:::note[Fuente canónica · v0.20.0]
Esta página se genera desde [`kiro.md`](https://github.com/BaldrVivaldelli/baldr-router/blob/v0.20.0/docs/kiro.md). No la edites en este repositorio.
Digest de la fuente: `b8c3b67c3035ceeec7fbbd60915dd5c4d6bfaec2b55b3b27bff8b31e236aadcb`.
:::
Kiro uses two thin pieces over the generic core:

```text
baldr-kiro-adapter
  workspace hook generation and idempotent onboarding

baldr-orchestrator Power
  Kiro-native activation, steering, and UX
```

Install core and adapter in the same Python environment:

```bash
uv tool install --force --editable ./router \
  --with-editable ./facades/kiro/adapter \
  --with-executables-from baldr-kiro-adapter
```

Install the Power from:

```text
facades/kiro/baldr-orchestrator/
```

Suggested first prompt:

```text
I just installed the power baldr-orchestrator and want to use it.
```

The Power maps first-run work to the shared `setup` intent, diagnostics to `status`, and spec-task execution to durable `run`. SQLite state, execution-profile resolution, recovery and evidence stay in the core; Kiro-specific hook creation remains in the adapter and is idempotent.

Context7 remains optional and secrets must never be requested in chat.
