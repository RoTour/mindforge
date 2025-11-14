import { createContext } from '$lib/server/trpc/context';
import { TeacherRouter } from '$quiz/teacher/adapters/TeacherRouter';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async (event) => {
	event.depends('promotion:selected');
	const { promotionId } = event.params;
	const caller = TeacherRouter.createCaller(() => createContext(event));
	const [allQuestions, promotionQuestions, plannedQuestions] = await Promise.all([
		caller.getAllOwnQuestions(),
		caller.getOwnQuestionForPromotion({ promotionId }),
		caller.getPlannedQuestionsForPromotion({ promotionId })
	]);

	return {
		allQuestions,
		promotionQuestions,
		plannedQuestions
	};
};
