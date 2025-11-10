// /Users/rotour/projects/mindforge/src/lib/server/bullmq/BullMQ.adapter.ts
import { Queue, Worker, Job as BullMQJob, type QueueOptions } from 'bullmq';
import type { IMessageQueue, Job } from '$lib/ddd/interfaces/MessageQueue.interface';

export class BullMQAdapter implements IMessageQueue {
	private queues: Map<string, Queue> = new Map();
	private workers: Map<string, Worker> = new Map();

	constructor(private readonly connection: QueueOptions['connection']) {}

	async add<T>(job: Job<T>): Promise<any> {
		const { name, data, opts } = job;
		let queue = this.queues.get(name);
		if (!queue) {
			queue = new Queue(name, { connection: this.connection });
			this.queues.set(name, queue);
		}
		return queue.add(name, data, opts);
	}

	process<T>(name: string, callback: (job: Job<T>) => Promise<void>): void {
		let worker = this.workers.get(name);
		if (worker) {
			// Worker for this queue is already processing.
			// Depending on the desired behavior, you might want to throw an error,
			// or simply return. For now, let's just return.
			return;
		}

		worker = new Worker(
			name,
			async (bullMQJob: BullMQJob) => {
				const job: Job<T> = {
					name: bullMQJob.name,
					data: bullMQJob.data
				};
				await callback(job);
			},
			{ connection: this.connection }
		);

		this.workers.set(name, worker);
	}
}
