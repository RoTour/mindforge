// src/routes/teacher/promotions/[promotionId]/sessions/+page.server.ts
import { createContext } from '$lib/server/trpc/context';
import { TeacherRouter } from '$quiz/teacher/adapters/TeacherRouter';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async (event) => {
	const { promotionId } = event.params;
	const caller = TeacherRouter.createCaller(() => createContext(event));
	
	const [sessions, questions] = await Promise.all([
		caller.sessions.getSessions({ promotionId }),
		caller.getAllOwnQuestions()
	]);

	return {
		sessions,
		questions,
		promotionId
	};
};

