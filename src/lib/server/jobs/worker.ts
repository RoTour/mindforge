// src/lib/server/jobs/worker.ts

import { Worker } from 'bullmq';

// Define the connection options (same as the queue)
const connection = {
	host: Bun.env.REDIS_HOST,
	port: parseInt(Bun.env.REDIS_PORT, 10)
};

console.log('Starting question scheduling worker...');

const worker = new Worker(
	'question-scheduling',
	async (job) => {
		// This is where your job processing logic goes
		const { promotionId, questionId } = job.data;
		console.log(
			`Processing job ${job.id}: Starting session for question ${questionId} in promotion ${promotionId}`
		);

		try {
			// Here you would call your application service/logic
			// For example, by calling an internal API endpoint or importing a service function.
			// This keeps the worker's responsibility small.
			await fetch(`${Bun.env.API_BASE_URL}/api/scheduler/trigger-internal`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ promotionId, questionId })
			});

			console.log(`Job ${job.id} completed successfully.`);
		} catch (error) {
			console.error(`Job ${job.id} failed:`, error);
			// The worker will automatically retry based on queue settings
			throw error; // Re-throw to let BullMQ know it failed
		}
	},
	{ connection }
);

worker.on('ready', () => {
	console.log('Question scheduling worker is ready and listening for jobs !');
});

worker.on('failed', (job, err) => {
	if (job) {
		console.error(`Job ${job.id} has failed with error ${err.message}`);
	}
});
