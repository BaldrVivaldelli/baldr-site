# Contribuir a Baldr Site

## Antes de abrir un pull request

```bash
npm ci
npm run check
BALDR_ROUTER_SOURCE=../baldr-router npm run sync:check
```

## Dónde realizar un cambio

- Corregí aquí la navegación, el lenguaje público, los componentes y las guías.
- Corregí en `baldr-router` los contratos y las especificaciones técnicas.
- No edites manualmente `src/content/docs/reference/router/`.

## Criterios de contenido

- Explicá primero el resultado y después los detalles internos.
- Usá términos del modelo semántico: rol, AgentRef, digest, capacidad y efecto.
- No prometas aislamiento que Runner todavía no implementa.
- Conservá enlaces útiles sin depender de rutas de un checkout local.
- Toda interacción debe funcionar con teclado, focus visible y movimiento
  reducido.

## Pull requests

Describí:

1. qué recorrido de usuario cambia;
2. qué páginas o componentes se modificaron;
3. cómo se comprobó el build y la navegación;
4. si cambia el tag de documentación del Router.
