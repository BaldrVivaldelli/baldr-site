## Desarrollo

Instalá dependencias con `npm ci`. Para iniciar el servidor, usá background mode:

```bash
npm run dev -- --background
```

Administralo con `npx astro dev status`, `npx astro dev logs` y
`npx astro dev stop`.

Antes de entregar cambios, ejecutá:

```bash
npm run sync:check
npm run check
```

## Frontera documental

- `baldr-site` posee navegación, diseño, explicaciones y guías públicas.
- `baldr-router` posee contratos y especificaciones técnicas.
- No edites `src/content/docs/reference/router/` manualmente.
- Actualizá `router-docs.json` y ejecutá `npm run sync:router-docs` para
  regenerar la referencia desde un tag exacto.

## Astro

Documentación completa: https://docs.astro.build

Consultá estas guías antes de trabajar en áreas relacionadas:

- [Rutas](https://docs.astro.build/en/guides/routing/)
- [Componentes Astro](https://docs.astro.build/en/basics/astro-components/)
- [Content collections](https://docs.astro.build/en/guides/content-collections/)
- [Estilos](https://docs.astro.build/en/guides/styling/)
- [Internacionalización](https://docs.astro.build/en/guides/internationalization/)

Toda interacción debe ser usable con teclado, focus visible, movimiento reducido
y paneles estrechos.
