import { ServiceProvider } from '$lib/server/ServiceProvider';
import { router } from '$lib/server/trpc/init';
import { teacherProcedure } from '$lib/server/trpc/procedures/teacherProcedure';
import { PromotionId } from '$quiz/domain/PromotionId.valueObject';
import z from 'zod';

export const TeacherRouter = router({
	listTeacherPromotions: teacherProcedure.query(async ({ ctx }) => {
		return ServiceProvider.TeacherPromotionsQueries.listTeacherPromotions(ctx.teacher.id);
	}),
	getAllOwnQuestions: teacherProcedure.query(async ({ ctx }) => {
		return ServiceProvider.TeacherQuestionsQueries.getAllOwnQuestionsForTeacher(ctx.teacher.id);
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
