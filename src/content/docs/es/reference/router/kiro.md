---
title: "Kiro"
description: "Referencia técnica de Baldr sincronizada desde v0.20.0."
editUrl: false
---

:::note[Fuente canónica · v0.20.0]
Esta página se genera desde [`kiro.md`](https://github.com/BaldrVivaldelli/baldr-router/blob/v0.20.0/docs/kiro.md). No la edites en este repositorio.
Digest de la fuente: `b8c3b67c3035ceeec7fbbd60915dd5c4d6bfaec2b55b3b27bff8b31e236aadcb`.
:::
Kiro usa dos piezas delgadas sobre el core genérico:

```text
baldr-kiro-adapter
  generación de hooks del workspace y onboarding idempotente

baldr-orchestrator Power
  activación, dirección y UX nativas de Kiro
```

Instalá el core y el adapter en el mismo entorno Python:

```bash
uv tool install --force --editable ./router \
  --with-editable ./facades/kiro/adapter \
  --with-executables-from baldr-kiro-adapter
```

Instalá el Power desde:

```text
facades/kiro/baldr-orchestrator/
```

Primer prompt sugerido:

```text
Acabo de instalar el power baldr-orchestrator y quiero usarlo.
```

El Power asigna el primer uso a la intención compartida `setup`, los
diagnósticos a `status` y la ejecución de tareas de Specs a `run` durable. El
estado SQLite, la resolución de perfiles de ejecución, la recuperación y la
evidencia permanecen en el core; la creación de hooks específicos de Kiro
permanece en el adapter y es idempotente.

Context7 continúa siendo opcional y nunca se deben pedir secretos en el chat.
