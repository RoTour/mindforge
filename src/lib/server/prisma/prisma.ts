import { PrismaClient } from '../../../../prisma/generated/client';
import { env } from '$env/dynamic/private';

console.debug('Initializing db connection to ', env.DATABASE_URL);
export const prisma = new PrismaClient({
	datasourceUrl: env.DATABASE_URL
});
