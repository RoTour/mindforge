import { createContext } from '$lib/server/trpc/context';
import { StudentsOverviewRouter } from '$quiz/student/adapters/StudentRouter';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async (event) => {
	const { promotionId } = event.params;
	const caller = StudentsOverviewRouter.createCaller(await createContext(event));
	const students = await caller.getStudentsFromPromotion({ promotionId });
	return {
		students
	};
};
