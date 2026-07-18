# Baldr Site

Static public website for [Baldr](https://github.com/BaldrVivaldelli/baldr-router):
landing page, architecture explorer, product guides, and versioned technical
reference.

English is the default language. Every public route has a Spanish equivalent
under `/es/`, and Starlight's language selector preserves the current page
when switching locales.

## Repository boundary

| Repository | Source of truth |
| --- | --- |
| `baldr-site` | navigation, design, explanations, translations, and public guides |
| `baldr-router` | code, contracts, specifications, and runtime changelog |

Documents under `src/content/docs/reference/router/` and
`src/content/docs/es/reference/router/` are generated. Their exact source,
tag, source language, and translation inputs live in
[`router-docs.json`](router-docs.json); every generated page includes the
canonical source's SHA-256 digest.

## Local development

Requirements:

- Node.js 22 or later;
- npm;
- a `baldr-router` checkout containing the configured tag, only when
  synchronizing the reference.

```bash
npm ci
npm run dev
```

Astro serves the site at `http://localhost:4321/baldr-site/` to reproduce the
GitHub Pages subpath. Spanish starts at
`http://localhost:4321/baldr-site/es/`.

## Commands

| Command | Purpose |
| --- | --- |
| `npm run dev` | development server |
| `npm run build` | static build in `dist/` |
| `npm run preview` | preview the build |
| `npm run check` | types, build, HTML/a11y, and internal links with anchors |
| `npm run sync:router-docs` | regenerate both localized references from the pinned tag |
| `npm run sync:check` | verify that generated references are aligned |

## Synchronize Router documentation

```bash
BALDR_ROUTER_SOURCE=../baldr-router npm run sync:router-docs
BALDR_ROUTER_SOURCE=../baldr-router npm run sync:check
```

The script uses `git show <ref>:<path>`; it does not copy the current working
tree. This guarantees that the website documents the declared release even
when the local checkout contains later changes.

To move to another release:

1. update `ref` in `router-docs.json`;
2. update the second checkout's `ref` in `.github/workflows/ci.yml`;
3. update translation sources when canonical content changed;
4. run synchronization;
5. review the diff and run `npm run check`.

## Deployment

- every pull request checks types, synchronization, the build, and links;
- every push to `main` validates again and deploys `dist/` to GitHub Pages;
- the site is published at `https://baldrvivaldelli.github.io/baldr-site/`.

Pages must use **GitHub Actions** as its publishing source.

## Structure

```text
src/content/docs/       English pages and guides; Spanish content under es/
src/components/         localized interactive experiences
src/i18n/               shared interface copy
src/translations/       auditable technical-reference translations
src/styles/             visual identity and responsive behavior
scripts/                synchronization and validators
router-docs.json        versioned, localized reference contract
.github/workflows/      CI and GitHub Pages
```

## License

[MIT](LICENSE)
