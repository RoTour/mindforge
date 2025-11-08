import { createContext } from '$lib/server/trpc/context';
import { TeacherRouter } from '$quiz/teacher/adapters/TeacherRouter';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async (event) => {
	const { promotionId } = event.params;
	const caller = TeacherRouter.createCaller(() => createContext(event));
	const [allQuestions, promotionQuestions] = await Promise.all([
		caller.getAllOwnQuestions(),
		caller.getOwnQuestionForPromotion({ promotionId })
	]);

	return {
		allQuestions,
		promotionQuestions
	};
};
