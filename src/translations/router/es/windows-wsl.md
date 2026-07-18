# Detección automática de Windows / WSL

`baldr-router` es agnóstico de Windows, macOS, Linux y WSL. El
`baldr-router-launcher` opcional existe únicamente para ayudar a los clientes
MCP a iniciar Router cuando el cliente corre en Windows pero Router está
instalado dentro de WSL.

Fallo habitual:

```text
El cliente MCP corre en Windows
baldr-router está instalado en WSL
el comando baldr-router falla porque el PATH de Windows no ve binarios Linux
```

Usá el launcher en modo automático:

```json
{
  "command": "baldr-router-launcher",
  "args": ["mcp"]
}
```

El modo automático significa:

```text
1. Intentar baldr-router en el PATH del host.
2. Sólo si falla y el host es Windows, intentar WSL.
3. Si WSL contiene baldr-router, crear el puente automáticamente.
```

Diagnóstico:

```powershell
baldr-router-launcher detect
```

Modos:

```text
BALDR_ROUTER_LAUNCHER_MODE=auto  # predeterminado
BALDR_ROUTER_LAUNCHER_MODE=host  # nunca intentar WSL
BALDR_ROUTER_LAUNCHER_MODE=wsl   # forzar WSL
```

Para desarrollo local sin instalar `baldr-router` como herramienta WSL:

```powershell
$env:BALDR_ROUTER_WSL_MCP_COMMAND='cd /home/me/projects/baldr-router/router && exec uv run baldr-router mcp'
baldr-router-launcher detect
```

Dentro de WSL, Router normaliza rutas habituales de Windows/UNC:

```text
C:\Users\me\project -> /mnt/c/Users/me/project
\\wsl.localhost\Ubuntu\home\me\project -> /home/me/project
\\wsl$\Ubuntu\home\me\project -> /home/me/project
```
