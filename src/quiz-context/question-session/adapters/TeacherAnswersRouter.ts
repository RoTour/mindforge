import { serviceProvider } from '$lib/server/container';
import { router } from '$lib/server/trpc/init';
import { teacherProcedure } from '$lib/server/trpc/procedures/teacherProcedure';
import { PublishGradeUsecase } from '$quiz/question-session/application/PublishGrade.usecase';
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
				}),
				shouldPublish: z.boolean().optional()
			})
		)
		.mutation(async ({ input }) => {
			const { questionSessionId, studentId, grade, shouldPublish } = input;
			const useCase = new TeacherGradeAnswerUsecase(serviceProvider.QuestionSessionRepository);
			await useCase.execute(questionSessionId, studentId, grade);

			if (shouldPublish) {
				const publishUseCase = new PublishGradeUsecase(serviceProvider.QuestionSessionRepository);
				await publishUseCase.execute(questionSessionId, studentId);
			}
		}),
	publishGrade: teacherProcedure
		.input(
			z.object({
				questionSessionId: z.string(),
				studentId: z.string()
			})
		)
		.mutation(async ({ input }) => {
			const { questionSessionId, studentId } = input;
			const useCase = new PublishGradeUsecase(serviceProvider.QuestionSessionRepository);
			await useCase.execute(questionSessionId, studentId);
		})
});
