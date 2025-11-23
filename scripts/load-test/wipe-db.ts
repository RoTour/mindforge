import dotenv from 'dotenv';
import path from 'path';
import { PrismaClient } from '../../prisma/generated/client';

// Load environment variables from env.loadtest
const envPath = path.resolve(process.cwd(), 'env.loadtest');
dotenv.config({ path: envPath, override: true });

const prisma = new PrismaClient();

async function main() {
	console.log('Wiping database...');
	
	// Order matters due to foreign keys if we don't use CASCADE
	// But TRUNCATE ... CASCADE handles it.
	const tablenames = await prisma.$queryRaw<
		Array<{ tablename: string }>
	>`SELECT tablename FROM pg_tables WHERE schemaname='public'`;

	const tables = tablenames
		.map(({ tablename }) => tablename)
		.filter((name) => name !== '_prisma_migrations')
		.map((name) => `"public"."${name}"`)
		.join(', ');

	if (tables.length > 0) {
		await prisma.$executeRawUnsafe(`TRUNCATE TABLE ${tables} CASCADE;`);
		console.log('Database wiped.');
	} else {
		console.log('No tables found to wipe.');
	}
}

main()
	.catch((e) => {
		console.error(e);
		process.exit(1);
	})
	.finally(async () => {
		await prisma.$disconnect();
	});
