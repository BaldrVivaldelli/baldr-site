---
title: Componentes
description: Las responsabilidades que forman la plataforma Baldr.
---

Cada pieza tiene una frontera deliberada. Esa separación permite agregar
lenguajes, superficies y ejecutores sin convertir Router en un monolito.

| Componente | Responsabilidad principal | Entrada | Salida |
| --- | --- | --- | --- |
| [Router](./router/) | Coordinar trabajo durable | intención + configuración | fases, decisiones y resultado |
| [Agent Manager](./agent-manager/) | Resolver identidades | rol + capacidades | `AgentRef + digest + ubicación` |
| [Runner](./runner/) | Ejecutar artefactos | invocación verificada | eventos privados + resultado |
| [Agent Builder](./agent-builder/) | Gestionar releases | proyecto + driver | artefacto + manifiestos |
| [SDKs](./sdks/) | API de autoría | código del equipo | agente compatible |

## Regla de dependencia

```text
SDK <- código del agente
Builder -> driver -> toolchain del lenguaje
Router -> Manager -> Runner -> artefacto
```

El SDK no inicia Builder. Builder no ejecuta workflows. Agent Manager no carga
artefactos. Runner no decide qué agente ocupa un rol.
