// This is a separate process that runs in parallel to the main server process.
import { startScheduleQuestionSessionWorker } from '$quiz/question-session/adapters/ScheduleQuestionSessionWorker.adapter';
import { startRegisterStudentAnswerWorker } from '$quiz/question-session/adapters/RegisterStudentAnswerWorker.adapter';
import type { WorkerOptions } from 'bullmq';
import { ServiceProviderFactory } from '../ServiceProvider';
import type { IEnvironment } from '../IEnvironment';

// 1. Create an environment implementation specific to the worker
class WorkerEnvironment implements IEnvironment {
	get DATABASE_URL(): string {
		return Bun.env.DATABASE_URL_DOCKER!;
	}
	get REDIS_HOST(): string {
		return Bun.env.REDIS_HOST!;
	}
	get REDIS_PORT(): string {
		return Bun.env.REDIS_PORT!;
	}
	get OPENROUTER_API_KEY(): string {
		return Bun.env.OPENROUTER_API_KEY!;
	}
	get OPENROUTER_MODEL_NAME(): string | undefined {
		return Bun.env.OPENROUTER_MODEL_NAME;
	}
	get RESEND_API_KEY(): string {
		return Bun.env.RESEND_API_KEY!;
	}
	get RESEND_FROM_EMAIL(): string {
		return Bun.env.RESEND_FROM_EMAIL!;
	}
}

// 2. Use the factory to create a serviceProvider instance for the worker
const factory = new ServiceProviderFactory(new WorkerEnvironment());
const serviceProvider = factory.create();

// 3. Create the redis connection for the worker
const redisConnection: WorkerOptions['connection'] = {
	host: Bun.env.REDIS_HOST ?? 'localhost',
	port: parseInt(Bun.env.REDIS_PORT!, 10)
};

// This log is used by testContainers to ensure the worker is ready - do not remove it
console.log('Workers are ready and listening for jobs !');

console.log(`Connecting to Redis at ${redisConnection.host}:${redisConnection.port}`);

console.log('Starting workers...');
// 4. Start the worker, injecting the required repository from the service provider
export const workers = [
	startScheduleQuestionSessionWorker(redisConnection, serviceProvider.QuestionSessionRepository),
	startRegisterStudentAnswerWorker(redisConnection, serviceProvider.QuestionSessionRepository)
];
