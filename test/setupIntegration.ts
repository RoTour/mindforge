import { PostgreSqlContainer, StartedPostgreSqlContainer } from '@testcontainers/postgresql';
import { beforeAll, beforeEach, afterAll } from 'vitest';
import { PrismaClient } from '../prisma/generated/client';
import { execSync } from 'child_process';

let postgresContainer: StartedPostgreSqlContainer;
let prisma: PrismaClient;

const resetDb = async () => {
	await prisma.$transaction([
		prisma.studentsOnPromotions.deleteMany(),
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
	execSync('bun prisma db push', {
		env: {
			...process.env,
			DATABASE_URL: postgresContainer.getConnectionUri()
		}
	});
	prisma = new PrismaClient({
		// datasourceUrl: `prisma+${postgresContainer.getConnectionUri()}?api_key=eyJkYXRhYmFzZVVybCI6InBvc3RncmVzOi8vcG9zdGdyZXM6cG9zdGdyZXNAbG9jYWxob3N0OjUxMjE0L3RlbXBsYXRlMT9zc2xtb2RlPWRpc2FibGUmY29ubmVjdGlvbl9saW1pdD0xJmNvbm5lY3RfdGltZW91dD0wJm1heF9pZGxlX2Nvbm5lY3Rpb25fbGlmZXRpbWU9MCZwb29sX3RpbWVvdXQ9MCZzaW5nbGVfdXNlX2Nvbm5lY3Rpb25zPXRydWUmc29ja2V0X3RpbWVvdXQ9MCIsIm5hbWUiOiJkZWZhdWx0Iiwic2hhZG93RGF0YWJhc2VVcmwiOiJwb3N0Z3JlczovL3Bvc3RncmVzOnBvc3RncmVzQGxvY2FsaG9zdDo1MTIxNS90ZW1wbGF0ZTE_c3NsbW9kZT1kaXNhYmxlJmNvbm5lY3Rpb25fbGltaXQ9MSZjb25uZWN0X3RpbWVvdXQ9MCZtYXhfaWRsZV9jb25uZWN0aW9uX2xpZmV0aW1lPTAmcG9vbF90aW1lb3V0PTAmc2luZ2xlX3VzZV9jb25uZWN0aW9ucz10cnVlJnNvY2tldF90aW1lb3V0PTAifQ`
		datasourceUrl: postgresContainer.getConnectionUri()
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
