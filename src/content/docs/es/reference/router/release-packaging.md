---
title: "Empaquetado del release"
description: "Referencia técnica de Baldr sincronizada desde v0.20.0."
editUrl: false
---

:::note[Fuente canónica · v0.20.0]
Esta página se genera desde [`release-packaging.md`](https://github.com/BaldrVivaldelli/baldr-router/blob/v0.20.0/docs/release-packaging.md). No la edites en este repositorio.
Digest de la fuente: `91c5d64a79b9ae0744112d9497a25deda624746f8428ff39e32c32c0cae2a691`.
:::
v0.20.0 separa las fuentes, los artefactos ejecutables y la evidencia de validación.

Los artefactos Python también se dividen por responsabilidad: `baldr-router`
es el control plane, `baldr-agent-sdk` es la API pública de autoría,
`baldr-agent-builder` es la toolchain de lifecycle consciente del lenguaje y
`baldr-agent-runner` es el data plane local independiente. El gate de release
construye e instala juntos los cuatro wheels de infraestructura en un entorno
limpio, mientras que el VSIX continúa incluyendo únicamente el wheel de Router.

El release también emite tarballs npm independientes bajo `artifacts/node`:

- `baldr-agent-sdk-<version>.tgz`;
- `baldr-agent-builder-typescript-<version>.tgz`.

El gate instala los wheels Python y ambos tarballs npm en prefijos temporales
limpios. Exige que el driver empaquetado se descubra desde `PATH`, verifica que
su digest no cambie al reubicarlo, crea y prueba un agente TypeScript, ejecuta
la suite oficial de conformidad del driver y una ejecución directa de Runner,
ejecuta el mismo equipo externo mediante las fachadas de VS Code y Kiro,
compara dos builds byte a byte idénticos, publica las versiones 1.0.0 y 1.1.0,
rechaza el reemplazo de 1.1.0 y hace rollback a 1.0.0. La evidencia se escribe
en `dist/validation/typescript-distribution.json`.

El workflow de release siempre construye y atestigua cada artefacto de
registry. La promoción real es explícita: `publish_pypi=true` publica los cinco
paquetes Python y `publish_npm=true` publica el SDK y el driver TypeScript. Los
proyectos PyPI y la organización npm primero deben configurar este repositorio
como trusted publisher; un tag por sí solo nunca publica paquetes.

```text
dist/baldr-router-0.20.0-source.zip
  fuentes, tests, docs, workflows y contratos; sin base de runtime ni caché

dist/baldr-router-0.20.0-artifacts.zip
  wheels, VSIX, Kiro Power, Agent Plugin, SBOM y procedencia
dist/baldr-router-0.20.0-validation-evidence.zip
  únicamente reportes portables de builds sintéticos
```

Los artefactos individuales permanecen bajo `dist/artifacts/`. La metadata de
release vive en `dist/metadata/` e incluye:

```text
SBOM.spdx.json
provenance.intoto.json
secret-scan.json
```

`dist/release-manifest.json` y `dist/SHA256SUMS.txt` cubren los bundles
separados y los artefactos individuales. El bundle de fuentes no debe contener:

```text
estado SQLite
cachés de validación
node_modules
entornos virtuales
rutas absolutas de build
evidencia privada de una máquina de usuario
```

Construí y verificá mediante un único entrypoint multiplataforma:

```bash
python scripts/dev.py build
python scripts/dev.py verify-release
```
