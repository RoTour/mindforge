import { betterAuth } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import { prisma } from '$lib/server/prisma/prisma';
import { env } from '$env/dynamic/private';

export const auth = betterAuth({
	emailAndPassword: {
		enabled: true
	},
	socialProviders: {
		github: {
			clientId: env.GITHUB_CLIENT_ID as string,
			clientSecret: env.GITHUB_CLIENT_SECRET as string
		}
	},
	database: prismaAdapter(prisma, {
		provider: 'postgresql'
	})
});
