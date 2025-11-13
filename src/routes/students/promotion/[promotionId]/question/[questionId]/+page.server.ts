// src/routes/students/promotion/[promotionId]/question/[questionId]/+page.server.ts
import type { PageServerLoad } from './$types';
import { redirectOnTRPCError } from '$lib/server/trpc/guard';
import { QuestionRouter } from '$quiz/question/adapters/QuestionRouter';
import { createContext } from '$lib/server/trpc/context';
import { serialize } from '$lib/lib/utils';
import { redirect } from '@sveltejs/kit';

export const load: PageServerLoad = async (event) => {
	const { params, parent } = event;
	const { promotionId, questionId } = params;
	const { activeSession } = await parent();

	// If there's no active session, or the active session's question doesn't match the URL,
	// redirect to lobby. This can happen if the session ends while the student is on the page.
	if (!activeSession || activeSession.questionId !== questionId) {
		throw redirect(303, `/students/promotion/${promotionId}/lobby`);
	}

	try {
		const questionDetails = await QuestionRouter.createCaller(() =>
			createContext(event)
		).getDetails({ promotionId, questionId });

		return {
			question: serialize(questionDetails),
			sessionId: activeSession.id,
			promotionId: promotionId
		};
	} catch (e) {
		redirectOnTRPCError(e, {
			UNAUTHORIZED: '/auth/sign-in',
			FORBIDDEN: '/',
			NOT_FOUND: `/students/promotion/${promotionId}/lobby`
		});
	}
};
