import { router } from '$lib/server/trpc/init';
import { teacherProcedure } from '$lib/server/trpc/procedures/teacherProcedure';
import { ServiceProvider } from '$lib/server/ServiceProvider';
import {
	CreatePromotionCommandSchema,
	CreatePromotionUsecase
} from '$quiz/promotion/application/CreatePromotion.usecase';
import { PlanQuestionSchema, PlanQuestionUsecase } from '../application/PlanQuestion.usecase';
import { OwnPromotionMiddleware } from './OwnPromotion';

export const PromotionRouter = router({
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
		}),
	planQuestion: teacherProcedure
		.input(PlanQuestionSchema)
		.use(OwnPromotionMiddleware)
		.mutation(async ({ input }) => {
			const usecase = new PlanQuestionUsecase(
				ServiceProvider.PromotionRepository,
				ServiceProvider.QuestionRepository
			);
			await usecase.execute(input);
		})
});

export type PromotionRouter = typeof PromotionRouter;
