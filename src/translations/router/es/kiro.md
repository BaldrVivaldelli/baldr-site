# Kiro

Kiro usa dos piezas delgadas sobre el core genérico:

```text
baldr-kiro-adapter
  generación de hooks del workspace y onboarding idempotente

baldr-orchestrator Power
  activación, dirección y UX nativas de Kiro
```

Instalá el core y el adapter en el mismo entorno Python:

```bash
uv tool install --force --editable ./router \
  --with-editable ./facades/kiro/adapter \
  --with-executables-from baldr-kiro-adapter
```

Instalá el Power desde:

```text
facades/kiro/baldr-orchestrator/
```

Primer prompt sugerido:

```text
Acabo de instalar el power baldr-orchestrator y quiero usarlo.
```

El Power asigna el primer uso a la intención compartida `setup`, los
diagnósticos a `status` y la ejecución de tareas de Specs a `run` durable. El
estado SQLite, la resolución de perfiles de ejecución, la recuperación y la
evidencia permanecen en el core; la creación de hooks específicos de Kiro
permanece en el adapter y es idempotente.

Context7 continúa siendo opcional y nunca se deben pedir secretos en el chat.
