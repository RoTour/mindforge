import { serialize } from '$lib/lib/utils';
import { createContext } from '$lib/server/trpc/context';
import { redirectOnTRPCError } from '$lib/server/trpc/guard';
import { TeacherRouter } from '$quiz/teacher/adapters/TeacherRouter';

export const load = async (event) => {
	try {
		const promotions = await TeacherRouter.createCaller(() =>
			createContext(event)
		).listTeacherPromotions();

		return {
			promotions: serialize(promotions)
		};
	} catch (e) {
		redirectOnTRPCError(e, {
			UNAUTHORIZED: '/auth/sign-in',
			FORBIDDEN: '/auth/sign-in'
		});
	}
};
