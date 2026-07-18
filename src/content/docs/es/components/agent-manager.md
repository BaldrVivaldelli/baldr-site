---
title: Agent Manager
description: Catálogo y resolución de identidades inmutables de agentes.
---

Agent Manager almacena y resuelve **releases**, no repositorios. Su unidad de
trabajo es una identidad exacta junto con el digest del manifiesto.

## Qué conserva

- `AgentRef` versionado;
- digest canónico del manifiesto;
- capacidades y modo de efectos;
- transporte y ubicación estable;
- estado de activación y salud;
- eventos administrativos para auditoría y rollback.

## Qué resuelve

Router consulta participantes compatibles con un rol. Agent Manager puede
devolver una versión activa o validar una referencia fijada explícitamente. El
resultado se congela en el snapshot del workflow.

```text
role.implementer + workspace.write
                 |
                 v
local://product/repository-writer@1.2.0
+ sha256:manifest
+ local-process target
```

Publicar otra vez el mismo contenido es idempotente. Publicar contenido distinto
bajo la misma versión se rechaza.

Siguiente: [identidad inmutable](/baldr-site/es/concepts/identity/).
