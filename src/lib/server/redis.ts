// /Users/rotour/projects/mindforge/src/lib/server/redis.ts
import type { WorkerOptions } from 'bullmq';

interface RedisConfig {
	host: string;
	port: number;
}

export const createRedisConnection = (config: RedisConfig): WorkerOptions['connection'] => {
	const connection = {
		host: config.host,
		port: config.port
	};

	console.log(`Connecting to Redis at ${connection.host}:${connection.port}`);

	return connection;
};
