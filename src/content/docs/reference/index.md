---
title: Documentación técnica
description: Especificaciones canónicas sincronizadas desde una versión fija de baldr-router.
---

Las páginas bajo **Referencia del Router** no se mantienen manualmente aquí.
Se generan desde el tag fijado en `router-docs.json`.

```json
{
  "repository": "https://github.com/BaldrVivaldelli/baldr-router",
  "ref": "v0.20.0"
}
```

## Garantía de sincronización

1. CI obtiene exactamente el tag configurado.
2. `npm run sync:check` vuelve a generar cada documento en memoria.
3. El job falla si una copia cambió, falta o sobra.
4. Cada página muestra el tag, enlace canónico y digest de su fuente.

Para actualizar la referencia se cambia el tag y se ejecuta:

```bash
BALDR_ROUTER_SOURCE=../baldr-router npm run sync:router-docs
npm run check
```

## Entradas recomendadas

- [Arquitectura](/baldr-site/reference/router/architecture/)
- [External Agent Runtime](/baldr-site/reference/router/external-agent-runtime/)
- [Builder Protocol](/baldr-site/reference/router/builder-protocol/)
- [Orquestación durable](/baldr-site/reference/router/durable-orchestration/)
- [Operación de Agent Manager](/baldr-site/reference/router/agent-manager-operations/)
