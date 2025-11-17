import { serviceProvider } from '$lib/server/container';
import { router } from '$lib/server/trpc/init';
import { authedAnyUserProcedure } from '$lib/server/trpc/procedures/authedAnyUserProcedure';
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
		}),
	doesStudentExist: authedAnyUserProcedure
		.input(
			z.object({
				email: z.email()
			})
		)
		.query(async ({ input }) => {
			const { email } = input;
			const student = await serviceProvider.StudentQueries.doesUnlinkedStudentExistWithEmail(email);
			return { success: student !== null };
		})
});

export type StudentsOverviewRouter = typeof router;
