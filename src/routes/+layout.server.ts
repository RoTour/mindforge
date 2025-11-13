import { appRouter } from '$lib/server/trpc/router';
import type { LayoutServerLoad } from './$types';
import { createContext } from '$lib/server/trpc/context';
import { redirectOnTRPCError } from '$lib/server/trpc/guard';

export const load: LayoutServerLoad = async (event) => {
	try {
		const caller = appRouter.createCaller(await createContext(event));
		const userIsTeacher = await caller.teacher.amIaTeacher();
		return {
			userIsATeacher: userIsTeacher
		};
	} catch (e) {
		redirectOnTRPCError(e, {
			UNAUTHORIZED: '/auth/sign-in'
		});
		return {
			userIsATeacher: false
		};
	}
};
