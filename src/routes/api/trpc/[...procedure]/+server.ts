import type { RequestHandler } from './$types';
import { fetchRequestHandler } from '@trpc/server/adapters/fetch';
import { appRouter } from '$lib/server/trpc/router';

export const GET: RequestHandler = (event) => {
	return fetchRequestHandler({
		endpoint: '/api/trpc',
		req: event.request,
		router: appRouter,
		createContext() {
			// pass anything here that you want to access in your resolvers
			// const user = event.locals.user;
			return {
				// user
			};
		}
	});
};

export const POST = GET;
