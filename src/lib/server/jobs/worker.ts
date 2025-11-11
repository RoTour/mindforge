// This is a separate process that runs in parallel to the main server process.
// It can't rely on sveltekit's environment variables, so we use the same logic as in server/redis.ts to get env vars.

import { startScheduleQuestionSessionWorker } from '$quiz/question-session/adapters/ScheduleQuestionSessionWorker.adapter';
import type { WorkerOptions } from 'bullmq';

const redisConnection: WorkerOptions['connection'] = {
	host: Bun.env.REDIS_HOST ?? 'localhost',
	port: parseInt(Bun.env.REDIS_PORT, 10)
};

console.log('Starting question scheduling workers...');

export const workers = [startScheduleQuestionSessionWorker(redisConnection)];
