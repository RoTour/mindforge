import { serviceProvider } from '$lib/server/container';
import { router } from '$lib/server/trpc/init';
import { teacherProcedure } from '$lib/server/trpc/procedures/teacherProcedure';
import z from 'zod';

export const StudentsOverviewRouter = router({
	getStudentsFromPromotion: teacherProcedure
		.input(
			z.object({
				promotionId: z.string()
			})
		)
		.query(async ({ ctx, input }) => {
			const { promotionId } = input;
			const { id: teacherId } = ctx.teacher;
			const students = await serviceProvider.StudentsOverviewQueries.getStudentsFromPromotion(
				promotionId,
				teacherId.id()
			);
			return students;
		})
});

export type StudentsOverviewRouter = typeof router;
