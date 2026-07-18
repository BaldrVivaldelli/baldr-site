---
title: Agent Runner
description: El data plane local que verifica y ejecuta agentes externos.
---

Runner ejecuta el artefacto **fuera del proceso del Router**. Recibe una
invocación ya resuelta y aplica la frontera operacional inmediatamente antes de
iniciar el proceso.

## Comprobaciones previas

1. La identidad y el digest coinciden con el manifiesto fijado.
2. El artefacto es un archivo regular, no un symlink.
3. Su SHA-256 coincide con el publicado.
4. Rol, capacidades y efecto solicitado son compatibles.
5. Tiempo, entrada, salida y entorno están acotados.

## Dos modos de workspace

- `read-only`: copia descartable sin metadata Git, dependencias generadas,
  symlinks ni permisos de escritura;
- `workspace-write`: workspace exacto, únicamente cuando fase y manifiesto
  declaran escritura y Router preserva un solo escritor.

Una cancelación de lectura puede reintentarse. Una escritura interrumpida puede
haber dejado efectos parciales y se marca `unknown` hasta reconciliarla.

Siguiente: [capacidades y efectos](/baldr-site/es/concepts/capabilities-effects/).
