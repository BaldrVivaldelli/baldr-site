---
title: "Instalación en una máquina limpia"
description: "Referencia técnica de Baldr sincronizada desde v0.20.0."
editUrl: false
---

:::note[Fuente canónica · v0.20.0]
Esta página se genera desde [`clean-machine-install.md`](https://github.com/BaldrVivaldelli/baldr-router/blob/v0.20.0/docs/clean-machine-install.md). No la edites en este repositorio.
Digest de la fuente: `fb64e2dedf2bf530b73a8f945b76dce1315bb2a43db6bb823cd47d2125256612`.
:::
La fachada de VS Code está diseñada como una **instalación de un solo clic con bootstrap automático**: instalar la extensión registra el servidor MCP, descubre el entorno host/WSL correcto y prepara un runtime privado y versionado de Baldr. La autenticación del proveedor y los avisos de confianza del editor continúan siendo consentimientos explícitos de seguridad, no configuración manual.

## Requisitos previos

Debe haber al menos un intérprete Python 3 soportado en el destino de ejecución:

- host Windows, Linux o macOS: Python 3.11+
- Windows con Baldr en WSL: Python 3.11+ dentro de la distribución WSL seleccionada
- VS Code Remote WSL: Python 3.11+ en la distribución remota

El proveedor utilizado por el workflow predeterminado también debe estar autenticado:

```bash
codex login
codex login status
```

Context7 es opcional y se configura durante `/setup`.

## VS Code: máquina Windows limpia con WSL opcional

1. Instalá `baldr-router-vscode-0.20.0.vsix`, o Baldr Router desde Marketplace cuando esté publicado.
2. Aceptá los diálogos de confianza del publisher y MCP de VS Code.
3. Abrí la carpeta sobre la que querés que trabaje BALDR; Git es opcional bajo la protección automática.
4. Abrí el ícono **Baldr** en la Activity Bar. La consola dedicada prepara el estado y setup; `@baldr /setup` sigue siendo un atajo opcional.
5. La extensión intenta primero un runtime privado de Windows. Si Windows no puede proporcionar uno compatible y WSL está disponible, instala/utiliza automáticamente el runtime privado de WSL.
6. Completá `codex login` en el entorno informado por Baldr si el estado lo solicita.
7. Opcionalmente, guardá una clave de Context7 mediante la entrada segura. La extensión usa `SecretStorage` de VS Code; no escribe la clave en el workspace ni en el TOML de Baldr.

No se requiere `.vscode/mcp.json`, un launcher global, `uv tool install` ni un bridge manual de WSL.

## VS Code Remote WSL

1. Abrí el repositorio con **WSL: Open Folder in WSL**.
2. Instalá la extensión en el extension host de WSL cuando VS Code pregunte dónde instalarla.
3. Ejecutá `@baldr /setup`.
4. Baldr prepara el runtime privado directamente dentro del entorno Linux remoto; no se utiliza un bridge de Windows.

## Kiro

Kiro utiliza la fachada opcional en lugar de la extensión de VS Code:

1. Instalá el núcleo y el adaptador en el mismo entorno:

   ```bash
   uv tool install --force ./router --with ./facades/kiro/adapter
   ```

2. Instalá el Power desde `facades/kiro/baldr-orchestrator/`.
3. Iniciá el intent compartido de setup. El adaptador confía en el workspace Git actual únicamente después de la acción de setup y crea el hook administrado de forma idempotente.
4. Confirmá que `router_extension_status` enumera el adaptador de Kiro.

## Clientes MCP genéricos

Los clientes sin una fachada nativa pueden iniciar:

```text
baldr-router mcp
```

Usá los ejemplos de `facades/generic-mcp/`. Un cliente genérico debe pasar o persistir un workspace confiable explícito antes de ejecutar proveedores.

## Comportamiento de actualización

Cada versión de la extensión de VS Code instala su wheel en un runtime privado versionado. El bootstrap:

1. verifica el SHA-256 del wheel contra `runtime.json`;
2. instala en un directorio temporal;
3. crea el entorno virtual en su ruta absoluta final y restaura el runtime anterior de la misma versión si la instalación o verificación falla;
4. conserva de forma predeterminada el runtime actual y un runtime anterior reciente;
5. nunca reutiliza un runtime cuya versión de manifiesto o hash del wheel no coincida.

Por lo tanto, una actualización fallida deja intacta una versión que funcionaba previamente.

## Desinstalación y datos locales

La extensión puede quitarse normalmente desde VS Code. Los datos de usuario de Baldr pueden permanecer intencionalmente:

- configuración: `~/.config/baldr-router/`
- telemetría: `~/.local/state/baldr-router/`
- caché de Context7: `~/.cache/baldr-router/`
- runtime privado de VS Code: global storage de la extensión / `.baldr-router-vscode`

Eliminá esos directorios solo si también querés quitar configuraciones locales, raíces de confianza, telemetría y cachés.
