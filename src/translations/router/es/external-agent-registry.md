# Resolución de agentes externos

Baldr coordina agentes que siguen siendo propiedad de terceros y se ejecutan fuera del router. Un vínculo externo usa cuatro contratos separados:

```text
AgentRef
  -> AgentResolver
      -> AgentManifest
          -> verificación de política de AgentGateway
              -> conector de transporte
                  -> agente de propiedad externa
```

El descubrimiento está separado deliberadamente de la resolución:

```text
AgentSource --solo metadata--> AgentManifest candidato
                                  |
                                  | sincronización explícita del catálogo
                                  v
AgentResolver --AgentRef exacto + digest--> ResolvedAgent
```

Un `AgentSource` indica dónde viven los agentes externos y devuelve metadata inerte de candidatos. No puede volver ejecutable a un candidato, otorgar permisos, registrar una versión ni cargar código del agente. La registración y la resolución exacta siguen siendo pasos separados, por lo que simplemente apuntar Baldr a una fuente no tiene efectos de ejecución.

El registro local es el resolver de bootstrap. Solo contiene metadata: Baldr lee el manifiesto, verifica su identidad e invoca el conector declarado. No importa ni evalúa código del agente desde el archivo de registro.

## Agent Sources v1

Cada resultado de descubrimiento implementa [`agent-source-v1.schema.json`](../contracts/agent-source-v1.schema.json). Cada candidato contiene:

- un `AgentManifest` completo, con versión exacta, y su digest canónico;
- id de fuente, tipo de fuente, id nativo, scope y un localizador sin secretos;
- un estado de disponibilidad (`available`, `shadowed` o `unavailable`);
- metadata visual opcional y warnings acotados.

Los adaptadores iniciales son:

- `KiroAgentSource`, que lee definiciones JSON normales en directorios `.kiro/agents` del workspace/globales y analiza únicamente filas built-in de `kiro-cli agent list`. No invoca ningún agente. Las versiones de archivos se derivan del digest completo de la definición; los built-ins se fijan a la versión de Kiro CLI y se vuelven a verificar antes de la invocación. Las definiciones del workspace marcan explícitamente como shadowed una definición global con el mismo nombre.
- `AgentManagerSource`, que adapta el catálogo autenticado existente del manager sin resolver ni invocar candidatos.
- `ManifestAgentSource`, que lee el mismo documento v1 desde un archivo JSON acotado sin symlink o un endpoint HTTPS. HTTP plano requiere una bandera explícita de piloto loopback y las credenciales se referencian únicamente por nombre de variable de entorno.

Previsualizá estas fuentes sin registrar nada:

```text
baldr-router agent discover --source kiro --workspace .
baldr-router agent discover --source manager --workspace .
baldr-router agent discover --source file --path ./agents.source.json \
  --expected-source-id product.agents
baldr-router agent discover --source endpoint \
  --endpoint https://agents.example.test/v1/source \
  --authorization-env PRODUCT_AGENT_SOURCE_TOKEN \
  --expected-source-id product.agents
```

Los documentos fuente y manifiestos no pueden contener credenciales inline. Los valores de autorización del endpoint permanecen fuera del output público y las URL de procedencia rechazan userinfo, query strings y fragments. La capa de sincronización del catálogo consume estos candidatos mediante un preview/diff explícito antes de cambiar el registro local.

## Preview y sincronización del catálogo

El workflow normal tiene solo dos comandos:

```text
# Preview de solo lectura: new, new-version, unchanged, disabled, unavailable,
# absent, revoked o conflict.
baldr-router agent sync --source kiro --workspace .

# Aplicar adiciones seguras y coincidencias exactas. Los agentes ausentes se conservan por defecto.
baldr-router agent sync --source kiro --workspace . --apply
```

El preview implementa [`agent-catalog-sync-v1.schema.json`](../contracts/agent-catalog-sync-v1.schema.json) e incluye un digest del baseline del registro y la propiedad de la fuente. Aplicar dos veces el mismo resultado no hace nada. Una definición modificada del agente crea una versión exacta nueva; el sincronizador nunca sobrescribe un `AgentRef` o digest existente.

La propiedad es conservadora:

- una versión publicada por sincronización es `managed` por esa fuente;
- una versión idéntica registrada manualmente solo es `observed`;
- las versiones observed conservan su estado manual enabled/disabled;
- únicamente las versiones managed pueden recibir decisiones automáticas de ciclo de vida desde su fuente.

Las versiones managed ausentes o shadowed se conservan salvo que un operador proporcione una decisión explícita:

```text
baldr-router agent sync --source kiro --workspace . --apply \
  --missing-action disable
```

Si el descubrimiento tiene algún warning, disable/revoke se rechaza porque el catálogo podría estar incompleto. Los cambios de ciclo de vida también se rechazan mientras un run durable activo referencia la versión. La revocación irreversible requiere además el id exacto de fuente mostrado en el preview:

```text
baldr-router agent sync --source kiro --workspace . --apply \
  --missing-action revoke --confirm-revoke kiro.local
```

Las revocaciones locales no pueden habilitarse ni eliminarse. Las eliminaciones normales de versiones disabled dejan un tombstone inmutable del digest, por lo que quitar una entrada del registro no puede usarse para volver a publicar contenido diferente bajo la misma versión. La propiedad de la fuente y los eventos de auditoría acotados viven junto al registro en un sidecar privado `*.sync.json`; inspeccioná los conteos seguros y el último evento con `baldr-router agent sync-status`.

## Referencias exactas de agentes

Las referencias tienen esta forma:

```text
registry://namespace/name@version
```

Por ejemplo:

```text
local://kiro/baldr-worker@1.0.0
company://cyber/threat-analyzer@3.1.0
```

Se rechazan query strings, fragments y referencias sin versión. Cada manifiesto tiene un digest SHA-256 canónico. Baldr resuelve ese digest antes de crear el snapshot inmutable del workflow y luego registra referencia, digest, registro y transporte en cada participante durable.

Cambiar el contenido de una versión ya resuelta produce una discrepancia de digest en lugar de cambiar silenciosamente un workflow reanudado.

Para agentes Kiro respaldados por archivos, un destino de proveedor puede además vincular el manifiesto a la definición exacta del agente externo:

```json
{
  "provider": "kiro-cli",
  "agent": "baldr-worker",
  "definition_scope": "global",
  "definition_digest": "sha256:<digest of ~/.kiro/agents/baldr-worker.json>"
}
```

Cuando estos campos están presentes, Baldr verifica antes de cada invocación un archivo JSON normal, sin symlink y de hasta 1 MiB; comprueba que su `name` coincida con `target.agent` y compara su SHA-256. Una definición global también falla de forma cerrada si `.kiro/agents/<agent>.json` en el workspace activo pudiera hacerle shadow. Versioná una definición con escritura bajo un AgentRef nuevo en lugar de cambiar el archivo detrás de una referencia existente.

## Registro local

La ruta predeterminada es:

```text
${XDG_CONFIG_HOME:-~/.config}/baldr-router/agents.json
```

`BALDR_AGENT_REGISTRY_PATH` puede seleccionar otro archivo. El archivo debe implementar [`agent-registry-v1.schema.json`](../contracts/agent-registry-v1.schema.json) y está limitado a 1 MiB y 1.000 manifiestos.

Hay un ejemplo compatible con Kiro en [`examples/agents.local.json`](../examples/agents.local.json). Apunta al adaptador `kiro-cli` y nombre de agente existentes; el agente Kiro permanece externo.

Usá la CLI administrativa en lugar de editar directamente el archivo JSON:

```text
baldr-router agent list --workspace .
baldr-router agent inspect local://kiro/baldr-worker@1.0.0
baldr-router agent publish local://codex/reviewer@1.0.0 \
  --owner product --transport provider --target provider=codex \
  --capability workspace.read
baldr-router agent disable local://codex/reviewer@1.0.0
baldr-router agent enable local://codex/reviewer@1.0.0
baldr-router agent remove local://codex/reviewer@1.0.0
```

Publicar la misma referencia con contenido diferente se rechaza; usá una versión nueva. La eliminación requiere que la versión exacta esté disabled y falla mientras un run durable activo todavía la referencia. Las escrituras son atómicas y el archivo de registro permanece privado para el usuario local.

Configurá un perfil de rol para vincular la referencia inmutable:

```toml
[execution_profiles.external-kiro]
agent_ref = "local://kiro/baldr-worker@1.0.0"
agent_manifest_digest = "sha256:7e4ed0661ea2e464e7eb2ed17e24281c17a8a2ef39cde1dfcf41a8bd1d8c4b75"

[roles.architect]
profiles = ["external-kiro"]
```

Los campos legacy `provider`, `model`, `agent` y `runner` siguen siendo válidos. Un `agent_ref` vacío sigue exactamente el camino anterior de ProviderRegistry, lo que mantiene compatibles las configuraciones y snapshots durables existentes.

## Resolver el equipo

Los workspaces nuevos usan de forma predeterminada la resolución de equipo `automatic`. Baldr evalúa el catálogo registrado de manera independiente para planificación, ejecución y revisión. Un candidato debe estar enabled, ready, tener digest válido y ser compatible con las capacidades del rol. La ejecución requiere además `workspace.write` y `effect_mode = "workspace-write"`; las etapas de lectura prefieren el menor privilegio. Las referencias exactas configuradas, capacidades específicas del rol, la versión semántica más nueva y finalmente la forma léxica del AgentRef producen un ordenamiento determinístico.

Si no hay un agente externo compatible listo, Baldr conserva el perfil normal configurado de Codex/Kiro y registra ese fallback en el snapshot durable. Los workspaces persistidos existentes migran como `configured`, por lo que una actualización nunca cambia silenciosamente su equipo.

El menú de VS Code expone únicamente tres opciones normales: automático, fijar un agente a una etapa o usar Codex/Kiro normalmente. Un pin es un override explícito de AgentRef; un pin ausente, disabled, revoked o incompatible falla con un error legible en lugar de seleccionar silenciosamente otro agente. El digest exacto del manifiesto todavía se resuelve y congela cuando inicia el run.

Las mismas opciones están disponibles para otros clientes:

```text
baldr-router facade setup . --team-mode automatic
baldr-router facade setup . --team-mode automatic \
  --agent-override reviewer=local://kiro/security-reviewer@1.0.0
baldr-router facade setup . --team-mode configured --clear-agent-overrides
```

La decisión durable implementa [`agent-team-resolution-v1.schema.json`](../contracts/agent-team-resolution-v1.schema.json).

## Frontera de política

El registro no puede otorgar permisos. Antes de la invocación, el gateway intersecta la solicitud del workflow con las capacidades y modo máximo de efectos declarados por el manifiesto. Un paso con escritura requiere `workspace.write` y `effect_mode = "workspace-write"`; siguen aplicándose las verificaciones normales de confianza del workspace, sandbox y autorización del operador.

Los destinos del registro no pueden contener tokens inline, contraseñas, API keys ni otras credenciales. Los futuros resolvers remotos deberían devolver referencias de credenciales cuyos valores se obtengan del secret manager del despliegue.

El adaptador Kiro también tolera actividad observable de herramientas antes del informe JSON solicitado. Se eliminan secuencias de control de terminal y solo se acepta un valor JSON completo, por lo que los logs de herramientas no degradan un resultado estructurado válido a un resumen opaco.

`baldr-router kiro-mcp-status` diagnostica el registro MCP organizacional opcional de Kiro por separado de la salud central de agentes. Esta separación evita que una caída del registro MCP deshabilite la ejecución Codex/Kiro o provoque probes recursivos de inicio MCP.

## Reemplazar el registro local

`AgentResolver` es independiente del formato de archivo. Agent Manager puede implementar el mismo contrato de resolución por referencia exacta y devolver la misma metadata `ResolvedAgent`. Los workflows y el motor durable no necesitan saber si un manifiesto vino del archivo bootstrap, un catálogo empresarial o un control plane SaaS.

El transporte `provider` envuelve los adaptadores actuales Codex/Kiro. El conector independiente `local-process` ejecuta artefactos externos fijados por digest mediante `baldr-agent-runner`; HTTP puede usar su sobre legacy compatible o el sobre neutral de transporte execution v1. Los futuros conectores MCP, queue y container todavía pueden registrarse detrás de `AgentGateway` sin almacenar sus agentes en Baldr.

El primer conector independiente y la implementación persistente del manager se describen en [`external-agent-http.md`](external-agent-http.md). Agregan el transporte `http-json` de solo lectura, resolución remota exacta, contratos de catálogo y salud, y el selector de agentes de VS Code.

El SDK, runner local, frontera del workspace y ciclo de vida de ejecución se describen en [`external-agent-runtime.md`](external-agent-runtime.md).
