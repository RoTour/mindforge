// /Users/rotour/projects/mindforge/src/lib/server/redis.ts
import type { WorkerOptions } from 'bullmq';
import { env } from '$env/dynamic/private';

const getEnvSource = () => {
	return env ?? Bun.env ?? process.env;
};

export const redisConnection: WorkerOptions['connection'] = {
	host: getEnvSource().REDIS_HOST ?? 'localhost',
	port: parseInt(getEnvSource().REDIS_PORT, 10)
};
