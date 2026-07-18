---
title: Crear un agente
description: Inicializar un agente Python o TypeScript con la API de autoría de Baldr.
---

## Requisitos

- Python 3.11 o posterior y `uv` para la toolchain;
- Node.js 20 o posterior para agentes TypeScript;
- `baldr-agent` y el driver del lenguaje disponibles.

## Inicializar

### Python

```bash
baldr-agent init ./my-agent \
  --name my-agent \
  --owner my-team \
  --namespace product \
  --language python
```

### TypeScript

```bash
baldr-agent init ./my-agent \
  --name my-agent \
  --owner my-team \
  --namespace product \
  --language typescript
```

## Declarar roles

`baldr-agent.toml` define identidad, lenguaje, entrypoint y uno o más roles:

```toml
schema_version = 2
name = "repository-report"
owner = "my-team"
namespace = "product"
version = "1.0.0"
language = "typescript"
entrypoint = "src/agent.ts"
driver = "baldr.typescript"

[[roles]]
name = "writer"
capabilities = ["workspace.read", "workspace.write", "role.implementer"]
effect_mode = "workspace-write"
```

## Probar antes de construir

```bash
cd my-agent
baldr-agent test
baldr-agent driver doctor baldr.typescript
baldr-agent driver conformance baldr.typescript
```

La conformidad comprueba el proyecto real, no solamente que el ejecutable del
driver responda.

Siguiente: [publicar una versión](../publish-agent/).
