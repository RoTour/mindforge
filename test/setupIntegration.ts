import { PostgreSqlContainer, StartedPostgreSqlContainer } from '@testcontainers/postgresql';
import { beforeAll, beforeEach, afterAll } from 'vitest';
import { PrismaClient } from '../prisma/generated/client';
import { execSync } from 'child_process';

let postgresContainer: StartedPostgreSqlContainer;
let prisma: PrismaClient;

const resetDb = async () => {
	await prisma.$transaction([
		prisma.studentsOnPromotions.deleteMany(),
		prisma.question.deleteMany(),
		prisma.answer.deleteMany(),
		prisma.questionSession.deleteMany(),
		prisma.plannedQuestion.deleteMany(),
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
	postgresContainer = await new PostgreSqlContainer('postgres:18').start();
	const dbUrl = postgresContainer.getConnectionUri();
	console.debug('Test database URL: ', dbUrl);
	execSync('bun prisma db push', {
		env: {
			...process.env,
			DATABASE_URL: dbUrl
		}
	});
	prisma = new PrismaClient({
		datasourceUrl: dbUrl
		// log: process.env.DEBUG ? ['query', 'error', 'warn'] : ['error']
	});
}, 30000); // Increase timeout for starting the container

beforeEach(async () => {
	await resetDb();
});

afterAll(async () => {
	await postgresContainer.stop();
	await prisma.$disconnect();
});

export const getPrismaTestClient = () => prisma;
