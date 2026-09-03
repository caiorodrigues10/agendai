import path from 'path'
import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig(({ mode }) => {
	const env = loadEnv(mode, '.', '')
	return {
		server: {
			port: 3003,
			host: '0.0.0.0',
			proxy: {
				'/api': {
					target: 'http://127.0.0.1:3333',
					ws: true,
				},
			},
			allowedHosts: [
				'ngrok.com',
				'ngrok-free.app',
				'9429-2001-12b4-604-9700-3408-16b6-8813-bba4.ngrok-free.app',
				'2669-201-33-79-229.ngrok-free.app',
			],
		},
		plugins: [
			react(),
			VitePWA({
				registerType: 'prompt',
				injectRegister: null,
				includeAssets: [
					'favicon.svg',
					'brand/*.svg',
					'brand/*.png',
					'icons/*.png',
					'screenshots/*.png',
				],
				manifest: {
					id: '/',
					name: 'AgendAI — Gestão para salões, barbearias e studios',
					short_name: 'AgendAI',
					description:
						'Fila digital, agenda, clientes e gestão do salão em uma experiência mobile-first.',
					lang: 'pt-BR',
					start_url: '/app/overview?source=pwa',
					scope: '/',
					display: 'standalone',
					orientation: 'any',
					background_color: '#0f0f0f',
					theme_color: '#0f0f0f',
					categories: ['business', 'productivity', 'lifestyle'],
					icons: [
						{
							src: '/icons/pwa-192x192.png',
							sizes: '192x192',
							type: 'image/png',
							purpose: 'any',
						},
						{
							src: '/icons/pwa-512x512.png',
							sizes: '512x512',
							type: 'image/png',
							purpose: 'any',
						},
						{
							src: '/icons/pwa-maskable-192x192.png',
							sizes: '192x192',
							type: 'image/png',
							purpose: 'maskable',
						},
						{
							src: '/icons/pwa-maskable-512x512.png',
							sizes: '512x512',
							type: 'image/png',
							purpose: 'maskable',
						},
					],
					screenshots: [
						{
							src: '/screenshots/queue-real.png',
							sizes: '1400x900',
							type: 'image/png',
							form_factor: 'wide',
							label: 'Fila digital do salão',
						},
						{
							src: '/screenshots/appointments-real.png',
							sizes: '1400x1001',
							type: 'image/png',
							form_factor: 'wide',
							label: 'Agenda do salão',
						},
					],
					shortcuts: [
						{
							name: 'Fila',
							short_name: 'Fila',
							url: '/app/queue?source=pwa-shortcut',
							icons: [{ src: '/icons/pwa-192x192.png', sizes: '192x192' }],
						},
						{
							name: 'Agenda',
							short_name: 'Agenda',
							url: '/app/appointments?source=pwa-shortcut',
							icons: [{ src: '/icons/pwa-192x192.png', sizes: '192x192' }],
						},
					],
				},
				workbox: {
					cleanupOutdatedCaches: true,
					clientsClaim: true,
					skipWaiting: false,
					navigateFallback: '/index.html',
					navigateFallbackDenylist: [/^\/api\//],
					runtimeCaching: [
						{
							urlPattern: ({ url }) => url.pathname.startsWith('/api/'),
							handler: 'NetworkOnly',
						},
						{
							urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
							handler: 'StaleWhileRevalidate',
							options: {
								cacheName: 'google-font-stylesheets',
								cacheableResponse: { statuses: [0, 200] },
							},
						},
						{
							urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
							handler: 'CacheFirst',
							options: {
								cacheName: 'google-font-files',
								cacheableResponse: { statuses: [0, 200] },
								expiration: { maxEntries: 12, maxAgeSeconds: 60 * 60 * 24 * 365 },
							},
						},
						{
							urlPattern: ({ url }) =>
								url.hostname !== 'storage.googleapis.com' &&
								!url.hostname.endsWith('.googleapis.com') &&
								/\.(?:png|jpg|jpeg|svg|webp|avif)$/i.test(url.pathname),
							handler: 'CacheFirst',
							options: {
								cacheName: 'agendai-static-images',
								cacheableResponse: { statuses: [0, 200] },
								expiration: { maxEntries: 80, maxAgeSeconds: 60 * 60 * 24 * 30 },
							},
						},
					],
				},
				devOptions: { enabled: false },
			}),
		],
		define: {
			'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
			'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
		},
		resolve: {
			alias: {
				'@': path.resolve(__dirname, 'src'),
			},
		},
	}
})
