---
title: "Arquitectura"
description: "Referencia técnica de Baldr sincronizada desde v0.20.0."
editUrl: false
---

:::note[Fuente canónica · v0.20.0]
Esta página se genera desde [`architecture.md`](https://github.com/BaldrVivaldelli/baldr-router/blob/v0.20.0/docs/architecture.md). No la edites en este repositorio.
Digest de la fuente: `d420b1380e326bc237780bc913a36a66583e373af908bd3cf8bd6a7aaf258923`.
:::
## Centro del producto

`baldr-router` es la única implementación del dominio y se expone como servidor MCP.

```text
fachada cliente
  -> contrato de fachada: setup | status | run
  -> proyección pública del progreso del work item
  -> núcleo baldr-router
      -> motor de workflows
      -> registro de proveedores
      -> Context7/caché
      -> telemetría/informes estructurados
      -> defensas de seguridad y recursión
```

## Contrato de fachada compartido

La fuente de verdad es:

```text
contracts/facade-v1.json
contracts/facade-v1.schema.json
```

Define tres intents estables del usuario:

- `setup`: inspección/readiness y configuración opcional de proveedor/Context7;
- `status`: informe compacto de salud y ejecuciones recientes;
- `run`: ejecución del workflow de orquestación congelado.

La continuación de una conversación es una acción interna de `run`, no un cuarto intent de fachada. Un work item durable posee turnos de solicitudes inmutables; cada continuación incrementa la revisión del item, inicia una ejecución relacionada y arrastra únicamente una allowlist acotada del informe final estructurado anterior más el nuevo contexto privado del cliente.

Los archivos generados de fachadas se sincronizan mediante `scripts/generate_facades.py`. La validación estilo CI usa `--check`.

El camino caliente de la consola usa el contrato aditivo `baldr-work-item-progress` v1 en `contracts/work-item-progress-v1.schema.json`. El proyector deriva una narrativa pública acotada desde pasos durables, informes estructurados, checkpoints, publicaciones y eventos de actividad permitidos. Los informes estructurados pueden llevar interpretación explícita, alcance, enfoque, pasos del plan, trabajo completado/siguiente, hallazgos, correcciones y evidencia de verificación; los informes legacy siguen siendo válidos cuando esos campos aditivos no están presentes. Los eventos de inicio de proveedor y comandos se proyectan como `working` genérico, mientras que `changing` y `verifying` requieren evidencia tipada. Es una frontera de presentación: prompts, eventos wire del proveedor, sesiones, leases, raíces privadas, stderr/stdout crudo y razonamiento nunca la atraviesan. `phases`, `workflow` y `timeline` existentes siguen disponibles para clientes compatibles de estado completo; `status --workbench-only` devuelve la proyección compacta sin probes de salud ni payloads internos del workflow.

## Responsabilidades del núcleo

```text
router/src/baldr_router/
```

- prompts y herramientas MCP que tienen sentido para todos los clientes;
- protocolo/registro de proveedores;
- roles y workflows;
- proveedores Codex y Kiro CLI opcional;
- Context7 y caché;
- output estructurado;
- telemetría;
- defensas de recursión/reentrada;
- descubrimiento genérico de extensiones instaladas.

## Responsabilidades de las fachadas

```text
facades/<client>/
```

- instalación y descubrimiento nativos del cliente;
- almacenamiento seguro de secretos;
- alias, slash commands y renderizado de UI;
- hooks específicos del cliente y herramientas de compatibilidad.

Una fachada no debe duplicar lógica de selección de proveedores, ejecución de workflows, reglas de enriquecimiento de Context7, agregación de telemetría ni gates de verificación.

## Extensión nativa de VS Code

```text
extensión de VS Code
  -> una entrada en Command Palette: Baldr: Open
  -> @baldr /setup | /status | /run
  -> registración programática de MCP
  -> runtime Python privado administrado
  -> host primero / fallback WSL
  -> SecretStorage para la clave opcional de Context7
```

La extensión invoca la misma fachada CLI del núcleo y también registra el mismo servidor MCP para el agente general de VS Code.

La fachada de VS Code resuelve la identidad del workspace desde referencias explícitas de Chat, el editor activo, una raíz fijada previamente o un selector multi-root explícito. Captura contexto acotado del editor/selección/buffer sucio/diagnósticos en artefactos privados. El workbench público expone turnos ordenados de solicitudes y una bandera de presencia de contexto, nunca el cuerpo del contexto privado.

## Fachada Kiro

```text
Kiro Power
  -> baldr-kiro-adapter
  -> MCP compartido de baldr-router
```

La materialización de hooks específica de Kiro permanece fuera del núcleo y es idempotente.

## Fachada Agent Plugin

Agent Plugin contiene únicamente archivos de prompts para slash commands y una declaración MCP. Es un camino de distribución secundario y preview que reutiliza el mismo contrato.

## Planos durables de control, código y artefactos

v0.16 mantiene la orquestación determinística en Baldr y trata el output de proveedores como efectos externos:

```text
control plane   -> máquina de estados SQLite + journal de eventos append-only
code plane      -> autorización + escritura puntual + checkpoints durables
artifact plane  -> informes, patches, telemetría y evidencia direccionados por contenido
```

El snapshot del workflow congela al crearse los perfiles de ejecución resueltos, configuración de proveedor/modelo, permisos, límites de rondas y versión del workflow. La recuperación, por lo tanto, no adopta silenciosamente una configuración posterior.

Cada fase referencia uno o varios perfiles de ejecución nombrados. Un único perfil compartido puede respaldar todas las fases, o arquitectura/implementación/revisión pueden usar perfiles n/m/l de forma independiente. Las sesiones de proveedor se identifican por scope, workspace/run, rol, proveedor, modelo/agente y perfil.

El code plane usa **Trabajar directamente** por defecto sin cambiar el alcance elegido por el usuario:

```text
arquitectura
  -> sandbox de solo lectura sobre el workspace elegido

implementación
  -> sandbox workspace-write sobre ese mismo workspace + journal durable
```

Todos los proveedores reciben únicamente la ruta seleccionada. Arquitectura no puede escribir; implementación escribe directamente y el reviewer comprueba el estado visible en la misma carpeta. `automatic` conserva la pausa opcional para quien la elija explícitamente. Los attempts, leases, checkpoints y eventos permanecen durables; una escritura interrumpida con efectos desconocidos exige reconciliación y nunca se repite automáticamente.

Los worktrees y shadows siguen disponibles para runs aislados existentes o configuraciones avanzadas. En esos modos, los manifests, blobs y journals conservan sus garantías de publicación y recuperación, pero no forman parte del camino predeterminado autorizado.

Consultá [`durable-orchestration.md`](../durable-orchestration/) y [`consistency-operator-control.md`](../consistency-operator-control/).

## Camino del proveedor

```text
workflow/tarea
  -> ProviderRegistry
      -> ProviderAdapter.run(ProviderRunRequest)
```

Los proveedores nunca se llaman directamente entre sí. Baldr posee el estado de la conversación y aplica rondas acotadas y defensas de reentrada.

## Frontera congelada

v0.16 agrega fencing, idempotencia/resume estrictos, cancelación durable y reconciliación del operador sobre la orquestación durable con SQLite, mientras conserva el robustecimiento de validación/probe/evidencia y mantiene congelada la superficie funcional. La superficie funcional permanece congelada en los proveedores, roles y workflow existentes descritos en `FEATURE_FREEZE.md`.
