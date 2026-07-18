# Laboratorio de validación y evidencia v0.14

Baldr v0.14 agrega tres capas de robustecimiento sin cambiar la superficie congelada de herramientas MCP, proveedores, roles ni workflows.

```text
Baldr Lab
  entornos reproducibles y descartables, y ejecuciones repetidas del ciclo de vida

Baldr Probe
  huella segura del entorno + perfil acotado del workspace

Baldr Verify / Evidence
  autoevaluación determinística del ciclo de vida + paquete de pruebas redactado
```

## 1. Baldr Lab

El laboratorio ejecuta repetidamente la misma suite determinística del ciclo de vida y exige aprobaciones consecutivas. El umbral predeterminado para un release es de tres ejecuciones exitosas consecutivas.

```bash
baldr-router lab --mode full --repeat 3
```

La suite valida:

- el recibo de runtime/instalación cuando hay un runtime administrado;
- la ejecución de fixtures y los límites del sistema de archivos;
- los eventos de progreso ordenados;
- la cancelación de un árbol de procesos;
- el inicio, handshake, detención y reinicio de MCP;
- la semántica transaccional de actualización y rollback;
- la redacción de secretos;
- el manejo de crashes y JSON inválido en modo completo.

`lab/` contiene un perfil de contenedor Linux, una plantilla de Windows Sandbox, scripts y la matriz canónica de entornos. Windows + WSL y Kiro todavía requieren una VM o máquina Windows real porque un contenedor Linux no puede demostrar esos límites del cliente.

## 2. Baldr Probe

### Sondeo del entorno

```bash
baldr-router env-report
```

El informe registra una huella redactada de:

- sistema operativo, arquitectura, Python y estado de WSL;
- ID y versión de la fachada cliente;
- disponibilidad y versiones de comandos;
- validez del recibo del runtime administrado;
- ninguna exportación cruda del entorno ni valores secretos.

### Perfil del workspace

```bash
baldr-router trust-workspace /path/to/repo
baldr-router probe-workspace /path/to/repo
```

El perfilado ocurre únicamente después de confiar en el workspace. Este proceso:

- respeta las reglas de exclusión de Git cuando Git está disponible;
- excluye archivos con forma de secreto y directorios generados de dependencias/build;
- analiza metadata acotada de manifiestos;
- cuenta extensiones de archivos sin leer el contenido fuente;
- descubre package managers, frameworks, scripts y comandos de verificación;
- guarda en caché un perfil con huella bajo el directorio de caché de Baldr.

**No** ejecuta scripts del workspace ni realiza un recorrido irrestricto del código fuente.

## 3. Baldr Verify y evidencia

```bash
baldr-router verify --mode quick
baldr-router verify --mode full
baldr-router evidence --latest
```

La verificación se ejecuta contra un repositorio Git temporal y un worker fixture interno y determinístico. No consume créditos de Codex/Kiro salvo que se indique explícitamente `--include-provider-smoke`.

La evidencia se almacena en:

```text
~/.local/state/baldr-router/evidence/<evidence-id>/
```

Cada paquete contiene:

```text
environment.json
lifecycle-results.json
workspace-profile.json       # cuando se proporciona un workspace confiable
manifest.json
redaction-report.json
artifact-hashes.json
summary.md
```

Se excluyen o redactan los secretos, valores con forma de token, prompts crudos, archivos fuente y la ruta actual del home.

## Comportamiento automático en las fachadas cliente

- VS Code prepara el runtime privado y ejecuta/guarda en caché una verificación rápida del ciclo de vida durante el calentamiento/estado.
- `/setup` de VS Code confía en el workspace seleccionado, genera su perfil acotado y reutiliza evidencia vigente.
- El adaptador de Kiro ejecuta el mismo sondeo y verificación del núcleo después del onboarding idempotente del workspace.
- Los clientes MCP genéricos reciben los mismos datos mediante los intents existentes `setup` y `status`, y `router_doctor`; no se agregaron nuevas herramientas MCP.

## Aceptación del release

Un candidato se considera repetible únicamente cuando el perfil requerido aprueba tres ejecuciones limpias consecutivas. Los resultados de clientes reales pertenecen en `e2e/REAL_ENVIRONMENT_MATRIX.md`; las pruebas sintéticas no se marcan como aprobaciones E2E reales.
