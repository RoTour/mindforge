// src/quiz-context/question-session/adapters/TeacherAnswersRouter.ts
import { serviceProvider } from '$lib/server/container';
import { router } from '$lib/server/trpc/init';
import { teacherProcedure } from '$lib/server/trpc/procedures/teacherProcedure';
import { PublishGradeUsecase } from '$quiz/question-session/application/PublishGrade.usecase';
import z from 'zod';
import { TeacherGradeAnswerUsecase } from '../application/TeacherGradeAnswer.usecase';
import { UnpublishGradeUsecase } from '../application/UnpublishGrade.usecase';

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
				liveSessionId: z.string(),
				slotOrder: z.number(),
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
			const { liveSessionId, slotOrder, studentId, grade, shouldPublish } = input;
			const useCase = new TeacherGradeAnswerUsecase(serviceProvider.LiveSessionRepository);
			await useCase.execute(liveSessionId, slotOrder, studentId, grade);

			if (shouldPublish) {
				const publishUseCase = new PublishGradeUsecase(serviceProvider.LiveSessionRepository);
				await publishUseCase.execute(liveSessionId, slotOrder, studentId);
			}
		}),
	publishGrade: teacherProcedure
		.input(
			z.object({
				liveSessionId: z.string(),
				slotOrder: z.number(),
				studentId: z.string()
			})
		)
		.mutation(async ({ input }) => {
			const { liveSessionId, slotOrder, studentId } = input;
			const useCase = new PublishGradeUsecase(serviceProvider.LiveSessionRepository);
			await useCase.execute(liveSessionId, slotOrder, studentId);
		}),
	unpublishGrade: teacherProcedure
		.input(
			z.object({
				liveSessionId: z.string(),
				slotOrder: z.number(),
				studentId: z.string()
			})
		)
		.mutation(async ({ input }) => {
			const { liveSessionId, slotOrder, studentId } = input;
			const useCase = new UnpublishGradeUsecase(serviceProvider.LiveSessionRepository);
			await useCase.execute(liveSessionId, slotOrder, studentId);
		})
});

