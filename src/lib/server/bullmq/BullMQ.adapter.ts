// /Users/rotour/projects/mindforge/src/lib/server/bullmq/BullMQ.adapter.ts
import { Queue, Worker, Job as BullMQJob, type QueueOptions, type JobsOptions } from 'bullmq';
import type { IMessageQueue, Job } from '$ddd/interfaces/IMessageQueue';

export class BullMQAdapter implements IMessageQueue {
	private queues: Map<string, Queue> = new Map();
	private workers: Map<string, Worker> = new Map();

	constructor(private readonly connection: QueueOptions['connection']) {}

	async add<T>(job: Job<T>): Promise<BullMQJob> {
		const { name, data, opts } = job;
		let queue = this.queues.get(name);
		if (!queue) {
			queue = new Queue(name, { connection: this.connection });
			this.queues.set(name, queue);
		}
		// The generic JobOptions are compatible with BullMQ's JobsOptions
		return queue.add(name, data, opts as JobsOptions);
	}

	process<T>(name: string, callback: (job: Job<T>) => Promise<void>): void {
		let worker = this.workers.get(name);
		if (worker) {
			return;
		}

		worker = new Worker(
			name,
			async (bullMQJob: BullMQJob) => {
				const job: Job<T> = {
					name: bullMQJob.name,
					data: bullMQJob.data as T,
					opts: bullMQJob.opts
				};
				await callback(job);
			},
			{ connection: this.connection }
		);

		this.workers.set(name, worker);
	}

	async debug(): Promise<void> {
		const items = await Promise.all(
			Array.from(this.queues.entries()).map(async ([key, val]) => ({
				name: key,
				active: await val.getActiveCount(),
				completed: await val.getCompletedCount(),
				failed: await val.getFailedCount(),
				delayed: await val.getDelayedCount(),
				waiting: await val.getWaitingCount()
			}))
		);
		console.debug('[DEBUG] BullMQ Adapter', items);
	}
}
