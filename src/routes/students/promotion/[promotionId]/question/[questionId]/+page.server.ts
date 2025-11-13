// src/routes/students/promotion/[promotionId]/question/[questionId]/+page.server.ts
import type { PageServerLoad } from './$types';
import { redirectOnTRPCError } from '$lib/server/trpc/guard';
import { QuestionRouter } from '$quiz/question/adapters/QuestionRouter';
import { createContext } from '$lib/server/trpc/context';
import { serialize } from '$lib/lib/utils';

export const load: PageServerLoad = async (event) => {
	const { params } = event;
	const { promotionId, questionId } = params;

	try {
		const questionDetails = await QuestionRouter.createCaller(() =>
			createContext(event)
		).getDetails({ promotionId, questionId });

		return {
			question: serialize(questionDetails)
		};
	} catch (e) {
		redirectOnTRPCError(e, {
			UNAUTHORIZED: '/auth/sign-in',
			FORBIDDEN: '/',
			NOT_FOUND: `/students/promotion/${promotionId}/lobby`
		});
	}
};
