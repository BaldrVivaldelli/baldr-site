---
title: Kiro
description: Power, adapter y acceso MCP al mismo Router.
---

Kiro usa dos piezas deliberadamente delgadas:

```text
Kiro Power -> baldr-kiro-adapter -> baldr-router MCP
```

El Power aporta la experiencia de Kiro y puede traducir tareas de Specs. El
adapter materializa hooks y compatibilidad específica de forma idempotente. El
workflow real continúa en Router.

## Configuración MCP

Una instalación puede exponer el launcher como servidor `baldr-router`. La ruta
exacta depende del entorno host/WSL y de cómo se distribuyó el runtime.

## Agentes externos

Kiro consulta los mismos participantes publicados que VS Code. Seleccionar un
agente guarda una referencia inmutable; no copia su archivo de configuración al
Power.

Referencia exacta: [Kiro](/baldr-site/reference/router/kiro/).
