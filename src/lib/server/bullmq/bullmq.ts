// src/lib/server/bullmq/bullmq.ts
// import { Queue, type ConnectionOptions } from 'bullmq';
// import { env } from '$env/dynamic/private';

// let quizMQ: Queue | undefined;

/**
 * A factory function to get a singleton instance of the BullMQ queue.
 * This pattern allows us to inject a specific Redis connection for tests,
 * while the main application can call it without arguments to use environment variables.
 * @param connection - Optional connection options for Redis.
 * @returns The singleton Queue instance.
//  */
// export function getQuizMQ(connection?: ConnectionOptions): Queue {
// 	if (quizMQ) {
// 		return quizMQ;
// 	}

// 	const conn: ConnectionOptions = connection ?? {
// 		host: env.REDIS_HOST ?? 'localhost',
// 		port: Number(env.REDIS_PORT ?? 6379),
// 		maxRetriesPerRequest: null
// 	};

// 	console.log(`Connecting to Redis at ${conn.host}:${conn.port}`);

// 	quizMQ = new Queue('question-scheduling', { connection: conn });

// 	// Graceful shutdown
// 	const gracefulShutdown = async () => {
// 		console.log('Closing BullMQ queue connection...');
// 		await quizMQ?.close();
// 		process.exit(0);
// 	};

// 	process.on('SIGTERM', gracefulShutdown);
// 	process.on('SIGINT', gracefulShutdown);

// 	return quizMQ;
// }
