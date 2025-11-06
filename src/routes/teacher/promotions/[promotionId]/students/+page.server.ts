import { createContext } from '$lib/server/trpc/context';
import { StudentsOverviewRouter } from '$quiz/adapters/StudentsOverviewRouter';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async (event) => {
	const promotionId = event.params.promotionId;
	const caller = StudentsOverviewRouter.createCaller(() => createContext(event));
	const students = await caller.getStudentsFromPromotion({ promotionId });
	return { students };
};
