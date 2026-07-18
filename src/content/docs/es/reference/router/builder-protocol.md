---
title: "Builder Protocol v1"
description: "Referencia técnica de Baldr sincronizada desde v0.20.0."
editUrl: false
---

:::note[Fuente canónica · v0.20.0]
Esta página se genera desde [`builder-protocol.md`](https://github.com/BaldrVivaldelli/baldr-router/blob/v0.20.0/docs/builder-protocol.md). No la edites en este repositorio.
Digest de la fuente: `153f8914914c99d3ca8dcc44c5042fa6d4401a037b1a1faf4af521f49e4b69d7`.
:::
Builder Protocol separa las herramientas para desarrolladores de las implementaciones de build específicas de cada lenguaje. Un SDK continúa siendo una biblioteca de autoría; no importa ni inicia Builder. La CLI, integración de IDE o cliente CI llama a Builder, y Builder selecciona un driver para el lenguaje del proyecto.

```text
fuente del agente ──importa──> SDK Python / TypeScript / futuro
     │
     └──> CLI, IDE o CI ──> BuilderClient ──> backend de Builder
                                                   │
                       protocolo JSONL de driver <─┤
                              │                    │
                       driver Python        driver TypeScript
```

Los tres schemas públicos de v1 son:

- [`builder-protocol-v1.schema.json`](https://github.com/BaldrVivaldelli/baldr-router/blob/v0.20.0/contracts/builder-protocol-v1.schema.json): semántica del servicio entre cliente y Builder;
- [`builder-driver-v1.schema.json`](https://github.com/BaldrVivaldelli/baldr-router/blob/v0.20.0/contracts/builder-driver-v1.schema.json): semántica del proceso entre Builder y el driver del lenguaje;
- [`builder-driver-registration-v1.schema.json`](https://github.com/BaldrVivaldelli/baldr-router/blob/v0.20.0/contracts/builder-driver-registration-v1.schema.json): metadata de descubrimiento portable para drivers de proceso.

## Transporte actual

El backend local inicia un proceso acotado para una operación e intercambia exactamente un objeto JSON por línea en cada dirección. La salida estándar está reservada para la respuesta; los diagnósticos pertenecen en el error estándar. `describe`, `test` y `build` identifican al driver mediante id, versión y digest SHA-256 exactos.

Las solicitudes llevan un digest de la fuente y un localizador del workspace, no bytes de la fuente. Los resultados llevan un digest del artefacto y una ruta local, no el artefacto mismo. Una implementación remota reemplazará esos localizadores locales por URI de CAS manteniendo estables los mensajes semánticos. Esto evita convertir JSON, Protobuf o una base de datos en un transporte ineficiente de artefactos.

Cada operación tiene una clave de idempotencia derivada de su entrada semántica. El backend local síncrono deriva un job id estable de esa clave; un futuro backend durable puede reutilizar la misma identidad para operaciones de estado, eventos y cancelación. El backend vuelve a comprobar el digest del workspace inmediatamente antes de ejecutar el driver, y el driver lo verifica otra vez antes de probar o construir.

`network = "inherit"` es intencional para el driver local actual. Registra que el hijo hereda la red del host; no afirma falsamente que exista sandboxing. Los backends pueden aceptar `disabled` o `enabled` únicamente cuando pueden aplicar esa política.

## Por qué JSON ahora y Protobuf después

Los proyectos Apache no usan una única codificación para todas las capas. Spark Connect envía planes lógicos neutrales al lenguaje mediante gRPC con Protocol Buffers, mientras que la API REST de monitoreo de Spark devuelve JSON. Arrow Flight usa Protobuf/gRPC para comandos y metadata, pero Arrow IPC para el flujo de datos masivos. La división sigue la responsabilidad de cada canal:

- JSON/JSONL es fácil de inspeccionar, probar con fixtures e implementar desde un ejecutable local en cualquier lenguaje;
- Protobuf/gRPC es valioso para una API remota de larga duración con clientes generados, streaming, deadlines y reglas explícitas de compatibilidad;
- los artefactos binarios y paquetes fuente grandes pertenecen en CAS/object storage y se referencian por digest.

Ejemplos oficiales: [descripción general de Spark Connect](https://spark.apache.org/docs/latest/spark-connect-overview.html), [API REST de monitoreo de Spark](https://spark.apache.org/docs/3.5.7/monitoring.html) y [protocolo Arrow Flight](https://arrow.apache.org/docs/format/Flight.html).

Por lo tanto, Baldr no agrega un archivo `.proto` especulativo en v1. Cuando exista un servicio Builder remoto, su API gRPC será un segundo binding de estas operaciones probadas. Las pruebas de compatibilidad deben alimentar solicitudes JSONL y gRPC equivalentes a la misma suite de backend y exigir resultados equivalentes.

## Configuración neutral del proyecto

El schema v2 de `baldr-agent.toml` reemplaza el `entry_module` específico de Python por `language`, `entrypoint` y un id exacto opcional de driver. Los proyectos Python existentes con schema v1 continúan siendo aceptados y se construyen con `baldr.python`; no se requiere migrar fuentes.

El registro local siempre expone el driver Python incorporado y descubre drivers adicionales desde:

1. manifiestos de registración enumerados en `BALDR_BUILDER_DRIVER_PATHS`;
2. manifiestos persistidos bajo `${XDG_CONFIG_HOME:-~/.config}/baldr-agent/builder-drivers`;
3. ejecutables llamados `baldr-builder-driver-*` en `PATH`.

Cada candidato debe responder `describe-request`. Builder fija entonces su `id + version + digest` exacto en la solicitud de operación y rechaza implementaciones ausentes, ambiguas o modificadas. Los operadores pueden inspeccionar y persistir el mismo contrato con:

```bash
baldr-agent driver list
baldr-agent driver doctor baldr.typescript
baldr-agent driver conformance baldr.typescript --project /path/to/agent
baldr-agent driver register /path/to/baldr-builder-driver.json
```

`driver conformance` es el gate neutral de compatibilidad para cada driver descubierto. Contra un proyecto de agente real exige `id + version + digest` estable, rechaza una versión no soportada del protocolo, ejecuta pruebas, verifica la attestación del artefacto, compara dos builds idénticos byte a byte y rechaza filtraciones de la ruta del checkout. Durante una actualización side-by-side, `--driver-version` o `--driver-digest` selecciona el candidato exacto bajo prueba.

## Slice TypeScript implementado

El primer driver externo vive en `tooling/agent-builder-typescript`. Este:

1. implementa el schema del driver mediante JSONL en stdin/stdout;
2. responde `describe-request` con id, versión, digest, operaciones y destinos exactos;
3. verifica el digest de la fuente y la identidad declarada del proyecto;
4. implementa `test-request` y `build-request`;
5. emite un artefacto Node CommonJS determinístico y autocontenido, y devuelve su SHA-256 sin incorporar el archivo en JSON.

El proyecto generado importa `@baldr/agent-sdk`, mientras Builder y el driver permanecen como procesos separados. `scripts/test_typescript_agent_vertical.py` demuestra el recorrido completo: descubrimiento, pruebas, build reproducible, instalación inmutable, publicación en catálogo y un workflow de Baldr de tres etapas que termina con la aprobación de revisión.
