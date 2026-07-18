---
title: "Operación del Agent Manager"
description: "Referencia técnica de Baldr sincronizada desde v0.20.0."
editUrl: false
---

:::note[Fuente canónica · v0.20.0]
Esta página se genera desde [`agent-manager-operations.md`](https://github.com/BaldrVivaldelli/baldr-router/blob/v0.20.0/docs/agent-manager-operations.md). No la edites en este repositorio.
Digest de la fuente: `6deabd23cd7d3920be123974fc49246547c7f2a2abacfb64ac83e29255c75bac`.
:::
Agent Manager es el control plane del catálogo de Baldr. Almacena manifiestos inmutables y su estado de ciclo de vida; no aloja código de agentes, no actúa como proxy de credenciales de modelos ni reemplaza los runtimes externos de Codex/Kiro.

## Frontera de confianza

Ejecutá el servicio detrás de TLS y una frontera de red autenticada. El servidor HTTP incluido es adecuado como proceso de aplicación; la terminación TLS, los límites de tasa y la admisión de red pertenecen al reverse proxy o service mesh del despliegue. Los clientes de Baldr solo aceptan HTTP plano para un despliegue loopback habilitado explícitamente.

Las credenciales nunca se escriben en una política, manifiesto, fila SQLite, evento de auditoría ni respuesta de API. Una política nombra variables de entorno y el servicio resuelve sus valores una vez al iniciar. Para rotar una credencial, actualizá el proveedor de secretos y reiniciá el proceso.

## RBAC y tenancy

Creá un esqueleto de política:

```text
baldr-router agent-manager init-policy ./manager-policy.json \
  --registry company \
  --principal-id product-publisher \
  --credential-env PRODUCT_MANAGER_TOKEN \
  --role publisher \
  --tenant product \
  --owner-scope product-team
```

Agregá más principales al JSON según sea necesario. La política implementa `baldr-agent-manager-policy` v1. Sus roles son intencionalmente pequeños:

| Rol | Permisos |
|---|---|
| `reader` | salud, catálogo acotado y resolución exacta |
| `publisher` | permisos de reader más publicación inmutable |
| `operator` | permisos de reader más enable, disable, revoke y métricas |
| `auditor` | salud, auditoría acotada y métricas |
| `admin` | todas las acciones |

El namespace de un AgentRef es la frontera del tenant. Por ejemplo, `company://product/reviewer@2.0.0` pertenece al tenant `product`. La publicación también comprueba el `owner` del manifiesto contra los alcances de propietario del principal. `"*"` se acepta únicamente como valor único del alcance y debería reservarse para una cantidad pequeña de administradores. Catálogos, resolución, métricas y auditoría se filtran en el servidor; un cliente no puede seleccionar otro tenant mediante un parámetro de la solicitud.

Iniciá el servicio:

```text
export PRODUCT_MANAGER_TOKEN="<value supplied by the deployment secret store>"
baldr-router agent-manager serve \
  --host 127.0.0.1 --port 8766 \
  --registry company \
  --database /var/lib/baldr/agent-manager.sqlite3 \
  --policy /etc/baldr/manager-policy.json
```

El modo anterior `--authorization-env` continúa siendo compatible y asigna una credencial a un principal `admin` con wildcard. Los despliegues compartidos o remotos nuevos deberían usar una política para que publicación, operación y auditoría sean autoridades separadas.

## Publicar un agente de propiedad externa

El archivo de publicación contiene la ubicación externa y la referencia de credencial, no código ejecutable ni un valor secreto:

```text
baldr-router agent-manager init-manifest ./reviewer.agent.json \
  company://product/reviewer@2.0.0 \
  --owner product-team \
  --transport http-json \
  --target endpoint=https://agents.example.test/v1/review \
  --target authorization_env=PRODUCT_AGENT_TOKEN \
  --capability workspace.read

baldr-router agent-manager validate-manifest ./reviewer.agent.json
baldr-router agent-manager publish-file ./reviewer.agent.json
```

El mismo flujo está disponible para integraciones Python mediante `AgentManagerPublisher`, `write_agent_publication` y `load_agent_publication`. La publicación es idempotente para el mismo digest. Se rechaza un manifiesto diferente bajo un AgentRef existente; publicá una nueva versión exacta en su lugar.

## Probes, métricas y auditoría

El servicio expone:

```text
GET /livez             vida del proceso sin autenticar, sin datos de catálogo
GET /readyz            disponibilidad de base de datos/schema sin autenticar
GET /v1/health         autenticado, conteos de catálogo acotados al tenant
GET /v1/metrics        operator/auditor/admin, contadores acotados al tenant
GET /v1/audit          auditor/admin, paginación acotada por cursor
```

Cada decisión autenticada de catálogo, resolución y administración se registra con request id, principal id, tenant, acción, AgentRef, resultado, estado y un código de detalle fijo. No se registran los cuerpos de las solicitudes, destinos de transporte, credenciales ni texto de error arbitrario. Triggers de SQLite rechazan actualizaciones y eliminaciones de la tabla de auditoría.

Comandos útiles del cliente:

```text
baldr-router agent-manager status
baldr-router agent-manager metrics
baldr-router agent-manager audit --after 0 --limit 100
```

## Actualización, backup y recuperación

La base de datos migra hacia adelante cuando el servicio o `doctor` la abre. La versión actual del schema y los conteos durables pueden verse sin iniciar HTTP:

```text
baldr-router agent-manager doctor \
  --registry company --database /var/lib/baldr/agent-manager.sqlite3
```

Antes de una actualización, detené los escritores o usá el comando de backup online de SQLite:

```text
baldr-router agent-manager backup \
  --registry company \
  --database /var/lib/baldr/agent-manager.sqlite3 \
  --output /var/backups/baldr/agent-manager-before-0.20.0.sqlite3
```

Los backups se crean como archivos privados nuevos y nunca sobrescriben una ruta existente. Probá la restauración ejecutando `doctor` contra una copia antes de cambiar la base de producción. Hacé rollback de la aplicación únicamente con una versión de schema de base de datos que el release anterior comprenda; de lo contrario, restaurá el backup previo a la actualización.

Las alertas operativas deberían cubrir fallas de readiness, crecimiento de solicitudes denegadas/fallidas, versiones del catálogo deshabilitadas o revocadas inesperadamente y antigüedad del backup. La retención/exportación de auditoría es política del despliegue: el store incluido es append-only y no elimina evidencia silenciosamente.
