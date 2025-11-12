import { PostgreSqlContainer, type StartedPostgreSqlContainer } from '@testcontainers/postgresql';
import { RedisContainer, type StartedRedisContainer } from '@testcontainers/redis';
import { afterAll, beforeAll, beforeEach } from 'vitest';
import { PrismaClient } from '../prisma/generated/client';
import { execSync } from 'child_process';
import type { RedisOptions } from 'ioredis';
import {
	GenericContainer,
	Wait,
	Network,
	type StartedNetwork,
	type StartedTestContainer
} from 'testcontainers';

let postgresContainer: StartedPostgreSqlContainer;
let redisContainer: StartedRedisContainer;
let workerContainer: StartedTestContainer;
let network: StartedNetwork;
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
	network = await new Network().start();

	// Start both containers in parallel for faster setup
	[postgresContainer, redisContainer] = await Promise.all([
		new PostgreSqlContainer('postgres:16-alpine')
			.withNetwork(network)
			.withNetworkAliases('db')
			.start(),
		new RedisContainer('redis:7.2-alpine').withNetwork(network).withNetworkAliases('redis').start()
	]);

	// --- Setup PostgreSQL and Prisma ---
	const dbUrl = postgresContainer.getConnectionUri();
	prisma = new PrismaClient({
		datasourceUrl: dbUrl
	});
	// We apply migrations using the prisma client from the testcontainers, but we need to set the env var for the worker container
	execSync('bun prisma db push', {
		env: { ...process.env, DATABASE_URL: dbUrl }
	});

	// --- Setup Redis ---
	testRedisConnection = {
		host: redisContainer.getHost(),
		port: redisContainer.getMappedPort(6379),
		maxRetriesPerRequest: null // Recommended for BullMQ
	};

	const container = await GenericContainer.fromDockerfile('../dev').build();
	// --- Setup Worker ---
	workerContainer = await container
		.withNetwork(network)
		.withEnvironment({
			DATABASE_URL: postgresContainer.getConnectionUri().replace(postgresContainer.getHost(), 'db'), // Use network alias
			REDIS_HOST: 'redis',
			REDIS_PORT: '6379',
			OPENROUTER_API_KEY: 'test-key', // Provide dummy values
			OPENROUTER_MODEL_NAME: 'test-model'
		})
		.withCommand(['bun', 'run', 'src/lib/server/jobs/worker.ts'])
		.withWaitStrategy(
			Wait.forLogMessage('Question scheduling worker is ready and listening for jobs !')
		)
		.start();
}, 60000); // Increase timeout for starting containers

beforeEach(async () => {
	await resetDb();
});

afterAll(async () => {
	// Disconnect clients first, then stop the containers
	await prisma.$disconnect();
	await Promise.all([postgresContainer.stop(), redisContainer.stop(), workerContainer.stop()]);
}, 20000);

export const getPrismaTestClient = () => prisma;
export const getTestRedisConnection = () => testRedisConnection;
