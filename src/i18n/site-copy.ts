export const siteCopy = {
	en: {
		architecture: {
			heading: 'Follow a task from end to end',
			intro: 'Choose a path, then select a node to understand its boundary.',
			flowLabel: 'Architecture paths',
			coordinate: 'Coordinate',
			publish: 'Publish',
			stage: 'Stage',
			explore: 'Explore',
			changeStage: 'Change stage',
			previous: 'Previous',
			next: 'Next',
			orchestration: [
				{
					id: 'surface',
					kind: 'Experience',
					name: 'VS Code · Kiro · MCP',
					short: 'A person starts and observes the work.',
					title: 'A task can start on any surface',
					description:
						'Facades handle installation and native experience. They all use the same Router contract, so coordination is not reimplemented in every client.',
					href: 'integrations/',
				},
				{
					id: 'router',
					kind: 'Control plane',
					name: 'Router',
					short: 'Coordinates roles, policies, and recovery.',
					title: 'Router turns intent into a durable workflow',
					description:
						'It pins session configuration, selects exact participants, and preserves state, evidence, and decisions even if the client restarts.',
					href: 'components/router/',
				},
				{
					id: 'manager',
					kind: 'Identity',
					name: 'Agent Manager',
					short: 'Resolves AgentRef and digest.',
					title: 'Agent Manager resolves identities, not source code',
					description:
						'The catalog returns an immutable version, its capabilities, and the artifact’s stable location. The owning team remains responsible for the agent.',
					href: 'components/agent-manager/',
				},
				{
					id: 'runner',
					kind: 'Data plane',
					name: 'Runner',
					short: 'Verifies and executes the artifact.',
					title: 'Runner enforces the execution boundary',
					description:
						'It verifies identity and digest, limits time and I/O, provides only the authorized workspace, and preserves the invocation result.',
					href: 'components/runner/',
				},
				{
					id: 'workspace',
					kind: 'Result',
					name: 'Workspace',
					short: 'Verifiable changes and evidence.',
					title: 'The result returns as durable evidence',
					description:
						'Planning and review observe read-only copies. Implementation can receive the exact workspace only when role, manifest, and policy permit writing.',
					href: 'concepts/capabilities-effects/',
				},
			],
			publishing: [
				{
					id: 'source',
					kind: 'Ownership',
					name: 'Agent repository',
					short: 'The team’s code, prompts, and tests.',
					title: 'The agent is born outside Baldr',
					description:
						'Each team chooses its language, internal design, and release schedule. Baldr does not absorb that code into its core.',
					href: 'guides/create-agent/',
				},
				{
					id: 'sdk',
					kind: 'Authoring',
					name: 'SDK',
					short: 'Minimal Python or TypeScript API.',
					title: 'The SDK expresses the agent contract',
					description:
						'The application imports only the authoring API: identity, capabilities, events, and response. The toolchain stays outside the agent runtime.',
					href: 'components/sdks/',
				},
				{
					id: 'builder',
					kind: 'Toolchain',
					name: 'Agent Builder',
					short: 'Tests, builds, and publishes.',
					title: 'Builder governs the release lifecycle',
					description:
						'A neutral CLI discovers the language driver, requires reproducible builds, and publishes versions that cannot change silently.',
					href: 'components/agent-builder/',
				},
				{
					id: 'driver',
					kind: 'Polyglot',
					name: 'Driver',
					short: 'Turns sources into an artifact.',
					title: 'Each language implements Builder Protocol',
					description:
						'Python, TypeScript, and future languages can use different toolchains without changing Agent Manager, Runner, or Router.',
					href: 'reference/router/builder-protocol/',
				},
				{
					id: 'release',
					kind: 'Distribution',
					name: 'Immutable release',
					short: 'Artifact, manifest, and digest.',
					title: 'The release crosses the boundary; the checkout does not',
					description:
						'Baldr receives an exact identity and stable location. Repeating the same publication is idempotent; changing content requires a new version.',
					href: 'concepts/identity/',
				},
			],
		},
		landing: {
			eyebrow: 'A clear boundary',
			title: 'Behavior lives outside.<br />Coordination stays in Baldr.',
			intro:
				'Teams retain their code, prompts, tests, and releases. Baldr discovers exact identities, controls capabilities, executes external artifacts, and preserves work state.',
			principles: [
				{ term: 'Ownership', description: 'The agent remains in its team’s repository.' },
				{ term: 'Identity', description: 'AgentRef, version, and digest pin what runs.' },
				{ term: 'Continuity', description: 'The workflow survives clients and restarts.' },
			],
			responsibilitiesEyebrow: 'Responsibilities',
			responsibilitiesTitle: 'A small core.<br />Pieces with boundaries.',
			responsibilitiesIntro:
				'Each component has one reason to change. That separation adds agents, languages, and surfaces without making Router larger.',
			learnMore: 'Explore the component',
			responsibilities: [
				{
					index: '01', label: 'Coordinate', title: 'Router turns intent into durable work',
					description: 'It pins roles, policies, and exact participants without absorbing private agent code.', href: 'components/router/',
				},
				{
					index: '02', label: 'Resolve', title: 'Agent Manager provides verifiable identity',
					description: 'It resolves AgentRef, version, capabilities, and digest before a phase can run.', href: 'components/agent-manager/',
				},
				{
					index: '03', label: 'Publish', title: 'SDK and Builder produce reproducible releases',
					description: 'Each language retains its toolchain and crosses the boundary as an immutable artifact.', href: 'components/agent-builder/',
				},
				{
					index: '04', label: 'Execute', title: 'Runner applies capabilities and effects',
					description: 'It verifies the artifact, bounds the invocation, and provides only the authorized workspace.', href: 'components/runner/',
				},
			],
			pathsEyebrow: 'Choose your entry point',
			pathsTitle: 'Start with the problem you need to solve.',
			pathsLabel: 'Getting-started paths',
			paths: [
				{ eyebrow: 'Understand', title: 'What is Baldr', description: 'The system model in five minutes.', href: 'overview/' },
				{ eyebrow: 'Build', title: 'Create an agent', description: 'From scaffold to the first local test.', href: 'guides/create-agent/' },
				{ eyebrow: 'Connect', title: 'Integrate a surface', description: 'VS Code, Kiro, CLI, and MCP.', href: 'integrations/' },
				{ eyebrow: 'Verify', title: 'Read the contracts', description: 'Technical reference pinned by version.', href: 'reference/' },
			],
		},
	},
	es: {
		architecture: {
			heading: 'Seguí una tarea de punta a punta',
			intro: 'Elegí un recorrido y después un nodo para entender su frontera.',
			flowLabel: 'Recorridos de arquitectura',
			coordinate: 'Coordinar',
			publish: 'Publicar',
			stage: 'Etapa',
			explore: 'Explorar',
			changeStage: 'Cambiar etapa',
			previous: 'Anterior',
			next: 'Siguiente',
			orchestration: [
				{ id: 'surface', kind: 'Experiencia', name: 'VS Code · Kiro · MCP', short: 'La persona inicia y observa el trabajo.', title: 'Una tarea puede comenzar en cualquier superficie', description: 'Las fachadas resuelven instalación y experiencia nativa. Todas hablan con el mismo contrato del Router, por lo que la coordinación no se reimplementa en cada cliente.', href: 'integrations/' },
				{ id: 'router', kind: 'Control plane', name: 'Router', short: 'Coordina roles, políticas y recuperación.', title: 'Router convierte la intención en un workflow durable', description: 'Fija la configuración de la sesión, selecciona participantes exactos y conserva estado, evidencia y decisiones aunque el cliente se reinicie.', href: 'components/router/' },
				{ id: 'manager', kind: 'Identidad', name: 'Agent Manager', short: 'Resuelve AgentRef y digest.', title: 'Agent Manager resuelve identidades, no código fuente', description: 'El catálogo devuelve una versión inmutable, sus capacidades y la ubicación estable del artefacto. El equipo propietario continúa siendo dueño del agente.', href: 'components/agent-manager/' },
				{ id: 'runner', kind: 'Data plane', name: 'Runner', short: 'Verifica y ejecuta el artefacto.', title: 'Runner aplica la frontera de ejecución', description: 'Comprueba identidad y digest, limita tiempo y E/S, entrega solamente el workspace autorizado y conserva el resultado de la invocación.', href: 'components/runner/' },
				{ id: 'workspace', kind: 'Resultado', name: 'Workspace', short: 'Cambios y evidencia verificables.', title: 'El resultado vuelve como evidencia durable', description: 'Planificación y revisión observan copias de solo lectura. Implementación puede recibir el workspace exacto únicamente cuando rol, manifiesto y política permiten escritura.', href: 'concepts/capabilities-effects/' },
			],
			publishing: [
				{ id: 'source', kind: 'Propiedad', name: 'Repositorio del agente', short: 'Código, prompts y pruebas del equipo.', title: 'El agente nace fuera de Baldr', description: 'Cada equipo elige lenguaje, diseño interno y calendario de release. Baldr no incorpora ese código a su núcleo.', href: 'guides/create-agent/' },
				{ id: 'sdk', kind: 'Autoría', name: 'SDK', short: 'API mínima Python o TypeScript.', title: 'El SDK expresa el contrato del agente', description: 'La aplicación importa solamente la API de autoría: identidad, capacidades, eventos y respuesta. La toolchain queda fuera del runtime del agente.', href: 'components/sdks/' },
				{ id: 'builder', kind: 'Toolchain', name: 'Agent Builder', short: 'Prueba, construye y publica.', title: 'Builder gobierna el ciclo de release', description: 'Una CLI neutral descubre el driver del lenguaje, exige builds reproducibles y publica versiones que no pueden cambiar silenciosamente.', href: 'components/agent-builder/' },
				{ id: 'driver', kind: 'Políglota', name: 'Driver', short: 'Convierte fuentes en un artefacto.', title: 'Cada lenguaje implementa Builder Protocol', description: 'Python, TypeScript y futuros lenguajes pueden tener toolchains diferentes sin cambiar Agent Manager, Runner ni Router.', href: 'reference/router/builder-protocol/' },
				{ id: 'release', kind: 'Distribución', name: 'Release inmutable', short: 'Artefacto, manifiesto y digest.', title: 'El release cruza la frontera; el checkout no', description: 'Baldr recibe una identidad exacta y una ubicación estable. Repetir la misma publicación es idempotente; cambiar contenido exige una versión nueva.', href: 'concepts/identity/' },
			],
		},
		landing: {
			eyebrow: 'Una frontera clara',
			title: 'El comportamiento vive afuera.<br />La coordinación queda en Baldr.',
			intro: 'Los equipos mantienen código, prompts, pruebas y releases. Baldr descubre identidades exactas, controla capacidades, ejecuta artefactos externos y conserva el estado del trabajo.',
			principles: [
				{ term: 'Propiedad', description: 'El agente sigue en el repositorio de su equipo.' },
				{ term: 'Identidad', description: 'AgentRef, versión y digest fijan qué se ejecuta.' },
				{ term: 'Continuidad', description: 'El workflow sobrevive a clientes y reinicios.' },
			],
			responsibilitiesEyebrow: 'Responsabilidades',
			responsibilitiesTitle: 'Un núcleo chico.<br />Piezas con límites.',
			responsibilitiesIntro: 'Cada componente tiene una sola razón para cambiar. Esa separación permite sumar agentes, lenguajes y superficies sin agrandar el Router.',
			learnMore: 'Conocer la pieza',
			responsibilities: [
				{ index: '01', label: 'Coordinar', title: 'Router convierte intención en trabajo durable', description: 'Fija roles, políticas y participantes exactos sin incorporar el código privado de los agentes.', href: 'components/router/' },
				{ index: '02', label: 'Resolver', title: 'Agent Manager entrega identidad verificable', description: 'Resuelve AgentRef, versión, capacidades y digest antes de que una fase pueda ejecutarse.', href: 'components/agent-manager/' },
				{ index: '03', label: 'Publicar', title: 'SDK y Builder producen releases reproducibles', description: 'Cada lenguaje conserva su toolchain y cruza la frontera como un artefacto inmutable.', href: 'components/agent-builder/' },
				{ index: '04', label: 'Ejecutar', title: 'Runner aplica capacidades y efectos', description: 'Verifica el artefacto, limita la invocación y entrega únicamente el workspace autorizado.', href: 'components/runner/' },
			],
			pathsEyebrow: 'Elegí tu entrada',
			pathsTitle: 'Empezá por lo que necesitás resolver.',
			pathsLabel: 'Recorridos para comenzar',
			paths: [
				{ eyebrow: 'Entender', title: 'Qué es Baldr', description: 'El modelo del sistema en cinco minutos.', href: 'overview/' },
				{ eyebrow: 'Construir', title: 'Crear un agente', description: 'Del scaffold al primer test local.', href: 'guides/create-agent/' },
				{ eyebrow: 'Conectar', title: 'Integrar una superficie', description: 'VS Code, Kiro, CLI y MCP.', href: 'integrations/' },
				{ eyebrow: 'Verificar', title: 'Leer los contratos', description: 'Referencia técnica fijada por versión.', href: 'reference/' },
			],
		},
	},
} as const;

export function copyForLocale(locale: string | undefined) {
	return locale === 'es' ? siteCopy.es : siteCopy.en;
}
