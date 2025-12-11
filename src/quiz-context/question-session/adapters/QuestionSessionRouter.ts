// src/quiz-context/question-session/adapters/QuestionSessionRouter.ts
import { serviceProvider } from '$lib/server/container';
import { router } from '$lib/server/trpc/init';
import { studentIsPartOfPromotionProcedure } from '$lib/server/trpc/procedures/studentIsPartOfPromotionProcedure';
import { z } from 'zod';
import { AcceptAnswerUsecase } from '../application/AcceptAnswerUsecase';

export const QuestionSessionRouter = router({
	submitAnswer: studentIsPartOfPromotionProcedure
		.input(
			z.object({
				promotionId: z.string(),
				liveSessionId: z.string(),
				slotOrder: z.number(),
				answerText: z.string()
			})
		)
		.mutation(async ({ ctx, input }) => {
			const usecase = new AcceptAnswerUsecase(serviceProvider.MessageQueue);
			await usecase.execute({
				liveSessionId: input.liveSessionId,
				slotOrder: input.slotOrder,
				studentId: ctx.student.id,
				answerText: input.answerText
			});
		})
});

