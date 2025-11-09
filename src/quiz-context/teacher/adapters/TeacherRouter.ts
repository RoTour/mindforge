import { ServiceProvider } from '$lib/server/ServiceProvider';
import { router } from '$lib/server/trpc/init';
import { teacherProcedure } from '$lib/server/trpc/procedures/teacherProcedure';
import { OwnPromotionMiddleware } from '$quiz/promotion/adapters/OwnPromotion';
import { PromotionId } from '$quiz/promotion/domain/PromotionId.valueObject';
import z from 'zod';

export const TeacherRouter = router({
	listTeacherPromotions: teacherProcedure.query(async ({ ctx }) => {
		return ServiceProvider.TeacherPromotionsQueries.listTeacherPromotions(ctx.teacher.id);
	}),
	getAllOwnQuestions: teacherProcedure.query(async ({ ctx }) => {
		return ServiceProvider.TeacherQuestionsQueries.getAllOwnQuestionsForTeacher(ctx.teacher.id);
	}),
	getPlannedQuestionsForPromotion: teacherProcedure
		.input(z.object({ promotionId: z.string() }))
		.use(OwnPromotionMiddleware)
		.query(async ({ ctx, input }) => {
			const { promotionId } = input;
			return ServiceProvider.TeacherQuestionsQueries.getPlannedQuestionsForPromotion(
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
			return ServiceProvider.TeacherQuestionsQueries.getOwnQuestionsForPromotion(
				new PromotionId(promotionId),
				ctx.teacher.id
			);
		})
});
