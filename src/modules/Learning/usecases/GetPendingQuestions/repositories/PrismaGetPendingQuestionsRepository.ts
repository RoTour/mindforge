import { PrismaToDomainQuestion } from '@modules/Learning/mappers/PrismaToDomainQuestion';
import type { PrismaClient } from '@prisma/client';
import * as IGetPendingQuestionsRepository from './IGetPendingQuestionsRepository';

type _PrismaGetPendingQuestionsRepository = {
	getUserQuestions: IGetPendingQuestionsRepository.GetUserQuestions;
};

export const PrismaGetPendingQuestionsRepository = (
	prisma: PrismaClient
): _PrismaGetPendingQuestionsRepository => {
	return {
		getUserQuestions: async () => {
			// TODO: Use userId when implemented
			const questions = await prisma.question.findMany();
			return questions.map(PrismaToDomainQuestion);
		}
	};
};
