# Contratos HTTP de agentes externos y Agent Manager

El conector `http-json` de Baldr invoca un agente externo alojado y de solo lectura sin pasar por `ProviderRegistry`. El contrato público del protocolo es [`agent-transport-http-v1.schema.json`](../contracts/agent-transport-http-v1.schema.json).

El destino del manifiesto contiene metadata, nunca valores de credenciales:

```json
{
  "transport": "http-json",
  "target": {
    "endpoint": "https://agents.example.test/v1/invoke",
    "authorization_env": "BALDR_AGENT_HTTP_TOKEN",
    "timeout_seconds": "30"
  }
}
```

`authorization_env` nombra una variable de entorno. Baldr lee su valor únicamente al construir el header HTTP `Authorization` y no lo publica en el estado, la evidencia ni el snapshot durable.

HTTPS es obligatorio. HTTP plano solo se acepta para pilotos en loopback cuando `BALDR_AGENT_ALLOW_INSECURE_LOOPBACK=1` o se utiliza un cliente equivalente habilitado explícitamente. Se rechazan las redirecciones, credenciales en la URL, mensajes demasiado grandes y respuestas con un tipo de contenido o contrato incorrecto.

El transporte HTTP v1 es intencionalmente de solo lectura. No envía al proceso remoto la ruta del workspace local ni el entorno del proveedor hijo. Los agentes con escritura requieren un conector que pueda demostrar su límite de workspace compartido o aislado; el piloto de compatibilidad con Kiro continúa usando el conector de proveedor existente para ese propósito.

Para endpoints nuevos, agregá `"protocol": "agent-execution-v1"` al destino. La solicitud implementa entonces el sobre compartido de invocación/resultado [`agent-execution-v1`](../contracts/agent-execution-v1.schema.json), incluida la identidad inmutable, los IDs durables, el timeout y la idempotencia. La raíz del workspace es explícitamente `null`, por lo que este modo HTTP permanece de solo lectura. Los endpoints sin ese campo de destino continúan recibiendo sin cambios el contrato original `baldr-agent-invocation`.

## Agent Manager v1

El Agent Manager opcional se configura sin almacenar el valor de una credencial:

```toml
[agent_manager]
enabled = true
registry = "manager"
base_url = "https://agent-manager.example.test"
authorization_env = "BALDR_AGENT_MANAGER_TOKEN"
timeout_seconds = 10
allow_insecure_loopback = false
catalog_limit = 100
```

El servicio persistente incluido expone endpoints acotados de lectura y administración descritos por [`agent-manager-v1.schema.json`](../contracts/agent-manager-v1.schema.json):

```text
GET /v1/health
GET /v1/agents?limit=100
GET /v1/agents/{namespace}/{name}/versions/{exact-version}
POST /v1/agents
POST /v1/agents/{namespace}/{name}/versions/{exact-version}/enable
POST /v1/agents/{namespace}/{name}/versions/{exact-version}/disable
POST /v1/agents/{namespace}/{name}/versions/{exact-version}/revoke
GET /v1/audit?after=0&limit=100
GET /v1/metrics
GET /livez
GET /readyz
```

Iniciá una instancia loopback respaldada por SQLite y configurá el cliente con:

```text
export BALDR_AGENT_MANAGER_TOKEN="<local secret>"
baldr-router agent-manager serve --database ~/.local/state/baldr-router/agent-manager.sqlite3
baldr-router agent-manager configure --registry manager --base-url http://127.0.0.1:8766 \
  --authorization-env BALDR_AGENT_MANAGER_TOKEN --allow-insecure-loopback
```

`publish`, `enable`, `disable`, `revoke` y `status` están disponibles debajo de `baldr-router agent-manager`. Las versiones exactas publicadas son inmutables; la revocación es irreversible. El servicio almacena únicamente manifiestos y estado, y la credencial configurada se referencia por el nombre de la variable de entorno en lugar de persistir su valor.

Para despliegues con múltiples equipos, pasá `--policy` en lugar de compartir la credencial legacy de un único administrador. La política versionada asigna principales respaldados por el entorno a roles de reader, publisher, operator, auditor o admin, y limita su alcance por namespace (tenant) de AgentRef y propietario del manifiesto. Los archivos de publicación, el procedimiento de backup/upgrade, los probes y la semántica de auditoría se documentan en [`agent-manager-operations.md`](agent-manager-operations.md).

La resolución acepta únicamente el `AgentRef` exacto solicitado. El manifiesto devuelto debe validar su propio digest SHA-256; un digest durable esperado también debe coincidir. Por lo tanto, un manager no puede reemplazar silenciosamente una versión de agente durante un workflow reanudado.

`baldr-router agent-catalog` combina metadata segura local y del manager, salud, versión y la última ejecución durable sin devolver destinos de transporte. En VS Code elegí **Agentes externos** desde el menú de suma o **Equipo de Baldr → Usar un agente externo registrado**. El selector filtra capacidades para la fase elegida, crea el perfil inmutable y lo asigna sin requerir edición manual de TOML o JSON. **Equipo de Baldr → Administrar agentes externos** registra y administra el catálogo bootstrap local; **Volver a Codex o Kiro normal** elimina el vínculo externo de un rol sin cambiar los demás.
