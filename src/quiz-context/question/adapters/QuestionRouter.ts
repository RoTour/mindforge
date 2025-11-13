// src/quiz-context/question/adapters/QuestionRouter.ts
import { serviceProvider } from '$lib/server/container';
import { router } from '$lib/server/trpc/init';
import { studentIsPartOfPromotionProcedure } from '$lib/server/trpc/procedures/studentIsPartOfPromotionProcedure';
import { teacherProcedure } from '$lib/server/trpc/procedures/teacherProcedure';
import {
	CreateQuestionCommandSchema,
	CreateQuestionUsecase
} from '$quiz/question/application/CreateQuestion.usecase';
import { QuestionId } from '../domain/QuestionId.valueObject';
import { z } from 'zod';
import { TRPCError } from '@trpc/server';

export const QuestionRouter = router({
	createQuestion: teacherProcedure
		.input(CreateQuestionCommandSchema.omit({ authorId: true }))
		.mutation(async ({ ctx, input }) => {
			const usecase = new CreateQuestionUsecase(
				serviceProvider.QuestionRepository,
				serviceProvider.TeacherRepository
			);

			await usecase.execute({ ...input, authorId: ctx.teacher.id });
		}),
	getDetails: studentIsPartOfPromotionProcedure
		.input(
			z.object({
				promotionId: z.string(), // from studentProcedure
				questionId: z.string()
			})
		)
		.query(async ({ input }) => {
			const { questionId } = input;
			const details = await serviceProvider.StudentQuestionQueries.getQuestionDetails(
				new QuestionId(questionId)
			);
			if (!details) {
				throw new TRPCError({ code: 'NOT_FOUND', message: 'Question not found.' });
			}
			return details;
		})
});

export type QuestionRouter = typeof router;
