import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';
import { PrismaClient } from '../../../../prisma/generated/client';

export const createPrismaClient = (databaseUrl: string) => {
	console.debug('Initializing db connection to ', databaseUrl);
	const pool = new pg.Pool({ connectionString: databaseUrl });
	const adapter = new PrismaPg(pool);
	return new PrismaClient({ adapter });
};
