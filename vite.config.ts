import devtoolsJson from 'vite-plugin-devtools-json';
import tailwindcss from '@tailwindcss/vite';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [tailwindcss(), sveltekit(), devtoolsJson()],
	server: {
		watch: {
			ignored: ['**/generated/**', '**/.prisma/**', './prisma/generated']
		}
	},
	test: {
		projects: [
			{
				extends: './vite.config.ts',
				test: {
					name: 'unit',
					environment: 'node',
					include: ['src/**/*.{test,spec}.{js,ts}'],
					exclude: ['src/**/*.int.{test,spec}.{js,ts}', 'src/**/*.svelte.test.{js,ts}']
				}
			},
			{
				extends: './vite.config.ts',
				test: {
					name: 'integration',
					environment: 'node',
					include: ['src/**/*.int.{test,spec}.{js,ts}'],
					exclude: ['src/**/*.svelte.test.{js,ts}'],
					setupFiles: ['./test/setupIntegration.ts']
				}
			},
			{
				extends: './vite.config.ts',
				test: {
					name: 'long-running',
					environment: 'node',
					include: ['src/**/*.long.{test,spec}.{js,ts}'],
					setupFiles: ['./test/setupIntegration.ts']
				}
			}
		]
	}
});
