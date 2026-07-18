---
title: "Codex"
description: "Referencia técnica de Baldr sincronizada desde v0.20.0."
editUrl: false
---

:::note[Fuente canónica · v0.20.0]
Esta página se genera desde [`codex.md`](https://github.com/BaldrVivaldelli/baldr-router/blob/v0.20.0/docs/codex.md). No la edites en este repositorio.
Digest de la fuente: `4c8e42f039c17fa83b2c996c51bce52336731b2d619dca0119c2681ec1b38691`.
:::
Codex puede participar de dos formas diferentes.

## Codex como provider de Baldr

Este es el camino de implementación predeterminado:

```text
cliente MCP → Baldr Router → Codex CLI
```

Baldr usa `codex exec --json`, salida estructurada, telemetría y una política
de sandbox específica por rol. Los runners opcionales de app-server y SDK
continúan siendo experimentales.

## Codex como cliente MCP

Codex también puede conectarse directamente a Baldr Router. Consultá:

```text
facades/generic-mcp/codex/config.toml.example
```

Evitá una topología recursiva en la que un provider Codex hijo vuelva a invocar
Baldr Router. Baldr marca las ejecuciones hijas con metadata de entorno contra
la reentrada y los providers no deberían autodelegarse.
