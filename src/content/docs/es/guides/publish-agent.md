---
title: Publicar un agente
description: Construir un artefacto reproducible y publicar una versión inmutable.
---

## Construir

```bash
baldr-agent build
```

Builder inventaría las fuentes, calcula su digest y selecciona un driver exacto.
El resultado debe ser portable y no conservar rutas al checkout, entornos
virtuales o `node_modules` locales.

## Publicar

```bash
baldr-agent publish
baldr-agent doctor
```

La publicación instala el artefacto en una ruta estable, genera un manifiesto
por rol y activa las identidades en el catálogo local. Para Agent Manager:

```bash
baldr-agent publish --catalog manager
```

## Evolucionar

Si cambian fuentes, capacidades, roles, ownership o metadata, incrementá
`version` en `baldr-agent.toml`. La versión anterior permanece disponible.

```bash
baldr-agent rollback 1.0.0
```

Rollback reactiva un release conocido; no reescribe su contenido.

Siguiente: [ejecutar el agente](../run-agent/).
