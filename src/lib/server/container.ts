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
}

const factory = new ServiceProviderFactory(new SvelteKitEnvironment());
export const serviceProvider = factory.create();
