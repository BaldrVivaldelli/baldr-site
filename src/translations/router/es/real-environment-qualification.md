# Calificación en entornos reales — v0.20

Baldr distingue tres afirmaciones diferentes:

```text
validación sintética
  fixtures determinísticos, Lab, Probe, Verify y pruebas de empaquetado

calificación provisional
  el entorno objetivo ejecutó el laboratorio de tres pasadas, pero las
  aserciones de clientes reales o los canarios de repositorios reales siguen incompletos

calificado
  el perfil exacto de cliente/runtime aprobó cada aserción obligatoria y diez
  tareas canario con evidencia en dos repositorios reales distintos
```

Una máquina de build puede producir evidencia sintética, pero no puede marcar como calificados VS Code, Kiro, WSL, la autenticación, la cancelación desde la UI ni los repositorios de un usuario.

## Perfiles

Perfiles obligatorios del release:

```text
vscode-windows-wsl
vscode-remote-wsl
vscode-linux-native
kiro-windows-wsl
```

Perfiles adicionales soportados:

```text
vscode-windows-native
vscode-macos-native
```

Los perfiles opcionales pueden producir recibos de calificación, pero no reemplazan los gates obligatorios de Windows/WSL, Remote WSL, Linux y Kiro. Los runners self-hosted de GitHub usados por el workflow de calificación deben ser lo bastante actuales para ejecutar el runtime de Node utilizado por las GitHub Actions seleccionadas.

Inspeccioná las definiciones congeladas:

```bash
baldr-router qualification definitions
```

## 1. Crear un workspace de calificación

```bash
baldr-router qualification template \
  --profile vscode-windows-wsl \
  --output-dir ./qualification-input
```

Esto escribe:

```text
qualification-input/client-assertions.json
qualification-input/canary-results.json
```

Los archivos no contienen secretos. Son recibos del operador: completá cada elemento únicamente después de observar el resultado en el cliente objetivo.

## 2. Completar las aserciones del cliente

Cada aserción requerida tiene uno de estos estados:

```text
pending
passed
failed
```

Un elemento aprobado debería contener una referencia de evidencia portable, por ejemplo:

```json
{
  "id": "vscode.cancel_from_ui",
  "status": "passed",
  "evidence": ["screen-recording:cancel-2026-07-11", "evidence:br-lifecycle-..."],
  "notes": "Cancellation reached durable cancelled and no child process remained."
}
```

No pegues API keys, prompts, código fuente, nombres de usuario ni rutas absolutas.

## 3. Ejecutar los diez canarios

Usá dos repositorios Git reales diferentes y registrá cinco tareas en cada uno. Cada tarea aprobada requiere:

```text
run_id
evidence_id
orphan_processes = 0
test/verification references
```

Los diez canarios congelados son cinco cambios acotados de código/documentación en un repositorio Python y cinco en uno Node. El comportamiento de ciclo de vida, cancelación, recuperación, actualización, fencing y redacción de secretos se demuestra por separado mediante el Lab de tres pasadas y las aserciones del cliente.

## 4. Ejecutar la calificación desde el entorno objetivo exacto

```bash
baldr-router trust-workspace /path/to/repository

baldr-router qualification run \
  --profile vscode-windows-wsl \
  --workspace-root /path/to/repository \
  --client-assertions ./qualification-input/client-assertions.json \
  --canary-results ./qualification-input/canary-results.json \
  --repeat 3
```

El resultado es `qualified` únicamente cuando todos los gates aprueban. La falta de evidencia real produce `provisional`; las aserciones fallidas explícitas o las fallas del ciclo de vida producen `failed`.

## 5. Inspeccionar el recibo

```bash
baldr-router qualification status --latest
```

Los recibos se guardan fuera del repositorio:

```text
~/.local/state/baldr-router/qualification/<qualification-id>/
```

Cada paquete incluye:

```text
receipt.json
summary.md
environment.json
workspace-profile.json
lab-result.json
client-assertions.json
canary-results.json
requirements.json
artifact-hashes.json
```

El recibo usa un digest SHA-256 canónico y excluye prompts crudos, código fuente, secretos, rutas home completas y rutas crudas del workspace.

## Regla de promoción

Un build v0.20.x solo puede promoverse cuando todos los perfiles obligatorios tienen un recibo `qualified` y los recibos se refieren a la misma versión del release. La evidencia sintética de CI sigue siendo necesaria, pero nunca sustituye este gate.

## Evaluación de CI self-hosted

El repositorio incluye un entrypoint multiplataforma utilizado por el workflow manual de GitHub:

```bash
uv run --project router python scripts/run_qualification_ci.py \
  --profile vscode-windows-wsl \
  --workspace-root /path/to/repository \
  --evidence-directory ./qualification-input \
  --output-directory ./qualification-output \
  --repeat 3
```

Siempre exporta el recibo redactado antes de devolver un estado fallido para un resultado `provisional` o `failed`. Esto permite que CI suba evidencia incluso cuando el gate de calificación rechaza al candidato.
