// /Users/rotour/projects/mindforge/src/lib/server/redis.ts
import type { WorkerOptions } from 'bullmq';

export const redisConnection: WorkerOptions['connection'] = {
	host: Bun.env.REDIS_HOST ?? 'localhost',
	port: parseInt(Bun.env.REDIS_PORT, 10)
};
