---
title: Identidad inmutable
description: Por qué Baldr combina versiones humanas y digests verificables.
---

Una referencia típica tiene esta forma:

```text
local://personal/repository-report-writer@1.0.0
```

El `AgentRef` comunica propietario, nombre, rol y versión. El digest prueba el
contenido exacto que esa versión declaró.

## Versión y digest cumplen trabajos diferentes

- la **versión** expresa evolución e intención para personas;
- el **digest** detecta cualquier cambio para máquinas.

```text
1.0.0 + digest A -> primera publicación
1.0.0 + digest A -> repetición idempotente
1.0.0 + digest B -> rechazo: contenido distinto
1.1.0 + digest B -> nueva release válida
```

## Por qué no alcanza una ruta

Una ruta local cambia de contenido, depende del checkout y no representa un
release. Un artefacto publicado se instala en una ubicación estable, pero su
identidad continúa siendo `AgentRef + digest`; la ruta es solamente un dato de
resolución.

## Rollback

Volver a una versión anterior reactiva una identidad que ya fue construida y
verificada. No intenta reconstruir aproximadamente el estado del pasado.
