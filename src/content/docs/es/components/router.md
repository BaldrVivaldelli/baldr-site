---
title: Router
description: El control plane que coordina roles, políticas y estado durable.
---

Router es la única implementación del dominio de coordinación. Se expone por
MCP y por una CLI compartida, sin depender de una interfaz concreta.

## Responsabilidades

- convertir una intención en un workflow versionado;
- fijar providers, modelos, agentes y perfiles para toda la sesión;
- coordinar planificación, implementación y revisión;
- aplicar límites de rondas, reentrada y escritor único;
- persistir intentos, leases, checkpoints, eventos y decisiones;
- proyectar progreso público sin filtrar información privada;
- recuperar o reconciliar ejecuciones interrumpidas.

## No le corresponde

- almacenar el código fuente de agentes externos;
- compilar todos los lenguajes;
- ejecutar código de terceros dentro de su proceso;
- implementar UX específica de VS Code o Kiro;
- cambiar silenciosamente participantes durante una sesión.

## Frontera estable

Las fachadas expresan tres intenciones: `setup`, `status` y `run`. Una
continuación es una nueva revisión durable del mismo work item, no un cuarto
contrato público.

Siguiente: [cómo Router mantiene workflows durables](/baldr-site/es/concepts/durable-workflows/).
