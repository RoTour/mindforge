// src/routes/teacher/promotions/[promotionId]/sessions/+page.server.ts
import { createContext } from '$lib/server/trpc/context';
import { TeacherRouter } from '$quiz/teacher/adapters/TeacherRouter';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async (event) => {
	const { promotionId } = event.params;
	const caller = TeacherRouter.createCaller(() => createContext(event));
	const sessions = await caller.sessions.getSessions({ promotionId });

	return {
		sessions,
		promotionId
	};
};
