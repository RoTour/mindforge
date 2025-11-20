import { createContext } from '$lib/server/trpc/context';
import { StudentsOverviewRouter } from '$quiz/student/adapters/StudentRouter';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async (event) => {
	const { promotionId, studentId } = event.params;
	const caller = StudentsOverviewRouter.createCaller(await createContext(event));
	const history = await caller.getStudentHistory({ promotionId, studentId });

	return {
		history,
		promotionId,
		studentId
	};
};
