// src/lib/server/jobs/worker.ts

import { startScheduleQuestionSessionWorker } from '$quiz/question-session/adapters/ScheduleQuestionSessionWorker.adapter';
import { type WorkerOptions } from 'bullmq';

const connection: WorkerOptions['connection'] = {
	host: Bun.env.REDIS_HOST ?? 'localhost',
	port: parseInt(Bun.env.REDIS_PORT, 10)
};

console.log('Starting question scheduling workers...');

export const workers = [startScheduleQuestionSessionWorker(connection)];
