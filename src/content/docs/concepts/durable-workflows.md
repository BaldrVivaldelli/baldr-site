---
title: Workflows durables
description: Estado, reintentos y recuperación más allá de la vida de una interfaz.
---

Una tarea no es una única llamada al modelo. Es un estado versionado que
conserva qué se intentó, quién participó y qué resultado puede afirmarse.

## Snapshot inicial

Al comenzar, Router fija:

- versión del workflow;
- providers, modelos, agentes y perfiles;
- permisos y modo del workspace;
- límites de rondas;
- contexto público permitido.

Una recuperación no adopta silenciosamente una configuración posterior.

## Estado durable

```text
work item
  └─ run
      ├─ planning step
      ├─ implementation step
      └─ review step
          └─ participants -> attempts -> evidence
```

Intentos, leases, idempotency keys, checkpoints y eventos permiten distinguir
un reintento seguro de una ejecución cuyo efecto es incierto.

## Progreso público

La interfaz recibe una proyección acotada: etapa, actividad, entregables,
resultado, archivos cambiados y decisiones necesarias. Prompts, razonamiento,
raíces privadas y stdout/stderr crudo no cruzan esa frontera.

## Continuaciones

Una conversación puede añadir un pedido al mismo work item. Baldr crea una
nueva revisión y transporta solamente campos permitidos del resultado anterior
más el nuevo contexto privado.
