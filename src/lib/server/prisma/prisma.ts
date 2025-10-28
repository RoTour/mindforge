import { PrismaClient } from '../../../../prisma/generated/client';
import { env } from '$env/dynamic/private';

export const prisma = new PrismaClient({
	datasourceUrl: env.DATABASE_URL
});
