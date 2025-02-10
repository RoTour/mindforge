import type { PrismaClient } from '@prisma/client';
import * as IValidateQuestionRepository from './IValidateQuestionRepository';
import { PrismaToDomainQuestion } from '@modules/Learning/mappers/PrismaToDomainQuestion';

type _PrismaValidateQuestionRepository = {
	getQuestionToValidate: IValidateQuestionRepository.GetQuestionToValidate;
};

export const PrismaValidateQuestionRepository = (
	prisma: PrismaClient
): _PrismaValidateQuestionRepository => ({
	getQuestionToValidate: async (questionId) => {
		const question = await prisma.question.findUnique({
			where: { id: questionId }
		});
		return question ? PrismaToDomainQuestion(question) : undefined;
	}
});
