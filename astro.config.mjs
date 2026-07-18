// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';

export default defineConfig({
	site: 'https://baldrvivaldelli.github.io',
	base: '/baldr-site',
	integrations: [
		starlight({
			title: 'Baldr',
			description:
				'Control plane local para coordinar agentes, herramientas y trabajo durable.',
			locales: {
				root: { label: 'Español', lang: 'es' },
			},
			favicon: '/favicon.svg',
			logo: {
				src: './src/assets/baldr-logo.svg',
				alt: 'Baldr',
			},
			customCss: ['./src/styles/custom.css'],
			social: [
				{
					icon: 'github',
					label: 'Baldr en GitHub',
					href: 'https://github.com/BaldrVivaldelli/baldr-router',
				},
			],
			editLink: {
				baseUrl: 'https://github.com/BaldrVivaldelli/baldr-site/edit/main/',
			},
			lastUpdated: true,
			tableOfContents: { minHeadingLevel: 2, maxHeadingLevel: 3 },
			head: [
				{
					tag: 'meta',
					attrs: { name: 'theme-color', content: '#101a18' },
				},
			],
			sidebar: [
				{
					label: 'Explorar Baldr',
					items: [
						{ label: 'Qué es Baldr', slug: 'overview' },
						{ label: 'Arquitectura interactiva', slug: 'explore' },
						{ label: 'Componentes', slug: 'components' },
					],
				},
				{
					label: 'Componentes',
					items: [
						{ label: 'Router', slug: 'components/router' },
						{ label: 'Agent Manager', slug: 'components/agent-manager' },
						{ label: 'Agent Runner', slug: 'components/runner' },
						{ label: 'Agent Builder', slug: 'components/agent-builder' },
						{ label: 'SDKs', slug: 'components/sdks' },
					],
				},
				{
					label: 'Conceptos',
					items: [
						{ label: 'Modelo conceptual', slug: 'concepts' },
						{ label: 'Identidad inmutable', slug: 'concepts/identity' },
						{
							label: 'Capacidades y efectos',
							slug: 'concepts/capabilities-effects',
						},
						{ label: 'Workflows durables', slug: 'concepts/durable-workflows' },
					],
				},
				{
					label: 'Guías',
					items: [
						{ label: 'Elegir un recorrido', slug: 'guides' },
						{ label: 'Crear un agente', slug: 'guides/create-agent' },
						{ label: 'Publicar un agente', slug: 'guides/publish-agent' },
						{ label: 'Ejecutar con Baldr', slug: 'guides/run-agent' },
					],
				},
				{
					label: 'Integraciones',
					items: [
						{ label: 'Superficies disponibles', slug: 'integrations' },
						{ label: 'VS Code', slug: 'integrations/vscode' },
						{ label: 'Kiro', slug: 'integrations/kiro' },
						{ label: 'CLI y MCP', slug: 'integrations/cli-mcp' },
					],
				},
				{
					label: 'Referencia',
					items: [
						{ label: 'Documentación técnica', slug: 'reference' },
						{ autogenerate: { directory: 'reference/router' } },
					],
				},
				{
					label: 'Proyecto',
					items: [{ label: 'Changelog', slug: 'changelog' }],
				},
			],
		}),
	],
});
