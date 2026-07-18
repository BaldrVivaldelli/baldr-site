---
title: Modelo conceptual
description: El vocabulario estable con el que Baldr coordina agentes y providers.
---

Baldr distingue conceptos que en un prototipo suelen mezclarse.

| Concepto | Significado |
| --- | --- |
| Rol | Responsabilidad en una fase: architect, implementer o reviewer |
| AgentRef | Identidad versionada de un participante externo |
| Digest | Prueba del contenido canónico de un manifiesto o artefacto |
| Capacidad | Acción que un agente declara poder realizar |
| Efecto | Frontera operacional efectiva, como lectura o escritura |
| Driver | Implementación de build para un lenguaje |
| Release | Definición, artefacto y manifiestos inmutables |
| Snapshot | Configuración y equipo congelados para un workflow |

## Relaciones importantes

```text
rol + capacidades requeridas
            |
            v
AgentRef + digest + effect_mode
            |
            v
participante durable del workflow
```

Un nombre humano ayuda a elegir. Una identidad exacta permite repetir,
auditar y revertir.

## Profundizar

- [Identidad inmutable](./identity/)
- [Capacidades y efectos](./capabilities-effects/)
- [Workflows durables](./durable-workflows/)
