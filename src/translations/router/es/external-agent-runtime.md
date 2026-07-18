# Runtime de agentes externos v1

Baldr puede coordinar agentes cuyo código, prompts y ciclo de release permanecen en otro repositorio. Baldr almacena únicamente su identidad y ubicación inmutables; no importa código de agentes de producto dentro del router.

```text
repositorio externo del agente                 infraestructura Baldr

código del agente + pruebas
       | importa
       v
baldr-agent-sdk       baldr-agent.toml
       |                     |
       +-- empaquetado por --+---> baldr-agent-builder
                                      |
                                artefacto + manifiesto
                                      |
                                      v
                           Agent Manager / registro local
                                      |
                                resolución exacta
                                      v
                                 AgentGateway
                                      |
                               baldr-agent-runner
                                      |
                           frontera explícita del workspace
```

El protocolo público es [`agent-execution-v1.schema.json`](../contracts/agent-execution-v1.schema.json). Cubre salud, aceptación de invocaciones, estado, eventos paginados, cancelación y resultados terminales. Cada invocación lleva el `AgentRef` exacto, digest del manifiesto, capacidades, modo de efectos, IDs durables de run/step/attempt, timeout y clave de idempotencia.

## Fronteras del monorepo

El monorepo contiene únicamente infraestructura:

```text
contracts/agent-execution-v1.schema.json  contrato wire
sdks/python/                              SDK público de autoría
sdks/typescript/                          SDK público TypeScript de autoría
tooling/agent-builder/                    toolchain de build y release
tooling/agent-builder-typescript/         driver externo de build TypeScript
runtimes/agent-runner/                    proceso local del data plane
router/                                   resolución, política y orquestación
```

La toolchain puede extenderse a otros lenguajes mediante [`Builder Protocol v1`](builder-protocol.md). Los SDK siguen siendo únicamente de autoría; las herramientas de desarrollo llaman a Builder, y Builder delega pruebas y empaquetado a un driver de lenguaje exacto e identificado por contenido.

El equipo propietario mantiene el agente real en su propio repositorio, lo versiona, construye el artefacto ejecutable y publica un manifiesto. Se permite un fixture dentro de un directorio de pruebas; un agente real de producto no es un componente de Baldr.

## Instalar desde este checkout

Instalá el control plane y el runner independiente en entornos visibles en el mismo `PATH`:

```bash
uv tool install --force --editable ./router
uv tool install --force --editable ./runtimes/agent-runner \
  --with-editable ./sdks/python \
  --with-editable ./tooling/agent-builder \
  --with-executables-from baldr-agent-builder

baldr-agent-runner health
baldr-agent --help
```

El SDK es la única biblioteca de Baldr importada por la fuente de un agente externo:

```bash
uv add baldr-agent-sdk
```

El release produce wheels separados de `baldr-router`, `baldr-agent-sdk`, `baldr-agent-builder` y `baldr-agent-runner`. Esto mantiene autoría, ciclo de vida y ejecución desplegables de forma independiente; VS Code, Kiro, Codex y MCP continúan usando las superficies existentes del router. El runtime privado de VS Code incorpora el router como antes, por lo que un agente local-process requiere además `baldr-agent-runner` en el `PATH` del runtime (o un `BALDR_AGENT_RUNNER_COMMAND` explícito que apunte a su ejecutable).

## Ciclo de vida del repositorio

Agent Builder instala `baldr-agent`, mantiene el código del agente en el repositorio del equipo propietario y expone un ciclo de vida neutral al lenguaje:

```bash
baldr-agent init ./product-agents \
  --name repository-report \
  --owner product-team \
  --namespace product \
  --language python  # o typescript
cd product-agents
baldr-agent test
baldr-agent driver conformance baldr.python
baldr-agent build
baldr-agent publish
baldr-agent doctor
baldr-agent run \
  --role implementer \
  --workspace /ruta/al/workspace \
  --request "Generá el resultado"
```

El schema v2 generado de `baldr-agent.toml` declara identidad exacta, versión, lenguaje, entrypoint, driver, roles, capacidades, fuentes y pruebas. Los proyectos Python existentes con schema v1 continúan siendo compatibles. `build` emite un `.pyz` Python determinístico o un `.cjs` Node autocontenido; ambos incorporan su runtime de SDK público, por lo que el release no tiene rutas relativas a un checkout de Baldr, entorno virtual del proyecto ni `node_modules`. `publish` lo copia a `${XDG_DATA_HOME:-~/.local/share}/baldr-agent/artifacts/<registry>/<namespace>/<project>/<version>/`, genera los manifiestos únicamente después de esa instalación estable, sincroniza el catálogo local y activa la versión exacta. Usá `--catalog manager` para publicar los mismos manifiestos mediante Agent Manager.

Las versiones exactas son inmutables: la definición portable del proyecto se incluye en el digest del artefacto, volver a publicar un release idéntico es idempotente y se rechazan cambios de fuente, roles, capacidades, propiedad, efectos o metadata del manifiesto bajo una versión instalada. Incrementá `version` en `baldr-agent.toml`, publicá nuevamente y usá `baldr-agent rollback VERSION` si el equipo necesita reactivar un release local anterior. Baldr almacena identidad, digest y ubicación estable; sigue sin ser propietario de la fuente del agente.

## Crear un agente Python externo

```python
from baldr_agent_sdk import Agent

agent = Agent(
    ref="company://product/reviewer@1.0.0",
    owner="product-team",
    capabilities=("workspace.read", "role.reviewer"),
)


@agent.invoke
def review(request, context):
    context.emit("verifying", "Review completed")
    return {
        "ok": True,
        "final_report": {
            "status": "approved",
            "summary": "No material defects found",
            # Include the remaining Baldr final-report fields used by the role.
        },
    }


if __name__ == "__main__":
    raise SystemExit(agent.serve_stdio())
```

Generá un manifiesto local-process desde el artefacto construido:

```python
manifest = agent.local_process_manifest(
    command="python",
    arguments=("/opt/product-agents/reviewer.py",),
    artifact_path="/opt/product-agents/reviewer.py",
    timeout_seconds=900,
)
Agent.write_manifest("reviewer.agent.json", manifest)
```

El manifiesto fija tanto su digest de contenido canónico como el SHA-256 del artefacto. Cambiar el programa requiere una nueva versión inmutable de AgentRef y un nuevo manifiesto. Publicalo mediante `baldr-router agent publish`/Agent Manager o sincronizá una fuente de manifiestos como se describe en [`external-agent-registry.md`](external-agent-registry.md).

`driver conformance` es el gate de release de una implementación de lenguaje. Comprueba identidad estable del driver, negociación fail-closed del protocolo, pruebas reales del proyecto, attestación del artefacto, bytes reproducibles y reubicación fuera del checkout fuente. `run` construye e instala un release exacto efímero, invoca el rol seleccionado mediante Agent Runner y elimina esa instalación después de la invocación. Nunca evita el efecto de lectura/escritura declarado por el rol.

## Crear un agente TypeScript externo

```ts
import { Agent } from "@baldr/agent-sdk";

const agent = new Agent({
  ref: process.env.BALDR_AGENT_REF!,
  owner: "product-team",
  capabilities: ["workspace.read", "role.reviewer"],
});

agent.invoke((_request, context) => {
  context.emit("verifying", "Review completed");
  return {
    ok: true,
    final_report: { status: "approved", summary: "No material defects found" },
  };
});

process.exitCode = await agent.serveStdio();
```

Registrá `tooling/agent-builder-typescript/baldr-builder-driver.json`, o colocá su ejecutable en `PATH`, y luego usá el mismo ciclo de vida `baldr-agent test`, `build` y `publish`. Ejecutá `baldr-agent driver conformance baldr.typescript` antes de promoverlo. El manifiesto publicado selecciona `node` y fija el digest del artefacto `.cjs`; el runner y el camino de orquestación de Baldr permanecen neutrales al lenguaje.

Los artefactos de release permiten instalar sin un checkout de fuentes:

```bash
npm install --global \
  ./baldr-agent-sdk-0.20.0.tgz \
  ./baldr-agent-builder-typescript-0.20.0.tgz
baldr-agent driver doctor baldr.typescript
```

El paquete global expone `baldr-builder-driver-typescript` en `PATH` y no requiere registración persistida. Después de la publicación en el registro, el driver puede instalarse por nombre de paquete y resuelve la versión exacta coincidente del SDK.

## Frontera del workspace y seguridad

El gateway primero intersecta las capacidades solicitadas con el manifiesto. El runner aplica luego la frontera del data plane:

- `read-only`: se crea un snapshot acotado y descartable sin metadata del repositorio, directorios generados de dependencias/build, symlinks ni archivos especiales; las entradas omitidas nunca se siguen, se quitan los bits de escritura y la ruta original del workspace nunca se envía al agente;
- `workspace-write`: el workspace exacto del workflow se pasa únicamente cuando tanto la fase como el manifiesto declaran `workspace.write`; Baldr ya exige exactamente un participante para cada fase con escritura;
- los artefactos locales deben ser archivos normales sin symlink y coincidir con el SHA-256 fijado inmediatamente antes de ejecutarse;
- el runner inicia un grupo de procesos separado, limita entrada/salida y tiempo, y persiste jobs/eventos en un store SQLite privado;
- las credenciales no pueden aparecer en un destino del manifiesto. El runner local v1 pasa un entorno mínimo; un futuro contrato de proveedor de secretos podrá otorgar credenciales nombradas sin incorporar valores en la metadata.

La cancelación es deliberadamente conservadora. Un job de lectura cancelado queda `cancelled` y puede reintentarse. Un job de escritura cancelado o perdido queda `unknown`, porque el proceso podría haber cambiado el workspace antes de terminar; la reconciliación durable normal decide qué hacer después.

Solo las categorías públicas fijas de actividad `working`, `analyzing`, `researching`, `changing` y `verifying` ingresan al log durable de progreso de Baldr. Los mensajes libres de eventos permanecen en el store privado de eventos del runner y no pueden filtrarse al canal de actividad de la UI.

## Transportes y compatibilidad

- `local-process` usa el runner independiente y soporta lecturas/escrituras explícitas del workspace local.
- `http-json` mantiene compatibilidad hacia atrás con el contrato síncrono original de invocación/resultado de solo lectura. Un destino con `protocol = "agent-execution-v1"` usa el nuevo sobre de invocación/resultado. Su raíz del workspace es `null`; el servicio remoto no recibe una ruta local y no puede pedir escrituras locales.
- `provider` continúa adaptando la ejecución normal de Codex y Kiro. Los perfiles existentes sin `agent_ref` no cambian.

Esto permite que una organización migre un rol por vez. La ausencia de un agente externo compatible todavía hace fallback al perfil Codex/Kiro configurado en modo automático; un agente ausente fijado explícitamente falla de forma visible.

## Semántica de fallas y recuperación

- los reintentos conservan `job_id` y la clave de idempotencia;
- se rechaza reutilizar una clave de idempotencia con contenido diferente;
- los reintentos de trabajos completados devuelven el resultado terminal almacenado sin volver a ejecutar el artefacto;
- las discrepancias de artefacto, identidad y protocolo fallan de forma cerrada;
- las solicitudes de estado y eventos sobreviven al proceso del router que hizo la invocación;
- los timeouts de escritura, cancelación y pérdida del proceso se vuelven `unknown` en lugar de un éxito falso.

## Evolución

El protocolo es neutral al lenguaje. Python y TypeScript ahora implementan el mismo schema y semántica canónica del manifiesto sin cambiar el router. Los futuros SDK y conectores pueden ubicar el runner detrás de un contenedor, job de Kubernetes o queue durable conservando la semántica de `AgentRef`, idempotencia, eventos, cancelación y resultados. Las imágenes de contenedores y consumidores de queues deberían fijar un digest de artefacto/imagen y deben demostrar una frontera del workspace o de efectos externos antes de anunciar capacidades de escritura.
