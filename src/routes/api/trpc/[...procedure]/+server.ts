import type { RequestHandler } from './$types';
import { fetchRequestHandler } from '@trpc/server/adapters/fetch';
import { appRouter } from '$lib/server/trpc/router';
import { createContext } from '$lib/server/trpc/context';

export const GET: RequestHandler = (event) => {
	console.debug('Api handler locals', event.locals);
	return fetchRequestHandler({
		endpoint: '/api/trpc',
		req: event.request,
		router: appRouter,
		createContext: () => createContext(event)
	});
};

export const POST = GET;
