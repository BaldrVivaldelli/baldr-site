# Baldr Site

Sitio público estático de [Baldr](https://github.com/BaldrVivaldelli/baldr-router):
landing, explorador de arquitectura, guías de producto y referencia técnica
versionada.

## Frontera entre repositorios

| Repositorio | Fuente de verdad |
| --- | --- |
| `baldr-site` | navegación, diseño, explicaciones y guías públicas |
| `baldr-router` | código, contratos, especificaciones y changelog del runtime |

Los documentos bajo `src/content/docs/reference/router/` son generados. Su
origen y tag exacto viven en [`router-docs.json`](router-docs.json); cada página
incluye el digest SHA-256 de la fuente.

## Desarrollo local

Requisitos:

- Node.js 22 o posterior;
- npm;
- un checkout de `baldr-router` con el tag configurado, solamente para
  sincronizar la referencia.

```bash
npm ci
npm run dev
```

Astro sirve el sitio bajo `http://localhost:4321/baldr-site/` para reproducir el
subpath de GitHub Pages.

## Comandos

| Comando | Propósito |
| --- | --- |
| `npm run dev` | servidor de desarrollo |
| `npm run build` | build estático en `dist/` |
| `npm run preview` | previsualizar el build |
| `npm run check` | tipos, build, HTML/a11y y enlaces internos con anchors |
| `npm run sync:router-docs` | regenerar referencia desde el tag fijado |
| `npm run sync:check` | comprobar que la referencia no se desalineó |

## Sincronizar documentación del Router

```bash
BALDR_ROUTER_SOURCE=../baldr-router npm run sync:router-docs
BALDR_ROUTER_SOURCE=../baldr-router npm run sync:check
```

El script usa `git show <ref>:<path>`; no copia el working tree actual. Esto
garantiza que el sitio documente exactamente el release declarado aunque el
checkout local tenga cambios posteriores.

Para avanzar a otro release:

1. actualizá `ref` en `router-docs.json`;
2. actualizá el `ref` del segundo checkout en `.github/workflows/ci.yml`;
3. ejecutá la sincronización;
4. revisá el diff y corré `npm run check`.

## Despliegue

- cada pull request ejecuta tipos, sincronización, build y enlaces;
- cada push a `main` vuelve a validar y despliega `dist/` en GitHub Pages;
- el sitio se publica en `https://baldrvivaldelli.github.io/baldr-site/`.

La configuración de Pages debe usar **GitHub Actions** como fuente de
publicación.

## Estructura

```text
src/content/docs/       páginas y guías
src/components/         experiencias interactivas
src/styles/             identidad visual y responsive
scripts/                sincronización y validadores
router-docs.json        contrato de referencia versionada
.github/workflows/      CI y GitHub Pages
```

## Licencia

[MIT](LICENSE)
