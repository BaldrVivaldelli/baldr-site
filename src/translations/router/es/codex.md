# Codex

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
