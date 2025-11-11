import { betterAuth } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import { env } from '$env/dynamic/private';
import { serviceProvider } from './server/container';

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
	database: prismaAdapter(serviceProvider.clients.prisma, {
		provider: 'postgresql'
	})
});
