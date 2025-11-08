import { serialize } from '$lib/lib/utils';
import { createContext } from '$lib/server/trpc/context';
import { TeacherRouter } from '$quiz/teacher/adapters/TeacherRouter';

export const load = async (event) => {
	const promotions = await TeacherRouter.createCaller(() =>
		createContext(event)
	).listTeacherPromotions();

	return {
		promotions: serialize(promotions)
	};
};
