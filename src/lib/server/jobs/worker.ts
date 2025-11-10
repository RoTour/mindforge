// src/lib/server/jobs/worker.ts

import { startScheduleQuestionSessionWorker } from '$quiz/question-session/adapters/ScheduleQuestionSessionWorker.adapter';
import { redisConnection } from '../redis';

console.log('Starting question scheduling workers...');

export const workers = [startScheduleQuestionSessionWorker(redisConnection)];
