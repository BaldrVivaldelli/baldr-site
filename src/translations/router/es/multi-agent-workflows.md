# Workflows multiagente

Baldr Router puede coordinar varios roles respaldados por providers sin
permitir que hablen directamente entre sí.

```text
cliente
  -> baldr-router
      -> architect.plan
      -> implementer.implement
      -> reviewer.review
      -> implementer.fix_round?   max_rounds acotado
      -> reviewer.final_review?
```

## Primer workflow

El primer workflow implementado es:

```text
architect-implement-review
```

Está diseñado para tareas de desarrollo en las que planificación,
implementación y revisión deben ser responsabilidades separadas.

## Roles y perfiles de ejecución

Los roles definen permisos y semántica de fase. Los perfiles de ejecución con
nombre definen provider/modelo/agente. Todas las fases pueden compartir un
perfil, o cada una puede referenciar una lista independiente.

```toml
[execution_profiles.shared]
provider = "codex"
session_scope = "workspace"

[roles.architect]
profiles = ["shared"]
can_write = false
sandbox = "read-only"

[roles.implementer]
profiles = ["shared"]
can_write = true
sandbox = "workspace-write"

[roles.reviewer]
profiles = ["shared"]
can_write = false
sandbox = "read-only"
```

Para participación n/m/l por fase:

```toml
[roles.architect]
profiles = ["arch-primary", "arch-fallback"]
strategy = "first-success"

[roles.implementer]
profiles = ["implementation"]
strategy = "first-success"

[roles.reviewer]
profiles = ["review-a", "review-b"]
strategy = "all"
min_successes = 2
min_approvals = 2
max_concurrency = 2

[workflows.architect-implement-review]
max_parallel_participants = 4
max_participants_per_phase = 8
max_total_participant_attempts = 24
```

`all` ejecuta planners/advisors o reviewers de solo lectura en paralelo,
acotados por el menor límite de concurrencia entre rol y workflow. La reducción
permanece determinista según el orden configurado de perfiles, no el orden de
finalización. Una fase con escritura debe resolver exactamente un perfil,
incluidas las configuraciones de fallback, para que nunca haya dos posibles
escritores. El presupuesto durable incluye reintentos y detiene una fase antes
del dispatch si el fan-out requerido no entra. Consultá
[`durable-orchestration.md`](durable-orchestration.md) para el contrato completo
y la semántica de cancelación y recuperación.

El comando simple de rol por CLI todavía crea un perfil inline:

```bash
baldr-router set-role-provider architect kiro-cli --agent baldr-architect --effort high
baldr-router set-role-provider implementer codex
baldr-router set-role-provider reviewer kiro-cli --agent baldr-reviewer --effort high
```

## Dry run

Previsualizá roles/providers seleccionados sin iniciar providers:

```bash
baldr-router run-workflow /path/to/repo "Implement auth refresh tokens" --dry-run
```

## Tools MCP

```text
router_workflow_status
router_list_roles
router_list_workflows
router_set_role_provider
run_workflow
run_architect_implement_review
```

## Guardia contra recursión

Los procesos hijos de providers reciben:

```text
BALDR_ROUTER_RUN_ID
BALDR_ROUTER_WORKFLOW
BALDR_ROUTER_ACTIVE_ROLE
BALDR_ROUTER_PARENT_PROVIDER
BALDR_ROUTER_DEPTH
BALDR_ROUTER_DISABLE_REENTRY=1
```

Si un provider hijo vuelve a llamar a baldr-router, las tools de workflow y
delegación rechazan la reentrada por defecto. Esto evita ciclos como:

```text
baldr-router -> kiro-cli -> baldr-router -> kiro-cli -> ...
```

## Roles recomendados por provider

```text
Codex
  ideal como implementer; también útil como reviewer o architect si Kiro CLI no está configurado.

Kiro CLI
  ideal como architect, reviewer o provider de segunda opinión.

Context7
  provider de documentación/contexto, no implementer.
```

## Frontera del registry de providers

El workflow engine nunca bifurca por nombres concretos de providers. Cada paso
de rol pasa por `ProviderRegistry` y el protocolo `ProviderAdapter`. La metadata
de capacidades del provider se incluye en status/resultados, incluso si una
frontera solicitada de lectura o escritura se aplica técnicamente o es advisory.

Durante el feature freeze de v0.16, este workflow y el conjunto incorporado de
providers están cubiertos por pruebas de contrato y no deberían ampliarse.
