---
title: Capacidades y efectos
description: Cómo Baldr calcula el permiso efectivo de cada invocación.
---

Seleccionar un agente no le concede automáticamente los permisos de la
aplicación que lo invocó. El permiso efectivo surge de una intersección:

```text
capacidades del manifiesto
        ∩
efectos permitidos por la fase
        ∩
política del workspace confiado
        =
invocación efectiva
```

## Lectura

Planificación y revisión reciben una copia descartable y reducida. La copia no
contiene metadata Git, symlinks, entradas especiales ni directorios generados
conocidos. El agente no recibe la ruta original.

## Escritura

Implementación puede recibir el workspace exacto cuando se cumplen todas estas
condiciones:

1. el rol necesita escritura;
2. el manifiesto declara `workspace.write`;
3. `effect_mode` es `workspace-write`;
4. la superficie ya confió el workspace;
5. Router conserva un único escritor para la fase.

## Fallos con significado diferente

Una lectura cancelada no deja cambios y puede reintentarse. Una escritura
interrumpida puede haber producido efectos parciales: el estado pasa a
`unknown` y exige reconciliación en lugar de una repetición automática.
