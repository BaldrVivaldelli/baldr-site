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
				'A local control plane for coordinating agents, tools, and durable work.',
			locales: {
				root: { label: 'English', lang: 'en' },
				es: { label: 'Español', lang: 'es' },
			},
			favicon: '/favicon.svg',
			logo: {
				src: './src/assets/baldr-logo.svg',
				alt: '',
			},
			customCss: ['./src/styles/custom.css'],
			social: [
				{
					icon: 'github',
					label: 'Baldr on GitHub',
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
					label: 'Explore Baldr',
					translations: { es: 'Explorar Baldr' },
					items: [
						{ label: 'What is Baldr', translations: { es: 'Qué es Baldr' }, slug: 'overview' },
						{
							label: 'Interactive architecture',
							translations: { es: 'Arquitectura interactiva' },
							slug: 'explore',
						},
						{ label: 'Components', translations: { es: 'Componentes' }, slug: 'components' },
					],
				},
				{
					label: 'Components',
					translations: { es: 'Componentes' },
					items: [
						{ label: 'Router', slug: 'components/router' },
						{ label: 'Agent Manager', slug: 'components/agent-manager' },
						{ label: 'Agent Runner', slug: 'components/runner' },
						{ label: 'Agent Builder', slug: 'components/agent-builder' },
						{ label: 'SDKs', slug: 'components/sdks' },
					],
				},
				{
					label: 'Concepts',
					translations: { es: 'Conceptos' },
					items: [
						{
							label: 'Conceptual model',
							translations: { es: 'Modelo conceptual' },
							slug: 'concepts',
						},
						{
							label: 'Immutable identity',
							translations: { es: 'Identidad inmutable' },
							slug: 'concepts/identity',
						},
						{
							label: 'Capabilities and effects',
							translations: { es: 'Capacidades y efectos' },
							slug: 'concepts/capabilities-effects',
						},
						{
							label: 'Durable workflows',
							translations: { es: 'Workflows durables' },
							slug: 'concepts/durable-workflows',
						},
					],
				},
				{
					label: 'Guides',
					translations: { es: 'Guías' },
					items: [
						{
							label: 'Choose a path',
							translations: { es: 'Elegir un recorrido' },
							slug: 'guides',
						},
						{
							label: 'Create an agent',
							translations: { es: 'Crear un agente' },
							slug: 'guides/create-agent',
						},
						{
							label: 'Publish an agent',
							translations: { es: 'Publicar un agente' },
							slug: 'guides/publish-agent',
						},
						{
							label: 'Run with Baldr',
							translations: { es: 'Ejecutar con Baldr' },
							slug: 'guides/run-agent',
						},
					],
				},
				{
					label: 'Integrations',
					translations: { es: 'Integraciones' },
					items: [
						{
							label: 'Available surfaces',
							translations: { es: 'Superficies disponibles' },
							slug: 'integrations',
						},
						{ label: 'VS Code', slug: 'integrations/vscode' },
						{ label: 'Kiro', slug: 'integrations/kiro' },
						{ label: 'CLI and MCP', translations: { es: 'CLI y MCP' }, slug: 'integrations/cli-mcp' },
					],
				},
				{
					label: 'Reference',
					translations: { es: 'Referencia' },
					items: [
						{
							label: 'Technical documentation',
							translations: { es: 'Documentación técnica' },
							slug: 'reference',
						},
						{ autogenerate: { directory: 'reference/router' } },
					],
				},
				{
					label: 'Project',
					translations: { es: 'Proyecto' },
					items: [{ label: 'Changelog', slug: 'changelog' }],
				},
			],
		}),
	],
});
