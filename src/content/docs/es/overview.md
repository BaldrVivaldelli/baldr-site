---
title: Qué es Baldr
description: Una introducción al control plane local y a las fronteras de la plataforma.
---

Baldr es un **control plane local para coordinar trabajo con agentes**. Puede
usar Codex o Kiro directamente y también descubrir agentes externos escritos
en diferentes lenguajes sin incorporar su código al Router.

## El problema que resuelve

Crear una primera demostración de un agente es sencillo. Operarlo exige
responder preguntas más difíciles:

- ¿qué versión exacta se ejecutó?;
- ¿qué capacidades declaró y qué efectos recibió?;
- ¿el artefacto ejecutado coincide con el que fue publicado?;
- ¿cómo continúa el trabajo después de un reinicio?;
- ¿cómo se revierte una actualización?;
- ¿cómo usan el mismo agente VS Code, Kiro, una CLI o cualquier cliente MCP?

Baldr convierte esas preguntas en contratos, identidades y estados durables.

## Lo que Baldr posee

- coordinación de roles y fases;
- resolución de participantes exactos;
- políticas de capacidades y efectos;
- ejecución mediante Runner;
- reintentos, cancelación y reconciliación;
- evidencia y progreso público acotado;
- una superficie común para diferentes clientes.

## Lo que permanece afuera

- código y prompts privados de cada agente;
- pruebas y dependencias del equipo propietario;
- decisiones internas de lenguaje y framework;
- calendario de release del producto;
- secretos que el agente no declaró necesitar.

:::tip[Una frase para recordarlo]
Baldr posee la coordinación. Cada equipo posee el comportamiento.
:::

## Dos formas de usarlo

### Providers normales

Codex y Kiro pueden seguir ocupando roles de planificación, implementación y
revisión. No hace falta crear un agente externo para obtener workflows
durables.

### Agentes externos

Un equipo desarrolla con el SDK de su lenguaje, construye con Agent Builder y
publica un release. Agent Manager resuelve su `AgentRef + digest`; Runner lo
ejecuta cuando Router selecciona ese participante.

El [explorador de arquitectura](/baldr-site/es/explore/) muestra ambos recorridos.
