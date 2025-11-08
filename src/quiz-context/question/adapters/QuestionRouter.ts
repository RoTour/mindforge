// src/quiz-context/adapters/QuestionRouter.ts
import { ServiceProvider } from '$lib/server/ServiceProvider';
import { router } from '$lib/server/trpc/init';
import { teacherProcedure } from '$lib/server/trpc/procedures/teacherProcedure';
import {
	CreateQuestionCommandSchema,
	CreateQuestionUsecase
} from '$quiz/question/application/CreateQuestion.usecase';

export const QuestionRouter = router({
	createQuestion: teacherProcedure
		.input(CreateQuestionCommandSchema.omit({ authorId: true }))
		.mutation(async ({ ctx, input }) => {
			const usecase = new CreateQuestionUsecase(
				ServiceProvider.QuestionRepository,
				ServiceProvider.TeacherRepository
			);

			await usecase.execute({ ...input, authorId: ctx.teacher.id });
		})
});

export type QuestionRouter = typeof router;
