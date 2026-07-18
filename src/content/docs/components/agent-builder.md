---
title: Agent Builder
description: Toolchain neutral para probar, construir, publicar y revertir agentes.
---

Agent Builder ofrece una experiencia común sin intentar implementar todos los
compiladores dentro de Baldr.

```bash
baldr-agent test
baldr-agent build
baldr-agent publish
baldr-agent doctor
baldr-agent rollback 1.0.0
```

## Builder Protocol

Builder descubre un driver por identidad exacta y le envía operaciones JSONL
versionadas. El driver conoce el lenguaje; Builder conoce el lifecycle.

| Builder decide | Driver decide |
| --- | --- |
| identidad del proyecto | cómo probar las fuentes |
| inventario y digest de entrada | cómo producir el artefacto |
| idempotencia y release | toolchain y formato de salida |
| instalación y publicación | metadata específica del lenguaje |

La conformidad comprueba protocolo, tests reales, attestation, builds
byte-idénticos y relocación fuera del checkout.

Siguiente: [crear un agente](/baldr-site/guides/create-agent/).
