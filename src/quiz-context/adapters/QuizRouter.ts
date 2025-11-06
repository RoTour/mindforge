import { router } from '$lib/server/trpc/init';
import { teacherProcedure } from '$lib/server/trpc/procedures/teacherProcedure';
import { ServiceProvider } from '$lib/server/ServiceProvider';
import {
	CreatePromotionCommandSchema,
	CreatePromotionUsecase
} from '$quiz/application/CreatePromotion.usecase';

export const QuizRouter = router({
	createPromotion: teacherProcedure
		.input(CreatePromotionCommandSchema.omit({ teacherId: true }))
		.mutation(async ({ input, ctx }) => {
			const usecase = new CreatePromotionUsecase(
				ServiceProvider.PromotionRepository,
				ServiceProvider.StudentRepository,
				ServiceProvider.TeacherRepository
			);
			console.debug('Quiz router teacher', ctx.teacher);
			await usecase.execute({ ...input, teacherId: ctx.teacher.id });
		})
});

export type QuizRouter = typeof router;
