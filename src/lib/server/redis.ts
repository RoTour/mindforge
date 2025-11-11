// /Users/rotour/projects/mindforge/src/lib/server/redis.ts
import type { WorkerOptions } from 'bullmq';
import { env } from '$env/dynamic/private';

export const redisConnection: WorkerOptions['connection'] = {
	host: env.REDIS_HOST ?? 'localhost',
	port: parseInt(env.REDIS_PORT, 10)
};
