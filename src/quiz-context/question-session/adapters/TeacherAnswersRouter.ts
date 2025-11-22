import { serviceProvider } from '$lib/server/container';
import { router } from '$lib/server/trpc/init';
import { teacherProcedure } from '$lib/server/trpc/procedures/teacherProcedure';
import z from 'zod';
import { TeacherGradeAnswerUsecase } from '../application/TeacherGradeAnswer.usecase';

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
		}),
	gradeAnswer: teacherProcedure
		.input(
			z.object({
				questionSessionId: z.string(),
				studentId: z.string(),
				grade: z.object({
					skillsMastered: z.array(z.string()),
					skillsToReinforce: z.array(z.string()),
					comment: z.string().nullable()
				})
			})
		)
		.mutation(async ({ input }) => {
			const { questionSessionId, studentId, grade } = input;
			const usecase = new TeacherGradeAnswerUsecase(serviceProvider.QuestionSessionRepository);
			await usecase.execute(questionSessionId, studentId, grade);
		})
});
