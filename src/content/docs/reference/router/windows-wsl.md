---
title: "Windows / WSL auto-detection"
description: "Referencia técnica de Baldr sincronizada desde v0.20.0."
editUrl: false
---

:::note[Fuente canónica · v0.20.0]
Esta página se genera desde [`windows-wsl.md`](https://github.com/BaldrVivaldelli/baldr-router/blob/v0.20.0/docs/windows-wsl.md). No la edites en este repositorio.
Digest de la fuente: `dab220661dabd64cc068000fcc4ae247f0476446f02cb1ed50c20b200e76456d`.
:::
`baldr-router` itself is agnostic to Windows, macOS, Linux and WSL. The optional `baldr-router-launcher` exists only to help MCP clients start the router when the client runs on Windows but the router is installed inside WSL.

Common failure:

```text
MCP client runs on Windows
baldr-router is installed in WSL
command: baldr-router fails because Windows PATH cannot see Linux binaries
```

Use the launcher in auto mode:

```json
{
  "command": "baldr-router-launcher",
  "args": ["mcp"]
}
```

Auto mode means:

```text
1. Try baldr-router on the host PATH.
2. Only if that fails and the host is Windows, try WSL.
3. If WSL has baldr-router, bridge to it automatically.
```

Diagnose:

```powershell
baldr-router-launcher detect
```

Modes:

```text
BALDR_ROUTER_LAUNCHER_MODE=auto  # default
BALDR_ROUTER_LAUNCHER_MODE=host  # never try WSL
BALDR_ROUTER_LAUNCHER_MODE=wsl   # force WSL
```

For local development without installing `baldr-router` as a WSL tool:

```powershell
$env:BALDR_ROUTER_WSL_MCP_COMMAND='cd /home/me/projects/baldr-router/router && exec uv run baldr-router mcp'
baldr-router-launcher detect
```

Inside WSL, the router normalizes common Windows/UNC paths:

```text
C:\Users\me\project -> /mnt/c/Users/me/project
\\wsl.localhost\Ubuntu\home\me\project -> /home/me/project
\\wsl$\Ubuntu\home\me\project -> /home/me/project
```
