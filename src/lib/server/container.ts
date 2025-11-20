// @path: /Users/rotour/projects/mindforge/src/lib/server/container.ts
import { env } from '$env/dynamic/private';
import type { IEnvironment } from './IEnvironment';
import { ServiceProviderFactory } from './ServiceProvider';

class SvelteKitEnvironment implements IEnvironment {
	get DATABASE_URL(): string {
		return env.DATABASE_URL;
	}
	get REDIS_HOST(): string {
		return env.REDIS_HOST;
	}
	get REDIS_PORT(): string {
		return env.REDIS_PORT;
	}
	get OPENROUTER_API_KEY(): string {
		return env.OPENROUTER_API_KEY;
	}
	get OPENROUTER_MODEL_NAME(): string | undefined {
		return env.OPENROUTER_MODEL_NAME;
	}
	get RESEND_API_KEY(): string {
		return env.RESEND_API_KEY;
	}
	get RESEND_FROM_EMAIL(): string {
		return env.RESEND_FROM_EMAIL;
	}
}

const appEnv = new SvelteKitEnvironment();
const factory = new ServiceProviderFactory(appEnv);
export const serviceProvider = factory.create();
console.debug('App env init', {
	REDIS_HOST: appEnv.REDIS_HOST,
	REDIS_PORT: appEnv.REDIS_PORT,
	DATABASE_URL: appEnv.DATABASE_URL,
	OPENROUTER_API_KEY: appEnv.OPENROUTER_API_KEY ? '****' : undefined,
	OPENROUTER_MODEL_NAME: appEnv.OPENROUTER_MODEL_NAME,
	RESEND_API_KEY: appEnv.RESEND_API_KEY ? '****' : undefined,
	RESEND_FROM_EMAIL: appEnv.RESEND_FROM_EMAIL
});
