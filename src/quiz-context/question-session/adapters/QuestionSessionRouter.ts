// src/quiz-context/question-session/adapters/QuestionSessionRouter.ts
import { router } from '$lib/server/trpc/init';
import { studentProcedure } from '$lib/server/trpc/procedures/studentProcedure';
import { z } from 'zod';
import { AcceptAnswerUsecase } from '../application/AcceptAnswerUsecase';
import { serviceProvider } from '$lib/server/container';

export const QuestionSessionRouter = router({
	submitAnswer: studentProcedure
		.input(
			z.object({
				promotionId: z.string(),
				questionSessionId: z.string(),
				answerText: z.string()
			})
		)
		.mutation(async ({ ctx, input }) => {
			const usecase = new AcceptAnswerUsecase(serviceProvider.MessageQueue);
			await usecase.execute({
				questionSessionId: input.questionSessionId,
				studentId: ctx.student.id,
				answerText: input.answerText
			});
		})
});
