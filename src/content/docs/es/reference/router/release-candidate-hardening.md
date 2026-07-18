---
title: "Robustecimiento del release candidate v0.13"
description: "Referencia técnica de Baldr sincronizada desde v0.20.0."
editUrl: false
---

:::note[Fuente canónica · v0.20.0]
Esta página se genera desde [`release-candidate-hardening.md`](https://github.com/BaldrVivaldelli/baldr-router/blob/v0.20.0/docs/release-candidate-hardening.md). No la edites en este repositorio.
Digest de la fuente: `35ca0b24bf4f2ca77aa9a4bed2b98b357bed9465edbb1f72f622448c6537b952`.
:::
Baldr Router v0.13 mantiene congelada la superficie de funcionalidades de v0.12. Este release cambia únicamente la confiabilidad, el empaquetado, la seguridad, los diagnósticos y la cobertura de pruebas. **No** agrega proveedores, roles, workflows ni herramientas MCP públicas.

## Matriz de robustecimiento

| # | Área | Implementación | Validación automatizada | Validación en entorno real |
|---|---|---|---|---|
| 1 | VS Code en Windows con Baldr en WSL | El bootstrap compartido selecciona primero el host Windows y conecta de forma transparente un runtime WSL existente o administrado. | Pruebas de fallback WSL del launcher y prueba de identidad del bootstrap compartido. | `e2e/vscode-windows-wsl.md` |
| 2 | VS Code Remote WSL | La extensión resuelve el router directamente en el extension host Linux remoto y pasa las raíces de confianza del workspace. | Prueba de resolución del destino Linux/Remote-WSL. | `e2e/vscode-remote-wsl.md` |
| 3 | Kiro Power | El adaptador opcional de Kiro confía de forma persistente en el workspace Git seleccionado e instala hooks administrados de manera idempotente. | Prueba E2E de onboarding del adaptador y prueba de descubrimiento/empaquetado de extensiones. | `e2e/kiro-power.md` |
| 4 | Workspaces confiables | Los proveedores se bloquean salvo que la ruta sea confiable, exista, sea un directorio, sea un repositorio Git de forma predeterminada y esté fuera de raíces sensibles. | `test_workspace_policy.py` más pruebas de conformidad de workflows/tareas. | Todos los runbooks E2E reales verifican el informe del workspace activo. |
| 5 | Cancelación y limpieza de procesos | Los subprocesos de proveedores se ejecutan en grupos de procesos. Timeout, cancelación, cierre y cancelación de la extensión terminan los descendientes. | Pruebas del árbol de procesos en Python y Node. | Los runbooks incluyen verificaciones de cancelación/reinicio. |
| 6 | Actualizaciones del runtime | Los runtimes de VS Code/launcher están versionados, verifican el hash del wheel, se instalan transaccionalmente con rollback y conservan solo una cantidad acotada de versiones. | Pruebas de manifiesto/hash y pruning; validación del bootstrap con el wheel empaquetado. | Checklist de máquina limpia y actualización. |
| 7 | Fallas de Codex | Binario/login ausente, timeout, aborto por señal, salida distinta de cero, JSONL malformado y output estructurado inválido tienen códigos de error estables. | Pruebas de integración con Codex falso. | Los runbooks incluyen escenarios de login ausente y cancelación. |
| 8 | Conformidad de fachadas | CLI, fachada Python, prompts/herramientas MCP, VS Code, Kiro, Agent Plugin y MCP genérico consumen el contrato congelado `setup/status/run`. | Verificación de generación de contratos y prueba de conformidad semántica CLI ↔ MCP. | Los smoke checks manuales de chat usan los mismos intents. |
| 9 | Secretos de Context7 | VS Code almacena la clave en `SecretStorage`; el runtime la recibe únicamente mediante el entorno del proceso. La redacción Python/TypeScript protege output, telemetría, caché y diagnósticos. | Pruebas de regresión de filtración de secretos en Python y Node. | Los runbooks verifican que logs/configuración no contengan la clave. |
| 10 | Instalación en máquina limpia | El VSIX contiene el wheel del núcleo y realiza el bootstrap de un runtime privado versionado sin JSON MCP manual. | Integridad de wheel/VSIX/paquete y validación de instalación aislada. | `docs/clean-machine-install.md` |

## Superficie congelada

Lo siguiente permanece sin cambios para la línea v0.13:

- proveedores: `codex`, `kiro-cli`
- roles: `architect`, `implementer`, `reviewer`
- workflow: `architect-implement-review`
- intents de fachada: `setup`, `status`, `run`
- listas de herramientas y prompts MCP del núcleo en `baldr_router.release_policy`

`router/tests/test_frozen_surface.py` falla si la superficie pública del núcleo cambia accidentalmente.

## Códigos de error

Las fallas de proveedores y workspaces son legibles por máquina. Los códigos importantes de v0.13 incluyen:

- `workspace_not_trusted`
- `workspace_git_required`
- `workspace_sensitive_path_blocked`
- `codex_not_found`
- `codex_not_authenticated`
- `codex_timeout`
- `codex_process_aborted`
- `codex_process_failed`
- `codex_invalid_structured_output`
- `router_reentry_blocked`
- `router_max_depth_exceeded`
- `same_provider_recursion_blocked`

Los clientes deberían mostrar `error.message`, conservar `error.code` y reintentar automáticamente únicamente cuando `error.retryable` sea verdadero.

## Criterio de salida del release candidate

La validación sintética automatizada es necesaria pero insuficiente. Un release candidate solo debería promoverse después de que los tres runbooks de entornos reales aprueben y al menos diez tareas representativas se completen en dos repositorios Git reales sin ediciones de configuración técnica, secretos filtrados ni procesos de proveedor huérfanos.
