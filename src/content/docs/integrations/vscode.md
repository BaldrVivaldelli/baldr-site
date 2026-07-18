---
title: VS Code
description: Extensión nativa, runtime privado y consola durable de Baldr.
---

La extensión registra el MCP programáticamente y prepara un runtime Python
privado y versionado. La experiencia diaria vive en la Activity Bar de Baldr.

## Qué resuelve la fachada

- Workspace Trust y selección de raíz;
- contexto acotado del editor, selección y diagnósticos;
- instalación y actualización del runtime;
- presentación de sesiones, etapas y archivos cambiados;
- apertura segura de archivos dentro del workspace;
- selección de providers y agentes compatibles.

## Qué delega

Providers, workflows, recuperación y políticas continúan en Router. La
extensión no duplica esas decisiones.

Para agentes `local-process`, el runtime también debe poder encontrar
`baldr-agent-runner` en `PATH` o mediante `BALDR_AGENT_RUNNER_COMMAND`.

Referencia exacta: [VS Code](/baldr-site/reference/router/vscode/).
