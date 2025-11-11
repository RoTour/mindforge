// /Users/rotour/projects/mindforge/src/lib/server/redis.ts
import type { WorkerOptions } from 'bullmq';

interface RedisConfig {
	host: string;
	port: number;
}

export const createRedisConnection = (config: RedisConfig): WorkerOptions['connection'] => {
	return {
		host: config.host,
		port: config.port
	};
};
