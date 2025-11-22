import { defineConfig } from 'vitest/config';

export default defineConfig({
	server: {
		watch: {
			ignored: [
				'**/generated/**',
				'**/.prisma/**',
				'**/prisma/generated/**',
				'**/node_modules/**',
				'**/dist/**'
			]
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
					setupFiles: ['./test/setupUnit.ts'],
					exclude: [
						'src/**/*.int.{test,spec}.{js,ts}',
						'src/**/*.svelte.test.{js,ts}',
						'src/**/*.long.{test,spec}.{js,ts}'
					]
				}
			},
			{
				extends: './vite.config.ts',
				test: {
					name: 'integration',
					environment: 'node',
					include: ['src/**/*.int.{test,spec}.{js,ts}'],
					exclude: ['src/**/*.svelte.test.{js,ts}'],
					setupFiles: ['./test/setupIntegration.ts'],
					hookTimeout: 60000
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
