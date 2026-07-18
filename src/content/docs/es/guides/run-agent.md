---
title: Ejecutar con Baldr
description: Probar un release y asignarlo a un workflow coordinado por Router.
---

## Smoke local del agente

Antes de incorporarlo a un equipo, ejecutá el rol mediante Runner:

```bash
baldr-agent run \
  --role implementer \
  --workspace /ruta/al/workspace \
  --request "Generá el resultado solicitado"
```

La operación construye e instala un release efímero, invoca el rol respetando
su efecto declarado y limpia la instalación al terminar.

## Seleccionar desde una superficie

VS Code y Kiro consultan el catálogo compatible para cada fase. La interfaz
muestra nombre humano, versión, estado y digest; la selección guarda el
`AgentRef` exacto.

También podés combinar agentes externos y providers normales. Por ejemplo:

```text
architect   -> Codex
implementer -> local://product/repository-writer@1.0.0
reviewer    -> Kiro
```

## Qué observar

- la tarea conserva el equipo seleccionado;
- cada fase muestra actividad y entregables;
- el resultado enumera archivos agregados, modificados y eliminados;
- una escritura incierta solicita reconciliación;
- una versión ausente fijada explícitamente falla de forma visible.

Para automatización consultá [CLI y MCP](/baldr-site/es/integrations/cli-mcp/).
