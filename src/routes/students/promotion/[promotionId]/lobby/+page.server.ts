import type { PageServerLoad } from './$types';
import { redirectOnTRPCError } from '$lib/server/trpc/guard';
import { redirect } from '@sveltejs/kit';
import { StudentLobbyRouter } from '$quiz/student/adapters/StudentLobbyRouter';
import { createContext } from '$lib/server/trpc/context';

export const load: PageServerLoad = async (event) => {
	const { params } = event;
	const { promotionId } = params;

	try {
		const context = await createContext(event);
		const caller = StudentLobbyRouter.createCaller(context);
		const activeSession = await caller.getActiveSession({ promotionId });

		if (activeSession) {
			// Redirect to the question page
			throw redirect(
				303,
				`/students/promotion/${promotionId}/question/${activeSession.questionId}`
			);
		}

		// No active session, stay in lobby
		return { promotionId };
	} catch (e) {
		redirectOnTRPCError(e, {
			UNAUTHORIZED: '/auth/sign-in',
			FORBIDDEN: '/'
		});
	}
};
