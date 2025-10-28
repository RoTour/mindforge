import { createTRPCClient, httpBatchLink } from '@trpc/client';
import { browser } from '$app/environment';
import { page } from '$app/state';
import type { AppRouter } from './server/trpc/router.js';

export function createTRPC() {
	return createTRPCClient<AppRouter>({
		links: [
			httpBatchLink({
				// We use the absolute path on the server
				url: browser ? '/api/trpc' : `${page.url.origin}/api/trpc`
			})
		]
	});
}
