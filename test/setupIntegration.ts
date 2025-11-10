import { PostgreSqlContainer, type StartedPostgreSqlContainer } from '@testcontainers/postgresql';
import { RedisContainer, type StartedRedisContainer } from '@testcontainers/redis';
import { afterAll, beforeAll, beforeEach } from 'vitest';
import { PrismaClient } from '../prisma/generated/client';
import { execSync } from 'child_process';
import type { RedisOptions } from 'ioredis';

let postgresContainer: StartedPostgreSqlContainer;
let redisContainer: StartedRedisContainer;
let prisma: PrismaClient;
let testRedisConnection: RedisOptions;

const resetDb = async () => {
	// This function is called by a beforeEach hook to ensure data isolation between tests
	await prisma.$transaction([
		prisma.studentsOnPromotions.deleteMany(),
		prisma.plannedQuestion.deleteMany(),
		prisma.answer.deleteMany(),
		prisma.questionSession.deleteMany(),
		prisma.question.deleteMany(),
		prisma.promotion.deleteMany(),
		prisma.student.deleteMany(),
		prisma.teacher.deleteMany(),
		prisma.account.deleteMany(),
		prisma.verification.deleteMany(),
		prisma.session.deleteMany(),
		prisma.user.deleteMany()
	]);
};

beforeAll(async () => {
	// Start both containers in parallel for faster setup
	[postgresContainer, redisContainer] = await Promise.all([
		new PostgreSqlContainer('postgres:16-alpine').start(),
		// Use the dedicated RedisContainer with the specific image tag for consistency
		new RedisContainer('redis:8.4-rc1-alpine').start()
	]);

	// --- Setup PostgreSQL and Prisma ---
	const dbUrl = postgresContainer.getConnectionUri();
	process.env.DATABASE_URL = dbUrl; // Set env var for prisma CLI
	execSync('bun prisma db push', {
		env: process.env
	});
	prisma = new PrismaClient({
		datasourceUrl: dbUrl
	});

	// --- Setup Redis ---
	testRedisConnection = {
		host: redisContainer.getHost(),
		port: redisContainer.getMappedPort(6379),
		maxRetriesPerRequest: null // Recommended for BullMQ
	};
}, 30000); // Increase timeout for starting containers

beforeEach(async () => {
	await resetDb();
});

afterAll(async () => {
	// Disconnect clients first, then stop the containers
	await prisma.$disconnect();
	await Promise.all([postgresContainer.stop(), redisContainer.stop()]);
}, 10000);

export const getPrismaTestClient = () => prisma;
export const getTestRedisConnection = () => testRedisConnection;
