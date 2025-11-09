import { Queue } from 'bullmq';
import { env } from '$env/dynamic/private';

const connection = {
	host: env.REDIS_HOST,
	port: Number(env.REDIS_PORT)
};

console.log('Starting scheduling worker ...');
console.log('Connecting to Redis at', `${env.REDIS_HOST}:${env.REDIS_PORT}`);

export const quizMQ = new Queue('question-scheduling', { connection });
