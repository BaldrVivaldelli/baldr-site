---
title: CLI y MCP
description: Automatización, diagnóstico y clientes neutrales.
---

Router ofrece una CLI operacional y un servidor MCP. Ambos llegan a la misma
implementación de dominio.

## Intenciones de fachada

```text
setup   -> preparación, configuración y readiness
status  -> salud y estado reciente
run     -> crear, continuar o recuperar trabajo durable
```

## CLI

La CLI agrega operaciones administrativas y de diagnóstico alrededor de esas
intenciones: qualification, lifecycle, catálogo de agentes, sincronización y
reconciliación.

```bash
baldr-router --help
baldr-router facade status --client cli
```

## MCP

Cualquier cliente compatible puede iniciar el launcher con el subcomando `mcp`.
Los valores privados se envían como argumentos o entorno del proceso; los logs
del runtime conservan nombres de flags, no sus valores.

Referencia de arquitectura: [facade contract](/baldr-site/es/reference/router/architecture/).
