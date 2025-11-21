import { createContext } from '$lib/server/trpc/context';
import { TeacherAnswersRouter } from '$quiz/question-session/adapters/TeacherAnswersRouter';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async (event) => {
	const { promotionId } = event.params;
	const caller = TeacherAnswersRouter.createCaller(await createContext(event));
	const answers = await caller.getAnswersForPromotion({ promotionId });

	return {
		answers,
		promotionId
	};
};
