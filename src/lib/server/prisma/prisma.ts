import { PrismaClient } from '../../../../prisma/generated/client';

export const createPrismaClient = (databaseUrl: string) => {
	console.debug('Initializing db connection to ', databaseUrl);
	return new PrismaClient({
		datasourceUrl: databaseUrl
	});
};
