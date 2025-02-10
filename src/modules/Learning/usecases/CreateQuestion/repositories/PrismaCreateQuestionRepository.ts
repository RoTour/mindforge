import type { PrismaClient } from '@prisma/client';
import * as ICreateQuestionRepository from './ICreateQuestionRepository';

type _PrismaCreateQuestionRepository = {
	storeQuestion: ICreateQuestionRepository.StoreQuestion;
};

export const PrismaCreateQuestionRepository = (
	prisma: PrismaClient
): _PrismaCreateQuestionRepository => {
	return {
		storeQuestion: async (question) => {
			await prisma.question.create({
				data: {
					prompt: question.prompt,
					answer: question.answer,
					questionType: question.type,
					options: question.options ?? [],
				}
			})
		}
	};
};
