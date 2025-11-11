// @path: /Users/rotour/projects/mindforge/src/lib/server/IEnvironment.ts

export interface IEnvironment {
	DATABASE_URL: string;
	REDIS_HOST: string;
	REDIS_PORT: string;
	OPENROUTER_API_KEY: string;
	OPENROUTER_MODEL_NAME?: string;
}
