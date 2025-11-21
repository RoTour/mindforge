import { serviceProvider } from '$lib/server/container';
import { router } from '$lib/server/trpc/init';
import { teacherProcedure } from '$lib/server/trpc/procedures/teacherProcedure';
import z from 'zod';

export const TeacherAnswersRouter = router({
	getAnswersForPromotion: teacherProcedure
		.input(
			z.object({
				promotionId: z.string()
			})
		)
		.query(async ({ input }) => {
			const { promotionId } = input;
			const answers =
				await serviceProvider.TeacherAnswersQueries.getAnswersForPromotion(promotionId);
			return answers;
		})
});
