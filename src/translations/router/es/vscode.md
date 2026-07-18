# Integración de VS Code

## Recomendado: extensión nativa

La extensión nativa en `facades/vscode-extension/` ofrece una **instalación con
un solo clic**:

- incluye el wheel de `baldr-router`;
- prepara automáticamente un entorno Python privado;
- registra Baldr programáticamente como servidor MCP;
- detecta host, Windows/WSL y Remote WSL;
- guarda una key opcional de Context7 en VS Code SecretStorage;
- aporta una consola propia de Baldr en la Activity Bar con work items durables;
- expone una entrada en Command Palette y conserva el chat como shortcut opcional;
- continúa pedidos posteriores en el mismo item durable desde Chat o Console;
- resuelve la carpeta activa en workspaces multirraíz desde referencias, el editor o un selector explícito;
- incluye contexto acotado del archivo activo, selección, buffer dirty y diagnósticos;
- muestra fases del workflow, cancelación, reconciliación, evidencia y perfiles de ejecución resueltos.

Instalá el artefacto generado:

```text
dist/artifacts/baldr-router-vscode-0.20.0.vsix
```

Luego usá la vista dedicada:

```text
Activity Bar -> Baldr
  escribí una tarea y presioná Enter
  + para adjuntos y configuración
  /new /run /status /profile /git /context /cancel /resume
```

Los shortcuts opcionales permanecen disponibles:

```text
Baldr: Open
@baldr /setup
@baldr /status
@baldr /run <task>
@baldr <task>
```

Cuando una tarea termina, el siguiente pedido simple en el mismo chat `@baldr`
o en la sesión seleccionada de Console agrega un turno durable a la
conversación y lo ejecuta sobre el mismo work item. `/resume` sigue siendo la
recuperación de un run interrumpido; no se requiere para una continuación
normal. Las respuestas finales de Chat y la tarjeta de resultado muestran
primero el resultado estructurado y dejan los detalles técnicos en segundo plano.

Con una carpeta, Baldr la usa directamente. Con varias, una referencia
explícita o el editor activo eligen la carpeta; en otro caso Baldr pregunta.
Nunca usa silenciosamente la primera carpeta del workspace.

Este camino no requiere `mcp.json` del workspace, launcher npm global,
instalación manual de paquetes Python ni formulario de configuración. Consultá
[`baldr-console.md`](baldr-console.md).

La autenticación del provider y los diálogos explícitos de confianza siguen
siendo pasos de seguridad de provider/VS Code, no configuración manual de Baldr.

## Fachada Agent Plugin (Preview)

`facades/vscode-agent-plugin/` incluye:

```text
/baldr-setup
/baldr-status
/baldr-run <task>
```

y un `.mcp.json` delgado que apunta a `baldr-router-launcher`. Intencionalmente
no contiene implementación de routing ni workflows.

## Configuración MCP genérica

Para desarrollo o para quienes no quieran la extensión:

```json
{
  "servers": {
    "baldrRouter": {
      "type": "stdio",
      "command": "baldr-router-launcher",
      "args": ["mcp"]
    }
  }
}
```

Cuando VS Code corre dentro de Remote WSL y ve Router directamente:

```json
{
  "servers": {
    "baldrRouter": {
      "type": "stdio",
      "command": "baldr-router",
      "args": ["mcp"]
    }
  }
}
```
