// $modules/Learning/gateways/router/TRPCLearningRouter.ts
import { prisma } from '$lib/prisma/client';
import { t } from '$lib/trpc/t';
import { QuestionBuilder } from '@modules/Learning/constructors/QuestionBuilder';
import { CreateQuestionDtoSchema, QuestionSchema } from '@modules/Learning/entities/Question';
import { PrismaAnswerQuestionRepository } from '@modules/Learning/usecases/AnswerQuestion/repositories/PrismaAnswerQuestionRepository';
import { CreateQuestion } from '@modules/Learning/usecases/CreateQuestion/CreateQuestion';
import { PrismaCreateQuestionRepository } from '@modules/Learning/usecases/CreateQuestion/repositories/PrismaCreateQuestionRepository';
import { PrismaGetPendingQuestionsRepository } from '@modules/Learning/usecases/GetPendingQuestions/repositories/PrismaGetPendingQuestionsRepository';
import { PrismaValidateQuestionRepository } from '@modules/Learning/usecases/ValidateQuestion/repositories/PrismaValidateQuestionRepository';
import { z } from 'zod';

export const TRPCLearningRouter = t.router({
	createQuestion: t.procedure.input(CreateQuestionDtoSchema).mutation(async ({ input }) => {
		const usecase = CreateQuestion({
			questionBuilder: (dto) => QuestionBuilder(dto).build(),
			storeQuestion: PrismaCreateQuestionRepository(prisma).storeQuestion,
			callbacks: []
		});
		const result = await usecase.execute({ dto: input });
		return result;
	}),
	getUserQuestions: t.procedure.input(z.string()).query(async ({ input }) => {
		const repository = PrismaGetPendingQuestionsRepository(prisma);
		return repository.getUserQuestions(input);
	}),
	getQuestion: t.procedure.input(z.string()).query(async ({ input }) => {
		const repository = PrismaAnswerQuestionRepository(prisma);
		return repository.getQuestion(input);
	}),
	saveQuestion: t.procedure.input(QuestionSchema).mutation(async ({ input }) => {
		const repository = PrismaAnswerQuestionRepository(prisma);
		return repository.saveQuestion(input);
	}),
	getQuestionToValidate: t.procedure.input(z.string()).query(async ({ input }) => {
		const repository = PrismaValidateQuestionRepository(prisma);
		return repository.getQuestionToValidate(input);
	}),
});
