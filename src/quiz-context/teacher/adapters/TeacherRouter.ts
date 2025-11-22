import { serviceProvider } from '$lib/server/container';
import { router } from '$lib/server/trpc/init';
import { authedAnyUserProcedure } from '$lib/server/trpc/procedures/authedAnyUserProcedure';
import { teacherProcedure } from '$lib/server/trpc/procedures/teacherProcedure';
import { OwnPromotionMiddleware } from '$quiz/promotion/adapters/OwnPromotion';
import { PromotionId } from '$quiz/promotion/domain/PromotionId.valueObject';
import { TeacherAnswersRouter } from '$quiz/question-session/adapters/TeacherAnswersRouter';
import z from 'zod';

export const TeacherRouter = router({
	amIaTeacher: authedAnyUserProcedure.query(async ({ ctx }) => {
		const teacher = await serviceProvider.TeacherQueries.findByAuthUserId(ctx.authUserId);
		return !!teacher;
	}),
	listTeacherPromotions: teacherProcedure.query(async ({ ctx }) => {
		return serviceProvider.TeacherPromotionsQueries.listTeacherPromotions(ctx.teacher.id);
	}),
	getAllOwnQuestions: teacherProcedure.query(async ({ ctx }) => {
		return serviceProvider.TeacherQuestionsQueries.getAllOwnQuestionsForTeacher(ctx.teacher.id);
	}),
	getPlannedQuestionsForPromotion: teacherProcedure
		.input(z.object({ promotionId: z.string() }))
		.use(OwnPromotionMiddleware)
		.query(async ({ ctx, input }) => {
			const { promotionId } = input;
			return serviceProvider.TeacherQuestionsQueries.getPlannedQuestionsForPromotion(
				new PromotionId(promotionId),
				ctx.teacher.id
			);
		}),
	getOwnQuestionForPromotion: teacherProcedure
		.input(
			z.object({
				promotionId: z.string()
			})
		)
		.query(async ({ ctx, input }) => {
			const { promotionId } = input;
			return serviceProvider.TeacherQuestionsQueries.getOwnQuestionsForPromotion(
				new PromotionId(promotionId),
				ctx.teacher.id
			);
		}),
	answers: TeacherAnswersRouter
});
