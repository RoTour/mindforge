// src/routes/+page.server.ts
import { serialize } from '$lib/lib/utils';
import { createContext } from '$lib/server/trpc/context';
import { appRouter } from '$lib/server/trpc/router';
import type { PageServerLoad } from './$types';
import { redirectOnTRPCError } from '$lib/server/trpc/guard';
import { TRPCError } from '@trpc/server';

export const load: PageServerLoad = async (event) => {
	try {
		const caller = appRouter.createCaller(await createContext(event));
		const promotions = await caller.studentDashboard.getMyPromotions();

		return {
			promotions: serialize(promotions)
		};
	} catch (e) {
		if (e instanceof TRPCError && e.code === 'FORBIDDEN') {
			// User is logged in, but not a student (or has no student profile).
			// This is not an exceptional case for the home page.
			// We can show them a different view (e.g. teacher dashboard link).
			return { promotions: [] };
		}

		// For other errors, like UNAUTHORIZED, we can redirect.
		redirectOnTRPCError(e, {
			UNAUTHORIZED: '/auth/sign-in'
		});
	}
};
